import { todayOffset } from "./utils.js";

export function createSeedTransactions() {
  return [
    {
      id: crypto.randomUUID(),
      type: "income",
      amount: 15_000_000,
      category: "salary",
      description: "Lương tháng",
      date: todayOffset(-12),
    },
    {
      id: crypto.randomUUID(),
      type: "expense",
      amount: 350_000,
      category: "food",
      description: "Ăn uống cuối tuần",
      date: todayOffset(-2),
    },
    {
      id: crypto.randomUUID(),
      type: "expense",
      amount: 125_000,
      category: "transport",
      description: "Di chuyển",
      date: todayOffset(-1),
    },
    {
      id: crypto.randomUUID(),
      type: "expense",
      amount: 890_000,
      category: "shopping",
      description: "Mua đồ gia dụng",
      date: todayOffset(-5),
    },
    {
      id: crypto.randomUUID(),
      type: "expense",
      amount: 620_000,
      category: "bills",
      description: "Điện, nước và Internet",
      date: todayOffset(-7),
    },
    {
      id: crypto.randomUUID(),
      type: "expense",
      amount: 180_000,
      category: "entertainment",
      description: "Xem phim",
      date: todayOffset(-4),
    },
  ];
}
