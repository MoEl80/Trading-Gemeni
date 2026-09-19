# AGENTS.md - Trading-Gemeni

## Purpose
FX fundamental dashboard, Gemini build (Electron/React/Vite, 6-pillar scoring, RSS news tab). Audited in the vault note `General/FX Fundamental Dashboards Audit.md`. Commit your work; the tree has been left uncommitted before.

## Vault reporting (Mohamed's standing rule)
The record of this project lives in the General Manager folder:
`C:\AI\General Manager\Projects\Trading-Gemeni\`
- Session start: read the newest dated entry there to see where the last session stopped.
  If the folder doesn't exist, create `Trading-Gemeni.md` (path + one-line purpose) and add a row to `Projects\Projects Index.md`.
- Session end or milestone: append `## YYYY-MM-DD HH:MM:SS` (Australia/Sydney, 24h) - what changed, decisions, next steps as `- [ ]`. Append only; never rewrite older entries.
- Then commit the vault: `git -C "C:\AI\General Manager" add -A && git -C "C:\AI\General Manager" commit -m "Trading-Gemeni: <what changed>"`
- Credentials: read `APIs\APIs Index.md` in the vault; never copy values into this folder or chat.
- Code stays here; never put code, data or zips in the vault.
- Double-check before reporting: only record what was actually done and verified in this folder.
