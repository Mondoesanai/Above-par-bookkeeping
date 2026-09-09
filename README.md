# Above Par Bookkeeping — website

A four-page marketing site for Above Par Bookkeeping (aboveparbookkeeping.com).
Luxury/editorial "private-ledger" look — charcoal + brass gold (`#CE9B50`) — built
around one goal: **book a free consultation** (or request a quote).

## Run it locally

**Double-click `START SERVER.bat`** (Windows) — it starts the server and opens the site.

Or from a terminal:

```
node serve.mjs
```

Then open <http://localhost:3110>. No build step, no dependencies for the site itself
(`serve.mjs` is plain Node). The screenshot helper (`_shot.mjs`) uses the shared
Puppeteer install in the parent folder and is not needed to run the site.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Photo-led hero, quiz (pushed near the top), services, testimonials, how-it-works, **custom booking calendar**, message form |
| `about.html` | Story, principles, how-we-work timeline, tools, FAQ, photo |
| `services.html` | Payroll / Budget & Forecasting / Invoice Management in depth (with photos), add-ons, pricing philosophy + quiz |
| `contact.html` | Booking calendar (`#book`) first, then a "send a message" form |
| `privacy.html` | Plain-language privacy note (noindex) |

Shared: `css/site.css`, `js/site.js`. Assets in `images/` (logo SVGs) and
`images/photos/` (Unsplash stock — swap for Debbie's real photos when available).

## Integrations (live)

- **Booking = real Calendly.** `index.html` and `contact.html` embed
  `calendly.com/debbie-aboveparbookkeeping/30min` via the official inline widget
  (`assets.calendly.com/assets/external/widget.js`). Every `[data-book]` button
  and the quiz/contact-form handoff call `openScheduler()` in `js/site.js`, which
  re-inits the embed with a prefilled `a1` custom answer (the quiz result or the
  message text) and scrolls to `#book`. Cross-page handoffs carry the note in
  `sessionStorage` (`apb_note`). A plain-link fallback sits under each embed.
  Debbie just needs to set her Calendly availability + intake questions.
- **Google Business Profile** (`https://share.google/vOsIL2xC95UJYuE14`) is wired
  into the footer social row, the homepage review block ("Read it on Google" /
  "Leave a review"), the floating review bubble, and every page's `sameAs`.
- **Contact form** is still front-end only — shows a confirmation, composes a
  pre-filled `mailto:`, and routes into the Calendly embed. Connect
  `<form id="contactForm">` to Formspree / Basin / GoHighLevel for real delivery.
- **Reviews**: one real 5★ Google review (Sarah Reyna) — homepage `.review-hero`
  card + `.review-bubble` + `Review`/`AggregateRating` schema. Add more as they
  come in (`REVIEW_SHORT` in `js/site.js`, `.review-hero` in `index.html`).
- **Quiz** ("Are your books losing you money?") — `initQuiz` in `js/site.js`,
  intro → 6 A/B/C questions → books-health score ring. Result carries into the
  Calendly booking via `openScheduler({ note })`.

## SEO / AI-SEO

- Per-page keyword-targeted `<title>` + meta description, `keywords`, `author`,
  `robots` (`max-image-preview:large`), canonical, `hreflang`, geo meta
  (`geo.region` US-TX, `geo.position`), full Open Graph + `summary_large_image`
  Twitter cards with a real 1200×630 `images/og-cover.png`.
- **Structured data** (JSON-LD): `@graph` on the homepage with `Organization` +
  `WebSite` + `AccountingService` (NAP, geo, `areaServed` cities, hours,
  `hasOfferCatalog`, `aggregateRating`, `review`, `knowsAbout`); `FAQPage` on
  home + about; `Service` graph on services; `ContactPage` + `BreadcrumbList`.
- **AI crawlers**: `robots.txt` explicitly allows GPTBot, OAI-SearchBot,
  ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, etc.
- **`llms.txt`** at the site root — plain-text business summary, facts, page map,
  and common Q&A for LLM answer engines.
- Homepage **FAQ section** (7 conversational Q&As) for People-Also-Ask / AI
  answers. `sitemap.xml` has `lastmod`.
- **Domain / analytics**: canonical URLs assume `https://aboveparbookkeeping.com/`.
  Dashboard `t.js` snippet is already on every page.

## Brand

- Gold `#CE9B50` · gold-deep `#B07E3A` · charcoal `#201E1D` / `#242223`
- Cream `#F4EFE6` / paper `#FBF8F2`
- Display type: **Fraunces** · UI/body: **Space Grotesk** (Google Fonts)
- Logo: `images/logo.svg` (full), `images/mark.svg` (seal only), `-light` variants
  for dark backgrounds, `images/favicon.svg`. Rebuilt from the client's existing
  logo with a transparent background.

