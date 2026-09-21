import { APP_CONFIG } from "../config.js";
import { createSeedTransactions } from "../demoData.js";

function getScopedStorageKey(mode, groupId = null) {
  if (mode === "group") {
    return `${APP_CONFIG.storageKey}_group_${groupId || "none"}`;
  }

  return `${APP_CONFIG.storageKey}_personal`;
}

export function loadTransactionsFromStorage(
  mode = "personal",
  groupId = null
) {
  const scopedKey = getScopedStorageKey(mode, groupId);
  let saved = localStorage.getItem(scopedKey);

  // Giữ dữ liệu cá nhân từ phiên bản cũ.
  if (!saved && mode === "personal") {
    const legacySaved = localStorage.getItem(APP_CONFIG.storageKey);

    if (legacySaved) {
      saved = legacySaved;
      localStorage.setItem(scopedKey, legacySaved);
    }
  }

  // Chuyển dữ liệu group cũ sang group đầu tiên một lần.
  if (!saved && mode === "group" && groupId === "grp-family") {
    const legacyGroupKey = `${APP_CONFIG.storageKey}_group`;
    const legacyGroup = localStorage.getItem(legacyGroupKey);
    const migratedKey = `${APP_CONFIG.storageKey}_group_migration_v3`;

    if (legacyGroup && !localStorage.getItem(migratedKey)) {
      saved = legacyGroup;
      localStorage.setItem(scopedKey, legacyGroup);
      localStorage.setItem(migratedKey, "1");
    }
  }

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("Không đọc được localStorage:", error);
    }
  }

  const seed = createSeedTransactions(mode, groupId);
  saveTransactionsToStorage(seed, mode, groupId);
  return seed;
}

export function saveTransactionsToStorage(
  transactions,
  mode = "personal",
  groupId = null
) {
  localStorage.setItem(
    getScopedStorageKey(mode, groupId),
    JSON.stringify(transactions)
  );
}

export function removeGroupTransactionStorage(groupId) {
  if (!groupId) return;

  localStorage.removeItem(
    getScopedStorageKey("group", groupId)
  );
}
