import { useEffect } from "react";

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalTouchAction = body.style.touchAction;

    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    return () => {
      body.style.overflow = originalOverflow;
      body.style.touchAction = originalTouchAction;
    };
  }, [isLocked]);
}
