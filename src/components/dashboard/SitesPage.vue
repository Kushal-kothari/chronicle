<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Sites</h1>
      <p class="page-subtitle">All tracked domains</p>
    </div>

    <!-- Filters -->
    <div class="filters-bar mb-4">
      <div class="search-wrap">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.406a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
        </svg>
        <input v-model="search" class="search-input" placeholder="Search sites..." />
      </div>
      <select v-model="selectedCategory" class="select">
        <option value="">All categories</option>
        <option v-for="c in categoryOptions" :key="c.value" :value="c.value">
          {{ c.label }}
        </option>
      </select>
      <select v-model="period" class="select">
        <option value="today">Today</option>
        <option value="week">This week</option>
        <option value="all">All time</option>
      </select>
      <select v-model="sortBy" class="select">
        <option value="time">Sort by time</option>
        <option value="sessions">Sort by sessions</option>
        <option value="domain">Sort by name</option>
      </select>
    </div>

    <!-- Site list -->
    <div v-if="isLoading" class="card">
      <div v-for="i in 8" :key="i" class="skeleton-row">
        <div class="skeleton" style="width:32px;height:32px;border-radius:8px;" />
        <div class="flex-col gap-1 flex-1 flex">
          <div class="skeleton" style="height:13px;width:45%;" />
          <div class="skeleton" style="height:11px;width:25%;" />
        </div>
        <div class="skeleton" style="height:13px;width:50px;" />
      </div>
    </div>

    <div v-else-if="filteredSites.length === 0" class="card p-6 text-center">
      <p class="text-caption">
        {{ search || selectedCategory ? 'No sites match your filters.' : 'No data yet.' }}
      </p>
    </div>

    <div v-else class="list-group">
      <SiteRow
        v-for="site in filteredSites"
        :key="site.domain"
        :domain="site.domain"
        :seconds="site.seconds"
        :favicon="site.favicon"
        :category="site.category"
        :ratio="maxSeconds > 0 ? site.seconds / maxSeconds : 0"
        @click="selectedSite = site"
        style="cursor:pointer;"
      />
    </div>

    <!-- Site detail modal -->
    <div v-if="selectedSite" class="modal-overlay" @click.self="selectedSite = null">
      <div class="site-detail-card animate-scale-in">
        <div class="detail-header">
          <div class="detail-favicon">
            <img
              v-if="selectedSite.favicon"
              :src="selectedSite.favicon"
              class="detail-favicon-img"
              @error="(e: Event) => (e.target as HTMLImageElement).style.display='none'"
            />
            <span v-else class="detail-favicon-placeholder">
              {{ selectedSite.domain.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <p class="detail-domain">{{ selectedSite.domain }}</p>
            <CategoryBadge :category="selectedSite.category" />
          </div>
          <button class="close-btn" @click="selectedSite = null">✕</button>
        </div>

        <div class="detail-stats">
          <div class="detail-stat">
            <p class="stat-label">Total time</p>
            <p class="stat-value" style="font-size:22px;">{{ formatSeconds(selectedSite.seconds) }}</p>
          </div>
          <div class="detail-stat">
            <p class="stat-label">Sessions</p>
            <p class="stat-value" style="font-size:22px;">{{ selectedSite.sessions }}</p>
          </div>
          <div class="detail-stat">
            <p class="stat-label">Active days</p>
            <p class="stat-value" style="font-size:22px;">{{ selectedSite.activeDays }}</p>
          </div>
        </div>

        <div class="detail-actions">
          <select
            :value="selectedSite.category"
            class="select flex-1"
            @change="(e) => reassignCategory(selectedSite!, (e.target as HTMLSelectElement).value as any)"
          >
            <option v-for="c in categoryOptions" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
          <button class="btn btn-danger btn-sm" @click="blockSite(selectedSite!.domain)">
            Block site
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { format, subDays } from 'date-fns';
import SiteRow from '../ui/SiteRow.vue';
import CategoryBadge from '../ui/CategoryBadge.vue';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam, StorageParams } from '../../storage/storage-params';
import { Tab } from '../../types/tab';
import { todayLocalDate } from '../../utils/date';
import { convertSummaryTimeToString } from '../../utils/converter';
import { asArray } from '../../utils/common';
import { getCategoryOverrides, setCategoryOverride } from '../../composables/useCategories';
import { getCategory } from '../../utils/auto-categorize';
import { Category, CATEGORY_META } from '../../types/category';

const storage = injectStorage();

interface SiteEntry {
  domain: string;
  seconds: number;
  sessions: number;
  activeDays: number;
  favicon?: string;
  category: Category;
}

const isLoading = ref(true);
const allSites = ref<SiteEntry[]>([]);
const search = ref('');
const selectedCategory = ref('');
const period = ref<'today' | 'week' | 'all'>('today');
const sortBy = ref<'time' | 'sessions' | 'domain'>('time');
const selectedSite = ref<SiteEntry | null>(null);

const categoryOptions = Object.values(Category).map(c => ({
  value: c,
  label: CATEGORY_META[c].label,
}));

const filteredSites = computed(() => {
  let list = allSites.value.filter(s => s.seconds > 0);
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(s => s.domain.toLowerCase().includes(q));
  }
  if (selectedCategory.value) {
    list = list.filter(s => s.category === selectedCategory.value);
  }
  return [...list].sort((a, b) => {
    if (sortBy.value === 'sessions') return b.sessions - a.sessions;
    if (sortBy.value === 'domain') return a.domain.localeCompare(b.domain);
    return b.seconds - a.seconds;
  });
});

