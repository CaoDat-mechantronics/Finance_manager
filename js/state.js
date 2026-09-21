const state = {
  transactions: [],
  selectedMonth: "",
  typeFilter: "all",
  searchText: "",
  financeMode: "personal",
  debtTotal: 0,
};

export function getState() {
  return state;
}

export function setTransactions(transactions) {
  state.transactions = [...transactions];
}

export function addTransaction(transaction) {
  state.transactions.push(transaction);
}

export function removeTransaction(id) {
  state.transactions = state.transactions.filter((item) => item.id !== id);
}

export function setSelectedMonth(month) {
  state.selectedMonth = month;
}

export function setTypeFilter(type) {
  state.typeFilter = type;
}

export function setSearchText(text) {
  state.searchText = text;
}

export function setFinanceMode(mode) {
  state.financeMode = mode === "group" ? "group" : "personal";
}

export function setDebtTotal(value) {
  const numberValue = Number(value);
  state.debtTotal = Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : 0;
}
