import { APP_CONFIG } from "../config.js";
import { getSummaryData } from "../selectors.js";
import { formatMoney } from "../utils.js";
import { els } from "./elements.js";

export function renderSummary() {
  const summary = getSummaryData(APP_CONFIG.monthlyBudget);

  els.balanceValue.textContent = formatMoney(summary.balance);
  els.incomeValue.textContent = formatMoney(summary.income);
  els.expenseValue.textContent = formatMoney(summary.expense);

  els.budgetRemainValue.textContent = formatMoney(
    summary.budgetRemain
  );

  els.budgetProgress.style.width =
    `${summary.budgetPercent}%`;

  els.budgetText.textContent =
    `${summary.budgetPercent}% ngân sách đã dùng`;
}
