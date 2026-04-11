<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Chronicle preferences</p>
    </div>

    <!-- General -->
    <div class="mb-6">
      <p class="section-header mb-3">General</p>
      <div class="list-group">
        <div class="list-row" style="cursor:default;">
          <div class="setting-info">
            <p class="setting-label">Dark mode</p>
            <p class="setting-desc">Use dark theme across Chronicle</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="darkMode" @change="saveSetting(StorageParams.DARK_MODE, darkMode)" />
            <div class="toggle-track" />
            <div class="toggle-thumb" />
          </label>
        </div>

        <div class="list-row" style="cursor:default;">
          <div class="setting-info">
            <p class="setting-label">Show time in badge</p>
            <p class="setting-desc">Display current site time on the extension icon</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="viewTimeInBadge" @change="saveSetting(StorageParams.VIEW_TIME_IN_BADGE, viewTimeInBadge)" />
            <div class="toggle-track" />
            <div class="toggle-thumb" />
          </label>
        </div>

        <div class="list-row" style="cursor:default;">
          <div class="setting-info">
            <p class="setting-label">Allow deferring block</p>
            <p class="setting-desc">Postpone site blocking for 5 minutes once per day</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="allowDefer" @change="saveSetting(StorageParams.BLOCK_DEFERRAL, allowDefer)" />
            <div class="toggle-track" />
            <div class="toggle-thumb" />
          </label>
        </div>

        <div class="list-row" style="cursor:default;">
          <div class="setting-info">
            <p class="setting-label">Inactivity timeout</p>
            <p class="setting-desc">Stop tracking after this period of no interaction</p>
          </div>
          <select
            v-model="inactivityInterval"
            class="select"
            @change="saveSetting(StorageParams.INTERVAL_INACTIVITY, Number(inactivityInterval))"
          >
            <option :value="30">30 seconds</option>
            <option :value="45">45 seconds</option>
            <option :value="60">1 minute</option>
            <option :value="120">2 minutes</option>
            <option :value="300">5 minutes</option>
            <option :value="600">10 minutes</option>
            <option :value="1200">20 minutes</option>
            <option :value="1800">30 minutes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="mb-6">
      <p class="section-header mb-3">Notifications</p>
      <div class="list-group">
        <div class="list-row" style="cursor:default;">
          <div class="setting-info">
            <p class="setting-label">Daily summary</p>
            <p class="setting-desc">Receive a daily digest notification</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="dailyNotification" @change="saveSetting(StorageParams.DAILY_NOTIFICATION, dailyNotification)" />
            <div class="toggle-track" />
            <div class="toggle-thumb" />
          </label>
        </div>

        <div v-if="dailyNotification" class="list-row" style="cursor:default;">
          <div class="setting-info">
            <p class="setting-label">Notification time</p>
            <p class="setting-desc">When to send the daily summary</p>
          </div>
          <select v-model="notificationHour" class="select" @change="saveNotificationTime">
            <option v-for="h in 24" :key="h-1" :value="(h-1) * 3600">
              {{ String(h-1).padStart(2,'0') }}:00
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Blocked sites -->
    <div class="mb-6">
      <p class="section-header mb-3">Blocked Sites</p>
      <div class="list-group mb-3">
        <div
          v-for="site in blackList"
          :key="site"
          class="list-row"
          style="cursor:default;"
        >
          <span class="flex-1 text-callout truncate">{{ site }}</span>
          <button class="btn btn-ghost btn-sm" @click="removeFromBlacklist(site)">Remove</button>
        </div>
        <div v-if="blackList.length === 0" class="list-row" style="cursor:default;">
          <span class="text-caption" style="padding:4px 0;">No blocked sites</span>
        </div>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newBlockedSite"
          class="input flex-1"
          placeholder="e.g. instagram.com"
          @keydown.enter="addToBlacklist"
        />
        <button class="btn btn-danger btn-sm" @click="addToBlacklist">Block</button>
      </div>
    </div>

    <!-- Whitelist -->
    <div class="mb-6">
      <p class="section-header mb-3">Whitelist (not tracked)</p>
      <div class="list-group mb-3">
        <div
          v-for="site in whiteList"
          :key="site"
          class="list-row"
          style="cursor:default;"
        >
          <span class="flex-1 text-callout truncate">{{ site }}</span>
          <button class="btn btn-ghost btn-sm" @click="removeFromWhitelist(site)">Remove</button>
        </div>
        <div v-if="whiteList.length === 0" class="list-row" style="cursor:default;">
          <span class="text-caption" style="padding:4px 0;">No whitelisted sites</span>
        </div>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newWhitelistSite"
          class="input flex-1"
          placeholder="e.g. calendar.google.com"
          @keydown.enter="addToWhitelist"
        />
        <button class="btn btn-secondary btn-sm" @click="addToWhitelist">Add</button>
      </div>
    </div>

    <!-- Data management -->
    <div class="mb-6">
      <p class="section-header mb-3">Data</p>
      <div class="list-group">
        <div class="list-row" @click="exportData" style="cursor:pointer;">
          <div class="setting-info">
            <p class="setting-label">Export data</p>
            <p class="setting-desc">Download a JSON backup of all your tracking data</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--label-3)">
            <path d="M8 12L3 7h3V2h4v5h3L8 12zm-5 2h10v1.5H3V14z"/>
          </svg>
        </div>
        <div class="list-row" @click="showImport = true" style="cursor:pointer;">
          <div class="setting-info">
            <p class="setting-label">Import data</p>
            <p class="setting-desc">Restore from a previously exported backup</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--label-3)">
            <path d="M8 4L13 9h-3v5H6V9H3L8 4zm-5 8h10v1.5H3V12z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="mb-6">
      <p class="section-header mb-3" style="color:var(--red);">Danger Zone</p>
      <div class="card p-4">
        <p class="text-callout mb-3">
          Permanently delete all tracked data. This cannot be undone.
        </p>
        <button class="btn btn-danger" @click="confirmReset = true">Delete all data</button>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="confirmReset" class="modal-overlay" @click.self="confirmReset = false">
      <div class="modal-card animate-scale-in">
        <h3 class="text-title-3 mb-2">Delete all data?</h3>
        <p class="text-caption mb-5">
          This will permanently erase all your tracking history, goals, and focus sessions.
          There is no undo.
        </p>
        <div class="flex gap-3">
          <button class="btn btn-ghost flex-1" @click="confirmReset = false">Cancel</button>
          <button class="btn btn-danger flex-1" @click="resetAllData">Yes, delete everything</button>
        </div>
      </div>
    </div>

    <!-- Import file input -->
    <input
      ref="importInput"
      type="file"
      accept=".json"
      style="display:none;"
      @change="importData"
    />

    <!-- About -->
    <div class="about-footer">
      <div class="logo-mark-sm">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="3.5" fill="#0A84FF"/>
          <path d="M8 3L10.5 7H13L10 9.5L11 13L8 10.5L5 13L6 9.5L3 7H5.5L8 3Z" fill="white"/>
        </svg>
      </div>
      <span class="text-caption">Chronicle v3.0.0</span>
      <a href="https://github.com" target="_blank" class="text-caption" style="color:var(--blue);">GitHub</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { injectStorage } from '../../storage/inject-storage';
