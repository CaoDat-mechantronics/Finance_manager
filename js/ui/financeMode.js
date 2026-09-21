import { els } from "./elements.js";
import { refreshIcons } from "../utils.js";

export function renderFinanceMode(mode) {
  els.financeModeButtons.forEach((button) => {
    const isActive = button.dataset.financeMode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  refreshIcons();
}

export function bindFinanceModeEvents(onModeChange) {
  els.financeModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      onModeChange(button.dataset.financeMode);
    });
  });
}
