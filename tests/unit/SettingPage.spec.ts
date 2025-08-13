import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { IonicVue } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import SettingPage from '@/views/SettingPage.vue';
import { DEFAULT_TIMER_DURATIONS } from '@/constants/pomodoro';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/settings', component: SettingPage },
  ],
});

describe('SettingPage', () => {
  let wrapper: VueWrapper;

  beforeEach(async () => {
    // Reset mocks
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue();
    vi.mocked(Preferences.remove).mockResolvedValue();

    // Create wrapper
    wrapper = mount(SettingPage, {
      global: {
        plugins: [IonicVue, mockRouter],
      },
    });

    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render with default timer values', async () => {
      await wrapper.vm.$nextTick();
      
      const workInput = wrapper.find('ion-input[aria-label="Work session duration in minutes"]');
      const shortBreakInput = wrapper.find('ion-input[aria-label="Short break duration in minutes"]');
      const longBreakInput = wrapper.find('ion-input[aria-label="Long break duration in minutes"]');
      
      expect(workInput.exists()).toBe(true);
      expect(shortBreakInput.exists()).toBe(true);
      expect(longBreakInput.exists()).toBe(true);
    });

    it('should load current pomodoro settings', async () => {
      // Mock saved settings
      const savedState = {
        workSessionsCompleted: 0,
        isBreak: false,
        isWork: true,
        isLongBreak: false,
        timerDurations: {
          work: 30 * 60 * 1000, // 30 minutes
          shortBreak: 10 * 60 * 1000, // 10 minutes
          longBreak: 20 * 60 * 1000, // 20 minutes
        },
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(savedState),
      });

      // Re-mount with saved settings
      wrapper.unmount();
      wrapper = mount(SettingPage, {
        global: {
          plugins: [IonicVue, mockRouter],
        },
      });

      await wrapper.vm.$nextTick();
      await vi.runAllTimersAsync();

      // Check that the component loaded custom values
      expect(wrapper.vm.workDurationMinutes).toBe(30);
      expect(wrapper.vm.shortBreakMinutes).toBe(10);
      expect(wrapper.vm.longBreakMinutes).toBe(20);
    });

    it('should have save button disabled initially', () => {
      const saveButton = wrapper.find('ion-button[aria-label*="Save"]');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate work duration range', async () => {
      await wrapper.setData({ workDurationMinutes: 0 });
      expect(wrapper.vm.isValidInput).toBe(false);

      await wrapper.setData({ workDurationMinutes: 121 });
      expect(wrapper.vm.isValidInput).toBe(false);

      await wrapper.setData({ workDurationMinutes: 25 });
      expect(wrapper.vm.isValidInput).toBe(true);
    });

    it('should validate short break duration range', async () => {
      await wrapper.setData({ shortBreakMinutes: 0 });
      expect(wrapper.vm.isValidInput).toBe(false);

      await wrapper.setData({ shortBreakMinutes: 61 });
      expect(wrapper.vm.isValidInput).toBe(false);

      await wrapper.setData({ shortBreakMinutes: 5 });
      expect(wrapper.vm.isValidInput).toBe(true);
    });

    it('should validate long break duration range', async () => {
      await wrapper.setData({ longBreakMinutes: 0 });
      expect(wrapper.vm.isValidInput).toBe(false);

      await wrapper.setData({ longBreakMinutes: 121 });
      expect(wrapper.vm.isValidInput).toBe(false);

      await wrapper.setData({ longBreakMinutes: 15 });
      expect(wrapper.vm.isValidInput).toBe(true);
    });

    it('should validate break duration relationships', async () => {
      // Short break should be less than work time
      await wrapper.setData({ 
        workDurationMinutes: 10,
        shortBreakMinutes: 15,
        longBreakMinutes: 20
      });
      expect(wrapper.vm.isValidInput).toBe(false);

      // Long break should be at least as long as short break
      await wrapper.setData({ 
        workDurationMinutes: 25,
        shortBreakMinutes: 10,
        longBreakMinutes: 5
      });
      expect(wrapper.vm.isValidInput).toBe(false);

      // Valid configuration
      await wrapper.setData({ 
        workDurationMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15
      });
      expect(wrapper.vm.isValidInput).toBe(true);
    });

    it('should show validation messages for invalid input', async () => {
      await wrapper.setData({ workDurationMinutes: 0 });
      
      const validationItem = wrapper.find('.validation-item');
      expect(validationItem.exists()).toBe(true);
      
      const validationNote = validationItem.find('ion-note[role="alert"]');
      expect(validationNote.exists()).toBe(true);
    });
  });

  describe('Change Detection', () => {
    it('should detect changes from defaults', async () => {
      expect(wrapper.vm.hasChanges).toBe(false);

      await wrapper.setData({ workDurationMinutes: 30 });
      expect(wrapper.vm.hasChanges).toBe(true);
    });

    it('should enable save button when there are valid changes', async () => {
      await wrapper.setData({ workDurationMinutes: 30 });
      
      const saveButton = wrapper.find('ion-button[aria-label*="Save"]');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Save Functionality', () => {
    it('should save settings successfully', async () => {
      await wrapper.setData({ 
        workDurationMinutes: 30,
        shortBreakMinutes: 10,
        longBreakMinutes: 20
      });

      await wrapper.vm.saveSettings();

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'PomodoroState',
        value: expect.stringContaining('"work":1800000'), // 30 minutes in ms
      });
    });

    it('should show success toast after saving', async () => {
      await wrapper.setData({ workDurationMinutes: 30 });
      
      await wrapper.vm.saveSettings();
      
      expect(wrapper.vm.isToastOpen).toBe(true);
      expect(wrapper.vm.toastMessage).toBe('Settings saved successfully!');
      expect(wrapper.vm.toastColor).toBe('success');
    });

    it('should not save invalid settings', async () => {
      await wrapper.setData({ workDurationMinutes: 0 });
      
      await wrapper.vm.saveSettings();
      
      expect(Preferences.set).not.toHaveBeenCalled();
      expect(wrapper.vm.toastMessage).toBe('Please enter valid timer durations');
      expect(wrapper.vm.toastColor).toBe('danger');
    });

    it('should handle save errors gracefully', async () => {
      vi.mocked(Preferences.set).mockRejectedValue(new Error('Storage error'));
      
      await wrapper.setData({ workDurationMinutes: 30 });
      await wrapper.vm.saveSettings();
      
      expect(wrapper.vm.toastMessage).toBe('Failed to save settings');
      expect(wrapper.vm.toastColor).toBe('danger');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default values', async () => {
      await wrapper.setData({ 
        workDurationMinutes: 30,
        shortBreakMinutes: 10,
        longBreakMinutes: 20
      });

      await wrapper.vm.resetToDefaults();

      expect(wrapper.vm.workDurationMinutes).toBe(25);
      expect(wrapper.vm.shortBreakMinutes).toBe(5);
      expect(wrapper.vm.longBreakMinutes).toBe(15);
    });

    it('should show reset toast message', async () => {
      await wrapper.vm.resetToDefaults();
      
      expect(wrapper.vm.toastMessage).toBe('Settings reset to defaults');
      expect(wrapper.vm.toastColor).toBe('warning');
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      const routerSpy = vi.spyOn(mockRouter, 'back');
      
      const backButton = wrapper.find('ion-button[aria-label="Go back to previous page"]');
      await backButton.trigger('click');
      
      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const workInput = wrapper.find('ion-input[aria-label="Work session duration in minutes"]');
      const shortBreakInput = wrapper.find('ion-input[aria-label="Short break duration in minutes"]');
      const longBreakInput = wrapper.find('ion-input[aria-label="Long break duration in minutes"]');
      
      expect(workInput.exists()).toBe(true);
      expect(shortBreakInput.exists()).toBe(true);
      expect(longBreakInput.exists()).toBe(true);
    });

    it('should have validation messages with proper ARIA attributes', async () => {
      await wrapper.setData({ workDurationMinutes: 0 });
      
      const validationNote = wrapper.find('ion-note[role="alert"][aria-live="polite"]');
      expect(validationNote.exists()).toBe(true);
    });

    it('should have descriptive button labels', () => {
      const backButton = wrapper.find('ion-button[aria-label="Go back to previous page"]');
      const resetButton = wrapper.find('ion-button[aria-label="Reset all timer durations to default values"]');
      
      expect(backButton.exists()).toBe(true);
      expect(resetButton.exists()).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Escape key for navigation', async () => {
      const routerSpy = vi.spyOn(mockRouter, 'back');
      
      await wrapper.trigger('keydown', { key: 'Escape' });
      
      expect(routerSpy).toHaveBeenCalled();
    });

    it('should handle Ctrl+S for saving', async () => {
      await wrapper.setData({ workDurationMinutes: 30 });
      
      const saveSettingsSpy = vi.spyOn(wrapper.vm, 'saveSettings');
      
      await wrapper.trigger('keydown', { key: 's', ctrlKey: true });
      
      expect(saveSettingsSpy).toHaveBeenCalled();
    });

    it('should handle Ctrl+R for reset', async () => {
      const resetSpy = vi.spyOn(wrapper.vm, 'resetToDefaults');
      
      await wrapper.trigger('keydown', { key: 'r', ctrlKey: true });
      
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should not save invalid settings with keyboard shortcut', async () => {
      await wrapper.setData({ workDurationMinutes: 0 });
      
      const saveSettingsSpy = vi.spyOn(wrapper.vm, 'saveSettings');
      
      await wrapper.trigger('keydown', { key: 's', ctrlKey: true });
      
      // saveSettings called but won't actually save due to validation
      expect(saveSettingsSpy).toHaveBeenCalled();
      expect(Preferences.set).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation Events', () => {
    it('should validate input on blur', async () => {
      const workInput = wrapper.find('ion-input[aria-label="Work session duration in minutes"]');
      
      // Simulate blur event with invalid value
      await workInput.trigger('ionBlur', {
        target: { value: '150' }
      });
      
      // Value should be clamped to maximum
      expect(workInput.element.getAttribute('value')).toBe('120');
    });

    it('should validate input range on blur', async () => {
      const shortBreakInput = wrapper.find('ion-input[aria-label="Short break duration in minutes"]');
      
      // Simulate blur event with value below minimum
      await shortBreakInput.trigger('ionBlur', {
        target: { value: '0' }
      });
      
      // Value should be clamped to minimum
      expect(shortBreakInput.element.getAttribute('value')).toBe('1');
    });
  });
});
