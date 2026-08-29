"use strict";
/* =============================================================================
   playground.ts — Comportamiento de teclado/foco del playground de componentes
   (backoffice). Compilar: cd ts && tsc   → genera ../js/playground.js
   ============================================================================= */
const pgById = (id) => document.getElementById(id);
/* --------------------------------- Alerts -------------------------------- */
function initAlerts() {
    const cerrarBotones = document.querySelectorAll(".c-alert-close");
    cerrarBotones.forEach((boton) => {
        boton.addEventListener("click", () => {
            var _a;
            (_a = boton.closest(".c-alert")) === null || _a === void 0 ? void 0 : _a.remove();
        });
    });
}
/* --------------------------------- Dialogs -------------------------------- */
function initDialogConfirmarEliminar() {
    const dialog = pgById("dialog-confirm-delete");
    const abrir = pgById("btn-open-dialog");
    const cancelar = pgById("btn-cancel-dialog");
    const confirmar = pgById("btn-confirm-delete");
    if (!dialog || !abrir || !cancelar || !confirmar)
        return;
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
function attachMenu(triggerId, menuId) {
    const trigger = pgById(triggerId);
    const menu = pgById(menuId);
    if (!trigger || !menu)
        return;
    const items = () => Array.from(menu.querySelectorAll("[role='menuitem']"));
    const abrirMenu = () => {
        var _a;
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        (_a = items()[0]) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const cerrarMenu = (devolverFocoAlTrigger) => {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        if (devolverFocoAlTrigger)
            trigger.focus();
    };
    trigger.addEventListener("click", () => {
        const abierto = trigger.getAttribute("aria-expanded") === "true";
        if (abierto)
            cerrarMenu(false);
        else
            abrirMenu();
    });
    menu.addEventListener("keydown", (e) => {
        var _a, _b;
        const lista = items();
        const actual = lista.indexOf(document.activeElement);
        if (e.key === "Escape") {
            e.preventDefault();
            cerrarMenu(true);
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            (_a = lista[(actual + 1) % lista.length]) === null || _a === void 0 ? void 0 : _a.focus();
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            (_b = lista[(actual - 1 + lista.length) % lista.length]) === null || _b === void 0 ? void 0 : _b.focus();
        }
        else if (e.key === "Tab") {
            cerrarMenu(false);
        }
    });
    document.addEventListener("click", (e) => {
        const objetivo = e.target;
        const estaAbierto = trigger.getAttribute("aria-expanded") === "true";
        if (estaAbierto && !menu.contains(objetivo) && !trigger.contains(objetivo)) {
            cerrarMenu(false);
        }
    });
}
function initMenus() {
    attachMenu("menu-trigger-text", "menu-account-text");
    attachMenu("menu-trigger-icon", "menu-account-icon");
}
const TOAST_MAX_VISIBLE = 3;
const TOAST_DURATION_MS = 5000;
function programarCierreToast(toast) {
    window.setTimeout(() => toast.remove(), TOAST_DURATION_MS);
}
function limitarToastsVisibles(container) {
    const toasts = Array.from(container.querySelectorAll(".c-toast"));
    const exceso = toasts.length - TOAST_MAX_VISIBLE;
    for (let i = 0; i < exceso; i++) {
        toasts[i].remove();
    }
}
function crearToast(tipo, mensaje) {
    const toast = document.createElement("div");
    toast.className = `c-toast c-toast--${tipo}`;
    const texto = document.createElement("p");
    texto.textContent = mensaje;
    toast.appendChild(texto);
    return toast;
}
function mostrarToast(container, tipo, mensaje) {
    const toast = crearToast(tipo, mensaje);
    container.appendChild(toast);
    limitarToastsVisibles(container);
    programarCierreToast(toast);
}
function initToasts() {
    const container = pgById("toast-container");
    if (!container)
        return;
    container.querySelectorAll(".c-toast").forEach((toast) => {
        programarCierreToast(toast);
    });
    const btnExito = pgById("btn-demo-toast-success");
    const btnError = pgById("btn-demo-toast-error");
    btnExito === null || btnExito === void 0 ? void 0 : btnExito.addEventListener("click", () => {
        mostrarToast(container, "success", "Los cambios se guardaron correctamente.");
    });
    btnError === null || btnError === void 0 ? void 0 : btnError.addEventListener("click", () => {
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
