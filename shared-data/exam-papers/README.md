# Exam Paper Downloads

Use `scripts/download_spm_papers.py` to download SPM paper files from a curated
manifest. Do not add URLs unless you have permission to download and use the
files in your product.

Example:

```bash
python3 scripts/download_spm_papers.py \
  --manifest shared-data/exam-papers/spm-past-papers.json \
  --out shared-data/exam-papers/downloads \
  --delay 2
```

Preview without downloading:

```bash
python3 scripts/download_spm_papers.py --dry-run
```

Restrict downloads to trusted domains:

```bash
python3 scripts/download_spm_papers.py \
  --manifest shared-data/exam-papers/spm-past-papers.json \
  --allowed-domain lp.moe.gov.my \
  --allowed-domain bpk.moe.gov.my
```

Manifest fields:

- `curriculum`: usually `SPM`
- `year`: exam or trial year
- `subject`: subject name
- `paper`: paper label
- `variant`: optional state/session/variant label
- `kind`: `question`, `mark-scheme`, `insert`, `data-booklet`, etc.
- `source`: where the URL came from
- `url`: direct file URL
- `filename`: optional stable output filename

The script writes downloaded files under `downloads/` and appends checksums to
`download-index.jsonl`.

