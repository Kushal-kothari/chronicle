import Browser from 'webextension-polyfill';
import { TypeOfUrl } from './enums';

// ─── Hostname extraction ────────────────────────────────────────────────────

export function extractHostname(url: string | undefined): string {
  if (url == undefined) return '';
  if (url.startsWith('file:')) return url;

  let hostname = url.indexOf('//') > -1 ? url.split('/')[2] : url.split('/')[0];
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}

// ─── URL type classification ────────────────────────────────────────────────

export function getTypeOfUrl(url: string): TypeOfUrl {
  return url.startsWith('file:') ? TypeOfUrl.Document : TypeOfUrl.WebSite;
}

// ─── Tab validation ─────────────────────────────────────────────────────────

export function isValidPage(tab: Browser.Tabs.Tab | undefined): boolean {
  if (!tab?.url || !tab?.id) return false;
  return (
    (tab.url.startsWith('http:') ||
      tab.url.startsWith('https:') ||
      tab.url.startsWith('file:')) &&
    !tab.url.startsWith('chrome://') &&
    !tab.url.startsWith('chrome-extension://')
  );
}

// ─── Active tab singleton ───────────────────────────────────────────────────

export class ActiveTab {
  private static instance: ActiveTab;
  private _url: string | null = null;
  private _domain: string | null = null;

  private constructor() {}

  static getInstance(): ActiveTab {
    if (!ActiveTab.instance) ActiveTab.instance = new ActiveTab();
    return ActiveTab.instance;
  }

  setActiveTab(value: string | null): void {
    this._url = value;
    this._domain = value != null ? extractHostname(value) : null;
  }

  getActiveTabUrl(): string | null {
    return this._url;
  }

  getActiveTabDomain(): string | null {
    return this._domain;
  }
}

// ─── Store URLs ─────────────────────────────────────────────────────────────

export const CHROME_STORE_REVIEW_URL = `https://chromewebstore.google.com/detail/chronicle/${__APP_ID__}/reviews`;
export const CHROME_STORE_SUPPORT_URL = `https://chromewebstore.google.com/detail/chronicle/${__APP_ID__}/support`;
export const EDGE_STORE_REVIEW_URL = `https://microsoftedge.microsoft.com/addons/detail/chronicle/${__APP_ID__}#review-section`;
