<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Overview</h1>
      <p class="page-subtitle">{{ dateLabel }}</p>
    </div>

    <!-- Stat cards -->
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <p class="stat-label">Today</p>
        <p class="stat-value">{{ todayFormatted }}</p>
        <p class="stat-sub" :style="{ color: vsYesterdayColor }">
          {{ vsYesterdayLabel }}
        </p>
      </div>
      <div class="stat-card">
        <p class="stat-label">This Week</p>
        <p class="stat-value">{{ weekFormatted }}</p>
        <p class="stat-sub">{{ activeDaysThisWeek }} active days</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Daily Average</p>
        <p class="stat-value">{{ avgFormatted }}</p>
        <p class="stat-sub">last 7 days</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Sites Tracked</p>
        <p class="stat-value">{{ totalSites }}</p>
        <p class="stat-sub">{{ todaySites }} today</p>
      </div>
    </div>

    <div class="two-col">
      <!-- Timeline -->
      <div class="card p-4 mb-5">
        <p class="section-header mb-3">Today's Activity</p>
        <TimelineStrip :hourly-seconds="hourlySeconds" :height="60" />
      </div>

      <!-- Category breakdown -->
      <div class="card p-4 mb-5">
        <p class="section-header mb-3">By Category</p>
        <div v-if="hasCategoryData" class="cat-breakdown">
          <div
            v-for="item in categoryBreakdown"
            :key="item.category"
            class="cat-row"
          >
            <span class="cat-dot" :style="{ background: item.color }" />
            <span class="cat-name">{{ item.label }}</span>
            <div class="progress-track flex-1" style="height:6px;">
              <div
                class="progress-fill"
                :style="{ width: `${item.percent}%`, background: item.color }"
              />
            </div>
            <span class="cat-time">{{ item.formatted }}</span>
            <span class="cat-pct">{{ item.percent }}%</span>
          </div>
        </div>
        <div v-else class="empty-mini">No activity yet today.</div>
      </div>
    </div>

    <!-- Insights -->
    <div v-if="insights.length > 0" class="mb-5">
      <p class="section-header mb-3">Insights</p>
      <div class="flex-col gap-3 flex">
        <InsightCard
          v-for="(ins, i) in insights"
          :key="ins.id"
          :insight="ins"
          :delay="i * 80"
        />
      </div>
    </div>

    <!-- Top sites today -->
    <div class="mb-5">
      <p class="section-header mb-3">Top Sites Today</p>
      <div v-if="topSitesToday.length === 0" class="card p-5 text-center">
        <p class="text-caption">No activity today. Start browsing to see your stats.</p>
      </div>
      <div v-else class="list-group">
        <SiteRow
          v-for="site in topSitesToday"
          :key="site.domain"
          :domain="site.domain"
          :seconds="site.seconds"
          :favicon="site.favicon"
          :category="site.category"
          :ratio="topSitesToday[0].seconds > 0 ? site.seconds / topSitesToday[0].seconds : 0"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { format, subDays } from 'date-fns';
import TimelineStrip from '../ui/TimelineStrip.vue';
import SiteRow from '../ui/SiteRow.vue';
import InsightCard from '../ui/InsightCard.vue';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam } from '../../storage/storage-params';
import { Tab } from '../../types/tab';
import { TimeInterval } from '../../types/time-interval';
import { todayLocalDate } from '../../utils/date';
import { convertSummaryTimeToString } from '../../utils/converter';
import { getTodayCategorySeconds, getCategoryOverrides } from '../../composables/useCategories';
import { getCategory } from '../../utils/auto-categorize';
import { CATEGORY_META, Category } from '../../types/category';
import { computeInsights, type Insight } from '../../composables/useInsights';

const storage = injectStorage();

const todaySeconds = ref(0);
const yesterdaySeconds = ref(0);
const weekSeconds = ref(0);
const activeDaysThisWeek = ref(0);
const avgSeconds = ref(0);
const totalSites = ref(0);
const todaySites = ref(0);
const hourlySeconds = ref<number[]>(Array(24).fill(0));
const categoryBreakdown = ref<Array<{ category: Category; label: string; color: string; percent: number; formatted: string }>>([]);
const topSitesToday = ref<Array<{ domain: string; seconds: number; favicon?: string; category: Category }>>([]);
const insights = ref<Insight[]>([]);

const dateLabel = computed(() => format(new Date(), 'EEEE, MMMM d, yyyy'));
const todayFormatted = computed(() => convertSummaryTimeToString(todaySeconds.value).trim() || '0m');
const weekFormatted = computed(() => convertSummaryTimeToString(weekSeconds.value).trim() || '0m');
const avgFormatted = computed(() => convertSummaryTimeToString(avgSeconds.value).trim() || '0m');

const hasCategoryData = computed(() => categoryBreakdown.value.length > 0);

