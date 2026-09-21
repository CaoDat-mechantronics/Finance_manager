import { todayOffset } from "./utils.js";

export function createSeedTransactions(mode = "personal", groupId = null) {
  if (mode === "group") {
    if (groupId === "grp-family") {
      return [
        {
          id: crypto.randomUUID(),
          type: "income",
          amount: 8_000_000,
          category: "other",
          description: "Đóng góp quỹ gia đình",
          date: todayOffset(-10),
        },
        {
          id: crypto.randomUUID(),
          type: "expense",
          amount: 1_250_000,
          category: "food",
          description: "Ăn uống gia đình",
          date: todayOffset(-4),
        },
        {
          id: crypto.randomUUID(),
          type: "expense",
          amount: 450_000,
          category: "transport",
          description: "Di chuyển chung",
          date: todayOffset(-2),
        },
      ];
    }

    if (groupId === "grp-robot") {
      return [
        {
          id: crypto.randomUUID(),
          type: "income",
          amount: 4_500_000,
          category: "other",
          description: "Quỹ dự án Robot",
          date: todayOffset(-11),
        },
        {
          id: crypto.randomUUID(),
          type: "expense",
          amount: 980_000,
          category: "shopping",
          description: "Mua linh kiện",
          date: todayOffset(-5),
        },
        {
          id: crypto.randomUUID(),
          type: "expense",
          amount: 320_000,
          category: "transport",
          description: "Chi phí vận chuyển",
          date: todayOffset(-1),
        },
      ];
    }

    return [];
  }

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

export function createSeedGroups() {
  return [
    {
      id: "grp-family",
      name: "Chi tiêu gia đình",
      description: "Quỹ sinh hoạt và các khoản chi chung trong gia đình.",
      inviteCode: "GIA-DINH-26",
      role: "owner",
      monthlyBudget: 12_000_000,
      members: [
        { id: "me", name: "Thành Đạt", role: "owner" },
        { id: "m2", name: "Minh Anh", role: "member" },
        { id: "m3", name: "Ngọc", role: "member" },
        { id: "m4", name: "Huy", role: "member" },
      ],
    },
    {
      id: "grp-robot",
      name: "Dự án Robot",
      description: "Theo dõi quỹ mua linh kiện và chi phí của nhóm Robot.",
      inviteCode: "ROBOT-2026",
      role: "member",
      monthlyBudget: 6_000_000,
      members: [
        { id: "owner-r", name: "Hoàng Nam", role: "owner" },
        { id: "me", name: "Thành Đạt", role: "member" },
        { id: "r3", name: "Tuấn", role: "member" },
        { id: "r4", name: "Linh", role: "member" },
        { id: "r5", name: "Phúc", role: "member" },
      ],
    },
  ];
}

export const DISCOVERABLE_GROUPS = [
  {
    id: "grp-travel",
    name: "Du lịch Đà Nẵng",
    description: "Quỹ chuyến đi, khách sạn, ăn uống và phương tiện.",
    inviteCode: "DANANG26",
    monthlyBudget: 15_000_000,
    members: [
      { id: "travel-owner", name: "Mai", role: "owner" },
      { id: "travel-2", name: "Hùng", role: "member" },
      { id: "travel-3", name: "Lan", role: "member" },
    ],
  },
  {
    id: "grp-room",
    name: "Chi tiêu phòng trọ",
    description: "Điện, nước, Internet và đồ dùng chung.",
    inviteCode: "PHONGTRO",
    monthlyBudget: 5_000_000,
    members: [
      { id: "room-owner", name: "Đức", role: "owner" },
      { id: "room-2", name: "Kiên", role: "member" },
    ],
  },
  {
    id: "grp-football",
    name: "CLB Bóng đá",
    description: "Sân bóng, nước uống, áo đấu và các khoản đóng góp.",
    inviteCode: "BONGDA26",
    monthlyBudget: 8_000_000,
    members: [
      { id: "football-owner", name: "Quân", role: "owner" },
      { id: "football-2", name: "Duy", role: "member" },
      { id: "football-3", name: "Thắng", role: "member" },
      { id: "football-4", name: "Long", role: "member" },
      { id: "football-5", name: "Vũ", role: "member" },
      { id: "football-6", name: "Sơn", role: "member" },
    ],
  },
];
