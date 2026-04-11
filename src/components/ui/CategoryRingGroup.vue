<template>
  <div class="ring-group">
    <div v-for="item in items" :key="item.category" class="ring-item">
      <ProgressRing
        :size="56"
        :stroke-width="5"
        :progress="item.progress"
        :color="item.color"
        :class="{ 'ring-danger': item.danger }"
      >
        <CategoryIcon :category="item.category" :size="18" :color="item.color" />
      </ProgressRing>
      <div class="ring-label">
        <span class="ring-cat">{{ item.label }}</span>
        <span class="ring-time">{{ item.formattedTime }}</span>
        <!-- Psychological hook: show "near limit" badge when > 80% of budget -->
        <span v-if="item.nearLimit" class="ring-near-limit">near limit</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Category, CATEGORY_META } from '../../types/category';
import { convertSummaryTimeToString } from '../../utils/converter';
import ProgressRing from './ProgressRing.vue';
import CategoryIcon from './CategoryIcon.vue';

const props = defineProps<{
  categorySeconds: Partial<Record<Category, number>>;
  budgets?: Partial<Record<Category, number>>;
}>();

const items = computed(() => {
  const entries = Object.entries(props.categorySeconds) as [Category, number][];
  const sorted = entries
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const maxSec = Math.max(...sorted.map(([, s]) => s), 1);

  return sorted.map(([cat, seconds]) => {
    const meta = CATEGORY_META[cat];
    const budget = props.budgets?.[cat];
    const progress = budget ? Math.min(seconds / budget, 1) : seconds / maxSec;
    const nearLimit = budget ? progress > 0.8 && progress < 1 : false;
    const danger = budget ? progress >= 1 : false;

    return {
      category: cat,
      label: meta.label,
      color: meta.color,
      progress,
      nearLimit,
      danger,
      formattedTime: convertSummaryTimeToString(seconds),
    };
  });
});
</script>

<style scoped>
.ring-group {
  display: flex;
  gap: 8px;
  justify-content: space-around;
  padding: 4px 0;
}

.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.ring-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.ring-cat {
  font-size: 11px;
  font-weight: 600;
  color: var(--label-2);
  text-align: center;
}

.ring-time {
  font-size: 12px;
  font-weight: 700;
  color: var(--label-1);
  font-variant-numeric: tabular-nums;
}

/* Psychological hook: near-limit creates mild urgency without panic */
.ring-near-limit {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #FF9F0A;
  margin-top: 1px;
}
</style>
