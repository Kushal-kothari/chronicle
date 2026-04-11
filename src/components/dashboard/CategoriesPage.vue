<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Categories</h1>
      <p class="page-subtitle">How you allocate your attention</p>
    </div>

    <!-- Period toggle -->
    <div class="period-toggle mb-5">
      <button
        v-for="p in periods"
        :key="p.value"
        class="period-btn"
        :class="{ active: selectedPeriod === p.value }"
        @click="selectedPeriod = p.value"
      >{{ p.label }}</button>
    </div>

    <!-- Ring overview -->
    <div class="card p-5 mb-5">
      <div class="ring-overview">
        <CategoryRingGroup :category-seconds="currentCategorySeconds" />
        <div class="ring-stats">
          <p class="text-title-3 mb-1">{{ totalFormatted }}</p>
          <p class="text-caption">Total for period</p>
        </div>
      </div>

      <!-- Category bars -->
      <div class="cat-bars mt-5">
        <div
          v-for="item in sortedCategories"
          :key="item.category"
          class="cat-bar-row"
        >
          <div class="cat-bar-label">
            <CategoryIcon :category="item.category" :size="15" />
            <span class="cat-name">{{ item.label }}</span>
          </div>
          <div class="cat-bar-track">
            <div
              class="cat-bar-fill"
              :style="{ width: `${item.percent}%`, background: item.color }"
            />
          </div>
          <span class="cat-bar-time">{{ item.formatted }}</span>
          <span class="cat-bar-pct">{{ item.percent }}%</span>
        </div>
      </div>
    </div>

    <!-- Weekly trend per category -->
    <div class="mb-5">
      <p class="section-header mb-3">Daily Trend (Last 7 Days)</p>
      <div class="card p-4">
        <div class="trend-grid">
          <div
            v-for="day in weeklyTrend"
            :key="day.date"
            class="trend-day"
          >
            <div class="trend-bars">
              <div
                v-for="bar in day.bars"
                :key="bar.category"
                class="trend-bar"
                :style="{ height: `${bar.heightPct}%`, background: bar.color }"
                :title="`${bar.label}: ${bar.formatted}`"
              />
            </div>
            <span class="trend-label">{{ day.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category site breakdown -->
    <div
      v-for="item in sortedCategories.filter(c => c.seconds > 0)"
      :key="item.category"
      class="mb-4"
    >
      <p class="section-header mb-2 flex items-center gap-2">
        <CategoryIcon :category="item.category" :size="14" />
        {{ item.label }}
        <span style="color:var(--label-3);font-weight:400;">{{ item.formatted }}</span>
      </p>
      <div class="list-group">
        <SiteRow
          v-for="site in item.sites.slice(0, 4)"
          :key="site.domain"
          :domain="site.domain"
          :seconds="site.seconds"
          :favicon="site.favicon"
          :category="item.category"
          :ratio="item.sites[0].seconds > 0 ? site.seconds / item.sites[0].seconds : 0"
          :compact="true"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { format, subDays } from 'date-fns';
import CategoryRingGroup from '../ui/CategoryRingGroup.vue';
import CategoryIcon from '../ui/CategoryIcon.vue';
import SiteRow from '../ui/SiteRow.vue';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam } from '../../storage/storage-params';
import { Tab } from '../../types/tab';
import { todayLocalDate } from '../../utils/date';
import { convertSummaryTimeToString } from '../../utils/converter';
import { getCategoryOverrides } from '../../composables/useCategories';
import { getCategory } from '../../utils/auto-categorize';
import { Category, CATEGORY_META } from '../../types/category';

const storage = injectStorage();
const selectedPeriod = ref<'today' | 'week' | 'month'>('today');

const periods = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

interface CatItem {
  category: Category;
  label: string;
  color: string;
  seconds: number;
  percent: number;
  formatted: string;
  sites: Array<{ domain: string; seconds: number; favicon?: string }>;
}

const allData = ref<{
  catSeconds: Record<Category, number>;
  catSites: Record<Category, Array<{ domain: string; seconds: number; favicon?: string }>>;
  total: number;
}>({ catSeconds: {} as any, catSites: {} as any, total: 0 });

const weeklyRaw = ref<Array<{ date: string; catSeconds: Record<Category, number> }>>([]);

const currentCategorySeconds = computed(() => allData.value.catSeconds);
const totalFormatted = computed(() => convertSummaryTimeToString(allData.value.total).trim() || '0m');

const sortedCategories = computed((): CatItem[] => {
  const { catSeconds, catSites, total } = allData.value;
  return Object.values(Category)
    .map(cat => ({
      category: cat,
      label: CATEGORY_META[cat].label,
      color: CATEGORY_META[cat].color,
      seconds: catSeconds[cat] ?? 0,
      percent: total > 0 ? Math.round(((catSeconds[cat] ?? 0) / total) * 100) : 0,
      formatted: convertSummaryTimeToString(catSeconds[cat] ?? 0).trim() || '0m',
      sites: (catSites[cat] ?? []).sort((a, b) => b.seconds - a.seconds),
    }))
    .sort((a, b) => b.seconds - a.seconds);
});

const weeklyTrend = computed(() => {
  const globalMax = Math.max(...weeklyRaw.value.flatMap(d => Object.values(d.catSeconds)), 1);
  return weeklyRaw.value.map(d => ({
    date: d.date,
    label: format(new Date(d.date + 'T12:00:00'), 'EEE'),
    bars: Object.values(Category)
      .filter(cat => (d.catSeconds[cat] ?? 0) > 0)
      .map(cat => ({
        category: cat,
        label: CATEGORY_META[cat].label,
        color: CATEGORY_META[cat].color,
        heightPct: Math.round(((d.catSeconds[cat] ?? 0) / globalMax) * 100),
        formatted: convertSummaryTimeToString(d.catSeconds[cat] ?? 0).trim(),
      })),
  }));
});

async function load() {
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  const overrides = await getCategoryOverrides();
  const today = todayLocalDate();

  const getPeriodDates = (): string[] => {
    if (selectedPeriod.value === 'today') return [today];
    const n = selectedPeriod.value === 'week' ? 7 : 30;
    return Array.from({ length: n }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  };

  const periodDates = new Set(getPeriodDates());
  const catSeconds: Record<Category, number> = Object.fromEntries(
    Object.values(Category).map(c => [c, 0]),
  ) as any;
  const catSites: Record<Category, Record<string, { seconds: number; favicon?: string }>> =
    Object.fromEntries(Object.values(Category).map(c => [c, {}])) as any;
  let total = 0;

  for (const tab of tabs) {
    const cat = getCategory(tab.url, overrides);
    for (const day of tab.days) {
      if (!periodDates.has(day.date) || day.summary === 0) continue;
      catSeconds[cat] += day.summary;
      total += day.summary;
      catSites[cat][tab.url] = {
        seconds: (catSites[cat][tab.url]?.seconds ?? 0) + day.summary,
        favicon: tab.favicon,
      };
    }
  }

  allData.value = {
    catSeconds,
    catSites: Object.fromEntries(
      Object.entries(catSites).map(([cat, siteMap]) => [
        cat,
        Object.entries(siteMap).map(([domain, data]) => ({ domain, ...data })),
      ]),
    ) as any,
    total,
  };

  // weekly trend (last 7 days always)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const cs: Record<Category, number> = Object.fromEntries(Object.values(Category).map(c => [c, 0])) as any;
    for (const tab of tabs) {
      const cat = getCategory(tab.url, overrides);
      const day = tab.days.find(d => d.date === date);
      if (day) cs[cat] += day.summary;
    }
    return { date, catSeconds: cs };
  });
  weeklyRaw.value = last7;
}

