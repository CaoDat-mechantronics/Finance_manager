import { APP_CONFIG } from "../config.js";
import { createSeedTransactions } from "../demoData.js";

export function loadTransactionsFromStorage() {
  const saved = localStorage.getItem(APP_CONFIG.storageKey);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("Không đọc được localStorage:", error);
    }
  }

  const seed = createSeedTransactions();
  saveTransactionsToStorage(seed);
  return seed;
}

export function saveTransactionsToStorage(transactions) {
  localStorage.setItem(
    APP_CONFIG.storageKey,
    JSON.stringify(transactions)
  );
}
