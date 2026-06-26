# Listing-To-Instagram Posting Flow

## V1 Product

The customer pays a weekly fee. The app imports or receives property listings and creates a queue of ready-to-post Instagram content.

Each listing can become:

- A square image post.
- A carousel concept.
- An 8-second Reel draft.
- Caption, hashtags, and CTA.

The agent approves the post before anything goes public.

## Safe First Version

1. Import listings manually, from CSV, or from approved listing feeds.
2. Generate content drafts.
3. Let the real estate agent approve/edit.
4. Export a PNG, MP4, and caption.
5. User shares manually or via phone share sheet.

## Later Auto-Publish Version

Auto-publishing to Instagram should use Meta's official Instagram publishing APIs, not password-based browser automation.

Requirements:

- Business or Creator Instagram account.
- Meta app.
- User authorization.
- Content publishing permission.
- Publicly hosted image/video URLs.
- Approval logs.
- Error handling for failed video processing.

## Instagram Edits

Treat Instagram Edits as a manual editing/export destination unless Meta exposes a public developer API for creating Edits projects. A practical flow is to generate MP4 drafts and let the user open/import them into Edits or Instagram manually.

## Listing-Photo Reel Test

This sample now uses refreshed listing data and real listing photos:

```powershell
node .\scripts\refresh-wanchai-listings.mjs
powershell -ExecutionPolicy Bypass -File .\scripts\make-listing-image-reel.ps1
```

That creates `social-content-sample/wan-chai-live-listing-photo-reel.mp4`, which can be imported into Instagram Edits for final polish.
