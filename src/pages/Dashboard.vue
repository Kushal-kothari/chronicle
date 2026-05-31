<template>
  <div class="dashboard-shell" :class="{ dark: isDark }">

    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="sidebar-logo-mark">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M8 3L10.5 7H13L10 9.5L11 13L8 10.5L5 13L6 9.5L3 7H5.5L8 3Z" fill="white"/>
          </svg>
        </div>
        <span class="sidebar-logo-name">Chronicle</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1">
        <span class="nav-section-label">Analytics</span>
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: currentPage === item.id }"
          @click="navigate(item.id)"
        >
          <span v-html="item.icon" class="nav-icon-wrap" />
          {{ item.label }}
        </button>

        <span class="nav-section-label mt-4">Settings</span>
        <button
          class="nav-item"
          :class="{ active: currentPage === 'settings' }"
          @click="navigate('settings')"
        >
          <span v-html="settingsIcon" class="nav-icon-wrap" />
          Settings
        </button>
      </nav>

      <!-- Dark mode toggle at bottom -->
      <button class="dark-toggle" @click="toggleDark">
        <span v-html="isDark ? sunIcon : moonIcon" />
        <span style="font-size:13px;font-weight:500;">{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
      </button>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <OverviewPage     v-if="currentPage === 'overview'" />
      <SitesPage        v-else-if="currentPage === 'sites'" />
      <CategoriesPage   v-else-if="currentPage === 'categories'" />
      <GoalsPage        v-else-if="currentPage === 'goals'" />
      <FocusLogPage     v-else-if="currentPage === 'focus'" />
      <WeeklyDigestPage v-else-if="currentPage === 'digest'" />
      <SettingsPage     v-else-if="currentPage === 'settings'" />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useDarkMode } from '../composables/useDarkMode';

import OverviewPage     from '../components/dashboard/OverviewPage.vue';
import SitesPage        from '../components/dashboard/SitesPage.vue';
import CategoriesPage   from '../components/dashboard/CategoriesPage.vue';
import GoalsPage        from '../components/dashboard/GoalsPage.vue';
import FocusLogPage     from '../components/dashboard/FocusLogPage.vue';
import WeeklyDigestPage from '../components/dashboard/WeeklyDigestPage.vue';
import SettingsPage     from '../components/dashboard/SettingsPage.vue';

type PageId = 'overview' | 'sites' | 'categories' | 'goals' | 'focus' | 'digest' | 'settings';

const { isDark, load: loadDarkMode, toggle: toggleDark } = useDarkMode();

// Read initial page from URL ?tab= param
function getInitialPage(): PageId {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const validPages: PageId[] = ['overview', 'sites', 'categories', 'goals', 'focus', 'digest', 'settings'];
  if (tab && validPages.includes(tab as PageId)) return tab as PageId;
  return 'overview';
}

const currentPage = ref<PageId>(getInitialPage());

function navigate(page: PageId) {
  currentPage.value = page;
  // Update URL without reload
  const url = new URL(window.location.href);
  url.searchParams.set('tab', page);
  window.history.replaceState({}, '', url.toString());
}

const navItems: Array<{ id: PageId; label: string; icon: string }> = [
  {
    id: 'overview',
    label: 'Overview',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2V2zm0 7h5v5H2V9zm7-7h5v5H9V2zm0 7h5v5H9V9z"/></svg>`,
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-.8 13.9C4.3 13.4 2 10.9 2 8c0-.5.1-1 .2-1.5L6 10.3v.7c0 1.1.9 2 2 2v.9zM13.2 12c-.3-.9-1.1-1.5-2.2-1.5h-1V9c0-.6-.4-1-1-1H5V6h2c.6 0 1-.4 1-1V3.1c2.9.5 5 3.1 5 5.9 0 1.1-.3 2.1-.8 3z"/></svg>`,
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm7 0a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V4zm-7 7a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1zm7 0a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1z"/></svg>`,
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z" clip-rule="evenodd"/></svg>`,
  },
  {
    id: 'focus',
    label: 'Focus Log',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8zm7-3.5a.75.75 0 0 1 .75.75v3.19l2.03 1.17a.75.75 0 0 1-.75 1.3L7.5 9.5A.75.75 0 0 1 7 8.75v-4A.75.75 0 0 1 8 4.5z"/></svg>`,
  },
  {
    id: 'digest',
    label: 'Weekly Digest',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H10v.5c2.76.46 4.67 2.93 4 5.63C13.44 11.54 11 14 8 14s-5.44-2.46-6-4.87C1.33 6.43 3.24 3.96 6 3.5V3H5.5a.5.5 0 0 1-.5-.5zM8 5a5 5 0 1 0 0 10A5 5 0 0 0 8 5zm.5 4.5V7a.5.5 0 0 0-1 0v3a.5.5 0 0 0 .25.43l2 1.15a.5.5 0 0 0 .5-.86L8.5 9.5z"/></svg>`,
  },
];

const settingsIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 .75a.75.75 0 0 1 .75.75V3h.5c.69 0 1.25.56 1.25 1.25v.5c.97.36 1.75 1.05 2.22 1.93l.43-.25a1.25 1.25 0 0 1 1.71.46l.25.43a1.25 1.25 0 0 1-.46 1.71l-.43.25c.04.25.06.5.06.77s-.02.52-.06.77l.43.25a1.25 1.25 0 0 1 .46 1.71l-.25.43a1.25 1.25 0 0 1-1.71.46l-.43-.25A4.25 4.25 0 0 1 10.5 13.75v.5A1.25 1.25 0 0 1 9.25 15.5h-.5V14.5a.75.75 0 0 1-1.5 0V15.5h-.5A1.25 1.25 0 0 1 5.5 14.25v-.5a4.25 4.25 0 0 1-2.22-1.93l-.43.25a1.25 1.25 0 0 1-1.71-.46l-.25-.43a1.25 1.25 0 0 1 .46-1.71l.43-.25A4.27 4.27 0 0 1 1.72 8.5h-.97V8a.75.75 0 0 1 0-1.5h.97c.04-.26.09-.52.16-.77l-.43-.25a1.25 1.25 0 0 1-.46-1.71l.25-.43A1.25 1.25 0 0 1 2.96 3.8l.43.25A4.25 4.25 0 0 1 5.5 2.12v-.5C5.5 .837 6.337 0 7.25 0h.5A.75.75 0 0 1 8 .75zm0 4.75a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" clip-rule="evenodd"/></svg>`;

const sunIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4"/><path d="M8 1v1.5M8 13.5V15M1 8H2.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const moonIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 1.75a6.75 6.75 0 0 1-6.75 6.75 6.747 6.747 0 0 1-1.75-.23 6.753 6.753 0 0 0 6.5 4.98c3.73 0 6.75-3.02 6.75-6.75a6.747 6.747 0 0 0-4.75-6.5v.75z"/></svg>`;

onMounted(loadDarkMode);
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-2);
}

.dark-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--r-sm);
  border: none;
  background: transparent;
  font-family: var(--font);
  color: var(--label-2);
  cursor: pointer;
  transition: background 0.12s ease;
  width: 100%;
}

.dark-toggle:hover {
  background: var(--fill-3);
}

.nav-icon-wrap {
  display: flex;
  align-items: center;
  color: currentColor;
}
</style>
