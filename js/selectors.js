import { CATEGORIES } from "./constants.js";
import { getState } from "./state.js";

export function getSelectedMonthTransactions() {
  const state = getState();

  return state.transactions.filter((transaction) =>
    transaction.date.startsWith(state.selectedMonth)
  );
}

export function getVisibleTransactions() {
  const state = getState();
  let data = getSelectedMonthTransactions();

  if (state.typeFilter !== "all") {
    data = data.filter((item) => item.type === state.typeFilter);
  }

  const keyword = state.searchText.trim().toLowerCase();

  if (keyword) {
    data = data.filter((item) => {
      const categoryLabel =
        CATEGORIES[item.category]?.label?.toLowerCase() || "";

      return (
        item.description.toLowerCase().includes(keyword) ||
        categoryLabel.includes(keyword)
      );
    });
  }

  return data.sort(
    (a, b) =>
      new Date(`${b.date}T00:00:00`) -
      new Date(`${a.date}T00:00:00`)
  );
}

export function getSummaryData(monthlyBudget) {
  const transactions = getSelectedMonthTransactions();

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expense;
  const budgetRemain = Math.max(monthlyBudget - expense, 0);
  const budgetPercent = Math.min(
    Math.round((expense / monthlyBudget) * 100),
    100
  );

  return {
    income,
    expense,
    balance,
    budgetRemain,
    budgetPercent,
  };
}

export function getCategoryExpenseData() {
  const expenses = getSelectedMonthTransactions().filter(
    (item) => item.type === "expense"
  );

  const totals = {};

  expenses.forEach((item) => {
    totals[item.category] =
      (totals[item.category] || 0) + Number(item.amount);
  });

  return Object.entries(totals)
    .map(([key, value]) => ({
      key,
      value,
      ...CATEGORIES[key],
    }))
    .sort((a, b) => b.value - a.value);
}
