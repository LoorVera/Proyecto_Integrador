/* =============================================================================
   playground.ts — Comportamiento de teclado/foco del playground de componentes
   (backoffice). Compilar: cd ts && tsc   → genera ../js/playground.js
   ============================================================================= */

const pgById = <T extends HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

/* --------------------------------- Alerts -------------------------------- */
function initAlerts(): void {
  const cerrarBotones = document.querySelectorAll<HTMLButtonElement>(".c-alert-close");
  cerrarBotones.forEach((boton) => {
    boton.addEventListener("click", () => {
      boton.closest<HTMLElement>(".c-alert")?.remove();
    });
  });
}

/* --------------------------------- Dialogs -------------------------------- */
function initDialogConfirmarEliminar(): void {
  const dialog = pgById<HTMLDialogElement>("dialog-confirm-delete");
  const abrir = pgById<HTMLButtonElement>("btn-open-dialog");
  const cancelar = pgById<HTMLButtonElement>("btn-cancel-dialog");
  const confirmar = pgById<HTMLButtonElement>("btn-confirm-delete");
  if (!dialog || !abrir || !cancelar || !confirmar) return;

  abrir.addEventListener("click", () => {
    dialog.showModal();
  });
  cancelar.addEventListener("click", () => {
    dialog.close();
  });
  confirmar.addEventListener("click", () => {
    dialog.close();
  });
}

/* --------------------------------- Menús --------------------------------- */
function attachMenu(triggerId: string, menuId: string): void {
  const trigger = pgById<HTMLButtonElement>(triggerId);
  const menu = pgById<HTMLUListElement>(menuId);
  if (!trigger || !menu) return;

  const items = (): HTMLElement[] =>
    Array.from(menu.querySelectorAll<HTMLElement>("[role='menuitem']"));

  const abrirMenu = (): void => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    items()[0]?.focus();
  };

  const cerrarMenu = (devolverFocoAlTrigger: boolean): void => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (devolverFocoAlTrigger) trigger.focus();
  };

  trigger.addEventListener("click", () => {
    const abierto = trigger.getAttribute("aria-expanded") === "true";
    if (abierto) cerrarMenu(false);
    else abrirMenu();
  });

  menu.addEventListener("keydown", (e: KeyboardEvent) => {
    const lista = items();
    const actual = lista.indexOf(document.activeElement as HTMLElement);

    if (e.key === "Escape") {
      e.preventDefault();
      cerrarMenu(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      lista[(actual + 1) % lista.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      lista[(actual - 1 + lista.length) % lista.length]?.focus();
    } else if (e.key === "Tab") {
      cerrarMenu(false);
    }
  });

  document.addEventListener("click", (e: MouseEvent) => {
    const objetivo = e.target as Node;
    const estaAbierto = trigger.getAttribute("aria-expanded") === "true";
    if (estaAbierto && !menu.contains(objetivo) && !trigger.contains(objetivo)) {
      cerrarMenu(false);
    }
  });
}

function initMenus(): void {
  attachMenu("menu-trigger-text", "menu-account-text");
  attachMenu("menu-trigger-icon", "menu-account-icon");
}

/* --------------------------------- Toasts --------------------------------- */
type ToastTipo = "success" | "error";

const TOAST_MAX_VISIBLE = 3;
const TOAST_DURATION_MS = 5000;

function programarCierreToast(toast: HTMLElement): void {
  window.setTimeout(() => toast.remove(), TOAST_DURATION_MS);
}

function limitarToastsVisibles(container: HTMLElement): void {
  const toasts = Array.from(container.querySelectorAll<HTMLElement>(".c-toast"));
  const exceso = toasts.length - TOAST_MAX_VISIBLE;
  for (let i = 0; i < exceso; i++) {
    toasts[i].remove();
  }
}

function crearToast(tipo: ToastTipo, mensaje: string): HTMLElement {
  const toast = document.createElement("div");
  toast.className = `c-toast c-toast--${tipo}`;
  const texto = document.createElement("p");
  texto.textContent = mensaje;
  toast.appendChild(texto);
  return toast;
}

function mostrarToast(container: HTMLElement, tipo: ToastTipo, mensaje: string): void {
  const toast = crearToast(tipo, mensaje);
  container.appendChild(toast);
  limitarToastsVisibles(container);
  programarCierreToast(toast);
}

function initToasts(): void {
  const container = pgById<HTMLElement>("toast-container");
  if (!container) return;

  container.querySelectorAll<HTMLElement>(".c-toast").forEach((toast) => {
    programarCierreToast(toast);
  });

  const btnExito = pgById<HTMLButtonElement>("btn-demo-toast-success");
  const btnError = pgById<HTMLButtonElement>("btn-demo-toast-error");
  btnExito?.addEventListener("click", () => {
    mostrarToast(container, "success", "Los cambios se guardaron correctamente.");
  });
  btnError?.addEventListener("click", () => {
    mostrarToast(container, "error", "No se pudo completar la acción.");
  });
}

/* ---------------------------------- Init ---------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initAlerts();
  initDialogConfirmarEliminar();
  initMenus();
  initToasts();
});
