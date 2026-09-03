import { useState, useEffect } from 'react';

/**
 * Hook untuk melakukan debounce terhadap suatu nilai
 * @param value Nilai yang ingin didebounce
 * @param delay Waktu tunda dalam milidetik (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
