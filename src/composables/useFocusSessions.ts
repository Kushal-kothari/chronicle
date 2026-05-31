import Browser from 'webextension-polyfill';
import { FocusSession, getSessionDuration, isSessionActive } from '../types/focus-session';
import { StorageParams, FOCUS_GOAL_ALERTS_DEFAULT } from '../storage/storage-params';
import { injectStorage } from '../storage/inject-storage';
import { playSound, FOCUS_COMPLETE_SOUND } from '../services/sound';
import { useNotification, NotificationType } from './useNotification';

/** Alarm name for the one-shot "focus session reached its target" wake-up. */
export const FOCUS_COMPLETE_ALARM = '@alarm/focus-session-complete';

function generateId(): string {
  return `focus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** (Re)schedule the completion alarm for a session that has a target duration. */
async function scheduleFocusAlarm(session: FocusSession): Promise<void> {
  await Browser.alarms.clear(FOCUS_COMPLETE_ALARM);
  if (!session.targetSeconds || session.targetSeconds <= 0) return;
  const when = new Date(session.startedAt).getTime() + session.targetSeconds * 1000;
  if (when > Date.now()) await Browser.alarms.create(FOCUS_COMPLETE_ALARM, { when });
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
  await scheduleFocusAlarm(session);
  return session;
}

export async function endActiveFocusSession(
  rating?: number,
  note?: string,
): Promise<FocusSession | null> {
  await Browser.alarms.clear(FOCUS_COMPLETE_ALARM);
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

/**
 * Called from the background alarm when a session reaches its target time.
 * Alerts the user (sound + notification) but leaves the session running so they
 * can still rate it on their own time — going over target is intentional.
 */
export async function notifyFocusComplete(): Promise<void> {
  const active = await getActiveFocusSession();
  if (!active || !active.targetSeconds) return;

  const alertsOn = await injectStorage().getValue(
    StorageParams.FOCUS_GOAL_ALERTS,
    FOCUS_GOAL_ALERTS_DEFAULT,
  );
  if (!alertsOn) return;

  await playSound(FOCUS_COMPLETE_SOUND);
  await useNotification(
    NotificationType.FocusComplete,
    'Focus session complete',
    `Nice work on "${active.name}". Time for a break.`,
  );
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
