# Social Content Sample

This folder contains sample assets for the listing-to-Instagram product.

- `wan-chai-live-listing-photo-reel.mp4`: refreshed listing-photo Reel generated from current listing data.
- `wan-chai-live-listing-photo-reel-frame.jpg`: preview frame from the generated Reel.
- `wan-chai-live-listing-narrator.mp3`: narrator audio used for the refreshed listing-photo Reel.
- `live-wanchai-listings.json`: current Wan Chai candidates copied from the refresh workflow.
- `listing-photo-reel-filter.txt`: ffmpeg overlay filter from the latest Reel build.
- `instagram-edits-workflow.md`: phone-side workflow for finishing the MP4 in Instagram Edits.
- `posting-flow.md`: notes for simple posts, video drafts, and future Instagram API publishing.

The prototype app is one level up:

- `../social-content-app.html`

Refresh the current listing candidates from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\refresh-wanchai-listings.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\make-listing-image-reel.ps1
```
