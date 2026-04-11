<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="progress-ring"
  >
    <!-- Track -->
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      :stroke="trackColor"
      :stroke-width="strokeWidth"
    />
    <!-- Fill -->
    <circle
      ref="fillCircle"
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      :style="{ transition: `stroke-dashoffset 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)` }"
      transform-origin="center"
      transform="rotate(-90)"
    />
    <!-- Center slot -->
    <foreignObject
      v-if="$slots.default"
      x="0"
      y="0"
      :width="size"
      :height="size"
    >
      <div class="ring-center-content" xmlns="http://www.w3.org/1999/xhtml">
        <slot />
      </div>
    </foreignObject>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  /** 0–1 progress */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}>(), {
  size: 64,
  strokeWidth: 6,
  color: 'var(--blue)',
  trackColor: 'var(--fill-2)',
});

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2 - 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(() =>
  circumference.value * (1 - Math.min(Math.max(props.progress, 0), 1)),
);
</script>

<style scoped>
.progress-ring { flex-shrink: 0; }

.ring-center-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
