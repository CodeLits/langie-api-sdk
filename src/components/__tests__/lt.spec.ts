import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import lt from '../lt.vue'

// Mock the composable
vi.mock('../../useTranslator', () => ({
  useTranslator: vi.fn()
}))

describe('lt component', () => {
  const mockL = vi.fn((key) => `translated_${key}`)

  beforeEach(async () => {
    vi.clearAllMocks()
    const { useTranslator } = await import('../../useTranslator')
    vi.mocked(useTranslator).mockReturnValue({
      l: mockL
    } as any)
  })

  it('renders translation from msg prop', () => {
    const { getByText } = render(lt, {
      props: {
        msg: 'hello'
      }
    })
    expect(getByText('translated_hello')).toBeTruthy()
    expect(mockL).toHaveBeenCalledWith('hello', undefined, undefined)
  })

  it('passes context and original language to l function', () => {
    render(lt, {
      props: {
        msg: 'greeting',
        ctx: 'salutation',
        orig: 'en'
      }
    })
    expect(mockL).toHaveBeenCalledWith('greeting', 'salutation', 'en')
  })
})
