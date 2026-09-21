import { APP_CONFIG } from "../config.js";
import {
  loadTransactionsFromStorage,
  saveTransactionsToStorage,
} from "./storageService.js";

async function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

function buildGroupQuery(mode, groupId) {
  const params = new URLSearchParams({ scope: mode });

  if (mode === "group" && groupId) {
    params.set("group_id", groupId);
  }

  return params.toString();
}

export async function getTransactions(
  mode = "personal",
  groupId = null
) {
  if (mode === "group" && !groupId) {
    return [];
  }

  if (APP_CONFIG.useLocalDemo) {
    return loadTransactionsFromStorage(mode, groupId);
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions?${buildGroupQuery(mode, groupId)}`,
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
  mode = "personal",
  groupId = null
) {
  if (mode === "group" && !groupId) {
    throw new Error("Chưa chọn nhóm");
  }

  if (APP_CONFIG.useLocalDemo) {
    const updated = [...currentTransactions, transaction];
    saveTransactionsToStorage(updated, mode, groupId);
    return transaction;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        ...transaction,
        scope: mode,
        group_id: mode === "group" ? groupId : null,
      }),
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
  mode = "personal",
  groupId = null
) {
  if (APP_CONFIG.useLocalDemo) {
    const updated = currentTransactions.filter(
      (item) => item.id !== id
    );

    saveTransactionsToStorage(updated, mode, groupId);
    return;
  }

  const query = buildGroupQuery(mode, groupId);

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/transactions/${id}?${query}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể xóa giao dịch");
  }
}
