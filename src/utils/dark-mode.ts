/**
 * Applies (or removes) the global dark theme by toggling the `.dark` class on
 * both <html> and <body>. The Chronicle design tokens (chronicle.css) live under
 * the `.dark` selector, so toggling it here restyles the whole document live —
 * no reload needed. This is the single source of truth; every dark-mode toggle
 * (popup, dashboard, settings) should call this.
 */
export function applyDarkMode(value: boolean): void {
  document.documentElement.classList.toggle('dark', value);
  document.body.classList.toggle('dark', value);
}
