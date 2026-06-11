# IC Wearables Deployment Notes

This folder is the GitHub Pages static mirror of IC Wearables.

GitHub Pages can serve the frontend and assets, but it cannot run the backend files in `api/`. The live backend should run on Vercel from the `schuwaong/IC_wearables` repo.

The frontend uses `config.js` to call:

```text
https://ic-wearables.vercel.app
```

If the pipeline feels unstable, check the Vercel deployment and environment variables first. The common failing backend calls are:

- `/api/colour-profile`
- `/api/generate-style-image`
- `/api/fetch-matching-clothes`

Do not commit `.env.local`, Vercel local state, logs, or `node_modules`.
