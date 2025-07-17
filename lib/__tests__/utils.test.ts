import { cn } from '../utils'

describe('cn utility', () => {
  test('merges class names correctly', () => {
    expect(cn('text-black', 'bg-white')).toBe('text-black bg-white')
  })

  test('handles conditional classes', () => {
    expect(cn('text-black', false && 'bg-white', 'p-4')).toBe('text-black p-4')
  })

  test('handles undefined/null values', () => {
    expect(cn('text-black', undefined, null, 'p-4')).toBe('text-black p-4')
  })

  test('handles empty input', () => {
    expect(cn()).toBe('')
  })

  test('handles array input', () => {
    expect(cn(['text-black', 'bg-white'])).toBe('text-black bg-white')
  })

  test('handles object input', () => {
    expect(cn({
      'text-black': true,
      'bg-white': false,
      'p-4': true
    })).toBe('text-black p-4')
  })

  test('handles tailwind merge conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})