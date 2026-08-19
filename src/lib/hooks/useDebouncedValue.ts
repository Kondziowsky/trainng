import { useEffect, useState } from 'react';

/**
 * Delays a rapidly-changing value. Used for search input so a query key (and
 * therefore a network request and a cache entry) is not created per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
