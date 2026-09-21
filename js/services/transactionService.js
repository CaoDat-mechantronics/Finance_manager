import { APP_CONFIG } from "../config.js";
import {
  loadTransactionsFromStorage,
  saveTransactionsToStorage,
} from "./storageService.js";

/**
 * Đây là tầng dữ liệu duy nhất mà UI nên gọi.
 *
 * Hiện tại:
 * - useLocalDemo = true -> dùng localStorage.
 *
 * Khi nối FastAPI:
 * - đổi APP_CONFIG.useLocalDemo = false
 * - hoàn thiện các request fetch bên dưới.
 *
 * Khi nối Firebase Auth:
 * - lấy Firebase ID token và truyền qua Authorization header.
 */

async function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export async function getTransactions() {
  if (APP_CONFIG.useLocalDemo) {
    return loadTransactionsFromStorage();
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions`,
    {
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Không tải được danh sách giao dịch");
  }

  return response.json();
}

export async function createTransaction(transaction, currentTransactions) {
  if (APP_CONFIG.useLocalDemo) {
    const updated = [...currentTransactions, transaction];
    saveTransactionsToStorage(updated);
    return transaction;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(transaction),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể thêm giao dịch");
  }

  return response.json();
}

export async function deleteTransaction(id, currentTransactions) {
  if (APP_CONFIG.useLocalDemo) {
    const updated = currentTransactions.filter(
      (item) => item.id !== id
    );

    saveTransactionsToStorage(updated);
    return;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions/${id}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể xóa giao dịch");
  }
}
