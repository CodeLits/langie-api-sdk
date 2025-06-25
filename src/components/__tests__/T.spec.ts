import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import T from '../T.vue'

// Mock the composable
vi.mock('../../useTranslator', () => ({
  useTranslator: vi.fn()
}))

describe('T component', () => {
  const mockT = vi.fn((key) => `translated_${key}`)

  beforeEach(async () => {
    vi.clearAllMocks()
    const { useTranslator } = await import('../../useTranslator')
    vi.mocked(useTranslator).mockReturnValue({
      t: mockT
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
})
