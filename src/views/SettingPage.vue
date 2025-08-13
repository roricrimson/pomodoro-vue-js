<script setup lang="ts">
import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonItemDivider,
  IonNote,
  IonToast,
  IonButtons,
} from "@ionic/vue";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { usePomodoro } from "@/composables/usePomodoro";
import { arrowBack, save, refresh } from "ionicons/icons";
import { useRouter } from "vue-router";

// Composables
const router = useRouter();
const pomodoro = usePomodoro();

// Local state for form inputs (in minutes for better UX)
const workDurationMinutes = ref(25);
const shortBreakMinutes = ref(5);
const longBreakMinutes = ref(15);

// Toast state
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Computed validation
const isValidInput = computed(() => {
  const work = workDurationMinutes.value;
  const shortBreak = shortBreakMinutes.value;
  const longBreak = longBreakMinutes.value;
  
  return (
    work >= 1 && work <= 120 &&
    shortBreak >= 1 && shortBreak <= 60 &&
    longBreak >= 1 && longBreak <= 120 &&
    shortBreak < work &&
    longBreak >= shortBreak
  );
});

const hasChanges = computed(() => {
  const currentWork = Math.round(pomodoro.timerDurations.value.work / (60 * 1000));
  const currentShortBreak = Math.round(pomodoro.timerDurations.value.shortBreak / (60 * 1000));
  const currentLongBreak = Math.round(pomodoro.timerDurations.value.longBreak / (60 * 1000));
  
  return (
    workDurationMinutes.value !== currentWork ||
    shortBreakMinutes.value !== currentShortBreak ||
    longBreakMinutes.value !== currentLongBreak
  );
});

// Load current values
function loadCurrentSettings() {
  workDurationMinutes.value = Math.round(pomodoro.timerDurations.value.work / (60 * 1000));
  shortBreakMinutes.value = Math.round(pomodoro.timerDurations.value.shortBreak / (60 * 1000));
  longBreakMinutes.value = Math.round(pomodoro.timerDurations.value.longBreak / (60 * 1000));
}

// Save settings
function saveSettings() {
  if (!isValidInput.value) {
    showToast('Please enter valid timer durations', 'danger');
    return;
  }
  
  try {
    pomodoro.timerDurations.value = {
      work: workDurationMinutes.value * 60 * 1000,
      shortBreak: shortBreakMinutes.value * 60 * 1000,
      longBreak: longBreakMinutes.value * 60 * 1000,
    };
    
    showToast('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Failed to save settings', 'danger');
  }
}

// Reset to defaults
function resetToDefaults() {
  workDurationMinutes.value = 25;
  shortBreakMinutes.value = 5;
  longBreakMinutes.value = 15;
  showToast('Settings reset to defaults', 'warning');
}

// Show toast message
function showToast(message: string, color: string = 'success') {
  toastMessage.value = message;
  toastColor.value = color;
  isToastOpen.value = true;
}

// Navigation
function goBack() {
  router.back();
}

// Handle input validation
function validateInput(event: any, min: number, max: number) {
  const value = parseInt(event.target.value);
  if (value < min) {
    event.target.value = min;
  } else if (value > max) {
    event.target.value = max;
  }
}

// Handle keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  // Save settings with Ctrl/Cmd + S
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (isValidInput.value && hasChanges.value) {
      saveSettings();
    }
  }
  // Reset with Ctrl/Cmd + R  
  else if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
    event.preventDefault();
    resetToDefaults();
  }
  // Go back with Escape
  else if (event.key === 'Escape') {
    goBack();
  }
}

onMounted(() => {
  loadCurrentSettings();
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown);
});

// Watch for changes in pomodoro timer durations and update form values
// This ensures the form reflects the saved values when they're loaded from storage
watch(() => pomodoro.timerDurations.value, (newDurations) => {
  // Only update if the form values are different from the stored values
  const storedWork = Math.round(newDurations.work / (60 * 1000));
  const storedShortBreak = Math.round(newDurations.shortBreak / (60 * 1000));
  const storedLongBreak = Math.round(newDurations.longBreak / (60 * 1000));
  
  if (workDurationMinutes.value !== storedWork ||
      shortBreakMinutes.value !== storedShortBreak ||
      longBreakMinutes.value !== storedLongBreak) {
    loadCurrentSettings();
  }
}, { deep: true, immediate: true });

