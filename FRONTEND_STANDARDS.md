# Frontend file/folder standard

Why this exists: every page in `app/` was `"use client"` top-to-bottom — routing,
data-fetching, and interactive UI all mixed into one file, with no per-page
`metadata` (bad SEO) and no consistent place to put a page's types or API
calls. This doc is the fix: one standard, applied page-by-page. `app/page.tsx`
+ `features/home/` is the reference implementation — copy its shape for every
other page.

## The rule

**`app/**/page.tsx` is always a thin Server Component.** No `"use client"`.
Its only jobs: export `metadata` (or `generateMetadata` for dynamic routes),
fetch first-paint data, and render the feature's Client Component.

**Everything specific to one page/domain lives in `features/<feature>/`**,
outside `app/`, named after the route it belongs to:

```
app/
  page.tsx                       <- server: metadata + render <HomeClient/>

  courses/
    page.tsx                     <- server: metadata + fetch + render <CoursesClient/>
    [id]/
      page.tsx                   <- server: generateMetadata + fetch + render <CourseDetailClient/>

features/
  home/
    home-client.tsx              <- "use client": HomeClient, all interactivity/animation

  courses/
    courses-client.tsx           <- "use client": top-level composition for the list page
    course-detail-client.tsx     <- "use client": top-level composition for the detail page
    types.ts                     <- shared TS types for this feature's API entities
    constants.ts                 <- feature-level constants, if any
    hooks/
      use-course-filters.ts      <- state/orchestration, one hook per concern
    api/
      fetch-courses.ts           <- server-fetch helpers, shared by page.tsx + generateMetadata
      fetch-course-by-id.ts
    schemas/
      course-filters.schema.ts   <- zod schemas for any validated input (forms, query params)
    components/                  <- presentational pieces used only within this feature
      course-card.tsx
```

This is the [bulletproof-react](https://github.com/alan2207/bulletproof-react) feature-folder
shape, applied per route family. `features/cart/` is the reference
implementation of the full shape (see below) — copy its structure exactly.

Rules for what goes where:

- **One feature folder per route family**, not per route. `courses/`,
  `courses/[id]/`, and the 7 course-category pages
  (`courses/high`, `courses/middle`, ...) all belong to `features/courses/`
  — that's also where the Batch 6 category-page template split lands.
- **`components/`, `hooks/`, `api/`, `schemas/` are folders; `types.ts` and
  `constants.ts` are flat files** at the feature root — don't wrap a single
  types file in a `types/` folder.
- **Only create the subfolders a feature actually needs.** `features/home/`
  has no data fetching or validation, so it's just `home-client.tsx` — no
  empty `api/`/`hooks/`/`schemas/` scaffolding. Add a subfolder when there's
  a real file to put in it, not up front.
- **`hooks/`** holds the feature's state/orchestration — the page's
  `useState`/`useEffect`/business-logic, extracted out of the client
  component so the component itself stays a thin composition of JSX
  (see `features/cart/hooks/use-cart-checkout.ts`). One hook per real
  concern; split further if a hook is doing two unrelated jobs.
- **`api/`** holds one function per network call, each with a typed return
  shape — never an inline `fetch()` inside a hook or component. Client-side
  calls hit our own `/api/*` routes directly; server-side calls (inside
  `page.tsx`/`generateMetadata`) use the existing `getBaseUrl()` + `fetch`
  pattern from `app/articles/page.tsx`. Next.js automatically dedupes
  identical `fetch()` calls within one request, so calling the same
  server-side `api/` function from both `page.tsx` and `generateMetadata`
  never means fetching twice.
- **`schemas/`** holds `zod` schemas for anything that needs validation —
  form input, checkout payloads, query params. Prefer a schema over a
  hand-rolled if-chain even for simple cases (see
  `features/cart/schemas/shipping-address.schema.ts`, which replaced exactly
  that). `zod` is already a project dependency.
- **`types.ts`** holds the TS types for that feature's data shape (what
  `mock-exams/page.tsx` currently does inline with `ApiMockExam` — move it
  here instead so the detail page and any other consumer share one
  definition instead of redefining it).
- **`components/`** is only for markup specific to that one feature (a
  course card used only on the courses list/detail pages). Anything reused
  *across* features (buttons, dialogs, the marketing section blocks under
  `components/sections/*`, `Navigation`, `Footer`) stays where it already
  is, in the top-level `components/` — that directory is unchanged by this
  standard.
