<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="category-icon"
    :style="{ color }"
    aria-hidden="true"
  >
    <!-- Work: classic code brackets </> — signals craft and precision -->
    <g v-if="category === 'work'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="7,6.5 4,10 7,13.5"/>
      <polyline points="13,6.5 16,10 13,13.5"/>
      <line x1="11.5" y1="5.5" x2="8.5" y2="14.5"/>
    </g>

    <!-- Learning: open book, spine visible — signals depth and growth -->
    <g v-else-if="category === 'learning'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 5.5C10 5.5 7.5 4.5 4.5 5.5V15.5C7.5 14.5 10 15.5 10 15.5"/>
      <path d="M10 5.5C10 5.5 12.5 4.5 15.5 5.5V15.5C12.5 14.5 10 15.5 10 15.5"/>
      <line x1="10" y1="5.5" x2="10" y2="15.5"/>
    </g>

    <!-- Social: person — minimal, human -->
    <g v-else-if="category === 'social'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <circle cx="10" cy="7" r="3"/>
      <path d="M4 17C4 13.7 6.7 11 10 11C13.3 11 16 13.7 16 17" stroke-linejoin="round"/>
    </g>

    <!-- Entertainment: rounded screen + play triangle — signals media -->
    <g v-else-if="category === 'entertainment'">
      <rect x="2" y="5" width="16" height="11" rx="2.5" stroke="currentColor" stroke-width="1.75"/>
      <path d="M8.5 8.5L13.5 10.5L8.5 12.5Z" fill="currentColor"/>
    </g>

    <!-- News: folded document + reading lines — signals information -->
    <g v-else-if="category === 'news'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 2H13L17 6V18H5V2Z"/>
      <path d="M13 2V6H17" stroke-linejoin="bevel"/>
      <line x1="7.5" y1="9.5" x2="14.5" y2="9.5"/>
      <line x1="7.5" y1="12.5" x2="14.5" y2="12.5"/>
      <line x1="7.5" y1="15.5" x2="11.5" y2="15.5"/>
    </g>

    <!-- Other: 4-dot grid — neutral, contained -->
    <g v-else fill="currentColor">
      <circle cx="6.5" cy="6.5" r="2"/>
      <circle cx="13.5" cy="6.5" r="2"/>
      <circle cx="6.5" cy="13.5" r="2"/>
      <circle cx="13.5" cy="13.5" r="2"/>
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Category, CATEGORY_META } from '../../types/category';

const props = withDefaults(defineProps<{
  category: Category | string;
  size?: number;
  /** Override color — defaults to the category's design-system color */
  color?: string;
}>(), {
  size: 20,
});

const color = computed(() => props.color ?? CATEGORY_META[props.category as Category]?.color ?? 'currentColor');
</script>

<style scoped>
.category-icon {
  display: block;
  flex-shrink: 0;
}
</style>
