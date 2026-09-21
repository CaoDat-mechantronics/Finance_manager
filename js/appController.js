import {
  addTransaction,
  getState,
  removeTransaction,
  setSearchText,
  setSelectedMonth,
  setTransactions,
  setTypeFilter,
} from "./state.js";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from "./services/transactionService.js";

import { currentMonthValue } from "./utils.js";
import { els } from "./ui/elements.js";
import { closeTransactionModal } from "./ui/modal.js";
import { renderSummary } from "./ui/summary.js";
import { renderTransactions } from "./ui/transactions.js";
import {
  renderCashFlowChart,
  renderCategoryChart,
} from "./ui/charts.js";

function renderMonthDependentViews() {
  renderSummary();
  renderTransactions(handleDeleteTransaction);
  renderCategoryChart();
}

function renderAll() {
  renderMonthDependentViews();
  renderCashFlowChart();
}

export async function initializeApp() {
  els.monthFilter.value = currentMonthValue();
  els.dateInput.value = new Date().toISOString().slice(0, 10);

  setSelectedMonth(els.monthFilter.value);

  const transactions = await getTransactions();
  setTransactions(transactions);

  bindAppEvents();
  renderAll();
}

function bindAppEvents() {
  els.transactionForm.addEventListener(
    "submit",
    handleCreateTransaction
  );

  els.searchInput.addEventListener("input", () => {
    setSearchText(els.searchInput.value);
    renderTransactions(handleDeleteTransaction);
  });

  els.typeFilter.addEventListener("change", () => {
    setTypeFilter(els.typeFilter.value);
    renderTransactions(handleDeleteTransaction);
  });

  els.monthFilter.addEventListener("change", () => {
    setSelectedMonth(els.monthFilter.value);
    renderMonthDependentViews();
  });

  els.chartRange.addEventListener(
    "change",
    renderCashFlowChart
  );
}

async function handleCreateTransaction(event) {
  event.preventDefault();

  const type = document.querySelector(
    'input[name="type"]:checked'
  ).value;

  const transaction = {
    id: crypto.randomUUID(),
    type,
    amount: Number(els.amountInput.value),
    category: els.categoryInput.value,
    description: els.descriptionInput.value.trim(),
    date: els.dateInput.value,
  };

  try {
    await createTransaction(
      transaction,
      getState().transactions
    );

    addTransaction(transaction);

    const transactionMonth =
      transaction.date.slice(0, 7);

    els.monthFilter.value = transactionMonth;
    setSelectedMonth(transactionMonth);

    closeTransactionModal();
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể lưu giao dịch.");
  }
}

async function handleDeleteTransaction(id) {
  const ok = window.confirm(
    "Bạn có chắc muốn xóa giao dịch này không?"
  );

  if (!ok) {
    return;
  }

  try {
    await deleteTransaction(
      id,
      getState().transactions
    );

    removeTransaction(id);
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể xóa giao dịch.");
  }
}
