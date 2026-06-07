# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server (Vite)

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Code quality
npm run lint         # ESLint
npm run format       # Prettier
```

No test suite is configured. Type-check with `tsc --noEmit` (TypeScript 5.8).

## Architecture

**Lexinoori** is a mobile-first news aggregator app (max-width 390px) built with:
- **TanStack Start** (SSR framework) + **TanStack Router** (file-based routing) + **TanStack Query**
- **React 19**, **Tailwind CSS v4**, **shadcn/ui** component library
- **Supabase** for auth and database
- Deployed to **Cloudflare Workers** via `@cloudflare/vite-plugin` and `wrangler.jsonc`

### Entry points

- `src/start.ts` — app entry
- `src/server.ts` — SSR/Cloudflare Worker entry (wraps error handling)
- `src/router.tsx` — creates the TanStack Router instance with a shared `QueryClient` in context
- `src/routes/__root.tsx` — root route: sets HTML `<head>`, wraps the app in `QueryClientProvider`, and renders `<AppShell>`

### Routing

Routes are file-based under `src/routes/` and auto-generated into `src/routeTree.gen.ts` (do not edit manually). Key routes:

| Route | Path |
|---|---|
| `index.tsx` | `/` — Today feed |
| `article.$id.tsx` | `/article/:id` — Article detail |
| `atlas.tsx` | `/atlas` — Map view |
| `stories.tsx` | `/stories` — Stories |
| `digest.tsx` | `/digest` — Digest |
| `profile.tsx` | `/profile` — Settings/auth |
| `saved.tsx` | `/saved` — Saved articles |
| `following.tsx` | `/following` |
| `search.tsx` | `/search` |
| `timeline.$id.tsx` | `/timeline/:id` |
| `journalist.$id.tsx` | `/journalist/:id` |
| `auth.login.tsx` / `auth.signup.tsx` / `auth.forgot.tsx` | Auth flows |

### Layout shell

`AppShell` (`src/components/AppShell.tsx`) conditionally renders `GlobalHeader` and `BottomNav` based on the current pathname. The bottom nav has 5 tabs: Today, Atlas, Stories, Digest, Profile. Content is constrained to `maxWidth: 390` to simulate a phone screen.

### Data layer

All data fetching goes directly through the Supabase client (`src/integrations/supabase/client.ts`). There is no React Query abstraction layer — routes fetch imperatively via `useEffect` + `setState`. The Supabase anon key is hardcoded in the client file (it is a public anon key, this is intentional).

**Key Supabase tables:**
- `articles` — merged news articles with multi-body variants (`body_bullets`, `body_brief`, `body_standard`, `body_deep_dive`) and multilingual columns (`headline_da`, `headline_de`, `headline_es`, `body_standard_da`, etc.)
- `source_articles` — raw scraped articles linked to `articles` via `cluster_id`
- `saved_articles` — user bookmarks (`user_id`, `article_id`)
- `profiles` — user settings including `primary_language`
- `journalists` / `sources` — journalist and outlet metadata

**Multilingual pattern:** User's `primary_language` is fetched from `profiles` table. Translated columns follow `{base_col}_{lang_code}` naming. The `pickLang` helper in `src/lib/articleLanguage.ts` resolves the right column. Supported languages: `en`, `da`, `de`, `es`.

### State management

Global state uses a hand-rolled `useSyncExternalStore` store in `src/hooks/useSavedArticles.ts` (module-level singleton, no context needed). Reading depth preference (`Bullets` / `Brief` / `Standard`) is persisted to `localStorage` under `lex:depth` and communicated via a custom DOM event `lex:depth-changed`.

### Styling conventions

- Dark-only design: background `#111111`, surface `#1C1C1E`, border `#2C2C2E`, muted text `#8E8E93`
- Brand green: `#1A7A5E`; breaking/live indicator: `#00C864`
- Topic accent colors are defined in `src/styles.css` as CSS custom properties (e.g. `--color-topic-politics: #4D6EFF`)
- Mixed usage of Tailwind utility classes and inline `style` props — inline styles are common in route components, Tailwind is used for layout primitives
- Font: **Heebo** (Google Fonts), configured as `--font-sans` in Tailwind theme

### Vite config note

`vite.config.ts` uses `@lovable.dev/vite-tanstack-config` which bundles TanStack Start, Vite React, Tailwind, `tsconfig-paths`, and the Cloudflare plugin. Do **not** add these plugins manually — the comment at the top of the file lists what is already included.
