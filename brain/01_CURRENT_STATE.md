# Current State — StudyGuy 3D
> Updated: 2026-04-21

## Status: SPA architecture — persistent Three.js, awaiting Cloudflare Pages setup

## What's done
- Repo cloned locally, Next.js files cleared
- **ARCHITECTURE CHANGE (2026-04-21):** Converted from multi-page to SPA with hash routing
- index.html is now a full SPA shell with all 5 views (landing, login, upload, account, viewer)
- sg-scene.js: persistent school-themed Three.js scene (desk / ID card / classroom)
- sg-app.js: hash router + view controllers for all views
- confirm.html kept as separate page (Supabase email links hardcode its URL); updated redirects to `/#/account` and `/#/login`
- three-bg.js and transitions.js removed (superseded by SPA architecture)
- CLAUDE.md + brain files created
- .env + .gitignore + build.sh + config.template.js + _headers copied

## Scene architecture (sg-scene.js)
- Three scene groups coexist in WebGL: deskGroup, idGroup, classGroup
- Visibility controlled via material opacity — all objects always exist, only active group visible
- Camera lerps between named mode positions — no reinitialisation between "navigations"
- Mode → scene mapping: landing=desk, auth=desk (closer), signup=id, app=classroom
- Public API: `window.SGScene.setMode(name)`, `triggerTransition()`, `setSmoothness(val)`
- Mouse parallax per-mode (landing full, app reduced)

## SPA routing (sg-app.js)
- Hash router: `#/`, `#/login`, `#/upload`, `#/account`, `#/viewer?id=...`
- `VIEW_MODES` maps view → scene mode; router calls `SGScene.setMode()` on every navigation
- `.html` filenames in links auto-mapped to hash routes via `HREF_MAP`
- View controllers: `onShow(params)` called per-view after CSS transition starts

## What's next
- Set up Cloudflare Pages project "studyguy3d" pointing to this repo
- Add SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY env vars in Cloudflare Pages
- Test end-to-end: landing → login → upload → guide
- Other HTML pages (login.html, account.html, etc.) still in repo but superseded — may need cleanup

## Known issues / notes
- Three.js r134 from cdnjs CDN — no local bundle
- Other HTML pages have unstaged local edits referencing deleted transitions.js — do not stage/push them until cleaned up
- All auth flows point to studyguy.net backend (same Supabase project)
