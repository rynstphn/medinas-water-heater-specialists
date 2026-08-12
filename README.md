# Medina's Water Heater Specialists — Website

**🔗 Live site: [medinas-water-heater-specialists.vercel.app](https://medinas-water-heater-specialists.vercel.app/)**

Marketing site for [Medina's Water Heater Specialists](https://www.yelp.com/biz/medinas-water-heater-specialists-suisun-city-2), a water-heater-only service business in Suisun City, CA serving Solano and Napa counties.

Single-page static site — no framework, no build step. Hand-written HTML, CSS, and vanilla JS, deployed on Vercel.

---

## Stack

| Layer | Choice |
|---|---|
| Markup | Single `index.html` (semantic sections + JSON-LD `LocalBusiness` schema) |
| Styles | One `styles.css` — CSS custom properties, no preprocessor |
| Behavior | One `script.js` — vanilla ES2020, no dependencies at runtime |
| Type | Aleo (wordmark) · Libre Franklin (display/body) · IBM Plex Mono (technical labels), via Google Fonts |
| Forms | [Formspree](https://formspree.io) POST endpoint |
| Hosting | Vercel (static) + Vercel Web Analytics & Speed Insights |

The only npm dependencies (`@vercel/analytics`, `@vercel/speed-insights`) are Vercel's packages; the page itself loads the insights script directly from `/_vercel/insights/script.js`, so nothing is bundled.

---

## Repository layout

```
index.html              Entire page — hero, services, process, stats, reviews,
                        service area, FAQ, booking form, footer
styles.css              Design tokens + all component styles
script.js               Nav, mobile menu, scroll reveals, counters, FAQ,
                        review carousel, hero→header logo handoff, form submit
vercel.json             Cache-Control headers for /assets/*
assets/brand/           Production logo set — the only assets the site serves
                        (SVG + WebP + PNG at @1x/@2x/@3x, plus separators)
Logo/                   Source logo package and usage documentation
Components/             Design references the UI components were adapted from
audience-research.md    Customer research notes
claude.md               Project context for AI-assisted work
```

**Print and physical assets are deliberately not kept here.** Door magnets, vehicle
signage, yard signs, and similar print artwork live outside the repository — they
are never served by the site, and print-resolution files bloat clones for no
benefit. `assets/brand/svg/` holds the vector masters; hand those to any printer.

---

## Running locally

No build step. Serve the directory over HTTP (opening `index.html` via `file://` breaks the fetch-based pieces):

```bash
npx serve .
```

Or with Python:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Note: Vercel Analytics and Speed Insights 404 locally — that's expected, they only resolve on Vercel.

---

## Configuration

Two integration points are wired but need credentials.

**1. Booking form (live)** — `index.html`, the `#booking-form` element. Submits to a Formspree endpoint via `fetch`, with client-side validation and an inline success state in `script.js`. Swap the `action` URL to change the destination inbox.

**2. Google Reviews (inactive)** — top of `script.js`:

```js
const GOOGLE_PLACE_ID = 'YOUR_PLACE_ID_HERE';
const GOOGLE_API_KEY  = 'YOUR_API_KEY_HERE';
```

The fetch scaffold and grid activate automatically once both are set. Until then the Yelp reviews block (hardcoded, manually curated from verified Yelp reviews) is what renders. Use a browser-restricted key with the Places API enabled.

---

## Design system

Aesthetic: **Clean Steel** — navy industrial professional. All colors are tokens at the top of `styles.css`.

| Token | Value | Role |
|---|---|---|
| `--navy` … `--navy-5` | `#0B1927` → `#234068` | Background depth ramp |
| `--steel` | `#2E8DF0` | Primary action / accent |
| `--brass` | `#B8924A` | Brand accent — rings, rules, drop marks |
| `--t1` … `--t4` | `#ECF2F9` → `#2E4959` | Text hierarchy |
| `--form*` | light palette | Booking form (inverted surface) |

No brown or amber outside the brass brand accent — the palette stays in the blue family.

Full logo usage rules, clear space, and minimum sizes are documented in `assets/brand/README.txt`.

---

## Performance & accessibility notes

Choices here are deliberate; changing them tends to regress Lighthouse scores:

- Google Fonts load non-blocking via `preload` + `media="print"` → `onload` swap, with a `<noscript>` fallback.
- The sticky header toggles `.scrolled` with an `IntersectionObserver` sentinel rather than a scroll listener, to avoid forced reflow.
- The hero-wordmark → header-logo handoff is deferred until after load so it doesn't compete with LCP.
- Animations are composited (`transform`/`opacity` only).
- Logos ship as WebP inside `<picture>` with a full PNG `src` + `srcset` fallback, saving 65–73% on the served bytes. **Keep the two formats in sync** — if you re-export a PNG, regenerate its `.webp` sibling at matching dimensions, or WebP-capable browsers (nearly all of them) quietly serve the stale one.
- Skip link, semantic landmarks, labeled form fields, and `details`/`summary` for the FAQ accordion.

---

## Deployment

Production: **https://medinas-water-heater-specialists.vercel.app/**

Pushes to `main` deploy through Vercel.

### Asset caching

`vercel.json` sets this on `/assets/*`:

```
Cache-Control: public, max-age=86400, stale-while-revalidate=604800
```

Cached assets serve instantly for 24 hours. For the following week the browser still serves the cached copy immediately, then refreshes it in the background — so a re-exported logo reaches returning visitors within a day or two with no perceptible cost on any request.

This replaced a `max-age=31536000, immutable` header. `immutable` is a promise that a URL's bytes will *never* change, which only holds if filenames are versioned on every edit — and with no build step to enforce that, it silently breaks the moment someone overwrites a logo in place. The shorter window plus `stale-while-revalidate` keeps effectively all of the performance while letting asset edits propagate on their own. **You can now overwrite brand assets under their existing filenames.**

---

## Business details

**Medina's Water Heater Specialists** · Owner: Paul Medina
📍 Suisun City, CA 94534
📞 (707) 336-2290
🕐 Mon–Thu 9am–5pm · Fri 9am–1pm · Closed weekends
🔧 Water heaters only — tank, tankless, and hybrid/heat pump
📌 Service area: Suisun City, Fairfield, Vacaville, Vallejo, Benicia, Dixon, Napa

---

*This repository contains the website only. Content and copy are maintained alongside the business's marketing operations.*
