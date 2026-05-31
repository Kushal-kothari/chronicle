<template>
  <div class="popup-shell" :class="{ dark: isDark }">

    <!-- Header -->
    <header class="popup-header">
      <div class="header-logo">
        <div class="logo-mark">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect width="16" height="16" rx="3.5" fill="white"/>
            <path d="M8 3L10.5 7H13L10 9.5L11 13L8 10.5L5 13L6 9.5L3 7H5.5L8 3Z" fill="#0A84FF"/>
          </svg>
        </div>
        <span class="header-name">Chronicle</span>
      </div>

      <div class="header-actions">
        <button class="icon-btn" :title="isDark ? 'Light mode' : 'Dark mode'" @click="toggleDark">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12A4 4 0 1 0 8 4a4 4 0 0 0 0 8zm0 1.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 13.5zm0-11a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 2.5zm5.5 5.5a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 .75.75zM3.25 8a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 3.25 8zM11.89 4.11a.75.75 0 0 1 0 1.06l-.707.707a.75.75 0 1 1-1.06-1.06l.707-.707a.75.75 0 0 1 1.06 0zM5.877 10.123a.75.75 0 0 1 0 1.06l-.707.707a.75.75 0 1 1-1.06-1.06l.707-.707a.75.75 0 0 1 1.06 0zM11.89 11.89a.75.75 0 0 1-1.06 0l-.707-.707a.75.75 0 0 1 1.06-1.06l.707.707a.75.75 0 0 1 0 1.06zM5.877 5.877a.75.75 0 0 1-1.06 0l-.707-.707a.75.75 0 0 1 1.06-1.06l.707.707a.75.75 0 0 1 0 1.06z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.5 1.75a.75.75 0 0 0-1.5 0 5.25 5.25 0 0 0 6.5 6.5.75.75 0 0 0 0-1.5A3.75 3.75 0 0 1 8.5 1.75z"/>
          </svg>
        </button>
        <button class="icon-btn" title="Open Dashboard" @click="openDashboard">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A.5.5 0 0 1 2.5 2h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-4zm0 7A.5.5 0 0 1 2.5 9h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-4zm7-7a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-4zm0 7a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-4z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="popup-scroll">
      <TodayView v-if="activeTab === 'today'" />
      <FocusView v-else-if="activeTab === 'focus'" />
      <GoalsView v-else-if="activeTab === 'goals'" />
    </div>

    <!-- Bottom nav -->
    <nav class="popup-nav">
      <button
        v-for="tab in navTabs"
        :key="tab.id"
        class="popup-nav-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="nav-icon" v-html="tab.icon" />
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import TodayView from '../components/popup/TodayView.vue';
import FocusView from '../components/popup/FocusView.vue';
import GoalsView from '../components/popup/GoalsView.vue';
import { openPage } from '../utils/open-page';
import { SettingsTab } from '../utils/enums';
import { useDarkMode } from '../composables/useDarkMode';

type TabId = 'today' | 'focus' | 'goals';

const activeTab = ref<TabId>('today');
const { isDark, load: loadDarkMode, toggle: toggleDark } = useDarkMode();

const navTabs: Array<{ id: TabId; label: string; icon: string }> = [
  {
    id: 'today',
    label: 'Today',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1zM4 8h12v9H4V8zm2 2a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H6zm0 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H6z"/>
    </svg>`,
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.24a.75.75 0 0 0-1.1 1.02l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75z" clip-rule="evenodd"/>
    </svg>`,
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z" clip-rule="evenodd"/>
    </svg>`,
  },
];

function openDashboard() {
  openPage(SettingsTab.Dashboard);
}

onMounted(loadDarkMode);
</script>

<style scoped>
.popup-shell {
  width: 380px;
  min-height: 500px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  background: var(--bg-2);
  position: relative;
  overflow: hidden;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  background: var(--bg-1);
  border-bottom: 0.5px solid var(--sep);
  flex-shrink: 0;
  z-index: 10;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-mark {
  width: 26px;
  height: 26px;
  background: var(--blue);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--label-1);
}

.header-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: var(--r-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--label-2);
  transition: background 0.12s ease, color 0.12s ease;
}

.icon-btn:hover {
  background: var(--fill-2);
  color: var(--label-1);
}

.popup-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 56px;
}
</style>
