import { els } from "./elements.js";

let dragging = false;
let dragStartX = 0;
let dragStartScrollLeft = 0;

function getScrollAmount() {
  const firstCard = els.summaryScroller?.querySelector(".summary-card:not(.hidden)");
  if (!firstCard) return 280;

  const gap = Number.parseFloat(
    getComputedStyle(els.summaryScroller).columnGap ||
    getComputedStyle(els.summaryScroller).gap ||
    "16"
  );

  return firstCard.getBoundingClientRect().width + gap;
}

export function updateSummaryScrollerControls() {
  if (!els.summaryScroller) return;

  const maxScroll = Math.max(
    els.summaryScroller.scrollWidth - els.summaryScroller.clientWidth,
    0
  );
  const hasOverflow = maxScroll > 4;

  els.summaryPrevBtn?.classList.toggle("hidden", !hasOverflow);
  els.summaryNextBtn?.classList.toggle("hidden", !hasOverflow);

  if (!hasOverflow) return;

  els.summaryPrevBtn.disabled = els.summaryScroller.scrollLeft <= 4;
  els.summaryNextBtn.disabled = els.summaryScroller.scrollLeft >= maxScroll - 4;
}

export function bindSummaryScrollerEvents() {
  if (!els.summaryScroller) return;

  els.summaryPrevBtn?.addEventListener("click", () => {
    els.summaryScroller.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    });
  });

  els.summaryNextBtn?.addEventListener("click", () => {
    els.summaryScroller.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    });
  });

  els.summaryScroller.addEventListener("scroll", updateSummaryScrollerControls, {
    passive: true,
  });

  window.addEventListener("resize", updateSummaryScrollerControls);

  // Hỗ trợ kéo ngang bằng chuột trên desktop. Touch vẫn dùng native scrolling.
  els.summaryScroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;

    dragging = true;
    dragStartX = event.clientX;
    dragStartScrollLeft = els.summaryScroller.scrollLeft;
    els.summaryScroller.classList.add("dragging");
    els.summaryScroller.setPointerCapture?.(event.pointerId);
  });

  els.summaryScroller.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const delta = event.clientX - dragStartX;
    els.summaryScroller.scrollLeft = dragStartScrollLeft - delta;
  });

  const endDrag = () => {
    dragging = false;
    els.summaryScroller.classList.remove("dragging");
  };

  els.summaryScroller.addEventListener("pointerup", endDrag);
  els.summaryScroller.addEventListener("pointercancel", endDrag);
  els.summaryScroller.addEventListener("pointerleave", endDrag);

  updateSummaryScrollerControls();
}
