export interface FocusSession {
  id: string;
  /** User-given name, e.g. "Thesis writing" */
  name: string;
  /** ISO timestamp when session started */
  startedAt: string;
  /** ISO timestamp when session ended (undefined = active) */
  endedAt?: string;
  /** Target duration in seconds (0 = open-ended) */
  targetSeconds: number;
  /** 1–5 rating after session */
  rating?: number;
  /** Optional note after session */
  note?: string;
  /** Domains allowed during this session (empty = all blocked except work category) */
  allowedDomains: string[];
}

export interface ActiveFocusSession {
  session: FocusSession;
  elapsedSeconds: number;
  isOverTarget: boolean;
}

export function isSessionActive(session: FocusSession): boolean {
  return session.endedAt === undefined;
}

export function getSessionDuration(session: FocusSession): number {
  const start = new Date(session.startedAt).getTime();
  const end = session.endedAt ? new Date(session.endedAt).getTime() : Date.now();
  return Math.floor((end - start) / 1000);
}