import {
  StorageParams,
  DARK_MODE_DEFAULT,
  VIEW_TIME_IN_BADGE_DEFAULT,
  BLOCK_DEFERRAL_DEFAULT,
  INTERVAL_INACTIVITY_DEFAULT,
  DAILY_NOTIFICATION_DEFAULT,
  DAILY_SUMMARY_NOTIFICATION_TIME_DEFAULT,
} from '../../storage/storage-params';
import { useFile } from '../../composables/useFile';
import Browser from 'webextension-polyfill';
import { Messages } from '../../utils/messages';

const storage = injectStorage();

const darkMode = ref(false);
const viewTimeInBadge = ref(true);
const allowDefer = ref(true);
const inactivityInterval = ref(30);
const dailyNotification = ref(true);
const notificationHour = ref(20 * 3600);
const blackList = ref<string[]>([]);
const whiteList = ref<string[]>([]);
const newBlockedSite = ref('');
const newWhitelistSite = ref('');
const confirmReset = ref(false);
const showImport = ref(false);
const importInput = ref<HTMLInputElement>();

async function loadSettings() {
  darkMode.value = await storage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  viewTimeInBadge.value = await storage.getValue(StorageParams.VIEW_TIME_IN_BADGE, VIEW_TIME_IN_BADGE_DEFAULT);
  allowDefer.value = await storage.getValue(StorageParams.BLOCK_DEFERRAL, BLOCK_DEFERRAL_DEFAULT);
  inactivityInterval.value = await storage.getValue(StorageParams.INTERVAL_INACTIVITY, INTERVAL_INACTIVITY_DEFAULT);
  dailyNotification.value = await storage.getValue(StorageParams.DAILY_NOTIFICATION, DAILY_NOTIFICATION_DEFAULT);
  notificationHour.value = await storage.getValue(StorageParams.DAILY_SUMMARY_NOTIFICATION_TIME, DAILY_SUMMARY_NOTIFICATION_TIME_DEFAULT);
  blackList.value = await storage.getValue(StorageParams.BLACK_LIST, []);
  whiteList.value = await storage.getValue(StorageParams.BLACK_LIST, []);
  // load whitelist from correct param
  const wl = await storage.getValue('whitelist' as any, []);
  whiteList.value = wl as string[];
}

