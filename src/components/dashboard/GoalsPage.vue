<template>
  <div class="animate-fade-in">
    <div class="page-header flex justify-between items-center">
      <div>
        <h1 class="page-title">Goals</h1>
        <p class="page-subtitle">Your daily intentions</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="showForm = true">+ New Goal</button>
    </div>

    <!-- Today's progress -->
    <div v-if="activeGoals.length > 0" class="mb-6">
      <p class="section-header mb-3">Today's Progress</p>
      <div class="goals-grid">
        <div v-for="gp in activeGoals" :key="gp.goal.id" class="goal-card card p-4">
          <div class="goal-card-header">
            <div class="goal-icon-wrap" :style="{ background: categoryTint(gp.goal) }">
              <CategoryIcon
                :category="gp.goal.category || 'other'"
                :size="20"
                :color="categoryColor(gp.goal)"
              />
            </div>
            <div class="goal-card-title">
              <p class="text-headline">{{ goalLabel(gp.goal) }}</p>
              <p class="text-caption">{{ periodLabel(gp.goal.period) }}</p>
            </div>
            <div class="goal-badge" :class="gp.met ? 'badge-met' : 'badge-active'">
              <Icon v-if="gp.met" name="check-circle" :size="12" style="margin-right:3px;" />
              {{ gp.met ? 'Met' : 'Active' }}
            </div>
          </div>

          <div class="goal-progress mt-3">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: `${Math.min(gp.ratio * 100, 100)}%`, background: progressColor(gp) }"
              />
            </div>
            <div class="goal-progress-labels mt-1 flex justify-between">
              <span class="text-caption">{{ formatSec(gp.currentSeconds) }}</span>
              <span class="text-caption">{{ typeLabel(gp.goal.type) }} {{ formatSec(gp.goal.targetSeconds) }}</span>
            </div>
            <!-- Psychological hook: near completion nudge -->
            <p v-if="nearCompletionMsg(gp)" class="near-completion-msg">{{ nearCompletionMsg(gp) }}</p>
          </div>

          <button class="goal-delete" @click="deleteGoalById(gp.goal.id)" title="Delete goal">
            <Icon name="close" :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!showForm" class="card p-8 text-center mb-6">
      <div class="empty-icon-wrap mb-4">
        <Icon name="target" :size="40" style="color:var(--label-4);" />
      </div>
      <p class="text-title-3 mb-2">No goals yet</p>
      <p class="text-caption mb-5">
        Set daily intentions for how you want to spend your attention.
        Chronicle will track your progress automatically.
      </p>
      <button class="btn btn-primary" @click="showForm = true">Create your first goal</button>
    </div>

    <!-- Paused goals -->
    <div v-if="inactiveGoals.length > 0" class="mb-6">
      <p class="section-header mb-3">Paused Goals</p>
      <div class="list-group">
        <div v-for="goal in inactiveGoals" :key="goal.id" class="list-row">
          <CategoryIcon :category="goal.category || 'other'" :size="16" class="mr-3" />
          <span class="flex-1 text-callout">{{ goalLabel(goal) }}</span>
          <button class="btn btn-ghost btn-sm" @click="toggleGoal(goal.id, true)">Enable</button>
          <button class="btn btn-danger btn-sm ml-2" @click="deleteGoalById(goal.id)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add goal modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card animate-scale-in">
        <h3 class="text-title-3 mb-4">New Goal</h3>

        <div class="form-group">
          <label class="form-label">I want to</label>
          <div class="type-toggle">
            <button
              class="type-btn"
              :class="{ active: form.type === 'limit_daily' }"
              @click="form.type = 'limit_daily'"
            >
              <Icon name="trending-down" :size="14" class="mr-1" />
              Spend less than
            </button>
            <button
              class="type-btn"
              :class="{ active: form.type === 'minimum_daily' }"
              @click="form.type = 'minimum_daily'"
            >
              <Icon name="trending-up" :size="14" class="mr-1" />
              Spend at least
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <div class="cat-select-grid">
            <button
              v-for="cat in categoryOptions"
              :key="cat.value"
              class="cat-select-btn"
              :class="{ active: form.category === cat.value }"
              :style="form.category === cat.value ? { borderColor: cat.color, background: cat.tint } : {}"
              @click="form.category = cat.value"
            >
              <CategoryIcon :category="cat.value" :size="18" :color="cat.color" />
              <span class="cat-btn-label">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Daily target</label>
          <div class="time-input-row">
            <input v-model.number="form.hours" class="input time-input" type="number" min="0" max="23" placeholder="0" />
            <span class="time-sep">h</span>
            <input v-model.number="form.minutes" class="input time-input" type="number" min="0" max="59" placeholder="30" />
            <span class="time-sep">min</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Active on</label>
          <div class="flex gap-2">
            <button
              v-for="p in periodOptions"
              :key="p.value"
              class="period-chip"
              :class="{ active: form.period === p.value }"
              @click="form.period = p.value"
            >{{ p.label }}</button>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button class="btn btn-ghost flex-1" @click="showForm = false">Cancel</button>
          <button class="btn btn-primary flex-1" :disabled="!isFormValid" @click="submitGoal">
            Save Goal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import CategoryIcon from '../ui/CategoryIcon.vue';
