export const APP_CONFIG = {
  apiBaseUrl: "http://127.0.0.1:8000/api",
  useLocalDemo: true,

  monthlyBudget: 10_000_000,

  storageKey: "moneyflow_transactions",
  financeContextStorageKey: "moneyflow_finance_context",

  groupStorageKey: "moneyflow_groups",
  activeGroupStorageKey: "moneyflow_active_group",

  // Demo dư nợ cá nhân. Dư nợ nhóm mặc định bằng 0.
  demoDebtByMode: {
    personal: 2_350_000,
    group: 0,
  },
};
