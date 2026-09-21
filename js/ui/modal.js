import { CURRENT_USER } from "../constants.js";
import { getState } from "../state.js";
import {
  escapeHtml,
  todayOffset,
} from "../utils.js";
import { els } from "./elements.js";

export function openTransactionModal() {
  prepareTransactionGroupContext();

  els.transactionModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  els.amountInput.focus();
}

export function closeTransactionModal() {
  els.transactionModal.classList.add("hidden");
  document.body.style.overflow = "";

  els.transactionForm.reset();

  const expenseRadio = document.querySelector(
    'input[name="type"][value="expense"]'
  );

  if (expenseRadio) {
    expenseRadio.checked = true;
  }

  els.dateInput.value = todayOffset(0);

  // Không giữ dữ liệu context cũ sau khi đóng modal.
  els.spenderInput.innerHTML =
    '<option value="">Chọn người chi tiêu</option>';

  els.transactionGroupInput.innerHTML =
    '<option value="">Chọn nhóm</option>';
}

export function bindModalEvents() {
  els.openTransactionBtn.addEventListener(
    "click",
    openTransactionModal
  );

  els.mobileAddBtn.addEventListener(
    "click",
    openTransactionModal
  );

  els.closeModalBtn.addEventListener(
    "click",
    closeTransactionModal
  );

  els.cancelBtn.addEventListener(
    "click",
    closeTransactionModal
  );

  els.transactionModal.addEventListener("click", (event) => {
    if (event.target === els.transactionModal) {
      closeTransactionModal();
    }
  });

  els.transactionGroupInput.addEventListener(
    "change",
    () => {
      renderSpenderOptions(
        els.transactionGroupInput.value,
        true
      );
    }
  );
}

/**
 * Chuẩn bị 2 trường chỉ dành cho giao dịch nhóm:
 * - Người chi tiêu
 * - Nhóm
 *
 * Mặc định:
 * - Nhóm = nhóm đang mở.
 * - Người chi tiêu = người dùng hiện tại.
 */
export function prepareTransactionGroupContext() {
  const {
    financeMode,
    groups,
    activeGroupId,
  } = getState();

  const isGroupMode =
    financeMode === "group" &&
    groups.length > 0 &&
    activeGroupId;

  els.groupTransactionFields.classList.toggle(
    "hidden",
    !isGroupMode
  );

  els.spenderInput.required = Boolean(isGroupMode);
  els.transactionGroupInput.required = Boolean(isGroupMode);

  if (!isGroupMode) {
    return;
  }

  renderGroupOptions(groups, activeGroupId);
  renderSpenderOptions(activeGroupId, true);
}

function renderGroupOptions(groups, selectedGroupId) {
  els.transactionGroupInput.innerHTML = groups
    .map(
      (group) => `
        <option
          value="${escapeHtml(group.id)}"
          ${group.id === selectedGroupId ? "selected" : ""}
        >
          ${escapeHtml(group.name)}
        </option>
      `
    )
    .join("");
}

function renderSpenderOptions(groupId, preferCurrentUser = false) {
  const { groups } = getState();

  const group = groups.find(
    (item) => item.id === groupId
  );

  const members = Array.isArray(group?.members)
    ? group.members
    : [];

  if (!members.length) {
    els.spenderInput.innerHTML = `
      <option value="${CURRENT_USER.id}">
        ${escapeHtml(CURRENT_USER.name)} (Bạn)
      </option>
    `;
    els.spenderInput.value = CURRENT_USER.id;
    return;
  }

  els.spenderInput.innerHTML = members
    .map((member) => {
      const isCurrentUser =
        member.id === CURRENT_USER.id;

      return `
        <option value="${escapeHtml(member.id)}">
          ${escapeHtml(member.name)}
          ${isCurrentUser ? " (Bạn)" : ""}
        </option>
      `;
    })
    .join("");

  const currentUserInGroup = members.find(
    (member) => member.id === CURRENT_USER.id
  );

  if (preferCurrentUser && currentUserInGroup) {
    els.spenderInput.value = CURRENT_USER.id;
  } else if (members[0]) {
    els.spenderInput.value = members[0].id;
  }
}

export function getTransactionGroupFormContext() {
  const { financeMode, groups } = getState();

  if (financeMode !== "group") {
    return null;
  }

  const groupId = els.transactionGroupInput.value;
  const spenderId = els.spenderInput.value;

  const group = groups.find(
    (item) => item.id === groupId
  );

  const spender = group?.members?.find(
    (member) => member.id === spenderId
  );

  return {
    groupId,
    groupName: group?.name || "",
    spenderId,
    spenderName:
      spender?.name ||
      (spenderId === CURRENT_USER.id
        ? CURRENT_USER.name
        : ""),
  };
}
