import { Category } from './category';

export enum GoalType {
  /** Spend at most N seconds on category/site per day */
  LimitDaily = 'limit_daily',
  /** Spend at least N seconds on category/site per day */
  MinimumDaily = 'minimum_daily',
}

export enum GoalPeriod {
  Weekdays = 'weekdays',    // Mon–Fri
  Weekends = 'weekends',    // Sat–Sun
  Everyday = 'everyday',
}

export interface Goal {
  id: string;
  type: GoalType;
  period: GoalPeriod;
  /** Category target (mutually exclusive with domain) */
  category?: Category;
  /** Single domain target (mutually exclusive with category) */
  domain?: string;
  /** Target in seconds */
  targetSeconds: number;
  createdAt: string; // ISO date string
  enabled: boolean;
}

export interface GoalProgress {
  goal: Goal;
  /** Seconds accumulated today */
  currentSeconds: number;
  /** 0–1 progress ratio */
  ratio: number;
  /** Whether the goal is currently being met */
  met: boolean;
  /** Consecutive days the goal has been met */
  streak: number;
}
