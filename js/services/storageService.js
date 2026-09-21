import { APP_CONFIG } from "../config.js";
import { createSeedTransactions } from "../demoData.js";

function getScopedStorageKey(mode) {
  return `${APP_CONFIG.storageKey}_${mode}`;
}

export function loadTransactionsFromStorage(mode = "personal") {
  const scopedKey = getScopedStorageKey(mode);
  let saved = localStorage.getItem(scopedKey);

  // Tự động giữ lại dữ liệu từ phiên bản cũ và xem nó là dữ liệu cá nhân.
  if (!saved && mode === "personal") {
    const legacySaved = localStorage.getItem(APP_CONFIG.storageKey);
    if (legacySaved) {
      saved = legacySaved;
      localStorage.setItem(scopedKey, legacySaved);
    }
  }

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("Không đọc được localStorage:", error);
    }
  }

  const seed = createSeedTransactions(mode);
  saveTransactionsToStorage(seed, mode);
  return seed;
}

export function saveTransactionsToStorage(transactions, mode = "personal") {
  localStorage.setItem(
    getScopedStorageKey(mode),
    JSON.stringify(transactions)
  );
}
