/* =============================================================================
   main.ts — Validación en tiempo real (TypeScript)
   Compilar con:  tsc   → genera ../js/main.js (ver tsconfig.json)
   ============================================================================= */

/* ------------------------------ Tipos ------------------------------ */
type Validator = (value: string) => string | null; // devuelve mensaje de error o null

interface FieldConfig {
  input: HTMLInputElement;
  error: HTMLElement;
  rules: Validator[];
}

/* --------------------------- Utilidad DOM -------------------------- */
const byId = <T extends HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

/* --------------------------- Validadores --------------------------- */
const required =
  (campo: string): Validator =>
  (value) => (value.trim() !== "" ? null : `⚠ ${campo} es obligatorio.`);

const minLength =
  (min: number, campo: string): Validator =>
  (value) =>
    value.trim().length >= min ? null : `⚠ ${campo} debe tener al menos ${min} caracteres.`;

const emailFormat: Validator = (value) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(value.trim()) ? null : "⚠ Correo inválido. Ejemplo: ana@correo.com";
};

const phoneFormat: Validator = (value) => {
  const limpio = value.replace(/[\s()-]/g, "");
  const re = /^(09\d{8}|\+5939\d{8})$/; // celular ecuatoriano
  return re.test(limpio) ? null : "⚠ Teléfono inválido. Usa 09XXXXXXXX o +5939XXXXXXXX.";
};

const passwordFormat: Validator = (value) => {
  if (value.length < 6) return "⚠ La contraseña debe tener al menos 6 caracteres.";
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value))
    return "⚠ Debe combinar al menos una letra y un número.";
  return null;
};

/* -------------------- Estado visual + ARIA ------------------------- */
function setError(input: HTMLInputElement, error: HTMLElement, msg: string): void {
  error.textContent = msg;
  error.classList.add("visible");
  input.setAttribute("aria-invalid", "true");
}

function clearError(input: HTMLInputElement, error: HTMLElement): void {
  error.textContent = "";
  error.classList.remove("visible");
  input.setAttribute("aria-invalid", "false");
}

function checkField(cfg: FieldConfig): boolean {
  for (const rule of cfg.rules) {
    const msg = rule(cfg.input.value);
    if (msg !== null) {
      setError(cfg.input, cfg.error, msg);
      return false;
    }
  }
  clearError(cfg.input, cfg.error);
  return true;
}

/* ------------- Conexión de formularios (tiempo real) --------------- */
function buildFields(defs: Array<[string, string, Validator[]]>): FieldConfig[] {
  const out: FieldConfig[] = [];
  for (const [inputId, errorId, rules] of defs) {
    const input = byId<HTMLInputElement>(inputId);
    const error = byId<HTMLElement>(errorId);
    if (input && error) out.push({ input, error, rules });
  }
  return out;
}

function bindForm(formId: string, fields: FieldConfig[], statusId: string, okMsg: string): void {
  const form = byId<HTMLFormElement>(formId);
  const status = byId<HTMLElement>(statusId);
  if (!form || !status) return;

  // Validación en tiempo real: al salir del campo y al corregir
  for (const cfg of fields) {
    cfg.input.addEventListener("blur", () => checkField(cfg));
    cfg.input.addEventListener("input", () => {
      if (cfg.input.getAttribute("aria-invalid") === "true") checkField(cfg);
    });
  }

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    const idxInvalido = fields.map(checkField).findIndex((ok) => !ok);
    if (idxInvalido !== -1) {
      fields[idxInvalido].input.focus(); // accesible: foco al primer error
      return;
    }

    status.classList.add("success");
    status.textContent = okMsg;
    form.reset();
    for (const cfg of fields) clearError(cfg.input, cfg.error);
  });
}

function initForms(): void {
  bindForm(
    "login-form",
    buildFields([
      ["email", "email-error", [required("El correo"), emailFormat]],
      ["password", "password-error", [required("La contraseña"), passwordFormat]],
    ]),
    "login-message",
    "✅ Sesión iniciada correctamente. ¡Bienvenido de nuevo!"
  );

  bindForm(
    "register-form",
    buildFields([
      ["reg-name", "reg-name-error", [required("El nombre"), minLength(3, "El nombre")]],
      ["reg-email", "reg-email-error", [required("El correo"), emailFormat]],
      ["reg-phone", "reg-phone-error", [required("El teléfono"), phoneFormat]],
      ["reg-password", "reg-password-error", [required("La contraseña"), passwordFormat]],
    ]),
    "register-form-message",
    "✅ Cuenta creada con éxito. Revisa tu correo para confirmarla."
  );
}

/* ------------------- Botones mostrar/ocultar clave ------------------ */
function initPasswordToggles(): void {
  const pares: Array<[string, string]> = [
    ["toggle-password", "password"],
    ["reg-toggle-password", "reg-password"],
  ];
  for (const [btnId, inputId] of pares) {
    const btn = byId<HTMLButtonElement>(btnId);
    const input = byId<HTMLInputElement>(inputId);
    if (!btn || !input) continue;
    btn.addEventListener("click", () => {
      const mostrar = input.type === "password";
      input.type = mostrar ? "text" : "password";
      btn.textContent = mostrar ? "Ocultar" : "Mostrar";
      btn.setAttribute("aria-pressed", String(mostrar));
      btn.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  }
}

/* ---------------------------- Carrusel ----------------------------- */
function initCarousel(): void {
  const slides = Array.from(document.querySelectorAll<HTMLElement>(".carousel-slide"));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>(".dot-btn"));
  if (slides.length === 0) return;

  let actual = 0;
  const irA = (i: number): void => {
    actual = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => {
      s.classList.toggle("active", idx === actual);
      s.setAttribute("aria-hidden", String(idx !== actual));
    });
    dots.forEach((d, idx) => {
      d.classList.toggle("active", idx === actual);
      d.setAttribute("aria-selected", String(idx === actual));
    });
  };

  const prev = byId<HTMLButtonElement>("btn-prev");
  const next = byId<HTMLButtonElement>("btn-next");
  if (prev) prev.addEventListener("click", () => irA(actual - 1));
  if (next) next.addEventListener("click", () => irA(actual + 1));
  dots.forEach((d, idx) => d.addEventListener("click", () => irA(idx)));
}

/* ----------------------------- Modal ------------------------------- */
function initModal(): void {
  const modal = byId<HTMLDialogElement>("modal-experiencia");
  const abrir = byId<HTMLButtonElement>("btn-open-modal");
  const cerrar = byId<HTMLButtonElement>("btn-close-modal");
  const form = byId<HTMLFormElement>("modal-form");
  if (!modal || !abrir || !cerrar) return;

  abrir.addEventListener("click", () => {
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "true");
  });
  cerrar.addEventListener("click", () => {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  });
  if (form) {
    form.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      form.reset();
      if (typeof modal.close === "function") modal.close();
    });
  }
}

/* ----------------------------- Arranque ---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initForms();
  initPasswordToggles();
  initCarousel();
  initModal();
});