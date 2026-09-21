import { initializeApp } from "./appController.js";
import {
  bindSidebarEvents,
  closeSidebar,
} from "./ui/sidebar.js";
import {
  bindModalEvents,
  closeTransactionModal,
} from "./ui/modal.js";
import {
  bindSummaryScrollerEvents,
} from "./ui/summaryScroller.js";
import {
  bindGroupTabScrollerEvents,
} from "./ui/groupTabScroller.js";
import {
  bindGroupModalEvents,
  closeGroupModal,
} from "./ui/groupModal.js";
import { refreshIcons } from "./utils.js";

async function bootstrap() {
  bindSidebarEvents();
  bindModalEvents();
  bindGroupModalEvents();
  bindSummaryScrollerEvents();
  bindGroupTabScrollerEvents();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTransactionModal();
      closeGroupModal();
      closeSidebar();
    }
  });

  refreshIcons();

  try {
    await initializeApp();
  } catch (error) {
    console.error(
      "Khởi tạo ứng dụng thất bại:",
      error
    );
    alert("Không thể khởi tạo ứng dụng.");
  }
}

bootstrap();