const vsYesterdayLabel = computed(() => {
  if (yesterdaySeconds.value === 0) return 'No data yesterday';
  const diff = todaySeconds.value - yesterdaySeconds.value;
  const pct = Math.round(Math.abs(diff / yesterdaySeconds.value) * 100);
  if (diff > 0) return `↑ ${pct}% vs yesterday`;
  if (diff < 0) return `↓ ${pct}% vs yesterday`;
  return 'Same as yesterday';
});

const vsYesterdayColor = computed(() => {
  if (yesterdaySeconds.value === 0) return 'var(--label-3)';
  return todaySeconds.value > yesterdaySeconds.value ? 'var(--red)' : 'var(--green)';
});

onMounted(async () => {
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  const intervals = (await storage.getDeserializeList(StorageDeserializeParam.TIMEINTERVAL_LIST)) as TimeInterval[];
  const overrides = await getCategoryOverrides();
  const today = todayLocalDate();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  totalSites.value = tabs.length;

  // Build daily data
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), 'yyyy-MM-dd'),
  );

  let todayTotal = 0;
  let yesterdayTotal = 0;
  let weekTotal = 0;
  let weekActiveDays = 0;
  const weekDayTotals = new Array(7).fill(0);
  const siteMap: Record<string, { seconds: number; favicon?: string }> = {};

  for (const tab of tabs) {
    for (const day of tab.days) {
      if (day.date === today) {
        todayTotal += day.summary;
        siteMap[tab.url] = { seconds: (siteMap[tab.url]?.seconds ?? 0) + day.summary, favicon: tab.favicon };
      }
      if (day.date === yesterday) yesterdayTotal += day.summary;
      const widx = weekDates.indexOf(day.date);
      if (widx >= 0) {
        weekTotal += day.summary;
        weekDayTotals[widx] += day.summary;
      }
    }
    if (tab.days.find(d => d.date === today)) todaySites.value++;
  }

  weekActiveDays = weekDayTotals.filter(s => s > 0).length;
  const daysWithData = weekDayTotals.filter(s => s > 0);

  todaySeconds.value = todayTotal;
  yesterdaySeconds.value = yesterdayTotal;
  weekSeconds.value = weekTotal;
  activeDaysThisWeek.value = weekActiveDays;
  avgSeconds.value = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length)
    : 0;

  // Hourly breakdown from intervals
  const todayIntervals = intervals.filter(iv => iv.day === today);
  const hourlySec = Array(24).fill(0);
  for (const iv of todayIntervals) {
    for (const segment of iv.intervals) {
      const [startStr, endStr] = segment.split('-');
      if (!startStr || !endStr) continue;
      const parse = (s: string) => {
        const [h, m, sec] = s.split(':').map(Number);
        return h * 3600 + m * 60 + (sec || 0);
      };
      const startSec = parse(startStr);
      const endSec = parse(endStr);
      if (endSec <= startSec) continue;
      const startHour = Math.floor(startSec / 3600);
      const endHour = Math.floor(endSec / 3600);
      for (let h = startHour; h <= Math.min(endHour, 23); h++) {
        const hStart = h * 3600;
        const hEnd = hStart + 3600;
        const overlap = Math.min(endSec, hEnd) - Math.max(startSec, hStart);
        if (overlap > 0) hourlySec[h] += overlap;
      }
    }
  }
  hourlySeconds.value = hourlySec;

  // Category breakdown
  const catSec = await getTodayCategorySeconds(tabs);
  const total = Object.values(catSec).reduce((a, b) => a + b, 0);
  categoryBreakdown.value = (Object.entries(catSec) as [Category, number][])
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, seconds]) => ({
      category: cat,
      label: CATEGORY_META[cat].label,
      color: CATEGORY_META[cat].color,
      percent: total > 0 ? Math.round((seconds / total) * 100) : 0,
      formatted: convertSummaryTimeToString(seconds).trim(),
    }));

  // Top sites
  topSitesToday.value = Object.entries(siteMap)
    .filter(([, { seconds }]) => seconds > 0)
    .sort(([, a], [, b]) => b.seconds - a.seconds)
    .slice(0, 8)
    .map(([domain, { seconds, favicon }]) => ({
      domain,
      seconds,
      favicon,
      category: getCategory(domain, overrides),
    }));

  insights.value = await computeInsights(tabs);
});
</script>

<style scoped>
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 700px) {
  .two-col { grid-template-columns: 1fr; }
}

.cat-breakdown { display: flex; flex-direction: column; gap: 10px; }

.cat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--label-1);
  width: 90px;
  flex-shrink: 0;
}

.cat-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--label-1);
  font-variant-numeric: tabular-nums;
  width: 60px;
  text-align: right;
  flex-shrink: 0;
}

.cat-pct {
  font-size: 12px;
  color: var(--label-3);
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

.empty-mini {
  font-size: 13px;
  color: var(--label-3);
  text-align: center;
  padding: 20px 0;
}
</style>
