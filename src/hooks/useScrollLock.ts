import { useEffect, useRef } from "react";
import { pinBody, unpinBody } from "./bodyPin";

// React-hook wrapper around the synchronous bodyPin helpers.
// Keeps the same reference-counted lock so the nav drawer and chat panel
// do not step on each other.
export function useScrollLock(isLocked: boolean) {
  const lockedRef = useRef(false);

  useEffect(() => {
    if (isLocked) {
      if (!lockedRef.current) {
        lockedRef.current = true;
        pinBody();
      }
      return;
    }

    if (lockedRef.current) {
      lockedRef.current = false;
      unpinBody();
    }
  }, [isLocked]);

  useEffect(() => {
    return () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        unpinBody();
      }
    };
  }, []);
}
