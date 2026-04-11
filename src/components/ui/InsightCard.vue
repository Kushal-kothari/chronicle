<template>
  <div
    class="insight-card animate-slide-up"
    :class="`insight-${insight.type}`"
    :style="{ animationDelay: delay + 'ms' }"
  >
    <div class="insight-icon-wrap">
      <Icon :name="iconName" :size="18" />
    </div>
    <div class="insight-text">
      <p class="insight-title">{{ insight.title }}</p>
      <p class="insight-body">{{ insight.body }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Icon from './Icon.vue';
import type { Insight } from '../../composables/useInsights';

const props = withDefaults(defineProps<{
  insight: Insight;
  delay?: number;
}>(), { delay: 0 });

const iconName = computed(() => {
  switch (props.insight.type) {
    case 'anomaly':
      // title tells us direction — more = trending-up (warning tint), less = trending-down (positive)
      return props.insight.id.includes('high') || props.insight.id.includes('site')
        ? 'warning'
        : 'trending-down';
    case 'pattern':   return 'chart-bar';
    case 'streak':    return 'lightning';
    case 'milestone': return 'star-fill';
    default:          return 'chart-bar';
  }
});
</script>

<style scoped>
.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 14px;
  background: var(--bg-1);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-sm);
  border-left: 3px solid transparent;
  transition: border-color 0.2s;
}

/* Each insight type gets a left-rail color — trains the eye to read mood instantly */
.insight-anomaly  { border-left-color: #FF9F0A; }
.insight-pattern  { border-left-color: var(--blue); }
.insight-streak   { border-left-color: #34C759; }
.insight-milestone{ border-left-color: #FFD60A; }

.insight-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

/* Icon background tint matches rail color */
.insight-anomaly  .insight-icon-wrap { background: rgba(255,159,10,.12); color: #FF9F0A; }
.insight-pattern  .insight-icon-wrap { background: rgba(10,132,255,.10); color: var(--blue); }
.insight-streak   .insight-icon-wrap { background: rgba(52,199,89,.12);  color: #34C759; }
.insight-milestone .insight-icon-wrap { background: rgba(255,214,10,.15); color: #B8860B; }

.insight-text { flex: 1; min-width: 0; }

.insight-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--label-1);
  margin-bottom: 3px;
  line-height: 1.35;
}

.insight-body {
  font-size: 12px;
  color: var(--label-2);
  line-height: 1.45;
}
</style>
