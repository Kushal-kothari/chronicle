# Chronicle landing page

Static marketing site for Chronicle, served via **GitHub Pages**.

## Deploy
1. Push this `docs/` folder to the default branch.
2. GitHub → **Settings → Pages** → Source: *Deploy from a branch* → Branch: your default branch, folder: **/docs**.
3. Live at `https://kushal-kothari.github.io/chronicle/` (matches the canonical/OG URLs in `index.html`).
   - If you later add a custom domain, update the `canonical`, `og:url`, `og:image`, `twitter:image`, and `sitemap.xml`/`robots.txt` URLs accordingly.

## Assets to add (referenced but not committed)
- **`og-image.png`** — 1200×630 social-share card (shown when the link is posted to Twitter/LinkedIn/Slack). Make it from the dashboard screenshot + the tagline "Know where your time goes. Own it." Until added, social cards fall back to no image.
- `icon.png` — copied from `public/128x128.png` (favicon + nav logo).

## Files
- `index.html` — page + full SEO head (meta, Open Graph, Twitter Card, canonical) + schema.org `SoftwareApplication` JSON-LD.
- `styles.css` — design tokens mirror `src/assets/css/chronicle.css` (Apple blue `#0A84FF`, Inter, dark-mode aware).
- `robots.txt`, `sitemap.xml` — crawlability.

Validate before sharing: [Google Rich Results Test](https://search.google.com/test/rich-results) (JSON-LD) and Lighthouse SEO.
