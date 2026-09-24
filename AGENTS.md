<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Muslima Stories Reader

This is a Next.js 16 app for browsing and reading the Muslima Acheampong story collection. The app is intentionally self-contained: story content is imported from DOCX files, then converted into static JSON used by the UI.

## Project shape

- `src/app/` contains the app router pages.
- `src/components/` contains the library and reader UI.
- `src/lib/stories.ts` exposes the generated story data and lookup helpers.
- `src/generated/stories.json` is generated output from the import pipeline and should not be hand-edited.
- `content/docx/` is the canonical story source.
- `public/books/` contains the matching cover/artwork files.
- `scripts/import-stories.mjs` reads the DOCX files and generates the story index used by the app.

## Core workflows

- Install dependencies with pnpm 9.x. The project is pinned to `pnpm@9.15.5` in `package.json` because the 11.12.0 release is broken for Vercel installs.
- Run `pnpm import:stories` after changing source story files or artwork.
- `predev` and `prebuild` automatically run the import script before local dev builds.
- Use `pnpm typecheck`, `pnpm lint`, and `pnpm build` for project validation.

## Important conventions

- Keep story metadata and content in the DOCX source files rather than editing generated JSON directly.
- Any new story requires matching artwork in `public/books` and a valid import mapping in the script.
- The route at `src/app/stories/[slug]/page.tsx` uses `generateStaticParams()` and `generateMetadata()` with a Promise-based `params` contract in App Router.
- Prefer reusable UI patterns in `src/components/` over ad hoc page logic.
- When changing the build or deployment setup, keep the package manager pinned to a stable pnpm release and verify with a fresh install before shipping.

## Deployment notes

- Vercel deployments rely on the `packageManager` field in `package.json`.
- Do not upgrade to pnpm 11.12.0 for this project; it fails during dependency installation on Vercel.
- If content changes are required, push the updated source files and rebuild the app; generated stories are refreshed during the build pipeline.

## Before making changes

- Confirm whether the task is modifying generated data or source content.
- Prefer safe source edits in the DOCX and script files over editing `src/generated/stories.json` directly.
- If the work touches deployment config, validate the install step with a stable pnpm version before finalizing the patch.
