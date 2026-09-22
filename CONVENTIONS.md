# Trading-Gemeni

This file exists for tools that do not read AGENTS.md. The full project rules are in `AGENTS.md` in this folder; the standing block below is copied from it and must stay identical.

## Standing rules (Mohamed) - read first, every session
- Record of this project: `C:\AI\General Manager\Projects\Trading-Gemeni\`. Session start: read the newest `## YYYY-MM-DD` entry there to see where the last session stopped. If the folder is missing, create `Trading-Gemeni.md` (path + one-line purpose) and add a row to `C:\AI\General Manager\Projects\Projects Index.md`.
- Session end or any milestone: append `## YYYY-MM-DD HH:MM:SS` (Australia/Sydney, 24h) - what changed, decisions, next steps as `- [ ]`. Append only; never rewrite older entries. Then run: `git -C "C:\AI\General Manager" add -A && git -C "C:\AI\General Manager" commit -m "Trading-Gemeni: <what changed>"`.
- Credentials: read `C:\AI\General Manager\APIs\APIs Index.md`; never copy values into this folder or chat. Demo/practice tokens are not secrets.
- Code, data and zips stay here; only notes go in General Manager.
- Verification: state the target in one line before working; finish with a runnable check (red before, green after) and a readback. Cold review by a different model before big runs.
- Full rules (models by job, hard limits, routing): `C:\AI\General Manager\AGENTS.md` section "Working inside a project folder".
