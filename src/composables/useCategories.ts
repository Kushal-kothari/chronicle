import { Category } from '../types/category';
import { StorageParams } from '../storage/storage-params';
import { injectStorage } from '../storage/inject-storage';
import { getCategory } from '../utils/auto-categorize';
import { Tab } from '../types/tab';
import { todayLocalDate } from '../utils/date';

export interface CategorySummary {
  category: Category;
  /** Seconds today */
  todaySeconds: number;
  /** Seconds all time */
  totalSeconds: number;
  domains: string[];
}

export async function getCategoryOverrides(): Promise<Record<string, Category>> {
  const storage = injectStorage();
  return (await storage.getValue(StorageParams.CATEGORY_OVERRIDES, {})) as Record<string, Category>;
}

export async function setCategoryOverride(domain: string, category: Category): Promise<void> {
  const storage = injectStorage();
  const overrides = await getCategoryOverrides();
  overrides[domain] = category;
  await storage.saveValue(StorageParams.CATEGORY_OVERRIDES, overrides);
}

export async function removeCategoryOverride(domain: string): Promise<void> {
  const storage = injectStorage();
  const overrides = await getCategoryOverrides();
  delete overrides[domain];
  await storage.saveValue(StorageParams.CATEGORY_OVERRIDES, overrides);
}

export function getDomainCategory(domain: string, overrides: Record<string, Category>): Category {
  return getCategory(domain, overrides);
}

/**
 * Aggregate category summaries from the full tab list.
 */
export async function getCategorySummaries(tabs: Tab[]): Promise<Map<Category, CategorySummary>> {
  const overrides = await getCategoryOverrides();
  const today = todayLocalDate();
  const map = new Map<Category, CategorySummary>();

  for (const category of Object.values(Category)) {
    map.set(category, {
      category,
      todaySeconds: 0,
      totalSeconds: 0,
      domains: [],
    });
  }

  for (const tab of tabs) {
    const cat = getCategory(tab.url, overrides);
    const entry = map.get(cat)!;

    entry.totalSeconds += tab.summaryTime;
    entry.domains.push(tab.url);

    const todayDay = tab.days.find(d => d.date === today);
    if (todayDay) entry.todaySeconds += todayDay.summary;
  }

  return map;
}

/**
 * Get today's seconds per category.
 */
export async function getTodayCategorySeconds(tabs: Tab[]): Promise<Record<Category, number>> {
  const overrides = await getCategoryOverrides();
  const today = todayLocalDate();
  const result = Object.fromEntries(
    Object.values(Category).map(c => [c, 0]),
  ) as Record<Category, number>;

  for (const tab of tabs) {
    const cat = getCategory(tab.url, overrides);
    const todayDay = tab.days.find(d => d.date === today);
    if (todayDay) result[cat] += todayDay.summary;
  }

  return result;
}