- **Naming**: kebab-case filenames everywhere in `features/` (matches
  `components/sections/*` and `components/ui/*` — the majority convention in
  this repo), PascalCase for the exported component name inside the file.
  This does **not** apply to `components/admin/**`, which uses its own
  established PascalCase-filename convention — leave it as-is, don't mix
  conventions into legacy code for no reason.
- **Admin pages and auth-gated account pages** (`profile/**`, `cart`,
  `checkout/**`, `order-success`, `mock-exams/attempt/**`) are out of scope —
  no SEO need, not part of this pass (see the approved plan for the full
  batch list and reasoning).

## When something is needed by more than one feature

`features/<x>/{hooks,api,schemas,components}` are for logic local to one
feature. The moment a hook/api-call/schema is needed by a **second**
feature, promote it out instead of copy-pasting or reaching across feature
folders:

- Cross-feature **schemas** → `lib/schemas/` (e.g. `lib/schemas/shipping-address.schema.ts`,
  needed by both `features/cart` and `features/checkout`).
- Cross-feature **api helpers** → `lib/api/` (e.g. `lib/api/orders.ts`, `lib/api/coupons.ts`).
- Cross-feature **hooks** → the existing top-level `hooks/` folder (this repo
  already does this — `hooks/use-school-field.ts` is used by three checkout
  pages; follow that precedent, don't add a second copy per feature).
- Cross-feature **components** → the existing top-level `components/`
  (unchanged from before this standard). Loose cross-cutting components live
  directly under `components/` with no subfolder — matches the existing
  `components/navigation.tsx`, `components/site-chrome.tsx` pattern (not
  everything needs a category folder). Example: `components/school-field.tsx`
  and `components/shipping-fields.tsx` started in `features/checkout/`,
  graduated here once `features/order-success` needed them too.

Don't promote pre-emptively — a schema/hook used by exactly one feature
stays in that feature's folder until a second consumer actually shows up.

## Reference implementation

- `app/page.tsx` / `features/home/home-client.tsx` — simplest case, no data
  fetching, pure server-shell-renders-client-component split.
- `app/cart/page.tsx` / `features/cart/**` — the full shape: `hooks/` for
  state, `api/` for typed network calls, `schemas/` for `zod` validation,
  `components/` for the item row / order summary / shipping form. Client-only
  page (auth-gated, no SEO value), so no `api.ts` server-fetch layer here —
  see the courses/books/exam-bank pages for that half of the pattern instead.
- `app/articles/page.tsx`, `app/articles/[slug]/page.tsx` — already correct
  before this standard existed; use them as the template for the server-side
  `getBaseUrl()` + `fetch` + `generateMetadata` pattern once a page needs
  real first-paint data (courses, books, exam-bank, mock-exams).
- `app/checkout/**` / `features/checkout/**` — four routes (cart/course/ebook/mock-exam
  checkout) that were ~90% duplicated logic between the course and ebook
  pages specifically. `features/checkout/hooks/use-single-item-checkout.ts`
  is the shared hook for "buy one item directly" (course + ebook); mock exam
  checkout is intentionally its own hook (`use-mock-exam-checkout.ts`) since
  it has no shipping/school step and a different already-purchased check —
  don't force a single item type through one mega-hook when the flows
  genuinely diverge. Good example of the promotion rule above: this is where
  `lib/schemas/shipping-address.schema.ts` and `lib/api/{orders,coupons}.ts`
  came from — they started in `features/cart`, then graduated once
  `features/checkout` needed the exact same validation/calls.
- `app/order-success/[id]` / `features/order-success/**` — was the single
  largest page in the app (1627 lines, one component). Split into
  `selectors.ts` (pure functions deriving display values from the fetched
  `Order` — no state, easy to reason about independently of React),
  `api/` (one function per network call), `hooks/` (one hook per concern:
  fetching the order, auto-enrollment + retry, resolving the ebook link,
  the slip-upload dialog's form state), and ~10 presentational
  `components/`. Also where `lib/auth-headers.ts` came from — it was
  copy-pasted in three different page files before this pass.
  Two silent dead-code removals happened during the split: an `enrollErr`/
  `triedEnrollRef` state pair that was read in JSX but never written to
  (so it could never actually render), and a `pollUntilPaid` polling
  function that was defined but never called anywhere.
