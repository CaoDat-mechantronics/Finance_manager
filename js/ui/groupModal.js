import { formatMoney, refreshIcons } from "../utils.js";
import { els } from "./elements.js";

let searchDebounce = null;

export function bindGroupModalEvents() {
  els.closeGroupModalBtn.addEventListener(
    "click",
    closeGroupModal
  );

  els.groupActionModal.addEventListener(
    "click",
    (event) => {
      if (event.target === els.groupActionModal) {
        closeGroupModal();
      }
    }
  );
}

export function closeGroupModal() {
  els.groupActionModal.classList.add("hidden");
  els.groupModalBody.innerHTML = "";
  document.body.style.overflow = "";
}

function openShell(title, eyebrow = "Quản lý nhóm") {
  els.groupModalTitle.textContent = title;
  els.groupModalEyebrow.textContent = eyebrow;
  els.groupActionModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function openCreateGroupModal(onSubmit) {
  openShell("Tạo nhóm mới", "Không gian tài chính");

  els.groupModalBody.innerHTML = `
    <form id="createGroupForm">
      <div class="form-group">
        <label for="newGroupName">Tên nhóm</label>
        <input
          id="newGroupName"
          type="text"
          maxlength="50"
          required
          placeholder="Ví dụ: Chi tiêu gia đình"
        />
      </div>

      <div class="form-group">
        <label for="newGroupDescription">Mô tả</label>
        <input
          id="newGroupDescription"
          type="text"
          maxlength="120"
          placeholder="Nhóm dùng để quản lý khoản chi nào?"
        />
      </div>

      <div class="form-group">
        <label for="newGroupBudget">Ngân sách tháng</label>
        <div class="amount-field">
          <input
            id="newGroupBudget"
            type="number"
            min="0"
            step="100000"
            value="5000000"
          />
          <span>₫</span>
        </div>
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" type="button" data-close-group-modal>
          Hủy
        </button>
        <button class="primary-btn" type="submit">
          <i data-lucide="plus"></i>
          Tạo nhóm
        </button>
      </div>
    </form>
  `;

  wireCloseButtons();

  document
    .getElementById("createGroupForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const payload = {
        name: document
          .getElementById("newGroupName")
          .value.trim(),
        description: document
          .getElementById("newGroupDescription")
          .value.trim(),
        monthlyBudget: Number(
          document.getElementById("newGroupBudget").value
        ),
      };

      if (!payload.name) return;

      await onSubmit(payload);
    });

  refreshIcons();
  document.getElementById("newGroupName").focus();
}

export function openJoinGroupModal(onSubmit) {
  openShell("Tham gia nhóm", "Mã mời");

  els.groupModalBody.innerHTML = `
    <form id="joinGroupForm">
      <div class="group-modal-note">
        <i data-lucide="key-round"></i>
        <div>
          <strong>Nhập mã nhóm</strong>
          <span>
            Mã do chủ nhóm chia sẻ. Ví dụ demo:
            <b>DANANG26</b>, <b>PHONGTRO</b> hoặc <b>BONGDA26</b>.
          </span>
        </div>
      </div>

      <div class="form-group">
        <label for="joinGroupCode">Mã nhóm</label>
        <input
          id="joinGroupCode"
          type="text"
          required
          autocomplete="off"
          placeholder="Nhập mã mời..."
        />
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" type="button" data-close-group-modal>
          Hủy
        </button>
        <button class="primary-btn" type="submit">
          <i data-lucide="log-in"></i>
          Tham gia
        </button>
      </div>
    </form>
  `;

  wireCloseButtons();

  document
    .getElementById("joinGroupForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const code = document
        .getElementById("joinGroupCode")
        .value.trim();

      await onSubmit(code);
    });

  refreshIcons();
  document.getElementById("joinGroupCode").focus();
}

