import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'
import { describe, expect, test, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

describe('HomePage.vue', () => {
  beforeEach(() => {
    // Create and set active Pinia instance
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  test('renders pomodoro timer interface', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [createPinia()],
      },
    })
    expect(wrapper.text()).toMatch('Work Time')
  })
})
