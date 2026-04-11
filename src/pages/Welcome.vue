<template>
  <div class="welcome-shell" :class="{ dark: isDark }">
    <!-- Step 1: Landing -->
    <div v-if="step === 0" class="welcome-screen animate-in">
      <div class="hero">
        <!-- Chronicle mark -->
        <div class="brand-mark">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="14" fill="#0A84FF"/>
            <rect x="14" y="14" width="12" height="28" rx="3" fill="white"/>
            <rect x="30" y="14" width="12" height="12" rx="3" fill="white" opacity="0.7"/>
            <rect x="30" y="30" width="12" height="12" rx="3" fill="white"/>
          </svg>
        </div>
        <h1 class="brand-name">Chronicle</h1>
        <p class="brand-tagline">Your attention is your most valuable asset.<br>Spend it intentionally.</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon-wrap feature-icon-wrap--blue">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="11" width="3.5" height="7" rx="1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <rect x="8.25" y="6.5" width="3.5" height="11.5" rx="1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <rect x="14" y="3" width="3.5" height="15" rx="1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="feature-title">Smart Tracking</p>
            <p class="feature-desc">Auto-categorizes every site into Work, Learning, Social, and more — no setup needed.</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap feature-icon-wrap--green">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.75"/>
              <circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.75"/>
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p class="feature-title">Goals & Limits</p>
            <p class="feature-desc">Set daily minimums and limits per category or site. Get notified when you hit them.</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap feature-icon-wrap--orange">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="11" r="7" stroke="currentColor" stroke-width="1.75"/>
              <line x1="10" y1="4" x2="10" y2="2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <line x1="8" y1="2" x2="12" y2="2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <polyline points="10,7.5 10,11 12.5,13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <p class="feature-title">Focus Sessions</p>
            <p class="feature-desc">Start timed work sprints, block distractions, and rate your sessions to build better habits.</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap feature-icon-wrap--purple">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polyline points="3,15 7.5,9 11.5,12 17,5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="13.5,5 17,5 17,8.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <p class="feature-title">Weekly Insights</p>
            <p class="feature-desc">See your best days, worst days, and patterns across weeks so you can improve over time.</p>
          </div>
        </div>
      </div>

      <div class="cta-area">
        <button class="btn-primary" @click="step = 1">Get started</button>
        <p class="cta-sub">Free · Private · No account required</p>
      </div>
    </div>

    <!-- Step 2: Pin tutorial -->
    <div v-if="step === 1" class="welcome-screen animate-in">
      <div class="tutorial-header">
        <button class="btn-back" @click="step = 0">← Back</button>
        <div class="step-indicator">
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
      </div>

      <div class="tutorial-content">
        <div class="tutorial-step-num">Step 1 of 2</div>
        <h2 class="tutorial-title">Pin Chronicle to your toolbar</h2>
        <p class="tutorial-desc">
          For quick access, pin the Chronicle icon so it's always one click away.
        </p>
        <div class="pin-steps">
          <div class="pin-step">
            <span class="pin-num">1</span>
            <p>Click the puzzle piece <img src="../assets/icons/extension.svg" height="18" style="vertical-align:middle;margin:0 4px;" /> icon in your Chrome toolbar</p>
          </div>
          <div class="pin-step">
            <span class="pin-num">2</span>
            <p>Find <strong>Chronicle</strong> in the list and click the pin icon <img src="../assets/icons/pin.svg" height="18" style="vertical-align:middle;margin:0 4px;" /></p>
          </div>
          <div class="pin-step">
            <span class="pin-num">3</span>
            <p>The Chronicle icon will appear in your toolbar — click it any time to see your stats</p>
          </div>
        </div>
        <div class="pin-hint">
          Click the <strong>puzzle piece icon</strong> in your Chrome toolbar to get started
        </div>
      </div>

      <div class="cta-area">
        <button class="btn-primary" @click="step = 2">Next →</button>
      </div>
    </div>

    <!-- Step 3: Done -->
    <div v-if="step === 2" class="welcome-screen animate-in">
      <div class="tutorial-header">
        <button class="btn-back" @click="step = 1">← Back</button>
        <div class="step-indicator">
          <span class="dot"></span>
          <span class="dot active"></span>
        </div>
      </div>

      <div class="tutorial-content centered">
        <div class="done-mark">✓</div>
        <h2 class="tutorial-title">You're all set</h2>
        <p class="tutorial-desc">
          Chronicle is now tracking your attention in the background — completely private, stored only on your device.
        </p>
        <div class="ready-cards">
          <div class="ready-card">
            <div class="ready-card-icon ready-card-icon--blue">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.75"/>
                <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" stroke-width="1.75"/>
                <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                <line x1="13" y1="2" x2="13" y2="6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              </svg>
            </div>
            <p>Browse normally today and check back — your data will be waiting.</p>
          </div>
          <div class="ready-card">
            <div class="ready-card-icon ready-card-icon--green">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <polyline points="3,15 7.5,9 11.5,12 17,5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="13.5,5 17,5 17,8.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p>Open the Dashboard from the popup anytime to dive deeper into your patterns.</p>
          </div>
        </div>
      </div>

      <div class="cta-area">
        <button class="btn-primary" @click="openDashboard">Open Dashboard</button>
        <button class="btn-secondary" @click="closeTab">Close this tab</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Browser from 'webextension-polyfill';

