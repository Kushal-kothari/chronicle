<template>
  <div class="goals-view animate-fade-in">

    <!-- Today's goal progress -->
    <div v-if="goalProgressList.length > 0" class="goals-section px-3 pt-3">
      <p class="section-header">Today's Goals</p>
      <div class="goals-list list-group">
        <div
          v-for="gp in goalProgressList"
          :key="gp.goal.id"
          class="goal-row"
        >
          <ProgressRing
            :size="44"
            :stroke-width="4"
            :progress="gp.ratio"
            :color="ringColor(gp)"
          />
          <div class="goal-info">
            <span class="goal-name">{{ goalLabel(gp.goal) }}</span>
            <span class="goal-sub">
              {{ formattedSeconds(gp.currentSeconds) }}
              {{ gp.goal.type === 'limit_daily' ? 'of' : 'of' }}
              {{ formattedSeconds(gp.goal.targetSeconds) }} target
            </span>
          </div>
          <span class="goal-status" :class="gp.met ? 'met' : 'unmet'">
            {{ gp.met ? '✓' : '···' }}
          </span>
        </div>
      </div>
    </div>

    <!-- No goals prompt -->
    <div v-if="goalProgressList.length === 0 && !showAddForm" class="empty-goals px-3 pt-4">
      <div class="empty-goals-card card p-5 text-center">
        <div class="empty-icon-wrap mb-3"><Icon name="target" :size="36" style="color:var(--label-4);" /></div>
        <p class="text-headline mb-2">Set your intentions</p>
        <p class="text-caption mb-4">
          Goals help you hold yourself accountable to how you want to spend your attention.
        </p>
        <button class="btn btn-primary btn-sm" @click="showAddForm = true">
          Add your first goal
        </button>
      </div>
    </div>

    <!-- Add goal form -->
    <div v-if="showAddForm" class="add-form px-3 pt-3">
      <p class="section-header">New Goal</p>
      <div class="card p-4 flex-col gap-3 flex">

        <div>
          <label class="form-label">Goal type</label>
          <div class="type-toggle">
            <button
              class="type-btn"
              :class="{ active: newGoal.type === 'limit_daily' }"
              @click="newGoal.type = 'limit_daily'"
            >Spend less than</button>
            <button
              class="type-btn"
              :class="{ active: newGoal.type === 'minimum_daily' }"
              @click="newGoal.type = 'minimum_daily'"
            >Spend at least</button>
          </div>
        </div>

        <div>
          <label class="form-label">Category</label>
          <select v-model="newGoal.category" class="select w-full">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="form-label">Daily target</label>
          <div class="flex gap-2">
            <input
              v-model.number="newGoal.hours"
              class="input"
              type="number"
              min="0"
              max="23"
              style="width:70px;"
              placeholder="0"
            />
            <span class="flex items-center text-secondary" style="font-size:14px;">h</span>
            <input
              v-model.number="newGoal.minutes"
              class="input"
              type="number"
              min="0"
              max="59"
              style="width:70px;"
              placeholder="30"
            />
            <span class="flex items-center text-secondary" style="font-size:14px;">min</span>
          </div>
        </div>

        <div>
          <label class="form-label">Active on</label>
          <div class="flex gap-2">
            <button
              v-for="p in periods"
              :key="p.value"
              class="period-chip"
              :class="{ active: newGoal.period === p.value }"
              @click="newGoal.period = p.value"
            >{{ p.label }}</button>
          </div>
        </div>

        <div class="flex gap-2 mt-1">
          <button class="btn btn-ghost flex-1" @click="showAddForm = false">Cancel</button>
          <button
            class="btn btn-primary flex-1"
            :disabled="!isFormValid"
            @click="saveGoal"
          >Save Goal</button>
        </div>
      </div>
    </div>

    <!-- Add button (if goals exist) -->
    <div v-if="goalProgressList.length > 0 && !showAddForm" class="px-3 pt-3">
      <button class="btn btn-secondary w-full btn-sm" @click="showAddForm = true">
        + Add another goal
      </button>
    </div>

    <!-- Manage goals link -->
    <div v-if="goalProgressList.length > 0" class="px-3 pt-3 pb-2">
      <button class="btn btn-ghost w-full btn-sm" @click="openDashboardGoals">
        Manage all goals →
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import ProgressRing from '../ui/ProgressRing.vue';
import Icon from '../ui/Icon.vue';
import { getGoals, addGoal, getGoalProgress } from '../../composables/useGoals';
import { Category, CATEGORY_META } from '../../types/category';
import { GoalType, GoalPeriod, GoalProgress } from '../../types/goal';
import { convertSummaryTimeToString } from '../../utils/converter';
import { injectStorage } from '../../storage/inject-storage';
import { StorageDeserializeParam } from '../../storage/storage-params';
import { Tab } from '../../types/tab';
import Browser from 'webextension-polyfill';
import { openPage } from '../../utils/open-page';
import { SettingsTab } from '../../utils/enums';