async function saveSetting(param: StorageParams, value: any) {
  await storage.saveValue(param, value);
}

async function saveNotificationTime() {
  await storage.saveValue(StorageParams.DAILY_SUMMARY_NOTIFICATION_TIME, notificationHour.value);
}

async function addToBlacklist() {
  const domain = newBlockedSite.value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain || blackList.value.includes(domain)) return;
  blackList.value.push(domain);
  await storage.saveValue(StorageParams.BLACK_LIST, blackList.value);
  newBlockedSite.value = '';
}

async function removeFromBlacklist(domain: string) {
  blackList.value = blackList.value.filter(s => s !== domain);
  await storage.saveValue(StorageParams.BLACK_LIST, blackList.value);
}

async function addToWhitelist() {
  const domain = newWhitelistSite.value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain || whiteList.value.includes(domain)) return;
  whiteList.value.push(domain);
  await storage.saveValue('whitelist' as any, whiteList.value);
  newWhitelistSite.value = '';
}

async function removeFromWhitelist(domain: string) {
  whiteList.value = whiteList.value.filter(s => s !== domain);
  await storage.saveValue('whitelist' as any, whiteList.value);
}

async function exportData() {
  const { useFile: file } = await import('../../composables/useFile');
  // Use existing backup logic via file utility
  const data = await Browser.storage.local.get(null);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chronicle-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    await Browser.runtime.sendMessage({ message: Messages.Restore, data: data.tabs });
  } catch (err) {
    console.error('Import failed', err);
  }
}

async function resetAllData() {
  await Browser.runtime.sendMessage(Messages.ClearAllData);
  confirmReset.value = false;
}

onMounted(loadSettings);
</script>

<style scoped>
.setting-info { flex: 1; min-width: 0; }

.setting-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--label-1);
  margin-bottom: 2px;
}

.setting-desc {
  font-size: 12px;
  color: var(--label-2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-card {
  background: var(--bg-1);
  border-radius: var(--r-xl);
  padding: 28px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

/* About footer */
.about-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 0;
  border-top: 0.5px solid var(--sep);
  margin-top: 8px;
}

.logo-mark-sm {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  overflow: hidden;
}
</style>