onMounted(load);
watch(selectedPeriod, load);
</script>

<style scoped>
.ring-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ring-stats { text-align: center; }

.cat-bars { display: flex; flex-direction: column; gap: 10px; }

.cat-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-bar-label {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100px;
  flex-shrink: 0;
}

.cat-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--label-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-bar-track {
  flex: 1;
  height: 6px;
  background: var(--fill-2);
  border-radius: 3px;
  overflow: hidden;
}

.cat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.cat-bar-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--label-1);
  width: 52px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cat-bar-pct {
  font-size: 11px;
  color: var(--label-3);
  width: 30px;
  text-align: right;
}

/* Period toggle */
.period-toggle {
  display: flex;
  background: var(--fill-1);
  border-radius: var(--r-sm);
  padding: 3px;
  gap: 2px;
}

.period-btn {
  flex: 1;
  padding: 7px 10px;
  border-radius: calc(var(--r-sm) - 2px);
  border: none;
  background: transparent;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--label-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.period-btn.active {
  background: var(--bg-1);
  color: var(--label-1);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* Trend chart */
.trend-grid {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 80px;
}

.trend-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.trend-bars {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1px;
}

.trend-bar {
  width: 100%;
  border-radius: 2px;
  min-height: 2px;
  transition: height 0.4s ease;
}

.trend-label {
  font-size: 10px;
  color: var(--label-3);
  font-weight: 500;
}
</style>
