<template>
  <span class="cat-badge" :class="`tag-${category}`">
    {{ meta.label }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Category, CATEGORY_META } from '../../types/category';

const props = defineProps<{ category: Category }>();
const meta = computed(() => CATEGORY_META[props.category]);
</script>

<style scoped>
.cat-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 100px;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
</style>
