import { APP_CONFIG } from "../config.js";

function getContextStorageKey(mode, groupId = null) {
  if (mode === "group") {
    return `${APP_CONFIG.financeContextStorageKey}_group_${groupId || "none"}`;
  }

  return `${APP_CONFIG.financeContextStorageKey}_personal`;
}

export async function getFinanceContext(
  mode = "personal",
  groupId = null
) {
  if (mode === "group" && !groupId) {
    return { debtTotal: 0 };
  }

  if (!APP_CONFIG.useLocalDemo) {
    const params = new URLSearchParams({ scope: mode });

    if (mode === "group") {
      params.set("group_id", groupId);
    }

    const response = await fetch(
      `${APP_CONFIG.apiBaseUrl}/finance-context?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Không tải được thông tin tài chính");
    }

    return response.json();
  }

  const key = getContextStorageKey(mode, groupId);
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const data = JSON.parse(saved);
      return {
        debtTotal: Number(data.debtTotal) || 0,
      };
    } catch (error) {
      console.warn("Không đọc được finance context:", error);
    }
  }

  const context = {
    debtTotal:
      mode === "group"
        ? 0
        : Number(APP_CONFIG.demoDebtByMode?.personal) || 0,
  };

  localStorage.setItem(key, JSON.stringify(context));
  return context;
}

export function saveDebtTotalToStorage(
  mode,
  debtTotal,
  groupId = null
) {
  localStorage.setItem(
    getContextStorageKey(mode, groupId),
    JSON.stringify({
      debtTotal: Math.max(Number(debtTotal) || 0, 0),
    })
  );
}

export function removeGroupFinanceContext(groupId) {
  if (!groupId) return;

  localStorage.removeItem(
    getContextStorageKey("group", groupId)
  );
}
