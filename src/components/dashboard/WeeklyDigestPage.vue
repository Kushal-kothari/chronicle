<template>
  <div class="animate-fade-in">
    <div class="page-header flex justify-between items-center">
      <div>
        <h1 class="page-title">Weekly Digest</h1>
        <p class="page-subtitle">Your attention, reviewed.</p>
      </div>
      <div class="week-nav">
        <button class="btn btn-ghost btn-sm" @click="weekOffset++" :disabled="weekOffset >= 4">← Prev</button>
        <span class="week-label">{{ digest?.weekLabel }}</span>
        <button class="btn btn-ghost btn-sm" @click="weekOffset = Math.max(0, weekOffset - 1)" :disabled="weekOffset === 0">Next →</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div v-for="i in 4" :key="i" class="skeleton mb-3" style="height:80px;border-radius:16px;" />
    </div>

    <div v-else-if="!digest || digest.totalSeconds === 0" class="card p-8 text-center">
      <div class="flex justify-center mb-4"><Icon name="calendar" :size="40" style="color:var(--label-4);" /></div>
      <p class="text-title-3 mb-2">No data for this week</p>
      <p class="text-caption">Keep using Chronicle and your weekly digest will appear here.</p>
    </div>

    <template v-else>
      <!-- Hero card -->
      <div class="hero-digest card p-6 mb-5">
        <p class="digest-headline">{{ digest.headline }}</p>
        <p class="digest-insight mt-2">{{ digest.insight }}</p>

        <div class="hero-stats mt-4">
          <div class="hero-stat">
            <p class="stat-value" style="font-size:28px;">{{ formatSec(digest.totalSeconds) }}</p>
            <p class="stat-label">Total time</p>
          </div>
          <div class="hero-stat">
            <p class="stat-value" style="font-size:28px;">{{ formatSec(digest.dailyAvgSeconds) }}</p>
            <p class="stat-label">Daily average</p>
          </div>
          <div v-if="digest.vsLastWeekPercent !== null" class="hero-stat">
            <p
              class="stat-value"
              style="font-size:28px;"
              :style="{ color: digest.vsLastWeekPercent > 0 ? 'var(--red)' : 'var(--green)' }"
            >
              {{ digest.vsLastWeekPercent > 0 ? '+' : '' }}{{ digest.vsLastWeekPercent }}%
            </p>
            <p class="stat-label">vs last week</p>
          </div>
          <div v-if="digest.focusStats.sessions > 0" class="hero-stat">
            <p class="stat-value" style="font-size:28px;">{{ digest.focusStats.sessions }}</p>
            <p class="stat-label">Focus sessions</p>
          </div>
        </div>
      </div>

      <!-- Category breakdown -->
      <div class="card p-5 mb-5">
        <p class="section-header mb-4">Time by Category</p>
        <div class="cat-viz">
          <!-- Stacked bar -->
          <div class="stacked-bar">
            <div
              v-for="item in digest.categoryBreakdown"
              :key="item.category"
              class="stacked-segment"
              :style="{ flex: item.seconds, background: item.color }"
              :title="`${item.label}: ${formatSec(item.seconds)} (${item.percent}%)`"
            />
          </div>
          <!-- Legend -->
          <div class="cat-legend mt-4">
            <div
              v-for="item in digest.categoryBreakdown"
              :key="item.category"
              class="legend-row"
            >
              <span class="legend-dot" :style="{ background: item.color }" />
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-time">{{ formatSec(item.seconds) }}</span>
              <span class="legend-pct">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Best / Worst day -->
      <div class="two-col mb-5">
        <div v-if="digest.bestDay" class="card p-4 day-card day-card-best">
          <p class="day-card-label">🏆 Best Day</p>
          <p class="day-card-day">{{ digest.bestDay.label }}</p>
          <p class="day-card-time">{{ formatSec(digest.bestDay.seconds) }}</p>
        </div>
        <div v-if="digest.worstDay" class="card p-4 day-card day-card-worst">
          <p class="day-card-label">😴 Least Active</p>
          <p class="day-card-day">{{ digest.worstDay.label }}</p>
          <p class="day-card-time">{{ formatSec(digest.worstDay.seconds) }}</p>
        </div>
      </div>

      <!-- Top sites -->
      <div class="mb-5">
        <p class="section-header mb-3">Top Sites This Week</p>
        <div class="list-group">
          <SiteRow
            v-for="site in digest.topSites"
            :key="site.domain"
            :domain="site.domain"
            :seconds="site.seconds"
            :favicon="site.favicon"
            :category="site.category"
            :ratio="digest.topSites[0].seconds > 0 ? site.seconds / digest.topSites[0].seconds : 0"
          />
        </div>
      </div>

      <!-- Focus summary -->
      <div v-if="digest.focusStats.sessions > 0" class="card p-5 mb-5">
        <p class="section-header mb-3">Focus Sessions</p>
        <div class="focus-stats-row">
          <div class="focus-stat">
            <p class="focus-stat-val">{{ digest.focusStats.sessions }}</p>
            <p class="focus-stat-label">Sessions</p>
          </div>
          <div class="focus-stat">
            <p class="focus-stat-val">{{ digest.focusStats.totalMinutes }}m</p>
            <p class="focus-stat-label">Total time</p>
          </div>
          <div v-if="digest.focusStats.avgRating" class="focus-stat">
            <p class="focus-stat-val" style="display:flex;align-items:center;gap:3px;">
              {{ digest.focusStats.avgRating.toFixed(1) }}
              <Icon name="star-fill" :size="13" style="color:#FFD60A;" />
            </p>
            <p class="focus-stat-label">Avg rating</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import SiteRow from '../ui/SiteRow.vue';
