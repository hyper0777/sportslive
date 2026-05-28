import { useEffect, useState } from 'react';

interface UseSportsDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useSportsData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
): UseSportsDataState<T> {
  const [state, setState] = useState<UseSportsDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await fetchFn();
        if (mounted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if (mounted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    fetch();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return state;
}
