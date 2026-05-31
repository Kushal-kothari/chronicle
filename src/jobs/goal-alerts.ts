import Browser from 'webextension-polyfill';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams, FOCUS_GOAL_ALERTS_DEFAULT } from '../storage/storage-params';
import { injectTabsRepository } from '../repository/inject-tabs-repository';
import { getGoals, getGoalProgress } from '../composables/useGoals';
import { GoalType } from '../types/goal';
import { CATEGORY_META } from '../types/category';
import { todayLocalDate } from '../utils/date';
import { convertSummaryTimeToString } from '../utils/converter';
import { playSound, GOAL_ALERT_SOUND } from '../services/sound';

/** goalId -> 'YYYY-MM-DD' on which we last alerted, so we alert at most once per day per goal. */
type GoalAlertState = Record<string, string>;

/**
 * Periodic background check (driven by a 1-minute alarm). Notifies the user when
 * a daily LIMIT goal is exceeded or a MINIMUM goal is reached, once per goal per
 * day. Cheap to run: bails immediately when alerts are off or no goals exist.
 */
export async function checkGoalAlerts(): Promise<void> {
  const storage = injectStorage();

  const alertsOn = await storage.getValue(
    StorageParams.FOCUS_GOAL_ALERTS,
    FOCUS_GOAL_ALERTS_DEFAULT,
  );
  if (!alertsOn) return;

  const goals = await getGoals();
  if (!goals.some(g => g.enabled)) return;

  const repo = await injectTabsRepository();
  const progress = await getGoalProgress(repo.getTabs());
  if (progress.length === 0) return;

  const today = todayLocalDate();
  const state = (await storage.getValue(StorageParams.GOAL_ALERT_STATE, {})) as GoalAlertState;
  const nextState: GoalAlertState = {};
  let soundPlayed = false;

  for (const p of progress) {
    const isLimit = p.goal.type === GoalType.LimitDaily;
    // LimitDaily: `met` means still within budget, so !met = exceeded.
    // MinimumDaily: `met` means the minimum has been reached.
    const triggered = isLimit ? !p.met : p.met;

    // Carry forward today's alert flag so the once-per-day guard survives.
    if (state[p.goal.id] === today) nextState[p.goal.id] = today;

    if (!triggered || state[p.goal.id] === today) continue;

    const label = p.goal.category
      ? CATEGORY_META[p.goal.category].label
      : p.goal.domain ?? 'your goal';
    const current = convertSummaryTimeToString(p.currentSeconds).trim();
    const target = convertSummaryTimeToString(p.goal.targetSeconds).trim();

    const title = isLimit ? `Daily limit reached · ${label}` : `Goal achieved · ${label}`;
    const message = isLimit
      ? `You've passed your ${target} limit on ${label} — ${current} so far today.`
      : `You hit your ${label} goal of ${target} today. 🎉`;

    await Browser.notifications.create(`goal-alert-${p.goal.id}`, {
      type: 'basic',
      title,
      message,
      iconUrl: Browser.runtime.getURL('128x128.png'),
      isClickable: false,
    });

    if (!soundPlayed) {
      await playSound(GOAL_ALERT_SOUND);
      soundPlayed = true;
    }
    nextState[p.goal.id] = today;
  }

  await storage.saveValue(StorageParams.GOAL_ALERT_STATE, nextState);
}
