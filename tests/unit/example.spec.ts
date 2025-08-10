import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'
import { describe, expect, test } from 'vitest'

describe('HomePage.vue', () => {
  test('renders pomodoro timer interface', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.text()).toMatch('Work Time')
  })
})
