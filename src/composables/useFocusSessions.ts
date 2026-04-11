import { FocusSession, getSessionDuration, isSessionActive } from '../types/focus-session';
import { StorageParams } from '../storage/storage-params';
import { injectStorage } from '../storage/inject-storage';

function generateId(): string {
  return `focus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function getFocusSessions(): Promise<FocusSession[]> {
  const storage = injectStorage();
  return (await storage.getValue(StorageParams.FOCUS_SESSIONS, [])) as FocusSession[];
}

export async function getActiveFocusSession(): Promise<FocusSession | null> {
  const storage = injectStorage();
  return (await storage.getValue(StorageParams.ACTIVE_FOCUS_SESSION, null)) as FocusSession | null;
}

async function saveActiveFocusSession(session: FocusSession | null): Promise<void> {
  const storage = injectStorage();
  await storage.saveValue(StorageParams.ACTIVE_FOCUS_SESSION, session);
}

export async function startFocusSession(
  name: string,
  targetMinutes: number,
  allowedDomains: string[] = [],
): Promise<FocusSession> {
  // End any existing session first
  await endActiveFocusSession();

  const session: FocusSession = {
    id: generateId(),
    name,
    startedAt: new Date().toISOString(),
    targetSeconds: targetMinutes * 60,
    allowedDomains,
  };

  await saveActiveFocusSession(session);
  return session;
}

export async function endActiveFocusSession(
  rating?: number,
  note?: string,
): Promise<FocusSession | null> {
  const active = await getActiveFocusSession();
  if (!active) return null;

  const completed: FocusSession = {
    ...active,
    endedAt: new Date().toISOString(),
    rating,
    note,
  };

  const sessions = await getFocusSessions();
  sessions.unshift(completed); // newest first
  const storage = injectStorage();
  await storage.saveValue(StorageParams.FOCUS_SESSIONS, sessions);
  await saveActiveFocusSession(null);
  return completed;
}

export async function updateActiveFocusSession(updates: Partial<FocusSession>): Promise<void> {
  const active = await getActiveFocusSession();
  if (!active) return;
  await saveActiveFocusSession({ ...active, ...updates });
}

/** Sessions from the last N days */
export async function getRecentFocusSessions(days = 7): Promise<FocusSession[]> {
  const sessions = await getFocusSessions();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessions.filter(s => new Date(s.startedAt).getTime() >= cutoff);
}

export interface FocusStats {
  totalSessions: number;
  totalSeconds: number;
  avgDurationSeconds: number;
  avgRating: number | null;
  longestSessionSeconds: number;
}

export function computeFocusStats(sessions: FocusSession[]): FocusStats {
  const completed = sessions.filter(s => s.endedAt);
  if (completed.length === 0) {
    return { totalSessions: 0, totalSeconds: 0, avgDurationSeconds: 0, avgRating: null, longestSessionSeconds: 0 };
  }

  const durations = completed.map(s => getSessionDuration(s));
  const totalSeconds = durations.reduce((a, b) => a + b, 0);
  const rated = completed.filter(s => s.rating !== undefined);
  const avgRating = rated.length > 0
    ? rated.reduce((a, s) => a + s.rating!, 0) / rated.length
    : null;

  return {
    totalSessions: completed.length,
    totalSeconds,
    avgDurationSeconds: Math.round(totalSeconds / completed.length),
    avgRating,
    longestSessionSeconds: Math.max(...durations),
  };
}
