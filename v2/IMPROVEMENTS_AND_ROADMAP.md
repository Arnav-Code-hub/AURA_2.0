# AURA v2 — Improvements & Roadmap

## 1. Things That Need Improvement

### UX & Polish
- **Upload “AI” is mock only** — Tags and category are hardcoded (e.g. "Casual", "Cotton", "Summer", category "Tops"). Either integrate a real vision API (e.g. Google Vision, Replicate) or label it as “Manual tags” until AI is added.
- **Outfit Mixer when not logged in** — Shows empty slots with “Add Tops/Bottoms/Shoes”. Consider a short CTA like “Sign in to use the Mixer” or a demo with placeholder images so the value is clear.
- **No error toasts** — Failed uploads, deletes, or API errors often only `console.error` or `alert()`. Add a small toast/notification system (e.g. sonner, react-hot-toast) for success and error feedback.
- **Wardrobe grid on small screens** — Confirm 2-column grid and touch targets are comfortable on mobile; add pull-to-refresh or a refresh button if needed.
- **Suggestions page empty state** — When there are no trends, the copy is fine but you could add a “Request trends” or “Check back soon” CTA and a link to the main Mixer.

### Performance
- **Duplicate wardrobe fetches** — Home fetches session items and passes to OutfitMixer; Wardrobe page fetches again. Consider a shared cache (React Query, SWR, or context) so one fetch is reused.
- **Images not optimized** — Wardrobe/upload/suggestions use raw image URLs. Use Next.js `<Image>` with proper sizes or a CDN/image API to avoid loading full-res images on mobile.
- **Lenis on every page** — Lenis runs globally. Consider disabling or using a lighter scroll on heavy pages (e.g. admin) if you notice jank.

### Security & Config
- **Admin UIDs in two env vars** — `ADMIN_UIDS` (server) and `NEXT_PUBLIC_ADMIN_UIDS` (client) must stay in sync. Document this clearly and consider a single source (e.g. server-only admin check and an `/api/auth/me` that returns `isAdmin`).
- **Firebase config in client** — `firebase.ts` has API keys in source. For production, ensure Firebase security rules and Auth domains are locked; keys in client are normal but restrict by domain in Firebase Console.
- **Session cookie scope** — Confirm `sameSite` and `secure` are correct for production (e.g. HTTPS-only) so session auth works on Vercel.

### Code Quality
- **Firestore index** — `wardrobe` query uses `where("userId", "==", uid)` and `orderBy("createdAt", "desc")`. Ensure a composite index exists in Firebase Console or the app will throw at runtime.
- **Type safety** — Some API responses are cast with `as`; consider shared types (e.g. `api-types.ts`) and runtime checks for critical payloads.
- **Accessibility** — Add `aria-label` on icon-only buttons (e.g. Logout, delete, Mix It), ensure focus order and contrast meet WCAG where possible.

---

## 2. Things We Can Add

### High Impact (Differentiators)
- **Real AI for uploads** — Use a vision API to suggest tags and category from the photo (e.g. “Denim”, “Jacket”, “Casual”). Improves “AI” positioning and saves user time.
- **Sponsor bias in Outfit Mixer** — When picking Top/Bottom/Shoe, weight items by sponsor priority (and optional `sponsorId` or category match). Makes the admin “bias” setting actually affect the mixer.
- **Save / favorite outfits** — Let users save a Mixer result (e.g. “Friday look”) to a “Saved outfits” list and optionally name it. Stored in Firestore per user.
- **Weather / occasion filters** — Optional filters like “Weekend”, “Work”, “Date” or “Hot / Cold” that influence which items are shown or suggested (tags or manual filters to start).

### Engagement & Retention
- **Onboarding flow** — First-time users: short steps (e.g. “Add 1 top, 1 bottom, 1 shoe”) with progress and a first “Mix” celebration.
- **Weekly digest or “Outfit of the day”** — Optional email or in-app reminder: “Your daily mix is ready” with one pre-generated outfit (could use Mixer logic + saved preferences).
- **Share outfit** — Share current mix as an image (e.g. canvas or html-to-image) or a link (e.g. `/outfit/:id` with read-only view).

### Monetization & Admin
- **Sponsor analytics (admin)** — Simple counts: how many times a sponsor’s item appeared in suggestions or mixer. Stored in Firestore or a small analytics collection.
- **Trend scheduling** — Admin can set `liveAt` / `expiresAt` for trends so they auto-show or hide by date.
- **Featured trend on home** — One “Trending now” or “AI pick” card on the home page that links to Suggestions or a specific trend.

### Technical & DX
- **E2E tests** — Playwright or Cypress for: sign-in → upload → wardrobe → mixer flow and admin trends CRUD.
- **Error boundaries** — React error boundaries on key routes (home, wardrobe, admin) with a fallback UI and optional error reporting.
- **PWA / offline** — Service worker + manifest so the app can be installed and work offline for viewing wardrobe and saved outfits (writes when back online).
- **i18n** — If you plan multiple locales, add structure early (e.g. next-intl or next-i18next) for nav, buttons, and empty states.

### Content & Discovery
- **Trend detail page** — `/suggestions/[slug]` with full trend copy, images, and “Get this look” linking to Mixer or wardrobe.
- **“Get this look” from a trend** — Map a trend’s category focus to the user’s wardrobe and pre-fill or highlight the Mixer with matching items.
- **Curated looks (admin)** — Admin can create “Look” entries (e.g. “Minimalist Monday”) with fixed Top/Bottom/Shoe image URLs or item IDs, shown in Suggestions or a “Curated” section.

---

## 3. Quick Wins (Low Effort)

1. Add a **skip-to-content** link and basic **focus styles** for keyboard users.
2. Use **Next.js `<Image>`** for wardrobe thumbnails and trend images with sensible `sizes`.
3. Add **toast notifications** for “Item added”, “Outfit saved”, “Deleted” instead of only `alert()` or console.
4. **Document env vars** in README or `.env.example`: `ADMIN_UIDS`, `NEXT_PUBLIC_ADMIN_UIDS`, `NEXT_PUBLIC_APP_URL`, `JWT_SECRET`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `AUTH_EXCHANGE_SECRET`.
5. **Firestore composite index** — Add link or instructions in README for the `wardrobe` (userId + createdAt) index.
6. **Mobile nav** — Hamburger menu for small screens so nav links don’t overflow.

---

## 4. Suggested Priority Order

| Priority | Item |
|----------|------|
| P0 | Firestore index for wardrobe; env docs; error toasts |
| P1 | Real AI (or clear “manual”) for upload tags/category; sponsor bias in Mixer |
| P2 | Save/favorite outfits; onboarding; Next.js Image |
| P3 | Share outfit; trend detail page; PWA; E2E tests |

You can paste this into your repo as `IMPROVEMENTS_AND_ROADMAP.md` and tick items off as you go.
