<template>
  <div class="focus-view animate-fade-in">

    <!-- Active session -->
    <div v-if="activeSession" class="active-session-card">
      <div class="active-pulse" />
      <div class="active-header">
        <div>
          <p class="active-label">Focus Session</p>
          <p class="active-name">{{ activeSession.name }}</p>
        </div>
        <div class="active-timer">{{ formattedElapsed }}</div>
      </div>

      <div v-if="activeSession.targetSeconds > 0" class="progress-wrap">
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{
              width: `${Math.min((elapsedSeconds / activeSession.targetSeconds) * 100, 100)}%`,
              background: isOverTarget ? 'var(--green)' : 'var(--blue)',
            }"
          />
        </div>
        <div class="progress-meta">
          <span class="text-secondary goal-reached-label" style="font-size:12px;">
            <Icon v-if="isOverTarget" name="check-circle" :size="12" style="color:var(--green);margin-right:3px;" />
            {{ isOverTarget ? 'Goal reached!' : targetLabel }}
          </span>
          <span class="text-secondary" style="font-size:12px;">
            {{ formattedTarget }}
          </span>
        </div>
      </div>

      <button class="btn btn-danger w-full mt-3" @click="showEndModal = true">
        End Session
      </button>
    </div>

    <!-- Start new session -->
    <div v-else class="start-section">
      <div class="start-icon"><Icon name="target" :size="40" style="color:var(--blue);" /></div>
      <h2 class="text-title-3 text-center mb-1">Start a Focus Session</h2>
      <p class="text-caption text-center mb-4">Name your work, set a timer, and stay on task.</p>

      <div class="form-group">
        <label class="form-label">Session name</label>
        <input
          v-model="sessionName"
          class="input"
          placeholder="e.g. Thesis writing, Deep work..."
          @keydown.enter="startSession"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Duration (optional)</label>
        <div class="duration-grid">
          <button
            v-for="opt in durationOptions"
            :key="opt.value"
            class="duration-chip"
            :class="{ active: selectedDuration === opt.value }"
            @click="selectedDuration = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <button
        class="btn btn-primary w-full"
        :disabled="!sessionName.trim()"
        @click="startSession"
      >
        Start Session
      </button>
    </div>

    <!-- Recent sessions -->
    <div class="px-3 pb-4">
      <p class="section-header mt-4">Recent Sessions</p>
      <div v-if="recentSessions.length === 0" class="empty-hint">
        No sessions yet. Start your first one above.
      </div>
      <div v-else class="list-group">
        <div v-for="session in recentSessions" :key="session.id" class="session-row">
          <div class="session-info">
            <span class="session-name truncate">{{ session.name }}</span>
            <span class="session-meta">{{ formatSessionDate(session.startedAt) }}</span>
          </div>
          <div class="session-right">
            <span class="session-duration">{{ formatDuration(session) }}</span>
            <span v-if="session.rating" class="session-rating">
              <Icon
                v-for="n in 5" :key="n"
                :name="n <= session.rating ? 'star-fill' : 'star'"
                :size="10"
                :style="{ color: n <= session.rating ? '#FFD60A' : 'var(--label-4)' }"
              />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- End session modal -->
    <div v-if="showEndModal" class="modal-overlay" @click.self="showEndModal = false">
      <div class="modal-card animate-scale-in">
        <h3 class="text-title-3 mb-1">End Session</h3>
        <p class="text-caption mb-4">How did it go? (optional)</p>

        <div class="rating-row mb-3">
          <button
            v-for="n in 5"
            :key="n"
            class="star-btn"
            :class="{ active: endRating >= n }"
            @click="endRating = endRating === n ? 0 : n"
          >
            <Icon :name="endRating >= n ? 'star-fill' : 'star'" :size="22" />
          </button>
        </div>

        <textarea
          v-model="endNote"
          class="input"
          placeholder="Any notes..."
          rows="2"
          style="resize:none;"
        />

        <div class="modal-actions mt-4">
          <button class="btn btn-ghost" @click="showEndModal = false">Cancel</button>
          <button class="btn btn-primary" @click="endSession">End & Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Icon from '../ui/Icon.vue';
import { format } from 'date-fns';
import {
  getActiveFocusSession,
  getRecentFocusSessions,
  startFocusSession,
  endActiveFocusSession,
} from '../../composables/useFocusSessions';
import { FocusSession, getSessionDuration } from '../../types/focus-session';
import { convertSummaryTimeToString } from '../../utils/converter';

