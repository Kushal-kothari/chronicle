import { Goal, GoalPeriod, GoalProgress, GoalType } from '../types/goal';
import { Category } from '../types/category';
import { StorageParams } from '../storage/storage-params';
import { injectStorage } from '../storage/inject-storage';
import { Tab } from '../types/tab';
import { todayLocalDate } from '../utils/date';
import { getTodayCategorySeconds } from './useCategories';
import { getCategory } from '../utils/auto-categorize';

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function getGoals(): Promise<Goal[]> {
  const storage = injectStorage();
  return (await storage.getValue(StorageParams.GOALS, [])) as Goal[];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  const storage = injectStorage();
  await storage.saveValue(StorageParams.GOALS, goals);
}

export async function addGoal(
  params: Omit<Goal, 'id' | 'createdAt'>,
): Promise<Goal> {
  const goal: Goal = {
    ...params,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const goals = await getGoals();
  goals.push(goal);
  await saveGoals(goals);
  return goal;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const goals = await getGoals();
  const idx = goals.findIndex(g => g.id === id);
  if (idx >= 0) {
    goals[idx] = { ...goals[idx], ...updates };
    await saveGoals(goals);
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals();
  await saveGoals(goals.filter(g => g.id !== id));
}

/**
 * Returns whether today's day-of-week matches the goal's period.
 */
export function isGoalActiveToday(goal: Goal): boolean {
  const day = new Date().getDay(); // 0 = Sun, 6 = Sat
  if (goal.period === GoalPeriod.Everyday) return true;
  if (goal.period === GoalPeriod.Weekdays) return day >= 1 && day <= 5;
  if (goal.period === GoalPeriod.Weekends) return day === 0 || day === 6;
  return false;
}

/**
 * Compute today's progress for all active goals.
 */
export async function getGoalProgress(tabs: Tab[]): Promise<GoalProgress[]> {
  const goals = await getGoals();
  const enabledGoals = goals.filter(g => g.enabled && isGoalActiveToday(g));

  const categorySeconds = await getTodayCategorySeconds(tabs);
  const overrides = {} as Record<string, Category>;

  const today = todayLocalDate();

  // Domain seconds today
  const domainSeconds: Record<string, number> = {};
  for (const tab of tabs) {
    const dayEntry = tab.days.find(d => d.date === today);
    if (dayEntry) domainSeconds[tab.url] = (domainSeconds[tab.url] ?? 0) + dayEntry.summary;
  }

  return enabledGoals.map(goal => {
    let currentSeconds = 0;

    if (goal.category) {
      currentSeconds = categorySeconds[goal.category] ?? 0;
    } else if (goal.domain) {
      currentSeconds = domainSeconds[goal.domain] ?? 0;
    }

    const ratio = goal.targetSeconds > 0
      ? Math.min(currentSeconds / goal.targetSeconds, 1)
      : 0;

    const met =
      goal.type === GoalType.LimitDaily
        ? currentSeconds <= goal.targetSeconds
        : currentSeconds >= goal.targetSeconds;

    return {
      goal,
      currentSeconds,
      ratio: goal.type === GoalType.LimitDaily ? ratio : ratio,
      met,
      streak: 0, // TODO: compute from history
    };
  });
}
