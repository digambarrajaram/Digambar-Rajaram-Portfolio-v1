// Synchronous body-pin/unpin so the layout shift happens BEFORE React
// paints, not after (which would cause a 1–2s post-paint reflow on mobile).
// Shares its lock counter with useScrollLock so the two mechanisms coexist.

let lockCount = 0;
let savedScrollY = 0;
export function getSavedScrollY(): number {
  return savedScrollY;
}
let originalBodyStyle: Record<string, string> = {};
let originalHtmlOverflow = "";
let activeTouchMoveListeners = 0;

function handleTouchMove(e: TouchEvent) {
  const target = e.target as HTMLElement | null;
  if (target?.closest("[data-scroll-lock-scrollable]")) return;
  e.preventDefault();
}

export function pinBody() {
  if (lockCount === 0) {
    const body = document.body;
    savedScrollY = window.scrollY;
    console.log("[bodyPin] pinBody — savedScrollY =", savedScrollY);

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
    activeTouchMoveListeners++;
    console.log("[bodyPin] touchmove listener ADDED — active count:", activeTouchMoveListeners);
  }
  lockCount++;
}

export function unpinBody(scrollTo?: number | null) {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  // Guard against double-unpin (e.g. closeDrawer racing with
  // handleNavClick) — if we already restored, originalBodyStyle
  // is empty and this is a no-op.
  if (Object.keys(originalBodyStyle).length === 0) return;

  const body = document.body;

  body.style.position = originalBodyStyle.position || "";
  body.style.top = originalBodyStyle.top || "";
  body.style.left = originalBodyStyle.left || "";
  body.style.right = originalBodyStyle.right || "";
  body.style.width = originalBodyStyle.width || "";
  body.style.overflow = originalBodyStyle.overflow || "";
  body.style.overscrollBehavior = originalBodyStyle.overscrollBehavior || "";
  document.documentElement.style.overflow = originalHtmlOverflow || "";

  // null means "skip scroll entirely" — caller will handle it.
  // undefined means "restore to savedScrollY".
  const skipScroll = scrollTo === null;
  const target: number = scrollTo != null ? scrollTo : savedScrollY;

  console.log(
    "[bodyPin] unpinBody — savedScrollY =", savedScrollY,
    "| scrollTo arg =", scrollTo,
    "| skipScroll =", skipScroll,
    "| target =", skipScroll ? "SKIPPED" : target,
  );

  // Clear saved state so a second unpin call is a true no-op.
  originalBodyStyle = {};
  originalHtmlOverflow = "";
  savedScrollY = 0;

  document.removeEventListener("touchmove", handleTouchMove);
  activeTouchMoveListeners = Math.max(0, activeTouchMoveListeners - 1);
  console.log("[bodyPin] touchmove listener REMOVED — active count:", activeTouchMoveListeners);

  if (!skipScroll) {
    // Batch the scroll into the next render frame so the body style
    // restoration (above) and the scroll happen in the same paint.
    // Avoids a visible flash of the wrong scroll position on mobile.
    requestAnimationFrame(() => {
      console.log("[bodyPin] unpinBody rAF — window.scrollTo(0,", target, ")");
      window.scrollTo(0, target);
    });
  }
}
