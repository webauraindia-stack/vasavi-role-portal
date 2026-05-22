# Next.js 16.0.1 Migration Report

**Date:** May 22, 2026  
**Scope:** Active applications only (`vasavi-main-site`, `vasavi-superadmin`)  
**Status:** Both apps build successfully on **Next.js 16.0.1** with **React 19.2.x**

---

## Executive Summary

| App | Before | After | Build |
|-----|--------|-------|-------|
| vasavi-main-site | Next 14.2.21, React 18 | Next 16.0.1, React 19 | Pass |
| vasavi-superadmin | Next 14.2.21, React 18 | Next 16.0.1, React 19 | Pass |

**Not migrated (legacy / archived):** `apps/`, `packages/`, `vasavi-admin/` — still reference older Next versions if present. Use only the two active apps per root `README.md`.

---

## Dependency Upgrades

### vasavi-main-site

| Package | Old | New | Notes |
|---------|-----|-----|-------|
| `next` | 14.2.21 | **16.0.1** | Turbopack default bundler |
| `react` / `react-dom` | ^18.3.1 | **^19.0.0** (resolved 19.2.6) | React 19 automatic JSX runtime |
| `eslint` | ^8 | **^9** | Flat config |
| `eslint-config-next` | 14.2.21 | **16.0.1** | Aligned with Next 16 |
| `@types/react` / `@types/react-dom` | ^18 | **^19** | |
| `@types/node` | ^20 | **^22** | |
| `typescript` | ^5 | **^5.7** | |
| `next-auth` | 5.0.0-beta.25 | **5.0.0-beta.31** | Peer supports Next 16 |

### vasavi-superadmin

| Package | Old | New | Notes |
|---------|-----|-----|-------|
| `next` | 14.2.21 | **16.0.1** | |
| `react` / `react-dom` | ^18.3.1 | **^19.0.0** (resolved 19.2.6) | |
| `eslint` / `eslint-config-next` | 14.x / ^8 | **9** / **16.0.1** | |
| `@types/*` | ^18 / ^20 | **^19** / **^22** | |

### Removed packages (legacy / unused)

| Package | App | Reason |
|---------|-----|--------|
| `next-intl` | main-site | Never imported; i18n uses `react-i18next` |
| `@auth/core` | main-site | Redundant explicit dep (via `next-auth`) |
| `framer-motion` | superadmin | Zero imports in codebase |

---

## Removed Legacy Features & Files

| Item | Action |
|------|--------|
| **Pages Router** | None existed — App Router only |
| `next.config.mjs` | Replaced with typed `next.config.ts` (both apps) |
| `.eslintrc.json` | Replaced with `eslint.config.mjs` (ESLint 9 flat config) |
| `middleware.ts` (main-site) | Renamed to **`proxy.ts`** (Next 16 convention) |
| `app/admin-globals-snippet.css` | Deleted (never imported) |
| `getServerSideProps` / `getStaticProps` | Never used |
| `next/legacy/image` | Never used |
| `images.domains` config | Never used (`remotePatterns` already in place) |
| `publicRuntimeConfig` / `serverRuntimeConfig` | Never used |

---

## Breaking Changes Addressed (Next 16)

### 1. Async route `params` (Server Components)

**File:** `vasavi-main-site/app/hotels/[slug]/page.tsx`

- `params` is now `Promise<{ slug: string }>`
- `generateMetadata` and page component are `async` and `await params`

Client pages using `useSearchParams()` / `useParams()` are unchanged (client hooks).

### 2. Middleware → Proxy (main-site)

**File:** `vasavi-main-site/middleware.ts` → `vasavi-main-site/proxy.ts`

- Same auth logic via NextAuth `auth()` wrapper
- Removes build deprecation warning

### 3. TypeScript / JSX

Next 16 auto-updated both `tsconfig.json` files:

- `jsx`: `"react-jsx"` (React automatic runtime)
- `target`: `ES2017`
- `include`: `.next/dev/types/**/*.ts`

### 4. Bundler

