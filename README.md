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

## Things the client still needs to wire up

- **Booking** uses a *custom, simulated* calendar UI (`initBooker` in `js/site.js`).
  Picking a service / day / time and confirming shows a "requested — Debbie will
  confirm by email" screen; **nothing is actually scheduled yet.** When Debbie's
  real Calendly is ready, replace the `[data-booker]` block with a Calendly inline
  embed pointed at `CALENDLY` (constant already in `js/site.js`).
- **Contact form** is front-end only — it shows a confirmation, composes a
  pre-filled `mailto:`, and routes the visitor into the booking calendar.
  Connect `<form id="contactForm">` to Formspree / Basin / Netlify Forms /
  GoHighLevel for real submissions.
- **Quiz** ("Are your books losing you money?") is a standalone lead-magnet
  component (`initQuiz` in `js/site.js`, fully JS-rendered into `<div class="quiz"
  data-quiz>`): intro screen → 6 big A/B/C questions with a progress bar → a
  "books-health" score ring + verdict + CTA. No pricing (Debbie's rates aren't
  set here). It's pushed near the top of the home page and echoed as a
  `.quiz-cta` band on About / Services / Contact. Completing it carries the
  result into the booking calendar.
- **Testimonials + the floating review bubble** use clearly-labelled *sample*
  copy. Swap for real client quotes (and a real Google review link) when ready.
- **Domain / analytics / OG image**: canonical + Open Graph URLs assume
  `https://aboveparbookkeeping.com/`. Add an analytics snippet and a real
  `og:image` (1200×630) if desired.

## Brand

- Gold `#CE9B50` · gold-deep `#B07E3A` · charcoal `#201E1D` / `#242223`
- Cream `#F4EFE6` / paper `#FBF8F2`
- Display type: **Fraunces** · UI/body: **Space Grotesk** (Google Fonts)
- Logo: `images/logo.svg` (full), `images/mark.svg` (seal only), `-light` variants
  for dark backgrounds, `images/favicon.svg`. Rebuilt from the client's existing
  logo with a transparent background.

## SEO

Per-page `<title>` + meta description, canonical, Open Graph, JSON-LD
(`AccountingService`, `OfferCatalog`, `BreadcrumbList`, `ContactPage`),
`robots.txt`, `sitemap.xml`, semantic landmarks, reduced-motion support.
