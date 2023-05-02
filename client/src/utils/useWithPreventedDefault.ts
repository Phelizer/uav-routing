import { useCallback } from "react";

interface WithPreventDefault {
  preventDefault: { (): void };
}

export function useWithPreventedDefault(cb: { (): void }) {
  const wrappedCallback = useCallback(
    (event: WithPreventDefault) => {
      event.preventDefault();
      cb();
    },
    [cb]
  );

  return wrappedCallback;
}
