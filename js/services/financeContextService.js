import { APP_CONFIG } from "../config.js";

function getContextStorageKey(mode) {
  return `${APP_CONFIG.financeContextStorageKey}_${mode}`;
}

export async function getFinanceContext(mode = "personal") {
  if (!APP_CONFIG.useLocalDemo) {
    const response = await fetch(
      `${APP_CONFIG.apiBaseUrl}/finance-context?scope=${encodeURIComponent(mode)}`
    );

    if (!response.ok) {
      throw new Error("Không tải được thông tin tài chính");
    }

    return response.json();
  }

  const key = getContextStorageKey(mode);
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const data = JSON.parse(saved);
      return { debtTotal: Number(data.debtTotal) || 0 };
    } catch (error) {
      console.warn("Không đọc được finance context:", error);
    }
  }

  const context = {
    debtTotal: Number(APP_CONFIG.demoDebtByMode?.[mode]) || 0,
  };

  localStorage.setItem(key, JSON.stringify(context));
  return context;
}

export function saveDebtTotalToStorage(mode, debtTotal) {
  localStorage.setItem(
    getContextStorageKey(mode),
    JSON.stringify({ debtTotal: Math.max(Number(debtTotal) || 0, 0) })
  );
}