import Icon from '../ui/Icon.vue';
import {
  getGoals, addGoal, deleteGoal, updateGoal, getGoalProgress, isGoalActiveToday,
} from '../../composables/useGoals';
import { Goal, GoalType, GoalPeriod, GoalProgress } from '../../types/goal';
import { Category, CATEGORY_META } from '../../types/category';
import { convertSummaryTimeToString } from '../../utils/converter';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam } from '../../storage/storage-params';
import { Tab } from '../../types/tab';

const storage = injectStorage();
const showForm = ref(false);
const allGoals = ref<Goal[]>([]);
const goalProgressList = ref<GoalProgress[]>([]);

const form = reactive({
  type: 'limit_daily' as GoalType,
  category: Category.Social,
  hours: 0,
  minutes: 30,
  period: GoalPeriod.Everyday,
});

const categoryOptions = Object.values(Category).map(c => ({
  value: c,
  label: CATEGORY_META[c].label,
  color: CATEGORY_META[c].color,
  tint: CATEGORY_META[c].tint,
}));

const periodOptions = [
  { value: GoalPeriod.Everyday, label: 'Every day' },
  { value: GoalPeriod.Weekdays, label: 'Weekdays' },
  { value: GoalPeriod.Weekends, label: 'Weekends' },
];

const isFormValid = computed(() => form.hours > 0 || form.minutes > 0);
const activeGoals = computed(() =>
  goalProgressList.value.filter(gp => gp.goal.enabled && isGoalActiveToday(gp.goal)),
);
const inactiveGoals = computed(() => allGoals.value.filter(g => !g.enabled));

function categoryColor(goal: Goal): string {
  return goal.category ? CATEGORY_META[goal.category].color : 'var(--label-3)';
}
function categoryTint(goal: Goal): string {
  return goal.category ? CATEGORY_META[goal.category].tint : 'var(--fill-2)';
}
function goalLabel(goal: Goal): string {
  const cat = goal.category ? CATEGORY_META[goal.category].label : goal.domain ?? 'Custom';
  return `${goal.type === GoalType.LimitDaily ? 'Max' : 'Min'} ${cat}`;
}
function typeLabel(type: GoalType): string {
  return type === GoalType.LimitDaily ? 'limit:' : 'target:';
}
function periodLabel(period: GoalPeriod): string {
  return period === GoalPeriod.Everyday ? 'Every day'
    : period === GoalPeriod.Weekdays ? 'Weekdays only'
    : 'Weekends only';
}
function progressColor(gp: GoalProgress): string {
  if (gp.goal.type === GoalType.LimitDaily) {
    return gp.ratio > 0.85 ? 'var(--red)' : 'var(--blue)';
  }
  return gp.met ? 'var(--green)' : 'var(--orange)';
}
function formatSec(s: number): string {
  return convertSummaryTimeToString(s).trim() || '0m';
}

