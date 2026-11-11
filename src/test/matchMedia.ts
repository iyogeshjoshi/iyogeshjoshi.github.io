export interface MatchMediaMock {
  /** Change the match state for a query and notify listeners. */
  set: (query: string, matches: boolean) => void;
  restore: () => void;
}

type Listener = (event: MediaQueryListEvent) => void;

/** Installs a controllable window.matchMedia. Unknown queries default to false. */
export const installMatchMedia = (initial: Record<string, boolean> = {}): MatchMediaMock => {
  const original = window.matchMedia;
  const state = new Map<string, boolean>(Object.entries(initial));
  const listeners = new Map<string, Set<Listener>>();

  window.matchMedia = ((query: string): MediaQueryList => {
    const set = listeners.get(query) ?? new Set<Listener>();
    listeners.set(query, set);
    return {
      get matches() {
        return state.get(query) ?? false;
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, l: Listener) => set.add(l),
      removeEventListener: (_: string, l: Listener) => set.delete(l),
      addListener: (l: Listener) => set.add(l),
      removeListener: (l: Listener) => set.delete(l),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;

  return {
    set: (query, matches) => {
      state.set(query, matches);
      listeners.get(query)?.forEach((l) => l({ matches, media: query } as MediaQueryListEvent));
    },
    restore: () => {
      window.matchMedia = original;
    },
  };
};
