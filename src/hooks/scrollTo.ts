// Shared scroll-to-section helper. Accounts for the fixed navbar height
// and any active chaos-mode banner so the target section isn't hidden
// behind the header. Use this everywhere instead of raw scrollIntoView.

export function scrollToElement(id: string, behavior: ScrollBehavior = "smooth") {
  const element = document.getElementById(id);
  if (!element) return;

  const nav = document.getElementById("navbar");
  const navHeight = nav?.offsetHeight || 0;
  const bannerOffset = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--banner-offset") || "0",
    10
  );

  const targetY = Math.max(
    0,
    element.getBoundingClientRect().top + window.scrollY - navHeight - bannerOffset
  );

  window.scrollTo({ top: targetY, behavior });
}