// Psychological hook: near-completion nudge
function nearCompletionMsg(gp: GoalProgress): string | null {
  if (gp.met) return null;
  const remaining = gp.goal.targetSeconds - gp.currentSeconds;
  if (remaining <= 0) return null;
  if (gp.goal.type === GoalType.LimitDaily) {
    if (gp.ratio > 0.8 && gp.ratio < 1) {
      return `${formatSec(remaining)} until limit`;
    }
  } else {
    if (gp.ratio > 0.7 && gp.ratio < 1) {
      return `Just ${formatSec(remaining)} more to hit your goal`;
    }
  }
  return null;
}

async function load() {
  allGoals.value = await getGoals();
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  goalProgressList.value = await getGoalProgress(tabs);
}
async function submitGoal() {
  const targetSeconds = form.hours * 3600 + form.minutes * 60;
  if (!targetSeconds) return;
  await addGoal({ type: form.type, category: form.category, period: form.period, targetSeconds, enabled: true });
  showForm.value = false;
  await load();
}
async function deleteGoalById(id: string) {
  await deleteGoal(id);
  await load();
}
async function toggleGoal(id: string, enabled: boolean) {
  await updateGoal(id, { enabled });
  await load();
}

onMounted(load);
</script>

<style scoped>
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.goal-card { position: relative; }

.goal-card-header { display: flex; align-items: flex-start; gap: 12px; }

.goal-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.goal-card-title { flex: 1; }

.goal-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.badge-met    { background: rgba(48,209,88,.12); color: var(--green); }
.badge-active { background: var(--blue-tint); color: var(--blue); }

.near-completion-msg {
  font-size: 11px;
  font-weight: 600;
  color: #FF9F0A;
  margin-top: 4px;
}

.goal-delete {
  position: absolute; top: 12px; right: 12px;
  background: transparent; border: none;
  color: var(--label-4); cursor: pointer;
  padding: 4px; border-radius: 4px;
  display: flex; align-items: center;
  transition: all 0.12s ease;
}
.goal-delete:hover { color: var(--red); background: rgba(255,69,58,.08); }

.empty-icon-wrap { display: flex; justify-content: center; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 20px;
}
.modal-card {
  background: var(--bg-1);
  border-radius: var(--r-xl);
  padding: 28px;
  width: 100%; max-width: 440px;
  box-shadow: var(--shadow-lg);
}

.form-group { margin-bottom: 20px; }
.form-label {
  display: block; font-size: 12px; font-weight: 600;
  color: var(--label-2); margin-bottom: 8px;
  text-transform: uppercase; letter-spacing: 0.04em;
}

.type-toggle { display: flex; gap: 8px; }
.type-btn {
  flex: 1; padding: 10px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--sep-opaque);
  background: transparent;
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--label-2); cursor: pointer;
  transition: all 0.12s ease;
  display: flex; align-items: center; justify-content: center;
}
.type-btn.active { border-color: var(--blue); background: var(--blue-tint); color: var(--blue); font-weight: 600; }

.cat-select-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.cat-select-btn {
  display: flex; flex-direction: column;
  align-items: center; gap: 5px;
  padding: 10px 4px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--sep-opaque);
  background: transparent;
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.12s ease;
}
.cat-btn-label { font-size: 11px; font-weight: 500; color: var(--label-2); }
.cat-select-btn.active .cat-btn-label { color: var(--label-1); font-weight: 600; }

.time-input-row { display: flex; align-items: center; gap: 8px; }
.time-input { width: 72px; text-align: center; }
.time-sep { font-size: 14px; font-weight: 500; color: var(--label-2); }

.period-chip {
  flex: 1; padding: 8px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--sep-opaque);
  background: transparent;
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--label-2); cursor: pointer;
  transition: all 0.12s ease;
}
.period-chip.active { border-color: var(--blue); background: var(--blue-tint); color: var(--blue); font-weight: 600; }
</style>
