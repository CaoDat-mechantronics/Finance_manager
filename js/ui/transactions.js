import { CATEGORIES } from "../constants.js";
import { getVisibleTransactions } from "../selectors.js";
import {
  escapeHtml,
  formatDate,
  formatMoney,
  refreshIcons,
} from "../utils.js";
import { els } from "./elements.js";

function transactionTemplate(item) {
  const category = CATEGORIES[item.category] || CATEGORIES.other;
  const isIncome = item.type === "income";
  const prefix = isIncome ? "+" : "-";

  return `
    <div class="transaction-row">
      <div class="transaction-main">
        <div
          class="transaction-icon"
          style="color:${category.color}; background:${category.color}16;"
        >
          <i data-lucide="${category.icon}"></i>
        </div>

        <div class="transaction-main-text">
          <strong>${escapeHtml(item.description)}</strong>
          <span>${formatDate(item.date)}</span>
        </div>
      </div>

      <div class="transaction-cell category-cell">
        ${category.label}
      </div>

      <div class="transaction-cell">
        ${isIncome ? "Khoản thu" : "Khoản chi"}
      </div>

      <div class="amount ${item.type}">
        ${prefix}${formatMoney(item.amount)}
      </div>

      <button
        class="row-menu-btn"
        type="button"
        title="Xóa giao dịch"
        data-delete-id="${item.id}"
      >
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  `;
}

export function renderTransactions(onDelete) {
  const data = getVisibleTransactions();

  els.transactionList.innerHTML =
    data.map(transactionTemplate).join("");

  els.emptyState.classList.toggle(
    "hidden",
    data.length > 0
  );

  document
    .querySelectorAll("[data-delete-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        onDelete(button.dataset.deleteId);
      });
    });

  refreshIcons();
}
