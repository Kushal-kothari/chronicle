import { differenceInCalendarDays } from 'date-fns';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams } from '../storage/storage-params';
import { useAllTabListSummary } from './useAllTabListSummary';
import { SortingBy } from '../utils/enums';

/**
 * Gated review prompt.
 *
 * We only ask for a review once a user is genuinely engaged — installed for a
 * few days AND has used the extension across several distinct days. This keeps
 * the ask honest (no nagging fresh installs) and means the reviews we earn come
 * from people who actually got value, which is both ethical and what the Chrome
 * Web Store rewards. The store-listing kit (marketing/STORE_LISTING.md) explains
 * why ratings + retention drive search rank.
 */

export type ReviewPromptStatus = 'pending' | 'rated' | 'dismissed';

export interface ReviewPromptState {
  status: ReviewPromptStatus;
  /** ISO timestamp; while in the future the prompt stays hidden ("Not now"). */
  snoozeUntil?: string;
}

const MIN_DAYS_SINCE_INSTALL = 5;
const MIN_ACTIVE_DAYS = 4;
const SNOOZE_DAYS = 14;

const DEFAULT_STATE: ReviewPromptState = { status: 'pending' };

export async function getReviewPromptState(): Promise<ReviewPromptState> {
  const storage = injectStorage();
  return (await storage.getValue(
    StorageParams.REVIEW_PROMPT_STATE,
    DEFAULT_STATE,
  )) as ReviewPromptState;
}

async function setReviewPromptState(state: ReviewPromptState): Promise<void> {
  const storage = injectStorage();
  await storage.saveValue(StorageParams.REVIEW_PROMPT_STATE, state);
}

/** True only for engaged users who haven't already rated, dismissed, or snoozed. */
export async function shouldShowReviewPrompt(): Promise<boolean> {
  const state = await getReviewPromptState();
  if (state.status !== 'pending') return false;
  if (state.snoozeUntil && new Date() < new Date(state.snoozeUntil)) return false;

  const storage = injectStorage();
  const installDate = (await storage.getValue(StorageParams.INSTALL_DATE)) as
    | string
    | undefined;
  if (installDate) {
    const daysSinceInstall = differenceInCalendarDays(new Date(), new Date(installDate));
    if (daysSinceInstall < MIN_DAYS_SINCE_INSTALL) return false;
  }

  const stats = await useAllTabListSummary(SortingBy.UsageTime);
  if (!stats || stats.activeDaysTotal < MIN_ACTIVE_DAYS) return false;

  return true;
}

/** User left a review — never ask again. */
export async function markReviewed(): Promise<void> {
  await setReviewPromptState({ status: 'rated' });
}

/** User declined permanently ("No thanks"). */
export async function dismissReviewForever(): Promise<void> {
  await setReviewPromptState({ status: 'dismissed' });
}

/** User chose "Not now" — hide for a couple of weeks, then it may reappear. */
export async function snoozeReviewPrompt(days = SNOOZE_DAYS): Promise<void> {
  const until = new Date();
  until.setDate(until.getDate() + days);
  await setReviewPromptState({ status: 'pending', snoozeUntil: until.toISOString() });
}
