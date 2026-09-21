import { APP_CONFIG } from "../config.js";
import { getSummaryData } from "../selectors.js";
import { getState } from "../state.js";
import { formatMoney } from "../utils.js";
import { els } from "./elements.js";
import { updateSummaryScrollerControls } from "./summaryScroller.js";

export function renderSummary() {
  const summary = getSummaryData(APP_CONFIG.monthlyBudget);
  const { debtTotal } = getState();

  els.balanceValue.textContent = formatMoney(summary.balance);
  els.incomeValue.textContent = formatMoney(summary.income);
  els.expenseValue.textContent = formatMoney(summary.expense);
  els.budgetRemainValue.textContent = formatMoney(summary.budgetRemain);

  els.budgetProgress.style.width = `${summary.budgetPercent}%`;
  els.budgetText.textContent = `${summary.budgetPercent}% ngân sách đã dùng`;

  const hasDebt = Number(debtTotal) > 0;
  els.debtSummaryCard.classList.toggle("hidden", !hasDebt);

  if (hasDebt) {
    els.debtValue.textContent = formatMoney(debtTotal);
  }

  requestAnimationFrame(updateSummaryScrollerControls);
}
