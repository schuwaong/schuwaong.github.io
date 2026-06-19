#!/usr/bin/env python3
"""Download SPM past-paper files from a curated manifest.

The script intentionally does not crawl search results or mirror whole websites.
Add only official, licensed, or otherwise permitted URLs to the manifest.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


DEFAULT_USER_AGENT = "IC-Educate-SPM-Paper-Downloader/1.0"
SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


def slug(value: Any) -> str:
    cleaned = SAFE_NAME_RE.sub("-", str(value or "").strip())
    return cleaned.strip("-").lower() or "unknown"


def load_manifest(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            data = data.get("papers", [])
        if not isinstance(data, list):
            raise ValueError("JSON manifest must be a list or an object with a 'papers' list.")
        return [dict(item) for item in data]

    if path.suffix.lower() == ".csv":
        with path.open(newline="", encoding="utf-8") as handle:
            return [dict(row) for row in csv.DictReader(handle)]

    raise ValueError("Manifest must be .json or .csv.")


def build_filename(item: dict[str, Any], url: str) -> str:
    explicit = item.get("filename")
    if explicit:
        return SAFE_NAME_RE.sub("-", str(explicit)).strip("-")

    parsed_name = Path(urlparse(url).path).name
    ext = Path(parsed_name).suffix.lower() if parsed_name else ".pdf"
    if ext not in {".pdf", ".doc", ".docx", ".zip", ".png", ".jpg", ".jpeg"}:
        ext = ".pdf"

    parts = [
        item.get("curriculum", "spm"),
        item.get("year"),
        item.get("subject"),
        item.get("paper"),
        item.get("variant"),
        item.get("kind", "question"),
    ]
    return "-".join(slug(part) for part in parts if part) + ext


def item_output_dir(base: Path, item: dict[str, Any]) -> Path:
    return base / slug(item.get("curriculum", "spm")) / slug(item.get("subject", "unknown")) / slug(item.get("year", "undated"))


def is_allowed_domain(url: str, allowed_domains: set[str]) -> bool:
    if not allowed_domains:
        return True
    host = (urlparse(url).hostname or "").lower()
    return any(host == domain or host.endswith(f".{domain}") for domain in allowed_domains)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download_one(url: str, destination: Path, user_agent: str, timeout: int) -> tuple[int, str]:
    request = Request(url, headers={"User-Agent": user_agent})
    destination.parent.mkdir(parents=True, exist_ok=True)

    with urlopen(request, timeout=timeout) as response:
        with NamedTemporaryFile("wb", delete=False, dir=str(destination.parent)) as tmp:
            tmp_path = Path(tmp.name)
            total = 0
            for chunk in iter(lambda: response.read(1024 * 256), b""):
                total += len(chunk)
                tmp.write(chunk)
    tmp_path.replace(destination)
    return total, sha256_file(destination)


def write_index(index_path: Path, row: dict[str, Any]) -> None:
    index_path.parent.mkdir(parents=True, exist_ok=True)
    with index_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download SPM past papers from a curated JSON/CSV manifest.")
    parser.add_argument("--manifest", default="shared-data/exam-papers/spm-past-papers.example.json", help="Path to JSON/CSV manifest.")
    parser.add_argument("--out", default="shared-data/exam-papers/downloads", help="Output directory.")
    parser.add_argument("--index", default="shared-data/exam-papers/download-index.jsonl", help="JSONL download index path.")
    parser.add_argument("--allowed-domain", action="append", default=[], help="Optional allowed domain. Repeat for multiple domains.")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between downloads in seconds.")
    parser.add_argument("--timeout", type=int, default=45, help="HTTP timeout in seconds.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing files.")
    parser.add_argument("--dry-run", action="store_true", help="Show planned downloads without fetching files.")
    parser.add_argument("--user-agent", default=DEFAULT_USER_AGENT, help="HTTP User-Agent header.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    manifest_path = Path(args.manifest)
    output_base = Path(args.out)
    index_path = Path(args.index)
    allowed_domains = {domain.lower().strip() for domain in args.allowed_domain if domain.strip()}

    papers = load_manifest(manifest_path)
    if not papers:
        print(f"No papers found in {manifest_path}.")
        return 0

    failures = 0
    for number, item in enumerate(papers, start=1):
        url = str(item.get("url", "")).strip()
        if not url:
            print(f"[{number}/{len(papers)}] skip: missing url")
            failures += 1
            continue

        if urlparse(url).scheme not in {"http", "https"}:
            print(f"[{number}/{len(papers)}] skip: unsupported URL scheme {url}")
            failures += 1
            continue

        if not is_allowed_domain(url, allowed_domains):
            print(f"[{number}/{len(papers)}] skip: domain not allowed {url}")
            failures += 1
            continue

        destination = item_output_dir(output_base, item) / build_filename(item, url)
        label = f"{item.get('year', '')} {item.get('subject', '')} {item.get('paper', '')} {item.get('kind', '')}".strip()

        if args.dry_run:
            print(f"[{number}/{len(papers)}] would download {label or url} -> {destination}")
            continue

        if destination.exists() and not args.overwrite:
            checksum = sha256_file(destination)
            print(f"[{number}/{len(papers)}] exists {destination}")
            write_index(index_path, {**item, "url": url, "path": str(destination), "sha256": checksum, "status": "exists"})
            continue

        try:
            size, checksum = download_one(url, destination, args.user_agent, args.timeout)
            print(f"[{number}/{len(papers)}] downloaded {destination} ({size} bytes)")
            write_index(
                index_path,
                {
                    **item,
                    "url": url,
                    "path": str(destination),
                    "bytes": size,
                    "sha256": checksum,
                    "downloadedAt": datetime.now(timezone.utc).isoformat(),
                    "status": "downloaded",
                },
            )
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            failures += 1
            print(f"[{number}/{len(papers)}] failed {url}: {error}", file=sys.stderr)

        if number < len(papers) and args.delay > 0:
            time.sleep(args.delay)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

