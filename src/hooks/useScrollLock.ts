import { useEffect, useRef } from "react";
import { pinBody, unpinBody } from "./bodyPin";

// React-hook wrapper around the synchronous bodyPin helpers.
// Keeps the same reference-counted lock so the nav drawer and chat panel
// don't step on each other, but the actual body pinning is done
// synchronously in the onClick handlers to avoid a post-paint reflow.
export function useScrollLock(isLocked: boolean) {
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!isLocked) {
      if (lockedRef.current) {
        lockedRef.current = false;
        unpinBody();
      }
      return;
    }

    lockedRef.current = true;
    pinBody();

    return () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        unpinBody();
      }
    };
  }, [isLocked]);
}
