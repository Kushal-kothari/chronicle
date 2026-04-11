<div align="center">

<img src="src/assets/icons/128x128.png" width="80" height="80" alt="Chronicle" />

# Chronicle

**Know where your time goes. Own it.**

A privacy-first Chrome extension that tracks your web activity with smart categories, daily goals, focus sessions, and weekly insights — all stored locally, nothing ever leaves your device.

<br />

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com)
[![Version](https://img.shields.io/badge/version-3.0.0-0A84FF?style=flat-square)](https://github.com/Kushal-kothari/chronicle/releases)
[![License](https://img.shields.io/badge/license-MIT-30D158?style=flat-square)](LICENSE)
[![Privacy](https://img.shields.io/badge/data-100%25_local-FF9F0A?style=flat-square)](#privacy)

</div>

---

## Why Chronicle?

Most people have no idea how they actually spend their time online. They think they spent 20 minutes on Twitter — it was 2 hours. Chronicle gives you the honest picture, without judgment, without sending your data anywhere.

It runs silently in the background and shows you exactly what your attention looks like over days and weeks. Then it gives you tools to shape it.

---

## Features

### Automatic Tracking
Browse normally. Chronicle tracks time on every site in the background — no manual logging, no popups, no interruptions. Switch tabs, it follows. Go idle, it pauses.

### Smart Categories
Sites are automatically classified into **Work**, **Learning**, **Social**, **Entertainment**, **News**, and **Other** using a built-in heuristic engine. Override any site's category with one tap and the change persists forever.

### Daily Goals
Set a limit (*spend less than 2h on Social*) or a minimum (*spend at least 1h on Learning*). Chronicle tracks your progress throughout the day with a progress ring and nudges you when you're within 15 minutes of your limit or goal.

### Focus Sessions
Name your work, set a duration (25m / 45m / 60m / 90m / ∞), and start a focus session. When you finish, rate it 1–5 stars and add a note. Every session is logged so you can look back and see where your deep work actually went.

### Weekly Digest
Every week gets a smart summary: total time, daily average, best day, least active day, category breakdown, and a comparison against last week. Chronicle generates a plain-language headline and insight for each week automatically.

### Site Blocking
Set a daily time limit per site. When it's hit, Chronicle replaces the page with a block screen that shows your stats. You can defer it by 5 minutes if you genuinely need more time.

### Insights
Chronicle watches for patterns in your data — anomalies, streaks, milestones — and surfaces them as cards in the dashboard. Not generic tips, but observations about *your* behaviour.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 + Composition API |
| Language | TypeScript |
| Build | Vite + vite-plugin-web-extension |
| Extension | Chrome Manifest V3 |
| Storage | Chrome Storage API (local only) |
| Styling | Pure CSS design system (no Tailwind) |

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # Dashboard page components
│   ├── popup/         # Popup view components
│   └── ui/            # Shared UI primitives (Icon, CategoryIcon, SiteRow…)
├── composables/       # Vue composables (useGoals, useInsights, useWeeklyDigest…)
├── services/          # Pure services (settings, badge, block-list, pomodoro…)
├── types/             # TypeScript types and entities
│   └── dto/           # Data transfer objects
├── jobs/              # Background alarm jobs (scheduler, cleanup, notifications)
├── pages/             # Entry-point Vue apps (Popup, Dashboard, Welcome, Block)
├── storage/           # Storage abstraction layer
├── utils/             # Utilities (url, date, time, converter…)
└── assets/
    └── css/           # chronicle.css — single design system file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Chrome browser

### Install & Run

```bash
git clone https://github.com/Kushal-kothari/chronicle.git
cd chronicle
npm install

# Development — watch mode, rebuilds on save
npm run dev
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `dist/` folder
4. Pin Chronicle to your toolbar
5. After any code change, click the **reload icon** on the extension card

### Production Build

```bash
# Build only
npx vite build --mode production

# Build + zip (ready to upload to Chrome Web Store)
npm run script:zip
# Output: artifacts/Chronicle.zip
```

---

## Privacy

Chronicle is built on a simple principle: **your browsing data belongs to you.**

- All data is stored using Chrome's local `storage` API — on your device only
- No analytics, no telemetry, no tracking of any kind
- No account, no login, no server
- Uninstalling the extension deletes all data
- The source code is fully open — read every line

---

## Contributing

Issues and pull requests are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Make your changes and test locally
4. Open a pull request with a clear description

---

## License

MIT © [Kushal Kothari](https://github.com/Kushal-kothari)
