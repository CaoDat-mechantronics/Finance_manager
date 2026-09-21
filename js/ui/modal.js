import { els } from "./elements.js";
import { todayOffset } from "../utils.js";

export function openTransactionModal() {
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
}
