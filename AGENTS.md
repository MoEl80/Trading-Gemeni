# AGENTS.md - Trading-Gemeni

## Standing rules (Mohamed) - read first, every session
- **Every report names model, effort and harness (Mohamed, 2026-10-02, TOP PRIORITY):** every report, dated log entry, lesson or status note you write must state `Model:` (exact model and variant, e.g. Claude Opus 5.5, GLM-5.3 Flash, GPT-6 Luna), `Effort:` (low/medium/high/max or thinking level) and `Harness:` (e.g. Claude Code desktop, Z Code CLI, Pi, Codex, Qoder, OpenCode). In force from 2026-10-02 15:12:10 Australia/Sydney (2026-10-02 05:12:10 GMT): any report recorded before that moment may lack or misstate its model, effort and harness - treat that information as unverified. No entry without all three; if one is unknown write `unknown` and why.
- **Lessons learned (Mohamed, 2026-10-01):** when you find an error and its fix, without being asked: add problem -> cause -> fix to a "Lessons learned" section at the end of this AGENTS.md, and append the same lesson to `C:\AI\General Manager\Projects\<this project>\Lessons Learned.md` under `## YYYY-MM-DD HH:MM:SS` (Sydney) with `Model:` and `Harness:`. Read both at session start.
- Record of this project: `C:\AI\General Manager\Projects\Trading-Gemeni\`. Session start: read the newest `## YYYY-MM-DD` entry there to see where the last session stopped. If the folder is missing, create `Trading-Gemeni.md` (path + one-line purpose) and add a row to `C:\AI\General Manager\Projects\Projects Index.md`.
- Session end or any milestone: append `## YYYY-MM-DD HH:MM:SS` (Australia/Sydney, 24h) - what changed, decisions, next steps as `- [ ]`. Append only; never rewrite older entries. Then run: `git -C "C:\AI\General Manager" add -- "Projects/Trading-Gemeni" "Projects/Projects Index.md" && git -C "C:\AI\General Manager" commit -m "Trading-Gemeni: <what changed>"` (stage only your own paths, never `add -A`: other sessions commit to the vault at the same time).
- Credentials: read `C:\AI\General Manager\APIs\APIs Index.md`; never copy values into this folder or chat. Demo/practice tokens are not secrets.
- Code, data and zips stay here; only notes go in General Manager.
- Verification: state the target in one line before working; finish with a runnable check (red before, green after) and a readback. Model choice is Mohamed's (2026-09-25): main and subagents each use whatever model is selected for them - never insist on one; if the same check is still red after two attempts, stop and tell Mohamed what's red and what was tried.
- Full rules (models by job, hard limits, routing): `C:\AI\General Manager\AGENTS.md` section "Working inside a project folder".

## Purpose
FX fundamental dashboard, Gemini build (Electron/React/Vite, 6-pillar scoring, RSS news tab). Audited in the vault note `General/FX Fundamental Dashboards Audit.md`. Commit your work; the tree has been left uncommitted before.

