import { useEffect, useRef } from "react";

// Module-level reference counter so multiple concurrent lock users
// (e.g. nav menu + chat panel both open) don't prematurely unlock the
// body when only one of them closes.
let lockCount = 0;
let savedScrollY = 0;
let originalBodyStyle: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  overscrollBehavior: string;
} | null = null;
let originalHtmlOverflow: string | null = null;

function handleTouchMove(e: TouchEvent) {
  const target = e.target as HTMLElement | null;
  // Allow scrolling inside elements explicitly marked as scrollable
  // so the mobile nav panel and chat message list still work.
  if (target?.closest("[data-scroll-lock-scrollable]")) return;
  e.preventDefault();
}

function lockBody() {
  const body = document.body;
  savedScrollY = window.scrollY;

  // Save original inline styles before overwriting so we can restore
  // them exactly on unlock.
  originalBodyStyle = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
    overscrollBehavior: body.style.overscrollBehavior,
  };
  originalHtmlOverflow = document.documentElement.style.overflow;

  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  document.documentElement.style.overflow = "hidden";

  document.addEventListener("touchmove", handleTouchMove, { passive: false });
}

function unlockBody() {
  const body = document.body;

  if (originalBodyStyle) {
    body.style.position = originalBodyStyle.position;
    body.style.top = originalBodyStyle.top;
    body.style.left = originalBodyStyle.left;
    body.style.right = originalBodyStyle.right;
    body.style.width = originalBodyStyle.width;
    body.style.overflow = originalBodyStyle.overflow;
    body.style.overscrollBehavior = originalBodyStyle.overscrollBehavior;
    originalBodyStyle = null;
  }
  if (originalHtmlOverflow !== null) {
    document.documentElement.style.overflow = originalHtmlOverflow;
    originalHtmlOverflow = null;
  }

  document.removeEventListener("touchmove", handleTouchMove);

  window.scrollTo(0, savedScrollY);
}

export function useScrollLock(isLocked: boolean) {
  // Track whether this specific hook instance currently holds a lock so
  // we know whether to decrement the counter on cleanup / unlock.
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!isLocked) {
      // Release this instance's lock if it held one (covers the transition
      // from locked → unlocked without double-releasing).
      if (lockedRef.current) {
        lockedRef.current = false;
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0) unlockBody();
      }
      return;
    }

    // Acquire lock — only pin the body when we're the first locker.
    lockedRef.current = true;
    if (lockCount === 0) {
      lockBody();
    }
    lockCount++;

    return () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0) unlockBody();
      }
    };
  }, [isLocked]);
}