const activeSession = ref<FocusSession | null>(null);
const recentSessions = ref<FocusSession[]>([]);
const elapsedSeconds = ref(0);
const sessionName = ref('');
const selectedDuration = ref(25);
const showEndModal = ref(false);
const endRating = ref(0);
const endNote = ref('');
let ticker: ReturnType<typeof setInterval>;

const durationOptions = [
  { label: '25m', value: 25 },
  { label: '45m', value: 45 },
  { label: '60m', value: 60 },
  { label: '90m', value: 90 },
  { label: '∞', value: 0 },
];

const isOverTarget = computed(() =>
  activeSession.value?.targetSeconds
    ? elapsedSeconds.value >= activeSession.value.targetSeconds
    : false,
);

const formattedElapsed = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600);
  const m = Math.floor((elapsedSeconds.value % 3600) / 60);
  const s = elapsedSeconds.value % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const formattedTarget = computed(() => {
  if (!activeSession.value?.targetSeconds) return '';
  return convertSummaryTimeToString(activeSession.value.targetSeconds).trim();
});

const targetLabel = computed(() => {
  if (!activeSession.value?.targetSeconds) return '';
  const remaining = activeSession.value.targetSeconds - elapsedSeconds.value;
  if (remaining <= 0) return '';
  return `${convertSummaryTimeToString(remaining).trim()} left`;
});

async function load() {
  activeSession.value = await getActiveFocusSession();
  recentSessions.value = await getRecentFocusSessions(14);
  if (activeSession.value) {
    elapsedSeconds.value = getSessionDuration(activeSession.value);
  }
}

async function startSession() {
  if (!sessionName.value.trim()) return;
  activeSession.value = await startFocusSession(
    sessionName.value.trim(),
    selectedDuration.value,
  );
  elapsedSeconds.value = 0;
  sessionName.value = '';
}

async function endSession() {
  await endActiveFocusSession(endRating.value || undefined, endNote.value || undefined);
  activeSession.value = null;
  elapsedSeconds.value = 0;
  showEndModal.value = false;
  endRating.value = 0;
  endNote.value = '';
  recentSessions.value = await getRecentFocusSessions(14);
}

function formatDuration(session: FocusSession): string {
  return convertSummaryTimeToString(getSessionDuration(session)).trim();
}

function formatSessionDate(iso: string): string {
  return format(new Date(iso), 'MMM d, h:mm a');
}

onMounted(async () => {
  await load();
  ticker = setInterval(() => {
    if (activeSession.value) elapsedSeconds.value++;
  }, 1000);
});

onUnmounted(() => clearInterval(ticker));
</script>

<style scoped>
.focus-view { padding-bottom: 12px; }

/* Active session card */
.active-session-card {
  margin: 12px;
  background: var(--bg-1);
  border-radius: var(--r-lg);
  padding: 20px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.active-pulse {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: var(--green);
  border-radius: 50%;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(1.3); }
}

.active-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.active-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.active-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--label-1);
}

.active-timer {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--label-1);
}

.progress-wrap { margin-bottom: 4px; }

.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

/* Start section */
.start-section {
  padding: 20px 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.start-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.form-group { margin-bottom: 16px; }

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--label-2);
  margin-bottom: 6px;
}

.duration-grid {
  display: flex;
  gap: 8px;
}

.duration-chip {
  flex: 1;
  padding: 8px 4px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--sep-opaque);
  background: transparent;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 600;
  color: var(--label-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.duration-chip.active,
.duration-chip:hover {
  border-color: var(--blue);
  background: var(--blue-tint);
  color: var(--blue);
}

/* Session list */
.empty-hint {
  font-size: 13px;
  color: var(--label-3);
  text-align: center;
  padding: 20px;
}

.session-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-bottom: 0.5px solid var(--sep);
}

.session-row:last-child { border-bottom: none; }

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--label-1);
}

.session-meta {
  font-size: 12px;
  color: var(--label-3);
}

.session-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.session-duration {
  font-size: 13px;
  font-weight: 600;
  color: var(--label-1);
}

.session-rating {
  display: flex;
  align-items: center;
  gap: 1px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding-bottom: 12px;
}

.modal-card {
  background: var(--bg-1);
  border-radius: var(--r-xl);
  padding: 24px;
  width: calc(100% - 24px);
  max-width: 360px;
  box-shadow: var(--shadow-lg);
}

.rating-row {
  display: flex;
  gap: 8px;
}

.star-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--label-4);
  padding: 4px;
  border-radius: var(--r-xs);
  transition: all 0.1s ease;
}

.star-btn.active { color: #FFD60A; }
.star-btn:hover  { transform: scale(1.15); }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.w-full { width: 100%; }
</style>
