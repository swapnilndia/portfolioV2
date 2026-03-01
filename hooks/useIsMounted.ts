import { useSyncExternalStore } from "react";

/**
 * Returns true on the client and false on the server.
 * Uses useSyncExternalStore for proper SSR hydration without
 * causing cascading renders from setState inside useEffect.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {}, // subscribe — no external store to subscribe to
    () => true, // getSnapshot — client always returns true
    () => false // getServerSnapshot — server always returns false
  );
}
