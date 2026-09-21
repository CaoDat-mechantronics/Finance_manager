import {
  addTransaction,
  getState,
  removeTransaction,
  setDebtTotal,
  setFinanceMode,
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
import { getFinanceContext } from "./services/financeContextService.js";

import { currentMonthValue } from "./utils.js";
import { els } from "./ui/elements.js";
import { closeTransactionModal } from "./ui/modal.js";
import { renderFinanceMode, bindFinanceModeEvents } from "./ui/financeMode.js";
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

async function loadFinanceModeData(mode) {
  const [transactions, context] = await Promise.all([
    getTransactions(mode),
    getFinanceContext(mode),
  ]);

  setTransactions(transactions);
  setDebtTotal(context?.debtTotal);
}

export async function initializeApp() {
  els.monthFilter.value = currentMonthValue();
  els.dateInput.value = new Date().toISOString().slice(0, 10);

  setSelectedMonth(els.monthFilter.value);
  setFinanceMode("personal");
  renderFinanceMode("personal");

  await loadFinanceModeData("personal");

  bindAppEvents();
  bindFinanceModeEvents(handleFinanceModeChange);
  renderAll();
}

function bindAppEvents() {
  els.transactionForm.addEventListener("submit", handleCreateTransaction);

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

  els.chartRange.addEventListener("change", renderCashFlowChart);
}

async function handleFinanceModeChange(mode) {
  if (mode === getState().financeMode) return;

  try {
    setFinanceMode(mode);
    renderFinanceMode(mode);
    await loadFinanceModeData(mode);
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể chuyển chế độ quản lý tài chính.");
  }
}

async function handleCreateTransaction(event) {
  event.preventDefault();

  const type = document.querySelector('input[name="type"]:checked').value;
  const { financeMode, transactions } = getState();

  const transaction = {
    id: crypto.randomUUID(),
    type,
    amount: Number(els.amountInput.value),
    category: els.categoryInput.value,
    description: els.descriptionInput.value.trim(),
    date: els.dateInput.value,
  };

  try {
    await createTransaction(transaction, transactions, financeMode);
    addTransaction(transaction);

    const transactionMonth = transaction.date.slice(0, 7);
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
  const ok = window.confirm("Bạn có chắc muốn xóa giao dịch này không?");
  if (!ok) return;

  try {
    const { financeMode, transactions } = getState();
    await deleteTransaction(id, transactions, financeMode);

    removeTransaction(id);
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể xóa giao dịch.");
  }
}
