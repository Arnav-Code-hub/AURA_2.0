# AURA v2 — Implementation Plan

This plan breaks down **IMPROVEMENTS_AND_ROADMAP.md** into phases and concrete tasks. Work in order; later phases often depend on earlier ones.

---

## Phase 0: Foundation (Do First)

**Goal:** Config, docs, and infra so the rest can ship safely.

| # | Task | Details | Files |
|---|------|---------|--------|
| 0.1 | **Firestore composite index** | Create index in Firebase Console: Collection `wardrobe`, fields `userId` (Ascending) + `createdAt` (Descending). Or add `firestore.indexes.json` and deploy. | Firebase Console or `firestore.indexes.json` |
| 0.2 | **`.env.example`** | Add file listing all env vars with short descriptions and no real values. | `.env.example` (new) |
| 0.3 | **README env & index docs** | In README (or SETUP.md): (1) Copy `.env.example` to `.env.local`, (2) Where to get each secret, (3) Link to Firebase Console for the wardrobe index. | `README.md` |
| 0.4 | **Single source for admin** | Have `/api/auth/me` return `isAdmin: boolean` (server checks `ADMIN_UIDS`). Client uses that instead of `NEXT_PUBLIC_ADMIN_UIDS`. Remove `NEXT_PUBLIC_ADMIN_UIDS` from client code. | `src/app/api/auth/me/route.ts`, `src/components/Navbar.tsx`, `src/app/admin/page.tsx` |
| 0.5 | **Session cookie production** | Ensure in auth callback and logout: `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`. Document that production must use HTTPS. | `src/app/api/auth/callback/route.ts`, `src/app/api/auth/logout/route.ts`, docs |

**Phase 0 Done When:** App runs with env from `.env.example`, README explains setup and index; admin is determined only by server; session works on HTTPS.

---

## Phase 1: Quick Wins (UX & A11y)

**Goal:** Toasts, accessibility, mobile nav, and small UX fixes with minimal new code.

| # | Task | Details | Files |
|---|------|---------|--------|
| 1.1 | **Toast system** | Install `sonner` (or `react-hot-toast`). Add `<Toaster />` in layout. Create a small `toast` helper if needed. | `package.json`, `src/app/layout.tsx`, optional `src/lib/toast.ts` |
| 1.2 | **Replace alert/console with toasts** | On upload success/failure, delete success/failure, API errors: call `toast.success()` or `toast.error()` instead of `alert()` / `console.error`. | `src/app/upload/page.tsx`, `src/app/wardrobe/page.tsx`, `src/app/login/page.tsx`, any API error handlers that surface to UI |
| 1.3 | **Skip-to-content + focus styles** | Add `<a href="#main" className="sr-only focus:not-sr-only ...">Skip to content</a>` at top of layout. Add `id="main"` on main content. In globals.css add `:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }`. | `src/app/layout.tsx`, `src/app/globals.css` |
| 1.4 | **aria-labels on icon buttons** | Add `aria-label` to: Logout, Delete item, Mix It (OutfitMixer), any icon-only links in Navbar and Admin. | `src/components/Navbar.tsx`, `src/components/OutfitMixer.tsx`, `src/app/wardrobe/page.tsx`, `src/app/admin/page.tsx` |
| 1.5 | **Mobile nav (hamburger)** | Below a breakpoint (e.g. `md`), hide nav links in a menu; show a hamburger button that toggles a drawer/sheet with the same links. Keep desktop nav as is. | `src/components/Navbar.tsx` |
| 1.6 | **Mixer when not logged in** | When `!user`, show a clear state: e.g. “Sign in to use the Mixer” + button to `/login`, or 3 placeholder images with “Sign in to mix your wardrobe”. Remove or repurpose “Add Tops/Bottoms/Shoes” for guests. | `src/components/OutfitMixer.tsx` |
| 1.7 | **Suggestions empty state** | When `trends.length === 0`, add a secondary CTA (e.g. “Check back soon” or “Try the Outfit Mixer”) and a button linking to `/`. | `src/app/suggestions/page.tsx` |
| 1.8 | **Wardrobe refresh** | Add a “Refresh” button or pull-to-refresh (e.g. `react-pull-to-refresh` or native scroll) on the wardrobe page so users can refetch without reload. | `src/app/wardrobe/page.tsx` |

**Phase 1 Done When:** All success/error feedback uses toasts; keyboard and screen-reader users can skip to content and focus buttons; mobile has a hamburger nav; guests see a clear Mixer CTA; suggestions empty state has a CTA.

---

## Phase 2: Performance & Data

