import { APP_CONFIG } from "../config.js";
import {
  loadTransactionsFromStorage,
  saveTransactionsToStorage,
} from "./storageService.js";

/**
 * Tầng dữ liệu giao dịch.
 * `mode` nhận "personal" hoặc "group" để tách riêng hai phạm vi dữ liệu.
 */
async function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export async function getTransactions(mode = "personal") {
  if (APP_CONFIG.useLocalDemo) {
    return loadTransactionsFromStorage(mode);
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions?scope=${encodeURIComponent(mode)}`,
    { headers: await getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Không tải được danh sách giao dịch");
  }

  return response.json();
}

export async function createTransaction(
  transaction,
  currentTransactions,
  mode = "personal"
) {
  if (APP_CONFIG.useLocalDemo) {
    const updated = [...currentTransactions, transaction];
    saveTransactionsToStorage(updated, mode);
    return transaction;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ ...transaction, scope: mode }),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể thêm giao dịch");
  }

  return response.json();
}

export async function deleteTransaction(
  id,
  currentTransactions,
  mode = "personal"
) {
  if (APP_CONFIG.useLocalDemo) {
    const updated = currentTransactions.filter((item) => item.id !== id);
    saveTransactionsToStorage(updated, mode);
    return;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions/${id}?scope=${encodeURIComponent(mode)}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể xóa giao dịch");
  }
}