export function openRenameGroupModal(group, onSubmit) {
  openShell("Đổi tên nhóm", group.name);

  els.groupModalBody.innerHTML = `
    <form id="renameGroupForm">
      <div class="form-group">
        <label for="renameGroupName">Tên nhóm mới</label>
        <input
          id="renameGroupName"
          type="text"
          maxlength="50"
          required
          value="${escapeAttribute(group.name)}"
        />
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" type="button" data-close-group-modal>
          Hủy
        </button>
        <button class="primary-btn" type="submit">
          <i data-lucide="save"></i>
          Lưu
        </button>
      </div>
    </form>
  `;

  wireCloseButtons();

  document
    .getElementById("renameGroupForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document
        .getElementById("renameGroupName")
        .value.trim();

      if (!name) return;
      await onSubmit(name);
    });

  refreshIcons();
}

export function openMembersModal(group) {
  openShell("Thành viên nhóm", group.name);

  const members = group.members || [];

  els.groupModalBody.innerHTML = `
    <div class="members-list">
      ${members
        .map(
          (member) => `
            <div class="member-row">
              <span class="member-avatar">
                ${getInitials(member.name)}
              </span>

              <div class="member-info">
                <strong>${escapeHtml(member.name)}</strong>
                <span>
                  ${
                    member.role === "owner"
                      ? "Chủ nhóm"
                      : "Thành viên"
                  }
                </span>
              </div>

              ${
                member.id === "me"
                  ? '<span class="you-badge">Bạn</span>'
                  : ""
              }
            </div>
          `
        )
        .join("")}
    </div>

    <div class="modal-actions">
      <button class="secondary-btn" type="button" data-close-group-modal>
        Đóng
      </button>
    </div>
  `;

  wireCloseButtons();
  refreshIcons();
}

export async function openSearchGroupModal({
  onSearch,
  onJoin,
}) {
  openShell("Tìm kiếm nhóm", "Khám phá");

  els.groupModalBody.innerHTML = `
    <div class="search-box modal-group-search">
      <i data-lucide="search"></i>
      <input
        id="discoverGroupInput"
        type="search"
        placeholder="Tên nhóm hoặc mã nhóm..."
      />
    </div>

    <div class="discover-group-results" id="discoverGroupResults">
      <div class="group-search-loading">Đang tải...</div>
    </div>
  `;

  refreshIcons();

  const input = document.getElementById("discoverGroupInput");

  const runSearch = async () => {
    const results = await onSearch(input.value);
    renderSearchResults(results, onJoin);
  };

  input.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(runSearch, 180);
  });

  await runSearch();
  input.focus();
}

function renderSearchResults(groups, onJoin) {
  const container = document.getElementById(
    "discoverGroupResults"
  );

  if (!container) return;

  if (!groups.length) {
    container.innerHTML = `
      <div class="discover-empty">
        <i data-lucide="search-x"></i>
        <strong>Không tìm thấy nhóm</strong>
        <span>Thử tên hoặc mã nhóm khác.</span>
      </div>
    `;
    refreshIcons();
    return;
  }

  container.innerHTML = groups
    .map(
      (group) => `
        <article class="discover-group-card">
          <div class="discover-group-main">
            <span class="group-card-avatar">
              ${getInitials(group.name)}
            </span>

            <div>
              <strong>${escapeHtml(group.name)}</strong>
              <span>
                ${group.members?.length || 0} thành viên ·
                ${formatMoney(group.monthlyBudget || 0)}/tháng
              </span>
            </div>
          </div>

          <p>${escapeHtml(group.description || "")}</p>

          <div class="discover-group-footer">
            <code>${escapeHtml(group.inviteCode)}</code>

            <button
              class="primary-btn compact-btn"
              type="button"
              data-join-discovered="${group.inviteCode}"
            >
              Tham gia
            </button>
          </div>
        </article>
      `
    )
    .join("");

  container
    .querySelectorAll("[data-join-discovered]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await onJoin(button.dataset.joinDiscovered);
      });
    });

  refreshIcons();
}

function wireCloseButtons() {
  els.groupModalBody
    .querySelectorAll("[data-close-group-modal]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        closeGroupModal
      );
    });
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return map[char];
  });
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}
