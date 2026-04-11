# Chronicle — Attention Tracker

> Your attention is your most valuable asset. Spend it intentionally.

Chronicle is a privacy-first Chrome extension that tracks how you spend your time online — with smart categories, daily goals, focus sessions, and weekly insights. All data stays on your device.

---

## Features

**Automatic Tracking**
Browse normally. Chronicle silently tracks every site in the background — no manual logging, no disruptions.

**Smart Categories**
Sites are automatically sorted into Work, Learning, Social, Entertainment, News, and Other. Override any site with one tap.

**Daily Goals**
Set limits (max 2h Social) or minimums (at least 1h Learning). Chronicle nudges you when you're close.

**Focus Sessions**
Start a named session with a countdown timer. Rate it when done. Build a log of your deep work over time.

**Weekly Digest**
Smart weekly summary — best day, worst day, category breakdown, vs last week, and personalized insights.

**Site Blocking**
Set daily time limits per site. Chronicle blocks the page when the limit is hit.

**100% Private**
Everything is stored locally using Chrome's storage API. Nothing is ever sent to any server.

---

## Tech Stack

- **Vue 3** + TypeScript
- **Vite** + vite-plugin-web-extension
- Chrome Manifest V3

---

## Development

```bash
# Install dependencies
npm install

# Watch mode (rebuilds on save)
npm run dev

# Production build
npx vite build --mode production

# Build + zip for Chrome Web Store
npm run script:zip
```

Load the extension locally:
1. Run `npm run dev`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the `dist/` folder
5. After changes, click the reload icon on the extension card

---

## License

MIT