- **Turbopack** is the default for `next dev` and `next build` in 16.0.1
- No webpack-specific custom config was present

---

## Refactored / Added Files

| File | Change |
|------|--------|
| `vasavi-main-site/package.json` | Next 16, React 19, engines, renamed package `vasavi-main-site` |
| `vasavi-superadmin/package.json` | Next 16, React 19, engines |
| `vasavi-main-site/next.config.ts` | Typed config (from `.mjs`) |
| `vasavi-superadmin/next.config.ts` | Typed config |
| `vasavi-main-site/eslint.config.mjs` | ESLint 9 flat config |
| `vasavi-superadmin/eslint.config.mjs` | ESLint 9 flat config |
| `vasavi-main-site/proxy.ts` | Auth route protection (was middleware) |
| `vasavi-main-site/app/robots.ts` | SEO — disallow private routes |
| `vasavi-superadmin/app/robots.ts` | Block all crawlers (admin portal) |
| `vasavi-main-site/app/sitemap.ts` | Uses `NEXT_PUBLIC_SITE_URL` instead of hardcoded `hotelhub.com` |
| `README.md` | Node 20.9+ requirement, migration link |
| `MIGRATION_REPORT.md` | This document |

---

## Architecture Preserved

- **App Router** only — no Pages Router migration needed
- **Server Components** by default on marketing pages (`/`, `/about`, `/hotels/[slug]`, etc.)
- **Client Components** retained where required (booking modal, Zustand, charts, RBAC shell)
- **ISR** on hotel pages: `revalidate = 3600` + `generateStaticParams`
- **API routes** unchanged (`/api/auth`, `/api/rooms/search`, etc.)
- **RBAC portal** functionality unchanged in superadmin

---

## Build Verification

```bash
cd vasavi-main-site && npm run build   # ✓ 34 static/SSG routes
cd vasavi-superadmin && npm run build  # ✓ 25 routes
```

---

## Security & Production Notes

### Manual action required: Next.js security patch

npm reports **Next.js 16.0.1 has a known security vulnerability** (CVE-2025-66478). You requested pin `16.0.1`; when ready for production, upgrade to the latest patched **16.x** release:

```bash
npm install next@latest eslint-config-next@latest
```

### Remaining production tasks (unchanged by migration)

1. Replace demo auth (hardcoded credentials) with database-backed auth
2. Server-side RBAC for superadmin (not client-only Zustand)
3. Connect Prisma / PostgreSQL (`packages/database` schema exists but unused)
4. Add CI/CD pipeline
5. Protect `/admin` on main-site in `proxy.ts` matcher

---

## Optional Follow-ups (Not Done)

| Item | Effort | Benefit |
|------|--------|---------|
| Upgrade to latest patched Next 16.x | Low | Security |
| Enable `cacheComponents` / `use cache` for static data | Medium | Performance |
| Enable React Compiler (`reactCompiler: true`) | Low | Fewer re-renders |
| Migrate more pages to Server Components | Medium | Smaller client bundles |
| Delete or upgrade `apps/`, `vasavi-admin/` | High | Remove version drift |
| Add `app/not-found.tsx` + `app/error.tsx` globally | Low | UX |
| Rename package lock stale names (`hotelhub`, `vasavi-hotel-manager`) | Low | Clarity |

---

## Run Commands (Post-Migration)

```bash
# Requires Node.js >= 20.9
cd vasavi-main-site && npm install && npm run dev    # :3000
cd vasavi-superadmin && npm install && npm run dev  # :3001
```

---

## Summary Checklist

- [x] Next.js 16.0.1 installed (both active apps)
- [x] React 19 installed
- [x] Legacy `next.config.mjs` removed
- [x] Legacy ESLint config removed
- [x] Async `params` fixed for dynamic routes
- [x] `middleware.ts` → `proxy.ts` (main-site)
- [x] Unused dependencies removed
- [x] Production builds pass
- [ ] Upgrade to patched Next 16.x when deploying to production (recommended)
- [ ] Migrate archived monorepo folders (optional)