const maxSeconds = computed(() =>
  filteredSites.value.length > 0 ? filteredSites.value[0].seconds : 1,
);

function formatSeconds(s: number): string {
  return convertSummaryTimeToString(s).trim() || '0m';
}

async function loadSites() {
  isLoading.value = true;
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  const overrides = await getCategoryOverrides();
  const today = todayLocalDate();
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), 'yyyy-MM-dd'),
  );

  allSites.value = tabs.map(tab => {
    let seconds = 0;
    let sessions = 0;
    let activeDays = 0;

    for (const day of tab.days) {
      const include =
        period.value === 'all' ||
        (period.value === 'today' && day.date === today) ||
        (period.value === 'week' && weekDates.includes(day.date));

      if (include) {
        seconds += day.summary;
        sessions += day.counter;
        if (day.summary > 0) activeDays++;
      }
    }

    return {
      domain: tab.url,
      seconds,
      sessions,
      activeDays,
      favicon: tab.favicon,
      category: getCategory(tab.url, overrides),
    };
  });

  isLoading.value = false;
}

async function reassignCategory(site: SiteEntry, category: Category) {
  await setCategoryOverride(site.domain, category);
  site.category = category;
  selectedSite.value = null;
  await loadSites();
}

async function blockSite(domain: string) {
  const blackList = asArray<string>(await storage.getValue(StorageParams.BLACK_LIST, []));
  if (!blackList.includes(domain)) {
    blackList.push(domain);
    await storage.saveValue(StorageParams.BLACK_LIST, blackList);
  }
  selectedSite.value = null;
}

watch(period, loadSites);
onMounted(loadSites);
</script>

<style scoped>
.filters-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--label-3);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 30px;
  background: var(--fill-2);
  border: none;
  border-radius: var(--r-sm);
  font-family: var(--font);
  font-size: 14px;
  color: var(--label-1);
  outline: none;
}

.search-input:focus { box-shadow: 0 0 0 3px rgba(10,132,255,0.25); }
.search-input::placeholder { color: var(--label-3); }

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--sep);
}
.skeleton-row:last-child { border-bottom: none; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.site-detail-card {
  background: var(--bg-1);
  border-radius: var(--r-xl);
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.detail-favicon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.detail-favicon-img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: contain;
}

.detail-favicon-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--fill-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--label-2);
}

.detail-domain {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--label-1);
  margin-bottom: 4px;
}

.close-btn {
  margin-left: auto;
  background: var(--fill-2);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 12px;
  color: var(--label-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.detail-stat {
  background: var(--bg-2);
  border-radius: var(--r-md);
  padding: 12px;
  text-align: center;
}

.detail-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
