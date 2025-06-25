import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import T from '../T.vue'
import { useTranslator } from '../../useTranslator'

// Mock the composable
vi.mock('../../useTranslator', () => ({
  useTranslator: vi.fn()
}))

describe('T component', () => {
  const mockT = vi.fn((key) => `translated_${key}`)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTranslator).mockReturnValue({
      t: mockT
      // Mock other properties if they are used in T.vue
    } as any)
  })

  it('renders translation from msg prop', () => {
    const { getByText } = render(T, {
      props: {
        msg: 'hello'
      }
    })
    expect(getByText('translated_hello')).toBeTruthy()
    expect(mockT).toHaveBeenCalledWith('hello', undefined, undefined)
  })

  it('renders translation from slot', () => {
    const { getByText } = render(T, {
      slots: {
        default: 'world'
      }
    })
    expect(getByText('translated_world')).toBeTruthy()
    expect(mockT).toHaveBeenCalledWith('world', undefined, undefined)
  })

  it('passes context and original language to t function', () => {
    render(T, {
      props: {
        msg: 'greeting',
        ctx: 'salutation',
        orig: 'en'
      }
    })
    expect(mockT).toHaveBeenCalledWith('greeting', 'salutation', 'en')
  })

  it('renders raw key on server-side', () => {
    // Mock SSR environment
    Object.defineProperty(import.meta, 'server', { value: true, configurable: true })

    const { getByText } = render(T, {
      props: {
        msg: 'ssr_key'
      }
    })

    expect(getByText('ssr_key')).toBeTruthy()
    expect(mockT).not.toHaveBeenCalled()

    // Cleanup
    Object.defineProperty(import.meta, 'server', { value: false, configurable: true })
  })
})
