export const APP_CONFIG = {
  apiBaseUrl: "http://127.0.0.1:8000/api",
  useLocalDemo: true,
  monthlyBudget: 10_000_000,
  storageKey: "moneyflow_transactions",
  financeContextStorageKey: "moneyflow_finance_context",

  // Dữ liệu demo để kiểm tra cơ chế ẩn/hiện thẻ dư nợ.
  // Đặt về 0 nếu bạn muốn thẻ dư nợ mặc định bị ẩn.
  demoDebtByMode: {
    personal: 2_350_000,
    group: 0,
  },
};
