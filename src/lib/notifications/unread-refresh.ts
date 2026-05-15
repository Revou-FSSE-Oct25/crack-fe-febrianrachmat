type Listener = () => void;

const listeners = new Set<Listener>();

export function requestUnreadRefresh(): void {
  listeners.forEach((listener) => listener());
}

export function onUnreadRefreshRequested(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
