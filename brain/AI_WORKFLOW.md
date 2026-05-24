# AI Workflow

## Purpose
This file defines how AI agents should work in the afterservice repo.

## Standard Workflow
1. Read `brain/BRAIN.md`.
2. Read `brain/product/roadmap.md` and `brain/tasks/roadmap.md`.
3. Inspect the relevant code before editing.
4. Keep edits scoped to the active phase/task.
5. Run the smallest meaningful checks first, then broader checks before handoff.
6. Update the brain when a decision, contract, roadmap item, or architecture changes.

## Required Before Implementation
- Confirm the target phase and task from `tasks/roadmap.md`.
- Check `git status --short`.
- Search for existing local patterns before adding new abstractions.
- Do not introduce new product names.

## Required After Implementation
- Run relevant typecheck/lint/build/test commands.
- Update `tasks/done.md` and `tasks/in-progress.md` if the task state changes.
- Add an ADR for decisions that affect architecture, schema, billing, auth, routing, or deployment.

## Verification Ladder
- Single package typecheck when editing one package.
- App typecheck when editing app UI or API client code.
- Root `bun run typecheck` before broad handoff.
- Root `bun run lint` before broad handoff.
- Root `bun run build` for scaffold, routing, deployment, or framework changes.
