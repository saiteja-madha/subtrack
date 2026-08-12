import { useCallback, useRef, useState } from "react";

/**
 * Keeps a RefreshControl's visual state owned by the screen that the user pulled.
 * A shared refreshing flag causes iOS to start controls belonging to hidden tabs.
 */
export function usePullToRefresh(refresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refresh]);

  return { isRefreshing, onRefresh };
}
