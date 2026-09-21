import { els } from "./elements.js";

export function openSidebar() {
  els.sidebar.classList.add("open");
  els.sidebarOverlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

export function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.sidebarOverlay.classList.remove("show");
  document.body.style.overflow = "";
}

export function bindSidebarEvents() {
  els.menuBtn.addEventListener("click", openSidebar);
  els.sidebarOverlay.addEventListener("click", closeSidebar);

  document.querySelectorAll(".side-nav .nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".side-nav .nav-item")
        .forEach((item) => item.classList.remove("active"));

      button.classList.add("active");

      if (window.innerWidth <= 900) {
        closeSidebar();
      }
    });
  });
}
