<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Focus Log</h1>
      <p class="page-subtitle">Your session history</p>
    </div>

    <!-- Stats summary -->
    <div v-if="stats.totalSessions > 0" class="stats-grid mb-6">
      <div class="stat-card">
        <p class="stat-label">Total Sessions</p>
        <p class="stat-value">{{ stats.totalSessions }}</p>
        <p class="stat-sub">last 30 days</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Focus Time</p>
        <p class="stat-value">{{ formatSec(stats.totalSeconds) }}</p>
        <p class="stat-sub">last 30 days</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Avg Session</p>
        <p class="stat-value">{{ formatSec(stats.avgDurationSeconds) }}</p>
        <p class="stat-sub">per session</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Avg Rating</p>
        <p class="stat-value stat-value--rating">
          {{ stats.avgRating !== null ? stats.avgRating.toFixed(1) : '—' }}
          <Icon v-if="stats.avgRating" name="star-fill" :size="16" style="color:#FFD60A;margin-left:3px;" />
        </p>
        <p class="stat-sub">out of 5</p>
      </div>
    </div>

    <!-- Session list -->
    <div v-if="sessions.length === 0" class="card p-8 text-center">
      <div class="empty-icon-wrap mb-4"><Icon name="timer" :size="40" style="color:var(--label-4);" /></div>
      <p class="text-title-3 mb-2">No focus sessions yet</p>
      <p class="text-caption mb-4">
        Start a focus session from the extension popup to build your work log.
      </p>
    </div>

    <div v-else>
      <div
        v-for="group in groupedSessions"
        :key="group.date"
        class="mb-5"
      >
        <p class="section-header mb-2">{{ group.label }}</p>
        <div class="list-group">
          <div
            v-for="session in group.sessions"
            :key="session.id"
            class="session-row"
          >
            <div class="session-icon"><Icon name="target" :size="20" style="color:var(--blue);" /></div>
            <div class="session-info">
              <p class="session-name">{{ session.name }}</p>
              <p class="session-meta">
                {{ formatTime(session.startedAt) }}
                <span v-if="session.note" class="session-note">· "{{ session.note }}"</span>
              </p>
            </div>
            <div class="session-right">
              <span class="session-duration">{{ formatDuration(session) }}</span>
              <span v-if="session.rating" class="session-rating">
                <Icon
                  v-for="n in 5"
                  :key="n"
                  :name="n <= session.rating ? 'star-fill' : 'star'"
                  :size="11"
                  :style="{ color: n <= session.rating ? '#FFD60A' : 'var(--label-4)' }"
                />
              </span>
              <span v-else class="session-rating-empty">No rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { format, isToday, isYesterday } from 'date-fns';
import { getFocusSessions, computeFocusStats } from '../../composables/useFocusSessions';
import { FocusSession, getSessionDuration } from '../../types/focus-session';
import { convertSummaryTimeToString } from '../../utils/converter';
import Icon from '../ui/Icon.vue';

const sessions = ref<FocusSession[]>([]);
const stats = ref({ totalSessions: 0, totalSeconds: 0, avgDurationSeconds: 0, avgRating: null as number | null, longestSessionSeconds: 0 });

function formatSec(s: number): string {
  return convertSummaryTimeToString(s).trim() || '0m';
}

function formatDuration(s: FocusSession): string {
  return formatSec(getSessionDuration(s));
}

function formatTime(iso: string): string {
  return format(new Date(iso), 'h:mm a');
}

const groupedSessions = computed(() => {
  const groups: Record<string, { label: string; sessions: FocusSession[] }> = {};

  for (const session of sessions.value.filter(s => s.endedAt)) {
    const d = new Date(session.startedAt);
    const key = format(d, 'yyyy-MM-dd');
    if (!groups[key]) {
      groups[key] = {
        label: isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'EEEE, MMMM d'),
        sessions: [],
      };
    }
    groups[key].sessions.push(session);
  }

  return Object.values(groups);
});

onMounted(async () => {
  const all = await getFocusSessions();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  sessions.value = all.filter(s => new Date(s.startedAt).getTime() >= cutoff);
  stats.value = computeFocusStats(sessions.value);
});
</script>

<style scoped>
.session-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 0.5px solid var(--sep);
}

.session-row:last-child { border-bottom: none; }

.session-icon {
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
}

.empty-icon-wrap {
  display: flex;
  justify-content: center;
}

.stat-value--rating {
  display: flex;
  align-items: center;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--label-1);
  margin-bottom: 3px;
}

.session-meta {
  font-size: 12px;
  color: var(--label-2);
}

.session-note {
  font-style: italic;
  color: var(--label-3);
}

.session-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}

.session-duration {
  font-size: 14px;
  font-weight: 700;
  color: var(--label-1);
  font-variant-numeric: tabular-nums;
}

.session-rating {
  display: flex;
  align-items: center;
  gap: 1px;
}

.session-rating-empty {
  font-size: 11px;
  color: var(--label-4);
}
</style>
