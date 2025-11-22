import { useEffect, useState } from 'react';
import type { RwaItem } from '../../../shared/types/rwa';

interface UseRwaItemsResult {
  items: RwaItem[];
  loading: boolean;
  error: Error | null;
}

export function useRwaItems(): UseRwaItemsResult {
  const [items, setItems] = useState<RwaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      try {
        const res = await fetch('/api/rwa/items');
        if (!res.ok) {
          throw new Error('Failed to load RWA items');
        }
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}
