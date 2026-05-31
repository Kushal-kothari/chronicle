# Privacy Policy — Chronicle

**Last updated: April 2026**

## Overview

Chronicle is a browser extension that tracks the time you spend on websites. This policy explains what data is collected, how it is stored, and your rights over it.

## Data Collected

Chronicle collects the following data solely to provide its core functionality:

- **Website domains** you visit (e.g. `github.com`) — not full URLs or page content
- **Time spent** on each domain per day
- **Tab activity** — switches, active/idle state — to accurately measure time
- **Goals, focus sessions, and settings** you configure inside the extension

## How Data Is Stored

All data is stored **exclusively on your local device** using Chrome's built-in `chrome.storage` API. It never leaves your device. Chronicle has no backend server, no database, and no network connection of any kind.

## Data Sharing

We do not sell, share, transfer, or disclose your data to any third party under any circumstances. There are no third-party analytics, advertising SDKs, or tracking tools included in Chronicle.

> **Note on Chrome Web Store statistics:** Like every extension, Chronicle's *store listing page* is covered by Google's own aggregate analytics, which Google provides to developers (anonymous install counts, listing impressions, country totals). This is a function of the Chrome Web Store itself and is entirely separate from the extension — Chronicle's code contains no analytics and transmits nothing from your browser.

## Data Retention

Data is retained locally until you choose to delete it. You can clear all data at any time from the Settings page inside Chronicle. Uninstalling the extension removes all stored data from your device.

## Permissions

Chronicle requests the following Chrome permissions:

| Permission | Reason |
|------------|--------|
| `tabs` | Monitor active tab to track which site is currently being visited |
| `activeTab` | Read the URL of the current tab |
| `storage` | Save tracking data, goals, and settings locally on your device |
| `unlimitedStorage` | Store long-term history without hitting Chrome's default quota |
| `idle` | Detect when you are away from the computer to pause time tracking |
| `alarms` | Schedule a daily summary notification and nightly data cleanup |
| `notifications` | Send an optional daily usage summary (off by default) |
| `offscreen` | Play an audio sound when a Pomodoro timer ends |

## Your Rights

You have full control over your data:

- **View** your data at any time inside the extension
- **Export** your data as a CSV from Settings
- **Delete** all data from Settings → Remove All Data
- **Uninstall** the extension to remove all data permanently

## Contact

For questions or concerns about this privacy policy, please open an issue at:
[https://github.com/Kushal-kothari/chronicle/issues](https://github.com/Kushal-kothari/chronicle/issues)
