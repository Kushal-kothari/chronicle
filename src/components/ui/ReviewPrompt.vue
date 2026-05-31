<template>
  <div v-if="visible" class="review-prompt animate-slide-up">
    <div class="review-icon">★</div>
    <div class="review-content">
      <p class="review-title">Enjoying Chronicle?</p>
      <p class="review-text">A quick rating helps others find it — and keeps Chronicle free.</p>
      <div class="review-actions">
        <button class="review-btn review-btn--primary" @click="rate">Rate it ★</button>
        <button class="review-btn" @click="later">Not now</button>
        <button class="review-btn review-btn--quiet" @click="never">No thanks</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Browser from 'webextension-polyfill';
import { CHROME_STORE_REVIEW_URL } from '../../utils/url';
import {
  shouldShowReviewPrompt,
  markReviewed,
  dismissReviewForever,
  snoozeReviewPrompt,
} from '../../composables/useReviewPrompt';

const visible = ref(false);

onMounted(async () => {
  visible.value = await shouldShowReviewPrompt();
});

async function rate() {
  await markReviewed();
  visible.value = false;
  await Browser.tabs.create({ url: CHROME_STORE_REVIEW_URL });
}

async function later() {
  await snoozeReviewPrompt();
  visible.value = false;
}

async function never() {
  await dismissReviewForever();
  visible.value = false;
}
</script>

<style scoped>
.review-prompt {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 12px 12px;
  padding: 14px;
  background: var(--bg-1);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-sm);
  border-left: 3px solid var(--blue);
}

.review-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  font-size: 16px;
  background: rgba(10, 132, 255, 0.1);
  color: var(--blue);
}

.review-content { flex: 1; min-width: 0; }

.review-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--label-1);
  margin-bottom: 3px;
}

.review-text {
  font-size: 12px;
  color: var(--label-2);
  line-height: 1.45;
  margin-bottom: 10px;
}

.review-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.review-btn {
  font-family: var(--font);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: var(--fill-3);
  color: var(--label-1);
  cursor: pointer;
  transition: background 0.12s ease, opacity 0.12s ease;
}

.review-btn:hover { opacity: 0.85; }

.review-btn--primary {
  background: var(--blue);
  color: #fff;
}

.review-btn--quiet {
  background: transparent;
  color: var(--label-3);
  padding: 6px 8px;
}

.review-btn--quiet:hover { color: var(--label-2); }
</style>
