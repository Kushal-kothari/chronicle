import { Category } from '../types/category';
import { getCategoryOverrides } from './useCategories';
import { getCategory } from '../utils/auto-categorize';
import { StorageParams } from '../storage/storage-params';
import { injectStorage } from '../storage/inject-storage';
import { todayLocalDate } from '../utils/date';

/** A continuous uninterrupted work session detected automatically */
export interface FlowSession {
  domain: string;
  startedAt: string; // ISO
  endedAt?: string;  // ISO
  durationSeconds: number;
}

// In-memory tracking state (lives in the service worker)
let flowDomain: string | null = null;
let flowStartTime: number | null = null;
const FLOW_THRESHOLD_SECONDS = 25 * 60; // 25 min continuous = flow state

export async function onDomainActive(domain: string | null): Promise<void> {
  if (!domain) {
    await closeFlow();
    return;
  }

  const overrides = await getCategoryOverrides();
  const category = getCategory(domain, overrides);

  // Only detect flow on Work or Learning categories
  const isProductiveCategory = category === Category.Work || category === Category.Learning;

  if (!isProductiveCategory) {
    await closeFlow();
    return;
  }

  if (flowDomain !== domain) {
    // Domain switched — close previous flow
    await closeFlow();
    flowDomain = domain;
    flowStartTime = Date.now();
  }
  // Same domain, same productive category — flow continues naturally
}

async function closeFlow(): Promise<void> {
  if (!flowDomain || !flowStartTime) {
    flowDomain = null;
    flowStartTime = null;
    return;
  }

  const durationSeconds = Math.floor((Date.now() - flowStartTime) / 1000);

  if (durationSeconds >= FLOW_THRESHOLD_SECONDS) {
    await recordFlowSession({
      domain: flowDomain,
      startedAt: new Date(flowStartTime).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds,
    });
  }

  flowDomain = null;
  flowStartTime = null;
}

export function getCurrentFlowDurationSeconds(): number {
  if (!flowStartTime) return 0;
  return Math.floor((Date.now() - flowStartTime) / 1000);
}

export function isInFlowState(): boolean {
  return getCurrentFlowDurationSeconds() >= FLOW_THRESHOLD_SECONDS;
}

async function recordFlowSession(session: FlowSession): Promise<void> {
  const storage = injectStorage();
  const sessions = ((await storage.getValue(StorageParams.FLOW_SESSIONS, [])) as FlowSession[]) || [];

  // Keep only last 90 days of flow sessions
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const filtered = sessions.filter(s => new Date(s.startedAt).getTime() > cutoff);
  filtered.push(session);

  await storage.saveValue(StorageParams.FLOW_SESSIONS, filtered);
}

export async function getTodayFlowMinutes(): Promise<number> {
  const storage = injectStorage();
  const sessions = ((await storage.getValue(StorageParams.FLOW_SESSIONS, [])) as FlowSession[]) || [];
  const today = todayLocalDate();
  const todaySessions = sessions.filter(
    s => s.startedAt.startsWith(today) && s.durationSeconds >= FLOW_THRESHOLD_SECONDS,
  );
  return Math.round(todaySessions.reduce((a, s) => a + s.durationSeconds, 0) / 60);
}
