# Session Logs — StudyGuy 3D

## 2026-04-21 — SPA conversion
- Studied stdyguy3d2 (3-file build): persistent WebGL canvas + school-themed modes + hash router
- Created sg-scene.js: persistent Three.js scene — desk / ID card / classroom groups, camera lerp between modes
- Created sg-app.js: hash router + view controllers (landing, login, upload, account, viewer)
- Rewrote index.html as SPA shell with all 5 view divs + external script loading
- Updated confirm.html: redirects now point to `/#/account` and `/#/login`
- Removed three-bg.js and transitions.js from git (superseded)
- Updated brain/01, 02, 03, 05
- Committed + pushed to GitHub main

## 2026-04-19 — Initial build
- Cloned studyguy3d GitHub repo locally
- Cleared Next.js files (app/, components/, lib/, next.config.ts, package.json, postcss.config.mjs, tsconfig.json, README.md)
- Copied from studyguy.net: .env, .gitignore, _headers, build.sh, config.template.js, config.js, login.html, confirm.html, account.html, admin.html, upload.html, viewer.html, payment-success.html, privacy.html, terms.html
- Built new index.html with Three.js 3D scene (particle field + floating geometry + mouse/scroll parallax)
- Created CLAUDE.md + all brain files
- Committed and pushed to GitHub main
- Next: set up Cloudflare Pages project for this repo
