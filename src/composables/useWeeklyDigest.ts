import { Tab } from '../types/tab';
import { Category, CATEGORY_META } from '../types/category';
import { getCategoryOverrides } from './useCategories';
import { getCategory } from '../utils/auto-categorize';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { FocusSession, getSessionDuration } from '../types/focus-session';

export interface WeeklyDigest {
  weekLabel: string;       // e.g. "April 7–13"
  totalSeconds: number;
  dailyAvgSeconds: number;
  vsLastWeekPercent: number | null; // +20 means 20% more than last week

  categoryBreakdown: Array<{
    category: Category;
    seconds: number;
    percent: number;
    label: string;
    color: string;
  }>;

  topSites: Array<{
    domain: string;
    seconds: number;
    favicon?: string;
    category: Category;
  }>;

  bestDay: { date: string; label: string; seconds: number } | null;
  worstDay: { date: string; label: string; seconds: number } | null;

  focusStats: {
    sessions: number;
    totalMinutes: number;
    avgRating: number | null;
  };

  headline: string;
  insight: string;
}

function dateRange(from: Date, to: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    dates.push(format(cur, 'yyyy-MM-dd'));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function generateWeeklyDigest(
  tabs: Tab[],
  focusSessions: FocusSession[],
  weekOffset = 0, // 0 = this week, 1 = last week
): Promise<WeeklyDigest> {
  const overrides = await getCategoryOverrides();
  const now = new Date();

  const weekStart = startOfWeek(subDays(now, 7 * weekOffset), { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(subDays(now, 7 * weekOffset), { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subDays(weekStart, 1), { weekStartsOn: 1 });
  const lastWeekEnd   = endOfWeek(subDays(weekStart, 1), { weekStartsOn: 1 });

  const weekDates = dateRange(weekStart, weekEnd);
  const lastWeekDates = dateRange(lastWeekStart, lastWeekEnd);

  const weekLabel = `${format(weekStart, 'MMM d')}–${format(weekEnd, 'd')}`;

  // ── Totals per day ──
  const dailyTotals: Record<string, number> = {};
  for (const d of weekDates) dailyTotals[d] = 0;

  // ── Category totals ──
  const catSeconds: Partial<Record<Category, number>> = {};
  for (const c of Object.values(Category)) catSeconds[c] = 0;

  // ── Site totals ──
  const siteSeconds: Record<string, { seconds: number; favicon?: string }> = {};

  for (const tab of tabs) {
    const cat = getCategory(tab.url, overrides);
    for (const day of tab.days) {
      if (weekDates.includes(day.date)) {
        dailyTotals[day.date] += day.summary;
        catSeconds[cat]! += day.summary;
        siteSeconds[tab.url] = {
          seconds: (siteSeconds[tab.url]?.seconds ?? 0) + day.summary,
          favicon: tab.favicon,
        };
      }
    }
  }

  // Last week total
  let lastWeekTotal = 0;
  for (const tab of tabs) {
    for (const day of tab.days) {
      if (lastWeekDates.includes(day.date)) lastWeekTotal += day.summary;
    }
  }

  const totalSeconds = Object.values(dailyTotals).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(dailyTotals).filter(s => s > 0).length;
  const dailyAvgSeconds = activeDays > 0 ? Math.round(totalSeconds / activeDays) : 0;

  const vsLastWeekPercent = lastWeekTotal > 0
    ? Math.round(((totalSeconds - lastWeekTotal) / lastWeekTotal) * 100)
    : null;

  // Category breakdown
  const categoryBreakdown = Object.entries(catSeconds)
    .filter(([, s]) => (s as number) > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([cat, seconds]) => ({
      category: cat as Category,
      seconds: seconds as number,
      percent: totalSeconds > 0 ? Math.round(((seconds as number) / totalSeconds) * 100) : 0,
      label: CATEGORY_META[cat as Category].label,
      color: CATEGORY_META[cat as Category].color,
    }));

  // Top sites
  const topSites = Object.entries(siteSeconds)
    .sort(([, a], [, b]) => b.seconds - a.seconds)
    .slice(0, 5)
    .map(([domain, { seconds, favicon }]) => ({
      domain,
      seconds,
      favicon,
      category: getCategory(domain, overrides),
    }));

  // Best/worst day
  const dayEntries = Object.entries(dailyTotals).filter(([, s]) => s > 0);
  const bestDay = dayEntries.length > 0
    ? (() => {
        const [date, seconds] = dayEntries.reduce((a, b) => a[1] > b[1] ? a : b);
        return { date, label: format(new Date(date), 'EEEE'), seconds };
      })()
    : null;

  const worstDay = dayEntries.length > 1
    ? (() => {
        const [date, seconds] = dayEntries.reduce((a, b) => a[1] < b[1] ? a : b);
        return { date, label: format(new Date(date), 'EEEE'), seconds };
      })()
    : null;

  // Focus sessions this week
  const weekFocusSessions = focusSessions.filter(s => {
    const d = new Date(s.startedAt);
    return d >= weekStart && d <= weekEnd && s.endedAt;
  });

  const focusTotalSeconds = weekFocusSessions.reduce((a, s) => a + getSessionDuration(s), 0);
  const ratedSessions = weekFocusSessions.filter(s => s.rating);
  const avgRating = ratedSessions.length > 0
    ? ratedSessions.reduce((a, s) => a + s.rating!, 0) / ratedSessions.length
    : null;

  // Headline + insight
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const topCat = categoryBreakdown[0];

  let headline = `${totalHours}h of screen time this week.`;
  let insight = 'Start setting goals to see personalised recommendations.';

  if (topCat) {
    if (topCat.category === Category.Work) {
      headline = `A productive week — ${totalHours}h online.`;
      insight = `${topCat.percent}% of your time went to Work. ${weekFocusSessions.length > 0 ? `${weekFocusSessions.length} focus sessions completed.` : ''}`;
    } else if (topCat.category === Category.Entertainment) {
      headline = `${totalHours}h this week, mostly entertainment.`;
      insight = `${topCat.percent}% went to Entertainment. Try setting a daily goal to balance it.`;
    } else if (topCat.category === Category.Social) {
      headline = `Social was your biggest category this week.`;
      insight = `You spent ${Math.round((catSeconds[Category.Social] ?? 0) / 3600)}h on Social — consider setting a limit.`;
    }
  }

  if (vsLastWeekPercent !== null && vsLastWeekPercent <= -20) {
    insight = `Screen time down ${Math.abs(vsLastWeekPercent)}% from last week. Great work.`;
  }

  return {
    weekLabel,
    totalSeconds,
    dailyAvgSeconds,
    vsLastWeekPercent,
    categoryBreakdown,
    topSites,
    bestDay,
    worstDay,
    focusStats: {
      sessions: weekFocusSessions.length,
      totalMinutes: Math.round(focusTotalSeconds / 60),
      avgRating,
    },
    headline,
    insight,
  };
}
