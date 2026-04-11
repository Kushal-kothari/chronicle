<template>
  <div class="timeline-wrap">
    <div class="timeline-bars">
      <div
        v-for="(val, i) in buckets"
        :key="i"
        class="timeline-bar"
        :style="{ height: `${barHeight(val)}%`, background: barColor(val) }"
        :title="`${i}:00 — ${formatTime(val)}`"
      />
    </div>
    <div class="timeline-labels">
      <span
        v-for="label in hourLabels"
        :key="label.hour"
        class="timeline-label"
        :style="{ left: `${label.pct}%` }"
      >{{ label.text }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { convertSummaryTimeToString } from '../../utils/converter';

const props = withDefaults(defineProps<{
  /** 24-element array of seconds per hour (index = hour 0–23) */
  hourlySeconds: number[];
  height?: number;
  accentColor?: string;
}>(), {
  height: 40,
  accentColor: 'var(--blue)',
});

const buckets = computed(() => {
  if (props.hourlySeconds.length === 24) return props.hourlySeconds;
  return Array(24).fill(0);
});

const maxVal = computed(() => Math.max(...buckets.value, 1));

function barHeight(val: number): number {
  return Math.max((val / maxVal.value) * 100, val > 0 ? 8 : 0);
}

function barColor(val: number): string {
  if (val === 0) return 'var(--fill-2)';
  const intensity = val / maxVal.value;
  if (intensity > 0.7) return props.accentColor;
  if (intensity > 0.3) return 'rgba(10, 132, 255, 0.55)';
  return 'rgba(10, 132, 255, 0.28)';
}

function formatTime(seconds: number): string {
  if (seconds === 0) return 'No activity';
  return convertSummaryTimeToString(seconds);
}

const hourLabels = computed(() => [
  { hour: 0, text: '12am', pct: 0 },
  { hour: 6, text: '6am', pct: 25 },
  { hour: 12, text: '12pm', pct: 50 },
  { hour: 18, text: '6pm', pct: 75 },
  { hour: 23, text: '11pm', pct: 100 },
]);
</script>

<style scoped>
.timeline-wrap {
  position: relative;
  padding-bottom: 14px;
}

.timeline-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: v-bind('props.height + "px"');
  border-radius: 4px;
  overflow: hidden;
}

.timeline-bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  transition: height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
  min-height: 2px;
}

.timeline-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 14px;
}

.timeline-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 500;
  color: var(--label-3);
  white-space: nowrap;
}
</style>
