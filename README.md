# Muslima Stories Reader

A local, self-contained library for the 13 stories by Muslima Acheampong (2020). Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Run locally

Install Node.js 20.9+ and pnpm 11, then run from this folder:

```powershell
pnpm.cmd install
pnpm.cmd dev
```

Open `http://localhost:3000`. For a production check, run `pnpm.cmd build` followed by `pnpm.cmd start`.

## Story source

The project includes its own source files: 13 DOCX files in `content/docx` and the supplied PNG artwork in `public/books`. `scripts/import-stories.mjs` reads each DOCX heading and body, checks that the artwork exists, and generates `src/generated/stories.json`. It runs automatically before `dev` and `build`; run `pnpm.cmd import:stories` to refresh the data directly after editing a DOCX.

Genres and artwork pairings are defined in the import script. Reader page lengths adapt to the available screen space; paragraphs and wording come from the DOCX files.

## Checks

```powershell
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd build
```
