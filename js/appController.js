import {
  addTransaction,
  getActiveGroup,
  getState,
  removeTransaction,
  setActiveGroupId,
  setDebtTotal,
  setFinanceMode,
  setGroups,
  setJoinedGroupSearchText,
  setSearchText,
  setSelectedMonth,
  setTransactions,
  setTypeFilter,
} from "./state.js";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from "./services/transactionService.js";

import {
  getFinanceContext,
} from "./services/financeContextService.js";

import {
  createGroup,
  deleteGroup,
  getGroups,
  joinGroupByCode,
  leaveGroup,
  loadLastActiveGroupId,
  renameGroup,
  saveLastActiveGroupId,
  searchGroups,
} from "./services/groupService.js";

import { currentMonthValue } from "./utils.js";
import { els } from "./ui/elements.js";
import {
  closeTransactionModal,
} from "./ui/modal.js";
import {
  renderFinanceMode,
  bindFinanceModeEvents,
} from "./ui/financeMode.js";
import { renderSummary } from "./ui/summary.js";
import { renderTransactions } from "./ui/transactions.js";
import {
  renderCashFlowChart,
  renderCategoryChart,
} from "./ui/charts.js";
import {
  bindGroupWorkspaceEvents,
  renderGroupWorkspace,
  showToast,
} from "./ui/groupWorkspace.js";
import {
  closeGroupModal,
  openCreateGroupModal,
  openJoinGroupModal,
  openMembersModal,
  openRenameGroupModal,
  openSearchGroupModal,
} from "./ui/groupModal.js";

function renderMonthDependentViews() {
  const { financeMode } = getState();

  renderSummary();
  renderTransactions(handleDeleteTransaction);

  if (financeMode === "personal") {
    renderCategoryChart();
  }
}

function renderAll() {
  const { financeMode } = getState();

  renderGroupWorkspace();
  renderMonthDependentViews();

  if (financeMode === "personal") {
    renderCashFlowChart();
  }
}

async function loadPersonalData() {
  const [transactions, context] = await Promise.all([
    getTransactions("personal"),
    getFinanceContext("personal"),
  ]);

  setTransactions(transactions);
  setDebtTotal(context?.debtTotal);
}

async function loadActiveGroupData(groupId) {
  if (!groupId) {
    setTransactions([]);
    setDebtTotal(0);
    return;
  }

  const [transactions, context] = await Promise.all([
    getTransactions("group", groupId),
    getFinanceContext("group", groupId),
  ]);

  setTransactions(transactions);
  setDebtTotal(context?.debtTotal);
}

async function loadGroupsAndSelectPreferred() {
  const groups = await getGroups();
  setGroups(groups);

  const rememberedId = loadLastActiveGroupId();
  const preferred =
    groups.find((group) => group.id === rememberedId) ||
    groups[0] ||
    null;

  setActiveGroupId(preferred?.id || null);
  saveLastActiveGroupId(preferred?.id || null);

  await loadActiveGroupData(preferred?.id || null);
}

export async function initializeApp() {
  els.monthFilter.value = currentMonthValue();
  els.dateInput.value = new Date()
    .toISOString()
    .slice(0, 10);

  setSelectedMonth(els.monthFilter.value);
  setFinanceMode("personal");
  renderFinanceMode("personal");

  await Promise.all([
    loadPersonalData(),
    getGroups().then(setGroups),
  ]);

  bindAppEvents();

  bindFinanceModeEvents(handleFinanceModeChange);

  bindGroupWorkspaceEvents({
    onSelect: handleSelectGroup,
    onCreate: handleOpenCreateGroup,
    onJoin: handleOpenJoinGroup,
    onAction: handleGroupMenuAction,
    onFilter: handleGroupFilter,
  });

  renderAll();
}

function bindAppEvents() {
  els.transactionForm.addEventListener(
    "submit",
    handleCreateTransaction
  );

  els.searchInput.addEventListener("input", () => {
    setSearchText(els.searchInput.value);
    renderTransactions(handleDeleteTransaction);
  });

  els.typeFilter.addEventListener("change", () => {
    setTypeFilter(els.typeFilter.value);
    renderTransactions(handleDeleteTransaction);
  });

  els.monthFilter.addEventListener("change", () => {
    setSelectedMonth(els.monthFilter.value);
    renderMonthDependentViews();
  });

  els.chartRange.addEventListener(
    "change",
    renderCashFlowChart
  );
}

async function handleFinanceModeChange(mode) {
  if (mode === getState().financeMode) return;

  try {
    setFinanceMode(mode);
    renderFinanceMode(mode);

    setSearchText("");
    els.searchInput.value = "";
    setTypeFilter("all");
    els.typeFilter.value = "all";

    if (mode === "personal") {
      await loadPersonalData();
    } else {
      await loadGroupsAndSelectPreferred();
    }

    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể chuyển chế độ quản lý tài chính.");
  }
}

async function handleSelectGroup(groupId) {
  const { financeMode, activeGroupId } = getState();

  if (
    financeMode !== "group" ||
    !groupId ||
    groupId === activeGroupId
  ) {
    return;
  }

  try {
    setActiveGroupId(groupId);
    saveLastActiveGroupId(groupId);

    await loadActiveGroupData(groupId);
    renderAll();

    const active = getActiveGroup();
    showToast(
      active
        ? `Đã chuyển sang nhóm "${active.name}"`
        : "Đã chuyển nhóm"
    );
  } catch (error) {
    console.error(error);
    alert("Không thể mở nhóm này.");
  }
}

function handleGroupFilter(value) {
  setJoinedGroupSearchText(value);
  renderGroupWorkspace();
}

