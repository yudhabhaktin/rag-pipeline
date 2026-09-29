> **Superseded.** The walkthrough now ships from the personal-site repo and lives at
> **[yudhabhakti.com/rag](https://yudhabhakti.com/rag)**, rebuilt as an Astro island with React
> and Web Animations (`src/pages/rag.astro`, `src/components/rag/`). This repository is the
> mobile-first prototype that came first, kept for the history and the plain-HTML version.
> The blog post about the build is
> [drawing a RAG pipeline that survives a phone screen](https://yudhabhakti.com/writing/drawing-a-rag-pipeline-that-survives-a-phone).

# A RAG pipeline, end to end — mobile-first animated walkthrough

An interactive explainer: eight steps of a retrieval-augmented generation pipeline, each
drawn as an animated SVG diagram you can step through, scrub, or let play.

Built because the usual pipeline explainer is a wide landscape diagram with a sidebar:
readable on a laptop, unreadable on a phone. Here the diagram is **drawn in container
pixel space** (1 SVG unit = 1 CSS px, measured from the stage box and redrawn on resize),
so a phone gets a vertically stacked diagram at real type size instead of a shrunken
16:9 one.

## What it does

- **8 steps**: corpus → manifest/dedupe → tiered parsing → structure-aware chunking →
  enrichment/embedding → storage & indexes → hybrid retrieval + rerank → grounded answer.
- **Phases per step**: every step has 2-4 timed phases with their own caption; the
  animation is a pure function of `t`, so scrubbing is deterministic and replayable.
- **Controls**: horizontal step strip, play/pause (auto-advances through the steps),
  prev/next, full-width timeline scrubber, keyboard (`←` `→` `space`).
- **Deep links**: `#s=3` opens step 3.
- **Responsive at every width**: the step strip scrolls horizontally on a phone and becomes
  a sticky sidebar from 1040px; each diagram relayouts as a vertical stack when the stage is
  narrow or portrait, and as rows/columns when it is wide.
- **Accessibility**: `prefers-reduced-motion` renders the finished state instead of
  animating, captions are an `aria-live` region, every control is ≥44×44 CSS px.

## Run locally

No build step, no dependencies:

```bash
python3 -m http.server 8080      # then open http://localhost:8080
```

## Files

```
index.html            markup: stage, step strip, panel, fixed control dock
assets/styles.css     dark theme, mobile-first, dock fixed to the bottom
assets/app.js         SVG toolkit, the eight step scenes, the player
.github/workflows/deploy.yml   Cloudflare Pages deploy (needs two secrets)
```

## Deploy

Cloudflare Pages, project `rag-pipeline-mobile`. The GitHub Actions workflow deploys on
every push to `main` and needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as
repository secrets; without them it writes a `::warning::` and skips instead of failing.

Manual deploy, if you need one:

```bash
npx --yes wrangler@4 pages deploy . --project-name rag-pipeline-mobile --branch main
```

## Reference

The starting point was **["Inside a 100,000-document RAG knowledge base"](https://ardyadipta.github.io/blog/rag-pipeline-explainer.html)
by Ardya Dipta Nandaviri** (© 2026, all rights reserved), which demonstrated the format: a
step list, an animated SVG stage, phases per step, play and scrub. Credit for the idea is
his, and the page footer links back to it.

This repository is an **independent implementation**, not a copy: its own SVG toolkit,
scenes, copy and player, and the responsive approach below. Nothing is taken from his
source.

## Notes on the content

The pipeline described here is the standard shape of a production RAG stack, written for
this explainer. Numbers shown (100,000 documents, 88,412 unique, 768-dim vectors,
71/22/7% parse split) are illustrative defaults — swap them for your own corpus stats in
`assets/app.js`.
