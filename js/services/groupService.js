import { APP_CONFIG } from "../config.js";
import {
  createSeedGroups,
  DISCOVERABLE_GROUPS,
} from "../demoData.js";
import { removeGroupTransactionStorage } from "./storageService.js";
import { removeGroupFinanceContext } from "./financeContextService.js";

function saveLocalGroups(groups) {
  localStorage.setItem(
    APP_CONFIG.groupStorageKey,
    JSON.stringify(groups)
  );

  return groups;
}

function loadLocalGroups() {
  const saved = localStorage.getItem(APP_CONFIG.groupStorageKey);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("Không đọc được danh sách nhóm:", error);
    }
  }

  return saveLocalGroups(createSeedGroups());
}

async function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

function normalizeGroup(group) {
  return {
    ...group,
    role: group.role || "member",
    monthlyBudget: Number(group.monthlyBudget) || 0,
    members: Array.isArray(group.members) ? group.members : [],
  };
}

export async function getGroups() {
  if (APP_CONFIG.useLocalDemo) {
    return loadLocalGroups().map(normalizeGroup);
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups`,
    { headers: await getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Không tải được danh sách nhóm");
  }

  return response.json();
}

export async function createGroup(payload) {
  if (APP_CONFIG.useLocalDemo) {
    const groups = loadLocalGroups();

    const group = normalizeGroup({
      id: `grp-${Date.now()}`,
      name: payload.name.trim(),
      description:
        payload.description?.trim() ||
        "Nhóm quản lý tài chính chung.",
      inviteCode: generateInviteCode(),
      role: "owner",
      monthlyBudget: Number(payload.monthlyBudget) || 5_000_000,
      members: [
        {
          id: "me",
          name: "Thành Đạt",
          role: "owner",
        },
      ],
    });

    saveLocalGroups([...groups, group]);
    return group;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể tạo nhóm");
  }

  return response.json();
}

export async function joinGroupByCode(inviteCode) {
  const cleanCode = String(inviteCode || "")
    .trim()
    .toUpperCase();

  if (!cleanCode) {
    throw new Error("Vui lòng nhập mã nhóm");
  }

  if (APP_CONFIG.useLocalDemo) {
    const groups = loadLocalGroups();

    const existing = groups.find(
      (group) =>
        String(group.inviteCode).toUpperCase() === cleanCode
    );

    if (existing) {
      return normalizeGroup(existing);
    }

    const found = DISCOVERABLE_GROUPS.find(
      (group) =>
        String(group.inviteCode).toUpperCase() === cleanCode
    );

    if (!found) {
      throw new Error("Không tìm thấy nhóm với mã này");
    }

    const joined = normalizeGroup({
      ...found,
      role: "member",
      members: [
        ...found.members,
        {
          id: "me",
          name: "Thành Đạt",
          role: "member",
        },
      ],
    });

    saveLocalGroups([...groups, joined]);
    return joined;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups/join`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ invite_code: cleanCode }),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể tham gia nhóm");
  }

  return response.json();
}

export async function searchGroups(query, joinedGroupIds = []) {
  const keyword = String(query || "").trim().toLowerCase();

  if (APP_CONFIG.useLocalDemo) {
    return DISCOVERABLE_GROUPS
      .filter((group) => !joinedGroupIds.includes(group.id))
      .filter((group) => {
        if (!keyword) return true;

        return (
          group.name.toLowerCase().includes(keyword) ||
          group.description.toLowerCase().includes(keyword) ||
          group.inviteCode.toLowerCase().includes(keyword)
        );
      })
      .map(normalizeGroup);
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups/search?q=${encodeURIComponent(keyword)}`,
    { headers: await getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Không thể tìm kiếm nhóm");
  }

  return response.json();
}

export async function renameGroup(groupId, name) {
  if (APP_CONFIG.useLocalDemo) {
    const groups = loadLocalGroups();

    const updated = groups.map((group) =>
      group.id === groupId
        ? { ...group, name: name.trim() }
        : group
    );

    saveLocalGroups(updated);
    return normalizeGroup(
      updated.find((group) => group.id === groupId)
    );
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups/${groupId}`,
    {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ name }),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể đổi tên nhóm");
  }

  return response.json();
}

export async function deleteGroup(groupId) {
  if (APP_CONFIG.useLocalDemo) {
    const groups = loadLocalGroups();
    const target = groups.find((group) => group.id === groupId);

    if (!target) {
      throw new Error("Không tìm thấy nhóm");
    }

    if (target.role !== "owner") {
      throw new Error("Chỉ chủ nhóm mới có thể xóa nhóm");
    }

    saveLocalGroups(
      groups.filter((group) => group.id !== groupId)
    );

    removeGroupTransactionStorage(groupId);
    removeGroupFinanceContext(groupId);
    return;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups/${groupId}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể xóa nhóm");
  }
}

export async function leaveGroup(groupId) {
  if (APP_CONFIG.useLocalDemo) {
    const groups = loadLocalGroups();
    const target = groups.find((group) => group.id === groupId);

    if (!target) {
      throw new Error("Không tìm thấy nhóm");
    }

    if (target.role === "owner") {
      throw new Error(
        "Chủ nhóm cần chuyển quyền hoặc xóa nhóm trước khi rời"
      );
    }

    saveLocalGroups(
      groups.filter((group) => group.id !== groupId)
    );

    removeGroupTransactionStorage(groupId);
    removeGroupFinanceContext(groupId);
    return;
  }

  const response = await fetch(
    `${APP_CONFIG.apiBaseUrl}/groups/${groupId}/leave`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể rời nhóm");
  }
}

export function loadLastActiveGroupId() {
  return localStorage.getItem(APP_CONFIG.activeGroupStorageKey);
}

export function saveLastActiveGroupId(groupId) {
  if (groupId) {
    localStorage.setItem(
      APP_CONFIG.activeGroupStorageKey,
      groupId
    );
  } else {
    localStorage.removeItem(
      APP_CONFIG.activeGroupStorageKey
    );
  }
}

function generateInviteCode() {
  return `MF-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}