onUnmounted(() => {
  // Remove keyboard event listener
  document.removeEventListener('keydown', handleKeydown);
});
</script>
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar class="settings-toolbar">
        <ion-buttons slot="start">
          <ion-button 
            @click="goBack" 
            fill="clear"
            aria-label="Go back to previous page"
          >
            <ion-icon :icon="arrowBack" />
          </ion-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
        <ion-buttons slot="end">
          <ion-button 
            @click="saveSettings" 
            :disabled="!isValidInput || !hasChanges"
            fill="clear"
            :class="{ 'save-enabled': isValidInput && hasChanges }"
            :aria-label="hasChanges ? 'Save settings changes' : 'No changes to save'"
          >
            <ion-icon :icon="save" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="settings-content">
      <div class="settings-container">
        <ion-list class="settings-list">
          <ion-item-divider>
            <ion-label>Timer Durations</ion-label>
          </ion-item-divider>
          
          <ion-item class="duration-item">
            <ion-label position="stacked">
              <h2>Work Session</h2>
              <p>Focus time duration</p>
            </ion-label>
            <div class="input-container">
              <ion-input
                v-model.number="workDurationMinutes"
                type="number"
                min="1"
                max="120"
                placeholder="25"
                @ionBlur="validateInput($event, 1, 120)"
                :class="{ 'input-error': workDurationMinutes < 1 || workDurationMinutes > 120 }"
                aria-label="Work session duration in minutes"
                aria-describedby="work-duration-help"
              />
              <span class="input-suffix" id="work-duration-help">min</span>
            </div>
          </ion-item>

          <ion-item class="duration-item">
            <ion-label position="stacked">
              <h2>Short Break</h2>
              <p>Regular break duration</p>
            </ion-label>
            <div class="input-container">
              <ion-input
                v-model.number="shortBreakMinutes"
                type="number"
                min="1"
                max="60"
                placeholder="5"
                @ionBlur="validateInput($event, 1, 60)"
                :class="{ 'input-error': shortBreakMinutes < 1 || shortBreakMinutes > 60 || shortBreakMinutes >= workDurationMinutes }"
                aria-label="Short break duration in minutes"
                aria-describedby="short-break-help"
              />
              <span class="input-suffix" id="short-break-help">min</span>
            </div>
          </ion-item>

          <ion-item class="duration-item">
            <ion-label position="stacked">
              <h2>Long Break</h2>
              <p>Extended break after 4 work sessions</p>
            </ion-label>
            <div class="input-container">
              <ion-input
                v-model.number="longBreakMinutes"
                type="number"
                min="1"
                max="120"
                placeholder="15"
                @ionBlur="validateInput($event, 1, 120)"
                :class="{ 'input-error': longBreakMinutes < 1 || longBreakMinutes > 120 || longBreakMinutes < shortBreakMinutes }"
                aria-label="Long break duration in minutes"
                aria-describedby="long-break-help"
              />
              <span class="input-suffix" id="long-break-help">min</span>
            </div>
          </ion-item>

          <!-- Validation messages -->
          <ion-item v-if="!isValidInput" lines="none" class="validation-item">
            <ion-label color="danger">
              <ion-note color="danger" role="alert" aria-live="polite">
                <ul class="validation-list">
                  <li v-if="workDurationMinutes < 1 || workDurationMinutes > 120">Work session: 1-120 minutes</li>
                  <li v-if="shortBreakMinutes < 1 || shortBreakMinutes > 60">Short break: 1-60 minutes</li>
                  <li v-if="longBreakMinutes < 1 || longBreakMinutes > 120">Long break: 1-120 minutes</li>
                  <li v-if="shortBreakMinutes >= workDurationMinutes">Short break must be less than work time</li>
                  <li v-if="longBreakMinutes < shortBreakMinutes">Long break must be at least as long as short break</li>
                </ul>
              </ion-note>
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- Action buttons -->
        <div class="action-buttons">
          <ion-button 
            @click="resetToDefaults" 
            fill="outline" 
            color="medium"
            class="reset-button"
            aria-label="Reset all timer durations to default values"
          >
            <ion-icon slot="start" :icon="refresh" />
            Reset to Defaults
          </ion-button>
        </div>
      </div>
    </ion-content>

    <!-- Toast for feedback -->
    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :duration="3000"
      :color="toastColor"
      @didDismiss="isToastOpen = false"
      position="bottom"
    />
  </ion-page>
</template>

<style scoped>
.settings-content {
  --background: #fcfef3;
}

.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-toolbar {
  --background: rgba(252, 254, 243, 0.95);
  backdrop-filter: blur(10px);
}

.settings-list {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.duration-item {
  padding: 16px 20px;
  --min-height: 80px;
}

.duration-item ion-label h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.duration-item ion-label p {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.input-container ion-input {
  --background: #f8f9fa;
  --border-radius: 8px;
  --padding: 12px 16px;
  --color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
  max-width: 100px;
  text-align: center;
}

.input-container ion-input.input-error {
  --background: #fff5f5;
  --color: #e74c3c;
  border: 2px solid #e74c3c;
}

.input-suffix {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.validation-item {
  --background: #fff5f5;
  --color: #e74c3c;
  padding: 12px 20px;
  --min-height: auto;
}

.validation-list {
  margin: 0;
  padding-left: 16px;
  font-size: 0.85rem;
}

.validation-list li {
  margin-bottom: 4px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.reset-button {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
}

.save-enabled {
  --color: #27ae60 !important;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .settings-content {
    --background: #1a1a1a;
  }
  
  .settings-toolbar {
    --background: rgba(26, 26, 26, 0.95);
  }
  
  .settings-list {
    background: rgba(44, 44, 46, 0.9);
  }
  
  .duration-item ion-label h2 {
    color: #ffffff;
  }
  
  .duration-item ion-label p {
    color: #a1a1a6;
  }
  
  .input-container ion-input {
    --background: #2c2c2e;
    --color: #ffffff;
  }
  
  .input-suffix {
    color: #a1a1a6;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .reset-button {
    width: 100%;
  }
}
</style>
