// Synchronous body-pin/unpin so the layout shift happens BEFORE React
// paints, not after. Shares its lock counter with useScrollLock so the
// nav drawer and chat panel do not step on each other.

let lockCount = 0;
let savedScrollY: number | null = null;
export function getSavedScrollY(): number {
  return savedScrollY ?? 0;
}
let originalBodyStyle: Partial<Record<string, string>> = {};
let originalHtmlOverflow = "";
let originalHtmlOverscrollBehavior = "";
let pendingRafId: number | null = null;
let touchMoveListenerActive = false;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function handleTouchMove(e: TouchEvent) {
  const target = e.target as Element | null;
  if (target?.closest?.("[data-scroll-lock-scrollable]")) return;
  e.preventDefault();
}

export function pinBody() {
  if (!isBrowser()) return;

  if (pendingRafId !== null) {
    cancelAnimationFrame(pendingRafId);
    pendingRafId = null;
  }

  if (lockCount === 0) {
    const body = document.body;
    const html = document.documentElement;
    if (!body || !html) return;

    savedScrollY = Math.max(0, Math.round(window.scrollY || window.pageYOffset || 0));

    originalBodyStyle = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
    };
    originalHtmlOverflow = html.style.overflow;
    originalHtmlOverscrollBehavior = html.style.overscrollBehavior;

    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    if (!touchMoveListenerActive) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      touchMoveListenerActive = true;
    }
  }

  lockCount += 1;
}

export function unpinBody(scrollTo?: number | null) {
  if (!isBrowser()) return;

  if (pendingRafId !== null) {
    cancelAnimationFrame(pendingRafId);
    pendingRafId = null;
  }

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  if (Object.keys(originalBodyStyle).length === 0 && !touchMoveListenerActive) return;

  const body = document.body;
  const html = document.documentElement;
  if (!body || !html) return;

  const skipScroll = scrollTo === null;
  const rawTarget = scrollTo !== undefined ? scrollTo : savedScrollY ?? window.scrollY;
  const target = Number.isFinite(rawTarget) ? Math.max(0, Math.round(rawTarget)) : 0;

  body.style.position = originalBodyStyle.position ?? "";
  body.style.top = originalBodyStyle.top ?? "";
  body.style.left = originalBodyStyle.left ?? "";
  body.style.right = originalBodyStyle.right ?? "";
  body.style.width = originalBodyStyle.width ?? "";
  body.style.overflow = originalBodyStyle.overflow ?? "";
  body.style.overscrollBehavior = originalBodyStyle.overscrollBehavior ?? "";
  html.style.overflow = originalHtmlOverflow ?? "";
  html.style.overscrollBehavior = originalHtmlOverscrollBehavior ?? "";

  originalBodyStyle = {};
  originalHtmlOverflow = "";
  originalHtmlOverscrollBehavior = "";
  savedScrollY = null;

  if (touchMoveListenerActive) {
    document.removeEventListener("touchmove", handleTouchMove);
    touchMoveListenerActive = false;
  }

  if (!skipScroll) {
    pendingRafId = requestAnimationFrame(() => {
      pendingRafId = null;
      if (typeof window !== "undefined" && window.scrollY !== target) {
        window.scrollTo(0, target);
      }
    });
  }
}