const goalProgressList = ref<GoalProgress[]>([]);
const showAddForm = ref(false);

const newGoal = reactive({
  type: 'limit_daily' as GoalType,
  category: Category.Social,
  hours: 0,
  minutes: 30,
  period: 'everyday' as GoalPeriod,
});

const categories = Object.values(Category).map(c => ({
  value: c,
  label: CATEGORY_META[c].label,
}));

const periods = [
  { value: GoalPeriod.Everyday, label: 'Every day' },
  { value: GoalPeriod.Weekdays, label: 'Weekdays' },
  { value: GoalPeriod.Weekends, label: 'Weekends' },
];

const isFormValid = computed(() =>
  newGoal.hours > 0 || newGoal.minutes > 0,
);

function ringColor(gp: GoalProgress): string {
  if (gp.goal.type === GoalType.LimitDaily) {
    return gp.met ? 'var(--blue)' : 'var(--red)';
  }
  return gp.met ? 'var(--green)' : 'var(--orange)';
}

function goalLabel(goal: any): string {
  const cat = goal.category ? CATEGORY_META[goal.category as Category].label : goal.domain;
  const verb = goal.type === GoalType.LimitDaily ? 'Max' : 'Min';
  return `${verb} ${cat}`;
}

function formattedSeconds(s: number): string {
  return convertSummaryTimeToString(s).trim() || '0m';
}

async function loadGoals() {
  const storage = injectStorage();
  const tabs = (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  goalProgressList.value = await getGoalProgress(tabs);
}

async function saveGoal() {
  const targetSeconds = newGoal.hours * 3600 + newGoal.minutes * 60;
  if (targetSeconds === 0) return;

  await addGoal({
    type: newGoal.type,
    category: newGoal.category,
    period: newGoal.period,
    targetSeconds,
    enabled: true,
  });

  showAddForm.value = false;
  await loadGoals();
}

function openDashboardGoals() {
  openPage(SettingsTab.Dashboard);
}

onMounted(loadGoals);
</script>

<style scoped>
.goals-view { padding-bottom: 12px; }

.goals-list { overflow: hidden; }

.empty-icon-wrap { display: flex; justify-content: center; }

.goal-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--sep);
}

.goal-row:last-child { border-bottom: none; }

.goal-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.goal-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--label-1);
}

.goal-sub {
  font-size: 12px;
  color: var(--label-2);
}

.goal-status {
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.goal-status.met   { color: var(--green); }
.goal-status.unmet { color: var(--label-3); }

/* Add form */
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--label-2);
  margin-bottom: 6px;
}

.type-toggle { display: flex; gap: 6px; }

.type-btn {
  flex: 1;
  padding: 8px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--sep-opaque);
  background: transparent;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  color: var(--label-2);
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: center;
}

.type-btn.active {
  border-color: var(--blue);
  background: var(--blue-tint);
  color: var(--blue);
}

.period-chip {
  flex: 1;
  padding: 7px 4px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--sep-opaque);
  background: transparent;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  color: var(--label-2);
  cursor: pointer;
  transition: all 0.12s ease;
}

.period-chip.active {
  border-color: var(--blue);
  background: var(--blue-tint);
  color: var(--blue);
}

.w-full  { width: 100%; }
.flex-1  { flex: 1; }
</style>