import Icon from '../ui/Icon.vue';
import { generateWeeklyDigest, type WeeklyDigest } from '../../composables/useWeeklyDigest';
import { getFocusSessions } from '../../composables/useFocusSessions';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam } from '../../storage/storage-params';
import { Tab } from '../../types/tab';
import { convertSummaryTimeToString } from '../../utils/converter';

const storage = injectStorage();
const digest = ref<WeeklyDigest | null>(null);
const isLoading = ref(true);
const weekOffset = ref(0);

function formatSec(s: number): string {
  return convertSummaryTimeToString(s).trim() || '0m';
}

async function load() {
  isLoading.value = true;
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  const sessions = await getFocusSessions();
  digest.value = await generateWeeklyDigest(tabs, sessions, weekOffset.value);
  isLoading.value = false;
}

watch(weekOffset, load);
onMounted(load);
</script>

<style scoped>
.week-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--label-1);
  min-width: 100px;
  text-align: center;
}

.loading-state { }

.hero-digest {
  background: linear-gradient(135deg, var(--bg-1) 0%, rgba(10,132,255,0.04) 100%);
}

.digest-headline {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--label-1);
}

.digest-insight {
  font-size: 14px;
  color: var(--label-2);
  line-height: 1.5;
}

.hero-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-stat { }

/* Category viz */
.stacked-bar {
  display: flex;
  height: 12px;
  border-radius: 100px;
  overflow: hidden;
  gap: 2px;
}

.stacked-segment {
  border-radius: 100px;
  transition: flex 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cat-legend { display: flex; flex-direction: column; gap: 8px; }

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--label-1);
  flex: 1;
}

.legend-time {
  font-size: 13px;
  font-weight: 600;
  color: var(--label-1);
  font-variant-numeric: tabular-nums;
  width: 60px;
  text-align: right;
}

.legend-pct {
  font-size: 12px;
  color: var(--label-3);
  width: 32px;
  text-align: right;
}

/* Day cards */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.day-card { text-align: center; }

.day-card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--label-2);
  margin-bottom: 4px;
}

.day-card-day {
  font-size: 18px;
  font-weight: 700;
  color: var(--label-1);
  margin-bottom: 4px;
}

.day-card-time {
  font-size: 14px;
  color: var(--label-2);
  font-variant-numeric: tabular-nums;
}

.day-card-best  { border-top: 3px solid var(--green); }
.day-card-worst { border-top: 3px solid var(--orange); }

/* Focus stats */
.focus-stats-row {
  display: flex;
  gap: 24px;
}

.focus-stat { text-align: center; flex: 1; }

.focus-stat-val {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--label-1);
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.focus-stat-label {
  font-size: 12px;
  color: var(--label-2);
}
</style>