**Goal:** One source of truth for wardrobe, optimized images, optional Lenis tweak.

| # | Task | Details | Files |
|---|------|---------|--------|
| 2.1 | **Wardrobe cache (SWR or React Query)** | Install SWR (or TanStack Query). Create `useWardrobe(uid)` that fetches from Firestore or `/api/wardrobe` when session user; cache by uid. Use it on Home (for OutfitMixer) and Wardrobe page; remove duplicate fetch logic. | `package.json`, `src/hooks/useWardrobe.ts` (or context), `src/app/page.tsx`, `src/app/wardrobe/page.tsx`, `src/components/OutfitMixer.tsx` (optional: accept items from parent only) |
| 2.2 | **Next.js Image for wardrobe** | Replace `<img>` with `<Image>` for wardrobe grid thumbnails. Use `sizes` (e.g. `(max-width: 768px) 50vw, 25vw`). For remote Firebase URLs, add `firebasestorage.googleapis.com` to `images.domains` in next.config. | `next.config.ts`, `src/app/wardrobe/page.tsx` |
| 2.3 | **Next.js Image for trends** | Use `<Image>` for trend cards on Suggestions page; same config for external URLs if needed. | `src/app/suggestions/page.tsx`, `next.config.ts` if new domain |
| 2.4 | **Lenis on heavy pages (optional)** | If admin or another page feels janky, disable Lenis on that route: e.g. wrap LenisProvider with a check for `pathname` and render children without Lenis on `/admin`. | `src/app/layout.tsx` and/or `src/components/LenisProvider.tsx` |

**Phase 2 Done When:** Wardrobe is loaded once and reused; grid and suggestions use `<Image>`; Lenis is optionally off on admin if needed.

---

## Phase 3: Upload Clarity & Sponsor Bias

**Goal:** Honest “AI” labeling or real AI; mixer respects sponsor priority.

| # | Task | Details | Files |
|---|------|---------|--------|
| 3.1 | **Upload: “Manual tags” or real AI** | **Option A:** Rename “AI Suggested Tags” to “Tags” and “Add your own tags”; remove fake 2s delay; keep category dropdown manual. **Option B:** Integrate a vision API (e.g. Google Cloud Vision, Replicate with a vision model): send image, get labels; map labels to tags and suggest category; show “AI suggested” only when API is used. | `src/app/upload/page.tsx`; if Option B: new `src/app/api/analyze-image/route.ts`, env for API key |
| 3.2 | **Sponsor bias in Outfit Mixer** | When building pools for Top/Bottom/Shoe, fetch active sponsors (or pass from parent). For each item, if it matches a sponsor’s `featuredCategory` (or future `sponsorId`), weight it by `priority`. Use weighted random (e.g. duplicate entries in a pool by priority) when calling “Mix It”. | `src/components/OutfitMixer.tsx`, fetch sponsors in parent or inside mixer; optional `src/lib/weighted-random.ts` |
| 3.3 | **Wardrobe item → sponsor (optional)** | If you want item-level sponsor link: add optional `sponsorId` to wardrobe items (admin or upload). Mixer then uses this for weighting; admin can assign sponsor to items later. | `src/services/wardrobe.ts`, Firestore `wardrobe` schema, admin UI or upload form |

**Phase 3 Done When:** Upload is either clearly manual or uses real AI; Mixer’s “Mix It” respects sponsor priority (and optional category/sponsorId).

---

## Phase 4: Save Outfits & Onboarding

**Goal:** Users can save mixer results; first-time users get a short onboarding.

| # | Task | Details | Files |
|---|------|---------|--------|
| 4.1 | **Saved outfits data model** | Firestore collection `savedOutfits`: `userId`, `topId`, `bottomId`, `shoeId`, `name?`, `createdAt`. Optional: store snapshot of image URLs for display if items are later deleted. | Design doc or `src/types/outfit.ts` |
| 4.2 | **Save outfit API** | POST `/api/saved-outfits`: body `{ topId, bottomId, shoeId, name? }`; require auth/session; write to Firestore. GET same route to list user’s saved outfits. DELETE `/api/saved-outfits/[id]`. | `src/app/api/saved-outfits/route.ts`, `[id]/route.ts` |
| 4.3 | **Mixer “Save outfit”** | In OutfitMixer, when there is a current top/bottom/shoe, show “Save outfit” button; optional modal for name. On success, toast and optionally refetch saved list. | `src/components/OutfitMixer.tsx` |
| 4.4 | **Saved outfits page** | New route `/outfits` (or “Saved” in nav): list saved outfits (thumbnail grid or list); each card shows the three items and name; delete button. | `src/app/outfits/page.tsx`, Navbar link |
| 4.5 | **Onboarding flow** | After first sign-in, if wardrobe count is 0, show a small modal or banner: “Add 1 top, 1 bottom, 1 shoe to get started” with progress (0/3) and link to Upload. When they have at least one of each, show “You’re ready! Try the Mixer” and link to Home. Store “onboardingDismissed” or “onboardingStep” in localStorage or user doc. | `src/components/OnboardingBanner.tsx` (or similar), `src/app/layout.tsx` or dashboard, localStorage or Firestore user doc |
| 4.6 | **First Mix celebration** | When user hits “Mix It” for the first time (track in localStorage), show a short success message or confetti. | `src/components/OutfitMixer.tsx` |

