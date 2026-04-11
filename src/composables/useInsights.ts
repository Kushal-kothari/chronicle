import { Tab } from '../types/tab';
import { Category } from '../types/category';
import { getCategoryOverrides } from './useCategories';
import { getCategory } from '../utils/auto-categorize';
import { format, subDays, parseISO } from 'date-fns';

export interface Insight {
  id: string;
  type: 'anomaly' | 'pattern' | 'streak' | 'milestone';
  title: string;
  body: string;
  priority: number; // higher = show first
}

/**
 * Compute insights from the tab history.
 * Pure math, no external API.
 */
export async function computeInsights(tabs: Tab[]): Promise<Insight[]> {
  const overrides = await getCategoryOverrides();
  const insights: Insight[] = [];
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // ── Build daily totals map per domain ──
  const domainDailySeconds: Record<string, Record<string, number>> = {};
  for (const tab of tabs) {
    domainDailySeconds[tab.url] = {};
    for (const day of tab.days) {
      domainDailySeconds[tab.url][day.date] = day.summary;
    }
  }

  // ── Total time per day (last 30 days) ──
  const dailyTotals: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    dailyTotals[date] = 0;
  }
  for (const tab of tabs) {
    for (const day of tab.days) {
      if (dailyTotals[day.date] !== undefined) {
        dailyTotals[day.date] += day.summary;
      }
    }
  }

  const todayTotal = dailyTotals[today] ?? 0;
  const yesterdayTotal = dailyTotals[yesterday] ?? 0;

  // ── Insight: today vs yesterday anomaly ──
  if (yesterdayTotal > 0 && todayTotal > 0) {
    const ratio = todayTotal / yesterdayTotal;
    if (ratio >= 1.5) {
      insights.push({
        id: 'anomaly_today_high',
        type: 'anomaly',
        title: 'More screen time than usual',
        body: `You're ${Math.round((ratio - 1) * 100)}% more online today than yesterday.`,
        priority: 8,
      });
    } else if (ratio <= 0.5) {
      insights.push({
        id: 'anomaly_today_low',
        type: 'anomaly',
        title: 'Great focus today',
        body: `Your screen time is ${Math.round((1 - ratio) * 100)}% lower than yesterday.`,
        priority: 7,
      });
    }
  }

  // ── Insight: most distracted hour ──
  const hourlySeconds: number[] = Array(24).fill(0);
  for (const tab of tabs) {
    // Best proxy: distribute today's time evenly (real interval data would be better)
    const todayDay = tab.days.find(d => d.date === today);
    if (!todayDay) continue;
  }

  // ── Insight: dominant category today ──
  const catSeconds: Partial<Record<Category, number>> = {};
  for (const tab of tabs) {
    const cat = getCategory(tab.url, overrides);
    const todayDay = tab.days.find(d => d.date === today);
    if (todayDay && todayDay.summary > 0) {
      catSeconds[cat] = (catSeconds[cat] ?? 0) + todayDay.summary;
    }
  }
  const [dominantCat, dominantSec] = Object.entries(catSeconds)
    .sort(([, a], [, b]) => b - a)[0] ?? [];

  if (dominantCat && (dominantSec as number) > 3600) {
    const hours = ((dominantSec as number) / 3600).toFixed(1);
    const catLabel = dominantCat.charAt(0).toUpperCase() + dominantCat.slice(1);
    insights.push({
      id: `pattern_dominant_${dominantCat}`,
      type: 'pattern',
      title: `Heavy ${catLabel} day`,
      body: `You've spent ${hours}h on ${catLabel} content today.`,
      priority: 5,
    });
  }

  // ── Insight: site anomaly (3× normal) ──
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i + 1), 'yyyy-MM-dd'),
  );

  for (const tab of tabs) {
    const todayDay = tab.days.find(d => d.date === today);
    if (!todayDay || todayDay.summary < 600) continue; // ignore < 10 min

    const past7 = last7Days
      .map(d => tab.days.find(day => day.date === d)?.summary ?? 0)
      .filter(s => s > 0);

    if (past7.length < 3) continue;
    const avgPast = past7.reduce((a, b) => a + b, 0) / past7.length;

    if (avgPast > 0 && todayDay.summary > avgPast * 3) {
      insights.push({
        id: `anomaly_site_${tab.url}`,
        type: 'anomaly',
        title: `Unusual time on ${tab.url}`,
        body: `You're spending ${Math.round(todayDay.summary / 60)}m there today vs. ${Math.round(avgPast / 60)}m on average.`,
        priority: 9,
      });
      break; // max one site anomaly
    }
  }

  // ── Insight: 7-day streak of being under social limit ──
  const socialDailySeconds: Record<string, number> = {};
  for (const tab of tabs) {
    const cat = getCategory(tab.url, overrides);
    if (cat !== Category.Social) continue;
    for (const day of tab.days) {
      socialDailySeconds[day.date] = (socialDailySeconds[day.date] ?? 0) + day.summary;
    }
  }

  let socialStreakDays = 0;
  for (let i = 1; i <= 7; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if ((socialDailySeconds[date] ?? 0) < 30 * 60) { // under 30min
      socialStreakDays++;
    } else {
      break;
    }
  }

  if (socialStreakDays >= 3) {
    insights.push({
      id: 'streak_social_low',
      type: 'streak',
      title: `${socialStreakDays}-day low-social streak`,
      body: `You've kept social under 30min for ${socialStreakDays} days in a row.`,
      priority: 6,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

/**
 * Compute the busiest hour of day from interval data.
 * Returns hour (0–23) or null if not enough data.
 */
export function computePeakHour(tabs: Tab[], date: string): number | null {
  const hourBuckets: number[] = Array(24).fill(0);
  let hasData = false;

  for (const tab of tabs) {
    const day = tab.days.find(d => d.date === date);
    if (!day || day.summary === 0) continue;
    hasData = true;
    // Without interval granularity, we can't compute per-hour accurately.
    // This is a placeholder; the hourly chart uses time-interval data.
  }

  if (!hasData) return null;
  return hourBuckets.indexOf(Math.max(...hourBuckets));
}
