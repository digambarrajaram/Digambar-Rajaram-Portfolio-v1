# Digambar Rajaram — SRE & AI Platform Portfolio

A production-grade, single-page portfolio built with React 19, TypeScript, Vite, and Tailwind CSS. Designed from the ground up to feel like an SRE dashboard — complete with a conversational AI assistant, an interactive incident simulator, and a draggable chat widget.

**[digambarrajaram.cloud](https://digambarrajaram.cloud)**

---

## What makes this different

### SRE-Copilot — AI Chat Agent

An embedded conversational assistant that answers questions about Digambar's background, skills, and projects. Not a generic chatbot — it's grounded in a curated portfolio context with production-hardened safety layers:

- **Model**: Groq (Llama 3.3 70B) with `temperature: 0.4`, max 700 output tokens
- **System prompt**: 7 ground rules that scope responses strictly to portfolio topics, reject prompt injection, and prevent hallucination by requiring the model to cite only the provided context
- **Pre-filter**: Regex-based injection detection catches the cheapest abuse patterns (ignore-instructions, DAN mode, system-prompt-reveal) before spending a model call — defense in depth, not the primary defense
- **Output scrubbing**: Strips any accidentally-echoed API key patterns before returning the response
- **Input validation**: Strips client-supplied `system` role messages, enforces max message count (20) and max message length (2,000 chars)
- **Rate limiting**: 15 requests/minute on `/api/chat`, 100 requests/minute globally
- **Vercel serverless**: Runs as an Express app inside Vercel's `@vercel/node` runtime with proper ESM module resolution (explicit `.js` extensions on all relative imports, `NodeNext` tsconfig)

### Chaos Mode — Interactive Incident Simulator

A toggleable simulation that transforms the entire site into a live incident scenario. Pods crash, CPU spikes, alerts fire, and a self-healing playbook runs a step-by-step automated recovery sequence with a terminal-style overlay. Every metric, chart, and status badge reacts to the mode switch — CPU charts spike, node status degrades, the SLA drops, and the navbar banner turns red. A real demo of SRE observability instincts, not just static copy.

### Draggable Chat Widget

The chat toggle button is a draggable floating action button — press-and-hold to reposition anywhere on screen, tap to open. Position persists across sessions via `localStorage`. Bounded to viewport edges. Uses the Pointer Events API (`pointerdown`/`pointermove`/`pointerup`) with a 6px drag threshold to distinguish drag from tap. Works identically on mouse and touch.

### Scroll-Lock That Actually Works on iOS

iOS Safari's `position: fixed` behavior is notoriously broken when combined with `backdrop-filter` or `transform` ancestors. This project implements a reference-counted body-pin technique:

- `pinBody()`: captures `window.scrollY`, sets `body { position: fixed; top: -${scrollY}px }`, prevents `touchmove`
- `unpinBody()`: restores body styles, scrolls to the saved position in a single `requestAnimationFrame` (before paint — no flash)
- Reference counter: the nav drawer and chat panel share the lock, so opening one while the other is open doesn't unpin the body prematurely
- Deferred unpin: on close, `unpinBody` waits for the exit animation to complete before restoring scroll, so the backdrop and panel fade out together without page bleed-through
- Stale rAF cancellation: `pinBody` cancels any pending scroll-restore rAF from a previous `unpinBody` to prevent scroll position corruption on rapid reopen

### Security Headers & Hardening

- **helmet** with CSP disabled (CSP is a project-specific config — enabled deliberately once origins are audited)
- **CORS** locked to `ALLOWED_ORIGIN` in production, open in dev
- **Rate limiting** on all API routes (express-rate-limit)
- **trust proxy** enabled for accurate client IP behind Vercel's edge
- **Input size cap**: 100 kB JSON body limit
- **No stack traces** leaked in production error responses

### Performance Optimizations

- **Vendor chunk splitting**: `react-vendor` (React + ReactDOM), `ui-vendor` (Motion + Lucide), `md-vendor` (react-markdown + unified ecosystem)
- **Lazy loading**: `ConsoleDemo` and `SREChatWindow` are `React.lazy()` with `Suspense fallback={null}` — the markdown parser (~34 kB gzip) never blocks LCP
- **CSS before scripts**: A Vite plugin reorders the built HTML so the stylesheet `<link>` comes before any `<script>` tag, unblocking FCP
- **Brotli + HTTP/2**: Vercel edge serves all static assets with `content-encoding: br` and `cache-control: public, max-age=31536000, immutable`
- **Font optimization**: Google Fonts loaded via HTML `<link>` (not CSS `@import`), `display=swap`, weights trimmed to 9 (from 15 originally), `preconnect` to both origins
- **`.gitattributes`**: `*.woff2 binary` prevents Git autocrlf corruption on future self-hosted font commits

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 with Rolldown |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| AI Model | Groq SDK — Llama 3.3 70B Versatile |
| API Runtime | Express on Vercel serverless (`@vercel/node`) |
| Markdown | react-markdown + remark-gfm |
| Deployment | Vercel |

---

## Quick Start

```bash
git clone https://github.com/digambarrajaram/Digambar-Rajaram-Portfolio-v1.git
cd Digambar-Rajaram-Portfolio-v1
npm install
```

Create `.env.local`:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Run:

```bash
npm run dev        # development server with HMR
npm run build      # production build
npm run lint       # TypeScript typecheck
```

---

## Project Structure

```
├── api/                    # Vercel serverless API
│   ├── _lib/chatAgent.ts   # AI chat agent (prompt, validation, rate-limit, guardrails)
│   ├── [...slug].ts        # Catch-all serverless route
│   ├── index.ts            # API root route
│   └── tsconfig.json       # NodeNext resolution for .js extensions
├── public/                 # Static assets
├── src/
│   ├── components/         # React components (Hero, Navbar, About, Contact, etc.)
│   ├── hooks/              # bodyPin (scroll lock), scrollTo, useScrollLock
│   ├── data.ts             # Portfolio content — single source of truth
│   ├── App.tsx             # Root layout, lazy-loaded routes
│   ├── main.tsx            # Entry point with dev error filter
│   └── index.css           # Tailwind imports + theme tokens
├── index.html              # HTML shell with font preconnects + scroll restoration
├── vercel.json             # Rewrites, cache headers, static asset rules
├── vite.config.ts          # Build config, chunk splitting, CSS ordering plugin
└── .gitattributes          # Binary declarations for font files
```

---

## Deployment

Push to `main` — Vercel auto-deploys. The `vercel.json` config sets `framework: null` (Vite handles its own build), excludes `/api/` and `/fonts/` from the SPA rewrite, and applies immutable cache headers to hashed assets.

For other platforms (Render, Railway), the `npm run build && npm run start` path serves the Express production server from `dist/`.

---

## License

Personal portfolio. Not intended for redistribution without permission.
