<template>
  <div class="block-shell">
    <div class="block-card">
      <!-- Chronicle mark -->
      <div class="brand-row">
        <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
          <rect width="56" height="56" rx="14" fill="#0A84FF"/>
          <rect x="14" y="14" width="12" height="28" rx="3" fill="white"/>
          <rect x="30" y="14" width="12" height="12" rx="3" fill="white" opacity="0.7"/>
          <rect x="30" y="30" width="12" height="12" rx="3" fill="white"/>
        </svg>
        <span class="brand-label">Chronicle</span>
      </div>

      <!-- Blocked indicator -->
      <div class="block-icon">🚫</div>
      <h1 class="block-title">Time limit reached</h1>
      <p class="block-site">
        <img v-if="favicon" :src="favicon" height="18" class="site-favicon" />
        <strong>{{ webSite }}</strong>
      </p>

      <div class="stats-row">
        <div class="stat">
          <span class="stat-label">Limit</span>
          <span class="stat-value">{{ limitTimeString }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-label">Sessions today</span>
          <span class="stat-value">{{ summaryCounter }}</span>
        </div>
      </div>

      <p class="block-message">
        You've used your daily allowance for this site. Come back tomorrow, or adjust your limit in Chronicle.
      </p>

      <button
        v-if="allowDeferringBlock && haveToShowDeffering"
        class="btn-defer"
        @click="deferring()"
      >
        +5 minutes — just this once
      </button>
      <p v-if="allowDeferringBlock" class="defer-note">You can defer once per day</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { getValueFromQuery } from '../utils/block-page';
import { injectStorage } from '../storage/inject-storage';
import { BLOCK_DEFERRAL_DEFAULT, StorageParams } from '../storage/storage-params';
import { convertLimitTimeToString } from '../utils/converter';
import { canDefering, defering } from '../services/defer-list';

const settingsStorage = injectStorage();

const webSite = ref('');
const sourceUrl = ref('');
const limitTime = ref<number>();
const favicon = ref('');
const limitTimeString = ref('');
const summaryCounter = ref(0);
const allowDeferringBlock = ref(false);
const haveToShowDeffering = ref(false);

onMounted(async () => {
  const q = getValueFromQuery(location.href);
  webSite.value = q.domain ?? '';
  sourceUrl.value = q.url ?? '';
  limitTime.value = q.limitTime;
  favicon.value = q.favicon ?? '';
  limitTimeString.value = convertLimitTimeToString(q.limitTime);
  summaryCounter.value = q.summaryCounter ?? 0;

  allowDeferringBlock.value = await settingsStorage.getValue(
    StorageParams.BLOCK_DEFERRAL,
    BLOCK_DEFERRAL_DEFAULT,
  );
  haveToShowDeffering.value = await canDefering(webSite.value);
});

async function deferring() {
  if (webSite.value && limitTime.value != undefined && allowDeferringBlock.value && haveToShowDeffering.value) {
    await defering(webSite.value, 5);
    if (sourceUrl.value) window.location.replace(sourceUrl.value);
  }
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.block-shell {
  min-height: 100vh;
  background: #F2F2F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  padding: 24px;
}

.block-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.brand-label {
  font-size: 15px;
  font-weight: 600;
  color: #1C1C1E;
  letter-spacing: -0.2px;
}

.block-icon { font-size: 48px; line-height: 1; }

.block-title {
  font-size: 24px;
  font-weight: 700;
  color: #1C1C1E;
  letter-spacing: -0.3px;
}

.block-site {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #3A3A3C;
}
.site-favicon { border-radius: 3px; }

.stats-row {
  display: flex;
  align-items: center;
  gap: 0;
  background: #F2F2F7;
  border-radius: 12px;
  padding: 14px 24px;
  width: 100%;
}
.stat { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 12px; color: #8E8E93; font-weight: 500; }
.stat-value { font-size: 18px; font-weight: 700; color: #1C1C1E; }
.stat-divider { width: 1px; height: 32px; background: #D1D1D6; margin: 0 16px; }

.block-message {
  font-size: 14px;
  line-height: 1.55;
  color: #6E6E73;
  max-width: 320px;
}

.btn-defer {
  background: #FF9F0A;
  color: #fff;
  border: none;
  border-radius: 12px;
  height: 46px;
  padding: 0 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.15s;
  margin-top: 4px;
}
.btn-defer:hover { opacity: 0.85; }

.defer-note { font-size: 12px; color: #8E8E93; }
</style>