**Phase 4 Done When:** Users can save and view/delete saved outfits; new users see onboarding until they have 1 top, 1 bottom, 1 shoe and have tried the Mixer once.

---

## Phase 5: Filters, Featured Trend, Trend Detail

**Goal:** Occasion/weather filters; featured trend on home; trend detail page.

| # | Task | Details | Files |
|---|------|---------|--------|
| 5.1 | **Weather / occasion filters (UI)** | Add optional filter chips or dropdown on Home or Mixer: e.g. “All”, “Work”, “Weekend”, “Date”, “Hot”, “Cold”. Store in component state or URL query. Don’t need backend yet—filter client-side by item tags or category. | `src/app/page.tsx` and/or `src/components/OutfitMixer.tsx` |
| 5.2 | **Filter logic** | Map “Work” / “Weekend” / “Date” to tags or categories; “Hot”/“Cold” to tags. When filter active, filter `tops`, `bottoms`, `shoes` before shuffle. If no items match, show “No items match this filter”. | Same as 5.1 |
| 5.3 | **Featured trend on home** | Fetch first active trend (or a “featured” flag). Below hero or above Mixer, show one card: “Trending now: [name]” with link to `/suggestions` or `/suggestions/[slug]`. | `src/app/page.tsx`, `src/app/api/trends/route.ts` (return first or featured) |
| 5.4 | **Trend detail page** | New route `/suggestions/[slug]`. Slug = trend id or slug field. Fetch trend by id/slug; show full description, image, “Get this look” CTA to Mixer. | `src/app/suggestions/[slug]/page.tsx`, link from suggestions grid |
| 5.5 | **“Get this look” from trend** | On trend detail, “Get this look” links to `/` with query e.g. `?trend=minimalist` or `?category=Tops`. Home/Mixer reads query and pre-filters or highlights matching category. | `src/app/suggestions/[slug]/page.tsx`, `src/app/page.tsx`, `src/components/OutfitMixer.tsx` |

**Phase 5 Done When:** Users can filter by occasion/weather; home shows a featured trend; each trend has a detail page with “Get this look” that deep-links to Mixer with context.

---

## Phase 6: Share, Analytics, Scheduling

**Goal:** Share outfit as image/link; admin analytics and trend scheduling.

| # | Task | Details | Files |
|---|------|---------|--------|
| 6.1 | **Share outfit as image** | Use `html-to-image` or similar: render current Mixer result (three images + labels) in a hidden div, export to PNG, trigger download or open in new tab. Add “Share” or “Download” button in OutfitMixer. | `src/components/OutfitMixer.tsx`, `package.json` |
| 6.2 | **Share outfit as link** | When user saves an outfit, optionally generate a share token (e.g. short id in `savedOutfits`). Public route `/outfit/[id]`: resolve id to saved outfit (or a “sharedOutfits” collection); show read-only view (three images, name). No auth required for view. | `src/app/outfit/[id]/page.tsx`, `src/app/api/saved-outfits/route.ts` (add shareId or use doc id), Firestore rules for public read by id |
| 6.3 | **Sponsor analytics (admin)** | New collection or subcollection: e.g. `mixerImpressions`: `{ sponsorId, date, count }` or per-session. When Mixer picks a sponsor’s item (once you have sponsorId on items or match by category), increment. Admin page: new “Analytics” tab or section showing counts per sponsor. | `src/app/api/admin/analytics/route.ts` or increment in mixer API; `src/app/admin/page.tsx` (Analytics section) |
| 6.4 | **Trend scheduling** | Add `liveAt` and `expiresAt` (timestamp) to trend model. Admin form: optional date pickers. Public API and list: filter trends where `now >= liveAt` and `now <= expiresAt` (or null = no limit). | `src/lib/trends.ts`, Firestore, `src/app/api/trends/route.ts`, `src/app/api/admin/trends/route.ts`, admin trend form |
| 6.5 | **Featured trend flag** | Add `featured: boolean` to trend. Admin can mark one trend as featured. Home and API “featured” endpoint return the featured trend first. | Same as 5.3; add `featured` to trend schema and admin UI |

