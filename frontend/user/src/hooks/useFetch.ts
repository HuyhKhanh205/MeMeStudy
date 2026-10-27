import { useCallback, useEffect, useState } from 'react';

export function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      fetcher()
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
        })
        .finally(() => setLoading(false)),
    [fetcher],
  );

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  return { data, loading, error, reload };
}
