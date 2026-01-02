import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });

  it('should handle Tailwind class conflicts', () => {
    const result = cn('px-2', 'px-4');
    // tailwind-merge should keep only px-4
    expect(result).toBe('px-4');
  });

  it('should handle empty strings', () => {
    const result = cn('foo', '', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle arrays', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('should handle objects', () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe('foo baz');
  });

  it('should handle mixed inputs', () => {
    const result = cn('foo', ['bar', 'baz'], { qux: true, quux: false });
    expect(result).toBe('foo bar baz qux');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should merge conflicting Tailwind utilities', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    // Should keep only the last one
    expect(result).toBe('bg-blue-500');
  });
});

