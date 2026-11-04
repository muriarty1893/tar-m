import { useEffect, useState } from 'react';

/** `value`, once it has stopped changing for `ms` (search as you type, without a request per letter). */
export function useDebounced<T>(value: T, ms = 400) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
}
