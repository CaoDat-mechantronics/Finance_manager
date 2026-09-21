import { els } from "./elements.js";

function getScrollAmount() {
  const firstTab = els.groupTabs?.querySelector(".group-tab");
  if (!firstTab) return 180;

  const styles = getComputedStyle(els.groupTabs);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "6");
  return firstTab.getBoundingClientRect().width + gap;
}

export function updateGroupTabScrollerControls() {
  if (!els.groupTabs || !els.groupTabsPrevBtn || !els.groupTabsNextBtn) {
    return;
  }

  const maxScroll = Math.max(
    els.groupTabs.scrollWidth - els.groupTabs.clientWidth,
    0
  );

  const hasOverflow = maxScroll > 4;

  els.groupTabsPrevBtn.classList.toggle("hidden", !hasOverflow);
  els.groupTabsNextBtn.classList.toggle("hidden", !hasOverflow);

  if (!hasOverflow) return;

  els.groupTabsPrevBtn.disabled = els.groupTabs.scrollLeft <= 4;
  els.groupTabsNextBtn.disabled = els.groupTabs.scrollLeft >= maxScroll - 4;
}

export function bindGroupTabScrollerEvents() {
  if (!els.groupTabs) return;

  els.groupTabsPrevBtn?.addEventListener("click", () => {
    els.groupTabs.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    });
  });

  els.groupTabsNextBtn?.addEventListener("click", () => {
    els.groupTabs.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    });
  });

  els.groupTabs.addEventListener(
    "scroll",
    updateGroupTabScrollerControls,
    { passive: true }
  );

  window.addEventListener("resize", updateGroupTabScrollerControls);

  updateGroupTabScrollerControls();
}
