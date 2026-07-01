# Darren Damansara Refresh

Refresh cadence: weekly while Darren is actively hunting, or before every viewing run.

1. Open the live sale and rent sources from `ic-property/darren-damansara.html`.
2. Remove unavailable listings and update asking price, rent band, listing date, beds, baths, size, and note.
3. Keep three `pick` tags in the HTML data:
   - `Best ROI`
   - `Best balance`
   - `Needs negotiation`
4. Cache listing photos:

```bash
node scripts/cache_darren_property_photos.mjs --force
```

5. Verify before pushing:

```bash
node --check <(sed -n '/<script>/,/<\\/script>/p' ic-property/darren-damansara.html | sed '1d;$d')
git diff --check -- ic-property/darren-damansara.html
```

6. Push to `main` and confirm:

```bash
curl -L https://schuwaong.github.io/ic-property/darren-damansara.html | rg "Decision shortlist|Best ROI|WhatsApp"
```

Keep this page conservative. Gross ROI is a screening number only; availability, title, renovation quality, and actual achievable rent should be verified before Darren schedules viewings.
