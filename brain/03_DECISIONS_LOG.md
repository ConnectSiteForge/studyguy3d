# Decisions Log — StudyGuy 3D

## 2026-04-19 — Shared backend, frontend-only variant
**Decision:** studyguy3d shares the same Supabase project, Edge Functions, and Stripe config as studyguy.net
**Rationale:** Avoids duplicating backend infrastructure. studyguy3d is purely a UI/marketing experiment to test whether 3D visuals improve conversion
**Implication:** Never modify studyforge/studyguy.net Cloudflare Pages or Supabase directly from this repo

## 2026-04-19 — Three.js via CDN, no framework
**Decision:** Load Three.js r134 from cdnjs CDN. No npm, no build step for JS.
**Rationale:** Matches the zero-bundle vanilla JS philosophy of the original studyguy.net. Keeps deployment simple (Cloudflare Pages static)
**Implication:** CDN dependency — if cdnjs is down, Three.js won't load. Consider self-hosting if this becomes production-critical

## 2026-04-19 — 3D on all pages via shared three-bg.js
**Decision:** Every page gets the Three.js background via a shared `three-bg.js`. index.html keeps a richer inline version (1800 particles, 6 objects). Inner pages use the shared lighter version (1400 particles, 5 objects).
**Rationale:** Consistent 3D feel across the whole product, not just the landing page. Glassmorphism on cards makes content float visually above the 3D scene.
**Implication:** CDN load on every page. three-bg.js must be served alongside HTML (same origin).

## 2026-04-19 — Particle scene design
**Decision:** Teal (#00c896) particles + wireframe geometric objects (icosahedra, octahedra, tetrahedra) on navy background
**Rationale:** Matches brand colors exactly. Geometric shapes suggest academic/mathematical precision. Wireframe keeps it lightweight and doesn't obscure text

## 2026-04-19 — Scroll drives scene rotation, not camera Y
**Decision:** window.scroll updates scene.rotation.x/y (lerped). Camera position is only driven by mouse.
**Rationale:** The original bug: scroll moved camera.y while mouse also moved camera.y via the same lerp — they fought each other causing visible jitter/glitching at certain scroll positions. Separating concerns fixes this cleanly.
**Implication:** Scene rotates as user scrolls — geometric objects become more visible from different angles. This is a feature, not a side effect.

## 2026-04-19 — Tab visibility handled with performance.now() + MAX_DELTA cap
**Decision:** Use performance.now() for manual delta timing. On visibilitychange (tab shown), reset lastTime. Cap MAX_DELTA at 0.05s. On return, fire wakeBoost (4× rotation speed) and wakePulse (opacity flash) for ~1s.
**Rationale:** THREE.Clock accumulates elapsed time while the tab is hidden. On return, getElapsedTime() gives a huge delta (seconds), causing all objects to teleport. Manual reset prevents this entirely. The wake animation makes the tab-return feel intentional and alive rather than a glitch.

## 2026-04-20 — Mouse parallax range reduced, lerp slowed
**Decision:** targetX/Y range reduced from ±8/±5 to ±3/±2. Lerp factor slowed from 0.04 to 0.025.
**Rationale:** Wide range caused visible camera jump when mouse moved quickly across the screen — especially jarring at screen edges. Smaller range keeps the parallax subtle and fluid without losing the 3D depth effect.
**Implication:** Values apply in both three-bg.js (inner pages) and the inline scene in index.html — must be kept in sync if changed.

## 2026-04-20 — Page transition overlay (transitions.js)
**Decision:** Shared transitions.js injects a navy `#sg-transition` overlay at z-index 9999. On load it fades out (opacity 1→0 over 0.45s). On internal link click it fades in (0→1), waits 460ms, then navigates.
**Rationale:** Hard page cuts are jarring against the continuous 3D scene. A smooth navy fade feels like the scene is transitioning between spaces, not reloading. 460ms delay matches the CSS transition duration exactly.
**Implication:** Transitions.js skips external links, hash anchors, mailto/tel, and target=_blank links. Supabase auth redirects (window.location.href = ...) are unaffected since they bypass the click handler.
