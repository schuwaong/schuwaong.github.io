# IC Educate Hosted Site Notes

The GitHub Pages version of IC Educate is a static frontend. It can show the UI and demo-mode worksheet output, but it cannot run OCR, worksheet generation, marking, or Gemini handoff by itself.

Those live in the local AAutograder IC Educate bridge, which the frontend calls at:

```text
http://127.0.0.1:8001
```

To use the full generator from the hosted site on another computer:

1. Copy or install the AAutograder bridge code.
2. Set any required Gemini or OCR environment variables locally.
3. Start the bridge on `127.0.0.1:8001`.
4. Open the GitHub Pages IC Educate URL in the same computer/browser.

If the hosted generator fails, the usual reason is that the bridge is not running locally or the browser cannot reach `127.0.0.1:8001`.