const step = ref(0);
const isDark = ref(false);

onMounted(async () => {
  const result = await Browser.storage.local.get('darkMode');
  isDark.value = !!result.darkMode;
});

async function closeTab() {
  const currentTab = await Browser.tabs.getCurrent();
  await Browser.tabs.remove(currentTab.id!);
}

async function openDashboard() {
  const url = Browser.runtime.getURL('src/dashboard.html');
  const tabs = await Browser.tabs.query({ currentWindow: true, active: true });
  Browser.tabs.update(tabs[0].id, { url });
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.welcome-shell {
  min-height: 100vh;
  background: #FAFAFA;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  color: #1C1C1E;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-shell.dark {
  background: #0C0C0E;
  color: #F2F2F7;
}

.welcome-screen {
  width: 100%;
  max-width: 560px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeUp 0.4s ease; }

/* Hero */
.hero { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }

.brand-mark { display: flex; }

.brand-name {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1C1C1E;
}
.welcome-shell.dark .brand-name { color: #F2F2F7; }

.brand-tagline {
  font-size: 17px;
  line-height: 1.5;
  color: #6E6E73;
  max-width: 360px;
}

/* Feature grid */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.welcome-shell.dark .feature-card { background: #1C1C1E; box-shadow: none; }

.feature-icon-wrap {
  width: 36px; height: 36px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.feature-icon-wrap--blue   { background: rgba(10,132,255,.12); color: #0A84FF; }
.feature-icon-wrap--green  { background: rgba(52,199,89,.12);  color: #34C759; }
.feature-icon-wrap--orange { background: rgba(255,159,10,.12); color: #FF9F0A; }
.feature-icon-wrap--purple { background: rgba(191,90,242,.12); color: #BF5AF2; }

.ready-card-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.ready-card-icon--blue  { background: rgba(10,132,255,.12); color: #0A84FF; }
.ready-card-icon--green { background: rgba(52,199,89,.12);  color: #34C759; }

.feature-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1C1C1E;
}
.welcome-shell.dark .feature-title { color: #F2F2F7; }

.feature-desc {
  font-size: 13px;
  line-height: 1.45;
  color: #6E6E73;
}

/* CTA */
.cta-area { display: flex; flex-direction: column; align-items: center; gap: 10px; }

.btn-primary {
  background: #0A84FF;
  color: #fff;
  border: none;
  border-radius: 12px;
  height: 50px;
  padding: 0 36px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.88; }

.btn-secondary {
  background: transparent;
  color: #0A84FF;
  border: none;
  border-radius: 12px;
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-secondary:hover { opacity: 0.7; }

.cta-sub { font-size: 13px; color: #8E8E93; }

/* Tutorial */
.tutorial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-back {
  background: none;
  border: none;
  color: #0A84FF;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.step-indicator { display: flex; gap: 6px; }
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #D1D1D6;
}
.dot.active { background: #0A84FF; }

.tutorial-content { display: flex; flex-direction: column; gap: 20px; }
.tutorial-content.centered { align-items: center; text-align: center; }

.tutorial-step-num { font-size: 13px; font-weight: 500; color: #0A84FF; }

.tutorial-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #1C1C1E;
}
.welcome-shell.dark .tutorial-title { color: #F2F2F7; }

.tutorial-desc { font-size: 16px; line-height: 1.5; color: #6E6E73; }

.pin-steps { display: flex; flex-direction: column; gap: 14px; }
.pin-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.pin-num {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: #0A84FF;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.pin-step p { font-size: 15px; line-height: 1.5; color: #3A3A3C; }
.welcome-shell.dark .pin-step p { color: #AEAEB2; }

.pin-hint {
  background: #F2F2F7;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.5;
  color: #3A3A3C;
}
.welcome-shell.dark .pin-hint { background: #2C2C2E; color: #AEAEB2; }

/* Done screen */
.done-mark {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #34C759;
  color: white;
  font-size: 28px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}

.ready-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  text-align: left;
}
.ready-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;
  color: #3A3A3C;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
}
.welcome-shell.dark .ready-card { background: #1C1C1E; color: #AEAEB2; box-shadow: none; }
.ready-card span { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
</style>
