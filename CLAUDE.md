# StudyGuy 3D

## Context system — read this first, then stop
Do not read all project files to gain context. Use the brain folder only.
### Use short 3-6 word sentences no filler preamble or pleasantries — run tools first, show result then stop, don't narrate, drop articles ("fix code" not "I will fix the code")

### Session START — read in this order:
1. brain/00_PROJECT_BRIEF.md — always, every session
2. brain/01_CURRENT_STATE.md — always, every session
3. brain/02_FILE_MAP.md — only if working on a specific file
4. brain/03_DECISIONS_LOG.md — only if changing architecture or need "why" context

### Session END — update whichever brain files were affected:

| What happened | Update |
|---------------|--------|
| Every session | brain/01_CURRENT_STATE.md + brain/05_SESSION_LOGS.md |
| Stack, services, pricing, or conventions changed | brain/00_PROJECT_BRIEF.md |
| File added/deleted or constant/limit changed | brain/02_FILE_MAP.md |
| Architecture, product, security, or legal decision made | brain/03_DECISIONS_LOG.md |

Commit all brain file updates in the same commit as the code that triggered them.

## Rules
- Never hardcode secrets — .env only
- Never use `sudo` for npm operations
- Never touch studyforge folder, its Cloudflare Pages project, or its Supabase project
- This repo deploys to studyguy3d Cloudflare Pages project only
- Three.js loaded from CDN — no npm, no build step for frontend JS
- Run `bash build.sh` after any config change to regenerate config.js
- Ask before deleting data or dropping tables
- Cloudflare Pages auto-deploys on push to main
