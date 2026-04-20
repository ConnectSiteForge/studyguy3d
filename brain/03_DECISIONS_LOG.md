# Decisions Log — StudyGuy 3D

## 2026-04-19 — Shared backend, frontend-only variant
**Decision:** studyguy3d shares the same Supabase project, Edge Functions, and Stripe config as studyguy.net
**Rationale:** Avoids duplicating backend infrastructure. studyguy3d is purely a UI/marketing experiment to test whether 3D visuals improve conversion
**Implication:** Never modify studyforge/studyguy.net Cloudflare Pages or Supabase directly from this repo

## 2026-04-19 — Three.js via CDN, no framework
**Decision:** Load Three.js r134 from cdnjs CDN. No npm, no build step for JS.
**Rationale:** Matches the zero-bundle vanilla JS philosophy of the original studyguy.net. Keeps deployment simple (Cloudflare Pages static)
**Implication:** CDN dependency — if cdnjs is down, Three.js won't load. Consider self-hosting if this becomes production-critical

## 2026-04-19 — 3D only on index.html initially
**Decision:** Three.js scene applied to landing page only. All other pages are identical to studyguy.net
**Rationale:** Fastest path to live. Inner pages (upload, account, viewer) are functional, not marketing — 3D adds no value there
**Implication:** login.html could get a lightweight 3D hero later if desired

## 2026-04-19 — Particle scene design
**Decision:** Teal (#00c896) particles + wireframe geometric objects (icosahedra, octahedra, tetrahedra) on navy background
**Rationale:** Matches brand colors exactly. Geometric shapes suggest academic/mathematical precision. Wireframe keeps it lightweight and doesn't obscure text
