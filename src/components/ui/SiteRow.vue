<template>
  <div class="site-row" :class="{ compact }">
    <div class="site-favicon">
      <img
        v-if="favicon"
        :src="favicon"
        :alt="domain"
        class="favicon-img"
        @error="faviconError = true"
      />
      <div v-else class="favicon-placeholder">
        <span>{{ domain.charAt(0).toUpperCase() }}</span>
      </div>
    </div>

    <div class="site-info">
      <span class="site-domain truncate">{{ domain }}</span>
      <CategoryBadge v-if="!compact" :category="category" />
    </div>

    <div class="site-meta">
      <span class="site-time">{{ formattedTime }}</span>
      <div v-if="showBar" class="site-bar-track">
        <div
          class="site-bar-fill"
          :style="{
            width: `${Math.min(ratio * 100, 100)}%`,
            background: categoryColor,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Category, CATEGORY_META } from '../../types/category';
import { convertSummaryTimeToString } from '../../utils/converter';
import CategoryBadge from './CategoryBadge.vue';

const props = withDefaults(defineProps<{
  domain: string;
  seconds: number;
  favicon?: string;
  category: Category;
  /** 0–1 proportion of max in list */
  ratio?: number;
  showBar?: boolean;
  compact?: boolean;
}>(), {
  ratio: 0,
  showBar: true,
  compact: false,
});

const faviconError = ref(false);
const favicon = computed(() => (!faviconError.value && props.favicon) ? props.favicon : null);
const formattedTime = computed(() => convertSummaryTimeToString(props.seconds));
const categoryColor = computed(() => CATEGORY_META[props.category].color);
</script>

<style scoped>
.site-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--sep);
  transition: background 0.1s ease;
}

.site-row:last-child { border-bottom: none; }
.site-row:hover      { background: var(--fill-3); }

.site-favicon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}

.favicon-img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
}

.favicon-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--fill-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--label-2);
}

.site-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.site-domain {
  font-size: 14px;
  font-weight: 500;
  color: var(--label-1);
}

.site-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.site-time {
  font-size: 13px;
  font-weight: 600;
  color: var(--label-1);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.site-bar-track {
  width: 60px;
  height: 3px;
  background: var(--fill-2);
  border-radius: 100px;
  overflow: hidden;
}

.site-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 3px;
}

/* Compact variant */
.compact { padding: 8px 12px; }
.compact .site-domain { font-size: 13px; }
.compact .site-time   { font-size: 12px; }
</style>
