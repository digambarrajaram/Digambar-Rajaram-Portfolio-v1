// Shared scroll-to-section helper. Accounts for the fixed navbar height
// and any active banner offset so the target section isn't hidden behind
// the header.

export function scrollToElement(id: string, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const element = document.getElementById(id);
  if (!element) return;

  const nav = document.getElementById("navbar");
  const navHeight = nav?.offsetHeight ?? 0;
  const bannerOffsetRaw = getComputedStyle(document.documentElement)
    .getPropertyValue("--banner-offset");
  const bannerOffset = Number.parseInt(bannerOffsetRaw || "0", 10);
  const safeBannerOffset = Number.isFinite(bannerOffset) ? Math.max(0, bannerOffset) : 0;

  const rawTarget = element.getBoundingClientRect().top + window.scrollY - navHeight - safeBannerOffset;
  const targetY = Number.isFinite(rawTarget) ? Math.max(0, Math.round(rawTarget)) : 0;

  window.scrollTo({ top: targetY, behavior });
}
