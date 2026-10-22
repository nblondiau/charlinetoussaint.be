## Guiding Principles

- **Keep it simple, stupid (KISS)** — Favor the simplest solution that works. Avoid unnecessary abstraction, over-engineering, or cleverness.
- **Bottom Line Up Front (BLUF)** — Begin every message (explanations, status updates, answers, commit messages) with its key information: state the conclusion or answer first, then follow with the supporting detail, as in the journalistic inverted-pyramid style. Do not build up to the point with a lengthy preamble or background.

## Split Commits

Prefer small, focused commits over large monolithic ones. Each commit should represent a single logical change.

## Git Commit and Push

Unless told otherwise, we work on the main branch, without PRs. You must ask the user for approval before every commit or push.

## Test Before Reporting

Always test changes on a local Hugo server with headless Chromium driven over the Chrome DevTools Protocol (CDP) before saying a fix works. Rendering the built HTML and grepping it is not a test: it misses lazy-loading, JS behaviour, computed styles, focus, and network. Check the behaviour the change is about, and where the remark is quantitative (bytes, request counts), measure it with and without the change.

Practical notes:

- Serve with `hugo server --bind 127.0.0.1 --port 1313`. **One server at a time**: a second one (e.g. to preview another `style`) writes to the same `public/` and the first starts serving its output, so measurements silently become meaningless.
- Chromium: `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome --headless=new --no-sandbox --remote-debugging-port=9222 --user-data-dir=/tmp/cdp-profile`. Drive it from plain Node (`fetch` + global `WebSocket`); no Playwright needed.
- Create targets with `PUT /json/new?<url>`. A fresh target is still on `about:blank`, so wait for `location.href` **and** `readyState === 'complete'`. `Page.captureScreenshot` clips are in page coordinates: add `scrollY`/`scrollX`.
- Load with `Emulation.setEmulatedMedia` for `prefers-color-scheme`, and use `Page.bringToFront` + `Emulation.setFocusEmulationEnabled` for keyboard tests. Real key events need `rawKeyDown`/`keyUp`; Enter additionally needs `text: '\r'`.
- To test a pre-load state, hold the image requests open with `Fetch.enable` (`resourceType: 'Image'`) instead of blocking them (blocking gives Chrome's broken-image placeholder) or throttling everything (the stylesheet arrives late).
