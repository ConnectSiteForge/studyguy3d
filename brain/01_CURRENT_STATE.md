# Current State — StudyGuy 3D
> Updated: 2026-04-19

## Status: Initial build complete — awaiting Cloudflare Pages setup

## What's done
- Repo cloned locally, Next.js files cleared
- All pages from studyguy.net copied (login, confirm, account, admin, upload, viewer, payment-success, privacy, terms)
- index.html rebuilt with Three.js 3D scene:
  - Particle field (1800 pts, teal, upward drift)
  - 6 floating wireframe geometric objects (icosahedra, octahedra, tetrahedra)
  - Connection lines between nearby particles
  - Mouse + scroll parallax on camera
  - Full design system match (same colors, fonts, copy as studyguy.net)
- CLAUDE.md + brain files created
- .env + .gitignore copied from studyguy.net
- build.sh + config.template.js + _headers copied
- All files committed and pushed to GitHub main

## What's next
- Set up Cloudflare Pages project "studyguy3d" pointing to this repo
- Add SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY env vars in Cloudflare Pages
- Test end-to-end: landing → login → upload → guide
- Optionally: add Three.js effects to login.html hero too

## Known issues / notes
- Three.js loaded from cdnjs r134 CDN — no local bundle
- Particle upward drift wraps poorly at very long scroll — minor visual artifact
- All auth flows point to studyguy.net backend (same Supabase project)
