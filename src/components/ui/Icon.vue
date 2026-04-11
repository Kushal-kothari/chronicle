<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="app-icon"
    aria-hidden="true"
  >
    <!-- trending-up: anomaly (more than usual) -->
    <g v-if="name === 'trending-up'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3,15 7.5,9 11.5,12 17,5"/>
      <polyline points="13.5,5 17,5 17,8.5"/>
    </g>

    <!-- trending-down: anomaly (less than usual / great focus) -->
    <g v-else-if="name === 'trending-down'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3,5 7.5,11 11.5,8 17,15"/>
      <polyline points="13.5,15 17,15 17,11.5"/>
    </g>

    <!-- target: focus session — sharp center, concentric rings signal locked-in attention -->
    <g v-else-if="name === 'target'">
      <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.75"/>
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.75"/>
      <circle cx="10" cy="10" r="1" fill="currentColor"/>
    </g>

    <!-- check-circle: goal met — satisfying completion -->
    <g v-else-if="name === 'check-circle'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10" cy="10" r="7"/>
      <polyline points="7,10 9,12.5 13.5,7.5"/>
    </g>

    <!-- lightning: streak — instant energy signal -->
    <path v-else-if="name === 'lightning'"
      d="M12.5 2.5L5 11H9.5L7.5 17.5L15 9H10.5L12.5 2.5Z"
      fill="currentColor"
    />

    <!-- chart-bar: pattern / dominant category -->
    <g v-else-if="name === 'chart-bar'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="11" width="3.5" height="7" rx="1"/>
      <rect x="8.25" y="6.5" width="3.5" height="11.5" rx="1"/>
      <rect x="14" y="3" width="3.5" height="15" rx="1"/>
      <line x1="1.5" y1="18" x2="18.5" y2="18"/>
    </g>

    <!-- star: rating — fills with color for rated sessions -->
    <path v-else-if="name === 'star'"
      d="M10 2.5L12.4 7.6L18 8.4L14 12.3L15.1 17.9L10 15.2L4.9 17.9L6 12.3L2 8.4L7.6 7.6L10 2.5Z"
      :fill="filled ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- star-fill (always filled variant) -->
    <path v-else-if="name === 'star-fill'"
      d="M10 2.5L12.4 7.6L18 8.4L14 12.3L15.1 17.9L10 15.2L4.9 17.9L6 12.3L2 8.4L7.6 7.6L10 2.5Z"
      fill="currentColor"
    />

    <!-- clock: today / time -->
    <g v-else-if="name === 'clock'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <circle cx="10" cy="10" r="7"/>
      <polyline points="10,6.5 10,10 12.5,12" stroke-linejoin="round"/>
    </g>

    <!-- calendar: weekly digest -->
    <g v-else-if="name === 'calendar'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="14" height="13" rx="2"/>
      <line x1="3" y1="9" x2="17" y2="9"/>
      <line x1="7" y1="2" x2="7" y2="6"/>
      <line x1="13" y1="2" x2="13" y2="6"/>
    </g>

    <!-- warning: site anomaly / over limit — attention-capturing triangle -->
    <g v-else-if="name === 'warning'">
      <path d="M9.1 3.5L1.5 17H18.5L10.9 3.5C10.5 2.8 9.5 2.8 9.1 3.5Z"
        stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="10" y1="8" x2="10" y2="13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      <circle cx="10" cy="15.5" r="1" fill="currentColor"/>
    </g>

    <!-- timer: focus countdown -->
    <g v-else-if="name === 'timer'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10" cy="11" r="7"/>
      <line x1="10" y1="4" x2="10" y2="2"/>
      <line x1="8" y1="2" x2="12" y2="2"/>
      <polyline points="10,7.5 10,11 12.5,13"/>
    </g>

    <!-- play: start session -->
    <g v-else-if="name === 'play'">
      <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.75"/>
      <path d="M8.5 7.5L13.5 10L8.5 12.5Z" fill="currentColor"/>
    </g>

    <!-- pause: pause / in progress -->
    <g v-else-if="name === 'pause'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <circle cx="10" cy="10" r="7"/>
      <line x1="8" y1="7.5" x2="8" y2="12.5"/>
      <line x1="12" y1="7.5" x2="12" y2="12.5"/>
    </g>

    <!-- stop: end session -->
    <g v-else-if="name === 'stop'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <circle cx="10" cy="10" r="7"/>
      <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="currentColor" stroke="none"/>
    </g>

    <!-- empty: no data / blank slate — invites action -->
    <g v-else-if="name === 'empty'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10" cy="10" r="7" stroke-dasharray="3 2"/>
      <line x1="10" y1="7" x2="10" y2="10"/>
      <circle cx="10" cy="12.5" r="0.75" fill="currentColor" stroke="none"/>
    </g>

    <!-- plus: add action -->
    <g v-else-if="name === 'plus'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <line x1="10" y1="4" x2="10" y2="16"/>
      <line x1="4" y1="10" x2="16" y2="10"/>
    </g>

    <!-- arrow-right: navigate / open -->
    <g v-else-if="name === 'arrow-right'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="10" x2="16" y2="10"/>
      <polyline points="11,5 16,10 11,15"/>
    </g>

    <!-- close: dismiss / remove -->
    <g v-else-if="name === 'close'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <line x1="5" y1="5" x2="15" y2="15"/>
      <line x1="15" y1="5" x2="5" y2="15"/>
    </g>

    <!-- settings: gear-style sliders — three horizontal levers -->
    <g v-else-if="name === 'settings'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <line x1="3" y1="5.5" x2="17" y2="5.5"/>
      <circle cx="7" cy="5.5" r="2" fill="var(--bg-1, white)" stroke="currentColor" stroke-width="1.75"/>
      <line x1="3" y1="10" x2="17" y2="10"/>
      <circle cx="13" cy="10" r="2" fill="var(--bg-1, white)" stroke="currentColor" stroke-width="1.75"/>
      <line x1="3" y1="14.5" x2="17" y2="14.5"/>
      <circle cx="8" cy="14.5" r="2" fill="var(--bg-1, white)" stroke="currentColor" stroke-width="1.75"/>
    </g>

    <!-- globe: sites / web -->
    <g v-else-if="name === 'globe'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <circle cx="10" cy="10" r="7"/>
      <path d="M10 3C10 3 7.5 6.5 7.5 10C7.5 13.5 10 17 10 17" stroke-linejoin="round"/>
      <path d="M10 3C10 3 12.5 6.5 12.5 10C12.5 13.5 10 17 10 17" stroke-linejoin="round"/>
      <line x1="3" y1="10" x2="17" y2="10"/>
      <line x1="3.5" y1="7" x2="16.5" y2="7"/>
      <line x1="3.5" y1="13" x2="16.5" y2="13"/>
    </g>

    <!-- grid: overview / dashboard -->
    <g v-else-if="name === 'grid'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="5.5" height="5.5" rx="1.5"/>
      <rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5"/>
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5"/>
      <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5"/>
    </g>

    <!-- list: focus log -->
    <g v-else-if="name === 'list'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <line x1="8" y1="5.5" x2="17" y2="5.5"/>
      <line x1="8" y1="10" x2="17" y2="10"/>
      <line x1="8" y1="14.5" x2="17" y2="14.5"/>
      <polyline points="3,4.5 4.5,6 7,3" stroke-linejoin="round"/>
      <polyline points="3,9 4.5,10.5 7,8" stroke-linejoin="round"/>
      <polyline points="3,13.5 4.5,15 7,12.5" stroke-linejoin="round"/>
    </g>

    <!-- donut: categories -->
    <g v-else-if="name === 'donut'" stroke="currentColor" stroke-width="1.75">
      <circle cx="10" cy="10" r="7"/>
      <circle cx="10" cy="10" r="3.5"/>
    </g>
  </svg>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  name: string;
  size?: number;
  filled?: boolean;
}>(), {
  size: 20,
  filled: false,
});
</script>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
}
</style>
