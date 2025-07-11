import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import lt from '../components/lt.vue'

describe('Global Component Registration', () => {
  it('should be able to register lt component globally', () => {
    const app = createApp({
      template: '<div>Test</div>'
    })

    // Register lt component globally
    app.component('Lt', lt)

    // Verify component is registered
    expect(app._context.components.lt).toBeDefined()
  })

  it('should have lt component as a valid Vue component', () => {
    // Check if lt is a valid Vue component
    expect(lt).toBeDefined()
    expect(typeof lt).toBe('object')
  })

  it('should be able to create multiple apps with lt component', () => {
    const app1 = createApp({ template: '<div>App 1</div>' })
    const app2 = createApp({ template: '<div>App 2</div>' })

    app1.component('Lt', lt)
    app2.component('Lt', lt)

    expect(app1._context.components.lt).toBeDefined()
    expect(app2._context.components.lt).toBeDefined()
  })
})
