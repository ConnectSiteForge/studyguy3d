# Current State — StudyGuy 3D
> Updated: 2026-04-20

## Status: All pages 3D — awaiting Cloudflare Pages setup

## What's done
- Repo cloned locally, Next.js files cleared
- All pages have Three.js 3D background scene (shared via three-bg.js)
- index.html has its own richer inline scene (1800 particles, 6 geometry objects)
- All inner pages use three-bg.js (1400 particles, 5 geometry objects)
- All main content cards converted to glassmorphism (backdrop-filter + rgba bg)
- CLAUDE.md + brain files created
- .env + .gitignore + build.sh + config.template.js + _headers copied
- Scroll glitch fixed + tab-switch wake animation added (see decisions log)
- Mouse glitch fixed: parallax range reduced (±3/±2 units), lerp slowed to 0.025
- Page transition overlay added via transitions.js (navy fade-out on load, fade-in on navigate)

## Scene architecture (three-bg.js + index.html inline)
- Particle field: per-particle drift speeds, smooth wrap (randomises x/z on Y wrap)
- Geometric objects: IcosahedronGeometry, OctahedronGeometry, TetrahedronGeometry — wireframe + solid
- Camera: mouse parallax only (x/y), range ±3/±2, lerp 0.025 — very smooth, no jitter
- Scroll: rotates scene.rotation.x/y instead — no camera conflict
- Tab visibility: visibilitychange resets lastTime to prevent delta spike; triggers wakeBoost (4× rotation speed for ~1s) + wakePulse (particle opacity flash)
- Delta cap: MAX_DELTA = 0.05s — prevents any single-frame position jump
- Uses performance.now() + manual delta, not THREE.Clock

## What's next
- Set up Cloudflare Pages project "studyguy3d" pointing to this repo
- Add SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY env vars in Cloudflare Pages
- Test end-to-end: landing → login → upload → guide

## Known issues / notes
- Three.js r134 from cdnjs CDN — no local bundle
- Connection lines are static (built from initial particle positions) — intentional, cheaper than rebuilding each frame
- All auth flows point to studyguy.net backend (same Supabase project)