**Phase 6 Done When:** User can share current mix as image and saved outfit as link; admin sees sponsor impression counts and can schedule and feature trends.

---

## Phase 7: Robustness & Scale

**Goal:** Error boundaries, E2E tests, PWA, type safety.

| # | Task | Details | Files |
|---|------|---------|--------|
| 7.1 | **Error boundaries** | Create `ErrorBoundary` component that catches render errors and shows a fallback UI (“Something went wrong” + retry). Wrap main route segments: e.g. layout children, or per-route in layout. | `src/components/ErrorBoundary.tsx`, `src/app/layout.tsx` or `template.tsx` |
| 7.2 | **Shared API types** | Add `src/types/api.ts` (or `api-types.ts`): types for API responses (wardrobe list, saved outfit, trend, sponsor). Use in API route return types and in client fetch handlers. Replace brittle `as` casts where possible. | `src/types/api.ts`, various API routes and client pages |
| 7.3 | **E2E tests (Playwright)** | Install Playwright. Add tests: (1) Home → Login (mock or real) → Wardrobe → Upload one item → Home → Mixer shows item; (2) Admin: login as admin → Trends CRUD, Sponsors CRUD. Run in CI. | `playwright.config.ts`, `e2e/*.spec.ts` |
| 7.4 | **PWA manifest + service worker** | Add `manifest.json` (name, icons, start_url). Use next-pwa or manual service worker to cache static assets and optionally API GET for wardrobe/outfits for offline read. | `public/manifest.json`, `next.config.ts` (with next-pwa or custom SW), layout meta/link for manifest |
| 7.5 | **i18n (optional)** | If you need multiple locales: add next-intl (or similar), create `messages/en.json` (and others), wrap app with provider, use `useTranslations` in Navbar, buttons, empty states. Defer if single locale is enough for now. | `package.json`, `src/i18n.ts`, `messages/*.json`, `src/app/layout.tsx`, key components |

**Phase 7 Done When:** Errors in a route don’t crash the whole app; key flows are covered by E2E; app is installable and optionally works offline; types are shared and safer.

---

## Phase 8: Nice-to-Have (Backlog)

**Goal:** Lower-priority items to pick up when Phases 0–7 are done.

| # | Task | Details |
|---|------|---------|
| 8.1 | **Daily mix / weekly digest** | Cron or scheduled function: generate one outfit per user (using Mixer logic), store in “dailyMix” or send via email (e.g. Resend, SendGrid). In-app “Outfit of the day” page that reads today’s mix. |
| 8.2 | **Curated looks (admin)** | New collection `curatedLooks`: admin sets fixed image URLs or item IDs for Top/Bottom/Shoe + title. Show in Suggestions under “Curated” or “Editor’s picks”. |
| 8.3 | **“Get this look” pre-fill** | From trend or curated look, open Mixer with those three items pre-selected (if user has them) or show “Add similar items” with links to upload. |
| 8.4 | **Firebase App Check** | Enable App Check for Firestore and Storage to reduce abuse. |
| 8.5 | **Rate limiting** | Add rate limiting on auth and upload APIs (e.g. Upstash Redis or Vercel KV). |

---

## Execution Checklist (Summary)

- [ ] **Phase 0:** Index, .env.example, README, single admin source, session secure
- [ ] **Phase 1:** Toasts, skip-to-content, focus, aria-labels, mobile nav, Mixer guest CTA, suggestions empty state, wardrobe refresh
- [ ] **Phase 2:** Wardrobe cache (SWR/React Query), Next.js Image (wardrobe + trends), optional Lenis off on admin
- [ ] **Phase 3:** Upload manual vs AI, sponsor bias in Mixer, optional sponsorId on items
- [ ] **Phase 4:** Saved outfits (model, API, UI, Mixer button), onboarding, first-Mix celebration
- [ ] **Phase 5:** Occasion/weather filters, featured trend on home, trend detail page, “Get this look” link
- [ ] **Phase 6:** Share (image + link), sponsor analytics, trend scheduling + featured flag
- [ ] **Phase 7:** Error boundaries, API types, E2E, PWA, optional i18n
- [ ] **Phase 8:** Daily mix, curated looks, App Check, rate limiting (as needed)

Use this with **IMPROVEMENTS_AND_ROADMAP.md**: the roadmap is the “what”; this plan is the “how” and “in what order.”