function handleOpenCreateGroup() {
  openCreateGroupModal(async (payload) => {
    try {
      const created = await createGroup(payload);
      const groups = await getGroups();

      setGroups(groups);
      setActiveGroupId(created.id);
      saveLastActiveGroupId(created.id);

      await loadActiveGroupData(created.id);

      closeGroupModal();
      renderAll();
      showToast(`Đã tạo nhóm "${created.name}"`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể tạo nhóm.");
    }
  });
}

function handleOpenJoinGroup() {
  openJoinGroupModal(async (code) => {
    try {
      const joined = await joinGroupByCode(code);
      const groups = await getGroups();

      setGroups(groups);
      setActiveGroupId(joined.id);
      saveLastActiveGroupId(joined.id);

      await loadActiveGroupData(joined.id);

      closeGroupModal();
      renderAll();
      showToast(`Đã tham gia "${joined.name}"`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể tham gia nhóm.");
    }
  });
}

async function handleGroupMenuAction(action) {
  const activeGroup = getActiveGroup();

  switch (action) {
    case "create":
      handleOpenCreateGroup();
      break;

    case "join":
      handleOpenJoinGroup();
      break;

    case "search":
      await openSearchGroupModal({
        onSearch: async (query) => {
          const joinedIds = getState().groups.map(
            (group) => group.id
          );

          return searchGroups(query, joinedIds);
        },
        onJoin: async (code) => {
          try {
            const joined = await joinGroupByCode(code);
            const groups = await getGroups();

            setGroups(groups);
            setActiveGroupId(joined.id);
            saveLastActiveGroupId(joined.id);

            await loadActiveGroupData(joined.id);

            closeGroupModal();
            renderAll();
            showToast(`Đã tham gia "${joined.name}"`);
          } catch (error) {
            alert(
              error.message || "Không thể tham gia nhóm."
            );
          }
        },
      });
      break;

    case "members":
      if (activeGroup) {
        openMembersModal(activeGroup);
      }
      break;

    case "rename":
      if (!activeGroup) return;

      openRenameGroupModal(
        activeGroup,
        async (name) => {
          try {
            await renameGroup(activeGroup.id, name);
            setGroups(await getGroups());

            closeGroupModal();
            renderAll();
            showToast("Đã đổi tên nhóm");
          } catch (error) {
            alert(
              error.message || "Không thể đổi tên nhóm."
            );
          }
        }
      );
      break;

    case "copy-code":
      if (activeGroup) {
        await copyInviteCode(activeGroup.inviteCode);
      }
      break;

    case "leave":
      if (activeGroup) {
        await handleLeaveGroup(activeGroup);
      }
      break;

    case "delete":
      if (activeGroup) {
        await handleDeleteGroup(activeGroup);
      }
      break;
  }
}

async function copyInviteCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã nhóm: ${code}`);
  } catch {
    showToast(`Mã nhóm: ${code}`);
  }
}

async function handleDeleteGroup(group) {
  const ok = window.confirm(
    `Xóa nhóm "${group.name}"?\n\nToàn bộ dữ liệu demo của nhóm trên trình duyệt này sẽ bị xóa.`
  );

  if (!ok) return;

  try {
    await deleteGroup(group.id);
    await refreshGroupsAfterRemoval();
    showToast(`Đã xóa nhóm "${group.name}"`);
  } catch (error) {
    console.error(error);
    alert(error.message || "Không thể xóa nhóm.");
  }
}

async function handleLeaveGroup(group) {
  const ok = window.confirm(
    `Bạn có chắc muốn rời nhóm "${group.name}"?`
  );

  if (!ok) return;

  try {
    await leaveGroup(group.id);
    await refreshGroupsAfterRemoval();
    showToast(`Đã rời nhóm "${group.name}"`);
  } catch (error) {
    console.error(error);
    alert(error.message || "Không thể rời nhóm.");
  }
}

async function refreshGroupsAfterRemoval() {
  const groups = await getGroups();
  setGroups(groups);

  const nextGroup = groups[0] || null;

  setActiveGroupId(nextGroup?.id || null);
  saveLastActiveGroupId(nextGroup?.id || null);

  await loadActiveGroupData(nextGroup?.id || null);
  renderAll();
}

async function handleCreateTransaction(event) {
  event.preventDefault();

  const type = document.querySelector(
    'input[name="type"]:checked'
  ).value;

  const {
    financeMode,
    transactions,
    activeGroupId,
  } = getState();

  if (financeMode === "group" && !activeGroupId) {
    alert("Hãy tạo hoặc chọn một nhóm trước.");
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    type,
    amount: Number(els.amountInput.value),
    category: els.categoryInput.value,
    description: els.descriptionInput.value.trim(),
    date: els.dateInput.value,
  };

  try {
    await createTransaction(
      transaction,
      transactions,
      financeMode,
      activeGroupId
    );

    addTransaction(transaction);

    const transactionMonth =
      transaction.date.slice(0, 7);

    els.monthFilter.value = transactionMonth;
    setSelectedMonth(transactionMonth);

    closeTransactionModal();
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể lưu giao dịch.");
  }
}

async function handleDeleteTransaction(id) {
  const ok = window.confirm(
    "Bạn có chắc muốn xóa giao dịch này không?"
  );

  if (!ok) return;

  try {
    const {
      financeMode,
      transactions,
      activeGroupId,
    } = getState();

    await deleteTransaction(
      id,
      transactions,
      financeMode,
      activeGroupId
    );

    removeTransaction(id);
    renderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể xóa giao dịch.");
  }
}
