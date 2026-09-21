import { getActiveGroup, getState } from "../state.js";
import {
  escapeHtml,
  formatMoney,
  refreshIcons,
} from "../utils.js";
import { els } from "./elements.js";

let bound = false;
let callbacks = {};
let toastTimer = null;

export function bindGroupWorkspaceEvents(handlers) {
  callbacks = handlers;

  if (bound) return;
  bound = true;

  els.addGroupTabBtn.addEventListener("click", () => {
    callbacks.onCreate?.();
  });

  els.groupListCreateBtn.addEventListener("click", () => {
    callbacks.onCreate?.();
  });

  els.emptyCreateGroupBtn.addEventListener("click", () => {
    callbacks.onCreate?.();
  });

  els.emptyJoinGroupBtn.addEventListener("click", () => {
    callbacks.onJoin?.();
  });

  els.groupManageBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    els.groupManageMenu.classList.toggle("hidden");
  });

  els.groupManageMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-group-action]");
    if (!button || button.disabled) return;

    els.groupManageMenu.classList.add("hidden");
    callbacks.onAction?.(button.dataset.groupAction);
  });

  els.groupTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-group-id]");
    if (!tab) return;

    callbacks.onSelect?.(tab.dataset.groupId);
  });

  els.groupCardGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-group-card-id]");
    if (!card) return;

    callbacks.onSelect?.(card.dataset.groupCardId);
  });

  els.joinedGroupSearchInput.addEventListener("input", () => {
    callbacks.onFilter?.(els.joinedGroupSearchInput.value);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".group-manage-wrap")) {
      els.groupManageMenu.classList.add("hidden");
    }
  });
}

export function renderGroupWorkspace() {
  const {
    financeMode,
    groups,
    activeGroupId,
    joinedGroupSearchText,
  } = getState();

  const inGroupMode = financeMode === "group";
  const activeGroup = getActiveGroup();
  const hasGroups = groups.length > 0;
  const hasActiveGroup = Boolean(activeGroup);

  els.groupWorkspaceBar.classList.toggle(
    "hidden",
    !inGroupMode
  );

  els.groupListSection.classList.toggle(
    "hidden",
    !inGroupMode
  );

  els.personalAnalyticsSection.classList.toggle(
    "hidden",
    inGroupMode
  );

  // Nếu chưa có nhóm thì chỉ hiển thị màn hình danh sách/empty state.
  els.summaryCarousel.classList.toggle(
    "hidden",
    inGroupMode && !hasActiveGroup
  );

  els.transactionPanel.classList.toggle(
    "hidden",
    inGroupMode && !hasActiveGroup
  );

  // Nút thêm giao dịch chỉ có ý nghĩa khi cá nhân hoặc đã chọn nhóm.
  els.openTransactionBtn.classList.toggle(
    "hidden",
    inGroupMode && !hasActiveGroup
  );

  els.mobileAddBtn.classList.toggle(
    "group-no-active",
    inGroupMode && !hasActiveGroup
  );

  if (!inGroupMode) {
    els.transactionEyebrow.textContent = "Hoạt động gần đây";
    els.transactionPanelTitle.textContent = "Giao dịch";
    return;
  }

  renderGroupTabs(groups, activeGroupId);
  renderGroupCards(
    groups,
    activeGroupId,
    joinedGroupSearchText
  );
  updateGroupMenuAvailability(activeGroup);

  if (activeGroup) {
    els.transactionEyebrow.textContent = "Giao dịch nhóm";
    els.transactionPanelTitle.textContent =
      activeGroup.name;
  } else {
    els.transactionEyebrow.textContent = "Giao dịch nhóm";
    els.transactionPanelTitle.textContent = "Chưa chọn nhóm";
  }

  refreshIcons();
}

function renderGroupTabs(groups, activeGroupId) {
  els.groupTabs.innerHTML = groups
    .map((group) => {
      const active = group.id === activeGroupId;

      return `
        <button
          class="group-tab ${active ? "active" : ""}"
          type="button"
          role="tab"
          aria-selected="${active}"
          data-group-id="${group.id}"
          title="${escapeHtml(group.name)}"
        >
          <span class="group-tab-avatar">
            ${getInitials(group.name)}
          </span>
          <span class="group-tab-name">
            ${escapeHtml(group.name)}
          </span>
        </button>
      `;
    })
    .join("");
}

function renderGroupCards(groups, activeGroupId, searchText) {
  const keyword = String(searchText || "")
    .trim()
    .toLowerCase();

  const filtered = groups.filter((group) => {
    if (!keyword) return true;

    return (
      group.name.toLowerCase().includes(keyword) ||
      String(group.description || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  const hasAnyGroups = groups.length > 0;

  els.groupEmptyState.classList.toggle(
    "hidden",
    hasAnyGroups
  );

  els.groupCardGrid.classList.toggle(
    "hidden",
    !hasAnyGroups
  );

  if (!hasAnyGroups) {
    els.groupCardGrid.innerHTML = "";
    return;
  }

  if (!filtered.length) {
    els.groupCardGrid.innerHTML = `
      <div class="group-filter-empty">
        <i data-lucide="search-x"></i>
        <strong>Không tìm thấy nhóm</strong>
        <span>Thử từ khóa khác.</span>
      </div>
    `;
    return;
  }

  els.groupCardGrid.innerHTML = filtered
    .map((group) => {
      const isActive = group.id === activeGroupId;
      const isOwner = group.role === "owner";
      const members = group.members?.length || 0;

      return `
        <article
          class="group-card ${isActive ? "active" : ""}"
          data-group-card-id="${group.id}"
          tabindex="0"
        >
          <div class="group-card-top">
            <div class="group-card-avatar">
              ${getInitials(group.name)}
            </div>

            <div class="group-card-badges">
              <span class="role-badge ${isOwner ? "owner" : ""}">
                ${isOwner ? "Chủ nhóm" : "Thành viên"}
              </span>

              ${
                isActive
                  ? '<span class="selected-badge"><i data-lucide="check"></i> Đang chọn</span>'
                  : ""
              }
            </div>
          </div>

          <div class="group-card-content">
            <h4>${escapeHtml(group.name)}</h4>
            <p>${escapeHtml(group.description || "Nhóm tài chính chung.")}</p>
          </div>

          <div class="group-card-meta">
            <span>
              <i data-lucide="users"></i>
              ${members} thành viên
            </span>

            <span>
              <i data-lucide="target"></i>
              ${formatMoney(group.monthlyBudget || 0)} / tháng
            </span>
          </div>

          <div class="group-card-footer">
            <span>Mã: ${escapeHtml(group.inviteCode || "—")}</span>
            <button type="button" tabindex="-1">
              Mở nhóm
              <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateGroupMenuAvailability(activeGroup) {
  const isOwner = activeGroup?.role === "owner";
  const isMember = Boolean(activeGroup) && !isOwner;

  els.groupManageMenu
    .querySelectorAll("[data-requires-group]")
    .forEach((button) => {
      button.disabled = !activeGroup;
    });

  els.groupManageMenu
    .querySelectorAll("[data-requires-owner]")
    .forEach((button) => {
      button.disabled = !isOwner;
    });

  els.groupManageMenu
    .querySelectorAll("[data-requires-member]")
    .forEach((button) => {
      button.disabled = !isMember;
    });
}

export function showToast(message) {
  if (!message) return;

  clearTimeout(toastTimer);

  els.appToastText.textContent = message;
  els.appToast.classList.remove("hidden");

  toastTimer = setTimeout(() => {
    els.appToast.classList.add("hidden");
  }, 2600);
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}
