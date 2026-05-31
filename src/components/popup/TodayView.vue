<template>
  <div class="today-view animate-fade-in">
    <!-- Hero section -->
    <div class="hero-section">
      <div class="hero-date">{{ dateLabel }}</div>
      <div v-if="isLoading" class="hero-time-skeleton skeleton" style="width:120px;height:40px;margin:4px 0;" />
      <div v-else class="hero-time">{{ formattedTotal }}</div>
      <div class="hero-sub text-secondary">Screen time today</div>

      <!-- Timeline strip -->
      <div class="timeline-container mt-3">
        <TimelineStrip :hourly-seconds="hourlySeconds" :height="36" />
      </div>
    </div>

    <!-- Review prompt (only shown to engaged users; self-gates) -->
    <ReviewPrompt />

    <!-- Category rings -->
    <div v-if="!isLoading && hasCategoryData" class="card mx-3 mb-3 p-4">
      <CategoryRingGroup :category-seconds="categorySeconds" />
    </div>

    <!-- Insights -->
    <div v-if="insights.length > 0" class="px-3 mb-3 flex-col gap-2 flex">
      <InsightCard
        v-for="(insight, i) in insights"
        :key="insight.id"
        :insight="insight"
        :delay="i * 60"
      />
    </div>

    <!-- Top sites -->
    <div class="px-3 mb-3">
      <p class="section-header">Top Sites</p>
      <div v-if="isLoading" class="card">
        <div v-for="i in 4" :key="i" class="skeleton-row">
          <div class="skeleton" style="width:28px;height:28px;border-radius:6px;" />
          <div class="flex-col gap-1 flex-1">
            <div class="skeleton" style="width:60%;height:13px;" />
            <div class="skeleton" style="width:35%;height:11px;" />
          </div>
          <div class="skeleton" style="width:40px;height:13px;" />
        </div>
      </div>
      <div v-else-if="topSites.length === 0" class="empty-state">
        <div class="empty-state-icon">🌐</div>
        <p class="text-headline">No activity yet</p>
        <p class="text-caption mt-1">Start browsing and Chronicle will begin tracking.</p>
      </div>
      <div v-else class="list-group">
        <SiteRow
          v-for="(site, i) in topSites"
          :key="site.domain"
          :domain="site.domain"
          :seconds="site.seconds"
          :favicon="site.favicon"
          :category="site.category"
          :ratio="maxSiteSeconds > 0 ? site.seconds / maxSiteSeconds : 0"
        />
        <button
          v-if="hasMore"
          class="show-more-btn"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Show less' : `Show all ${allSites.length} sites` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { format } from 'date-fns';
import TimelineStrip from '../ui/TimelineStrip.vue';
import CategoryRingGroup from '../ui/CategoryRingGroup.vue';
import SiteRow from '../ui/SiteRow.vue';
import InsightCard from '../ui/InsightCard.vue';
import ReviewPrompt from '../ui/ReviewPrompt.vue';
import { injectTabsRepository } from '../../repository/inject-tabs-repository';
import { SortingBy } from '../../utils/enums';
import { todayLocalDate } from '../../utils/date';
import { convertSummaryTimeToString } from '../../utils/converter';
import { getTodayCategorySeconds } from '../../composables/useCategories';
import { getCategoryOverrides } from '../../composables/useCategories';
import { getCategory } from '../../utils/auto-categorize';
import { computeInsights } from '../../composables/useInsights';
import { Category } from '../../types/category';
import type { Insight } from '../../composables/useInsights';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam } from '../../storage/storage-params';
import { Tab } from '../../types/tab';

const isLoading = ref(true);
const totalSeconds = ref(0);
const categorySeconds = ref<Partial<Record<Category, number>>>({});
const allSites = ref<Array<{ domain: string; seconds: number; favicon?: string; category: Category }>>([]);
const showAll = ref(false);
const insights = ref<Insight[]>([]);
const hourlySeconds = ref<number[]>(Array(24).fill(0));

const dateLabel = computed(() => format(new Date(), 'EEEE, MMMM d'));
const formattedTotal = computed(() => totalSeconds.value > 0
  ? convertSummaryTimeToString(totalSeconds.value).trim()
  : '0m',
);

const hasCategoryData = computed(() =>
  Object.values(categorySeconds.value).some(s => (s ?? 0) > 0),
);

const maxSiteSeconds = computed(() =>
  allSites.value.length > 0 ? allSites.value[0].seconds : 1,
);

const SHOW_LIMIT = 7;
const hasMore = computed(() => allSites.value.length > SHOW_LIMIT);
const topSites = computed(() => showAll.value ? allSites.value : allSites.value.slice(0, SHOW_LIMIT));

onMounted(async () => {
  isLoading.value = true;
  const storage = injectStorage();
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  const today = todayLocalDate();
  const overrides = await getCategoryOverrides();

  // Total & sites
  const siteMap: Record<string, { seconds: number; favicon?: string }> = {};
  let total = 0;

  for (const tab of tabs) {
    const dayEntry = tab.days.find(d => d.date === today);
    if (!dayEntry || dayEntry.summary === 0) continue;
    total += dayEntry.summary;
    siteMap[tab.url] = {
      seconds: dayEntry.summary,
      favicon: tab.favicon,
    };
  }

  totalSeconds.value = total;

  // Sort sites
  allSites.value = Object.entries(siteMap)
    .sort(([, a], [, b]) => b.seconds - a.seconds)
    .map(([domain, { seconds, favicon }]) => ({
      domain,
      seconds,
      favicon,
      category: getCategory(domain, overrides),
    }));

  // Category breakdown
  categorySeconds.value = await getTodayCategorySeconds(tabs);

  // Insights
  insights.value = await computeInsights(tabs);

  isLoading.value = false;
});
</script>

<style scoped>
.today-view {
  padding-bottom: 12px;
}

.hero-section {
  background: var(--bg-1);
  padding: 20px 20px 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.hero-date {
  font-size: 13px;
  font-weight: 500;
  color: var(--label-2);
  margin-bottom: 4px;
}

.hero-time {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--label-1);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.hero-sub {
  font-size: 13px;
  color: var(--label-2);
  margin-top: 2px;
}

.timeline-container {
  padding-top: 4px;
}

.show-more-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  border-top: 0.5px solid var(--sep);
  font-family: var(--font);
  font-size: 14px;
  font-weight: 500;
  color: var(--blue);
  cursor: pointer;
  transition: background 0.12s ease;
}

.show-more-btn:hover { background: var(--fill-3); }

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--sep);
}

.skeleton-row:last-child { border-bottom: none; }

.empty-state {
  background: var(--bg-1);
  border-radius: var(--r-lg);
  padding: 40px 24px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.empty-state-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
</style>
