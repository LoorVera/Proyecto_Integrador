"use strict";
/* =============================================================================
   main.ts — Validaciones + menú + tema + UX + accesibilidad (TypeScript)
   Compilar:  cd ts && tsc   → genera ../js/main.js
   ============================================================================= */
const EXPERIENCIAS_KEY = "experiencias-usuario";
const RESERVAS_KEY = "reservas-usuario";
const VIAJES_KEY = "viajes-guardados";
const SESION_KEY = "sesion-usuario";
const byId = (id) => document.getElementById(id);
const debounce = (fn, ms) => {
    let t;
    return () => { window.clearTimeout(t); t = window.setTimeout(fn, ms); };
};
/* ------------------- Persistencia simulada (localStorage) ---------- */
function leerArray(key) {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    }
    catch (err) {
        return [];
    }
}
function guardarArray(key, arr) {
    try {
        window.localStorage.setItem(key, JSON.stringify(arr));
    }
    catch (err) { /* navegación privada */ }
}
/* --------------------------- Validadores --------------------------- */
const required = (campo) => (v) => (v.trim() !== "" ? null : `⚠ ${campo} es obligatorio.`);
const minLength = (min, campo) => (v) => (v.trim().length >= min ? null : `⚠ ${campo} debe tener al menos ${min} caracteres.`);
const maxLength = (max, campo) => (v) => (v.trim().length <= max ? null : `⚠ ${campo} no puede superar los ${max} caracteres.`);
const emailFormat = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "⚠ Correo inválido. Ejemplo: ana@correo.com";
const phoneFormat = (v) => /^(09\d{8}|\+5939\d{8})$/.test(v.replace(/[\s()-]/g, ""))
    ? null : "⚠ Teléfono inválido. Usa 09XXXXXXXX o +5939XXXXXXXX.";
const nameFormat = (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'.-]+(\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'.-]+)*$/.test(v.trim())
    ? null : "⚠ El nombre solo puede contener letras y espacios.";
const passwordFormat = (v) => {
    if (v.length < 6)
        return "⚠ La contraseña debe tener al menos 6 caracteres.";
    if (!/[a-zA-Z]/.test(v) || !/\d/.test(v))
        return "⚠ Debe combinar al menos una letra y un número.";
    return null;
};
/* ---------------------- Medidor de seguridad ---------------------- */
const NIVELES = ["", "Débil", "Regular", "Buena", "Excelente"];
function passwordScore(v) {
    if (v.length === 0)
        return 0;
    let s = 0;
    if (v.length >= 6)
        s++;
    if (v.length >= 10)
        s++;
    if (/\d/.test(v) && /[a-zA-Z]/.test(v))
        s++;
    if (/[^A-Za-z0-9]/.test(v))
        s++;
    return Math.max(1, Math.min(4, s));
}
function updateStrength(value) {
    const bar = byId("reg-strength-bar");
    const text = byId("reg-strength-text");
    if (!bar || !text)
        return;
    const score = passwordScore(value);
    bar.dataset.level = String(score);
    text.textContent = value ? `Seguridad de la contraseña: ${NIVELES[score]}` : "";
}
/* --------------------- Estado visual + ARIA ----------------------- */
function setError(input, error, msg) {
    error.textContent = msg;
    error.classList.add("visible");
    input.setAttribute("aria-invalid", "true");
}
function clearError(input, error) {
    error.textContent = "";
    error.classList.remove("visible");
    input.setAttribute("aria-invalid", "false");
}
function checkField(cfg) {
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
/* ------------------- Formularios (tiempo real) -------------------- */
function buildFields(defs) {
    const out = [];
    for (const [inputId, errorId, rules] of defs) {
        const input = byId(inputId);
        const error = byId(errorId);
        if (input && error)
            out.push({ input, error, rules });
    }
    return out;
}
function bindForm(formId, fields, statusId, okMsg, onSuccess) {
    const form = byId(formId);
    const status = byId(statusId);
    if (!form || !status)
        return;
    for (const cfg of fields) {
        cfg.input.addEventListener("blur", () => checkField(cfg));
        cfg.input.addEventListener("input", debounce(() => checkField(cfg), 300));
    }
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        status.className = "form-status";
        status.textContent = "";
        const idx = fields.map(checkField).findIndex((ok) => !ok);
        if (idx !== -1) {
            fields[idx].input.focus();
            return;
        }
        if (onSuccess)
            onSuccess();
        status.classList.add("success");
        status.textContent = okMsg;
        form.reset();
        for (const cfg of fields)
            clearError(cfg.input, cfg.error);
        updateStrength("");
    });
}
function initForms() {
    bindForm("login-form", buildFields([
        ["login-email", "login-email-error", [required("El correo"), emailFormat]],
        ["login-password", "login-password-error", [required("La contraseña"), passwordFormat]],
    ]), "login-message", "✅ Sesión iniciada correctamente. ¡Bienvenido de nuevo!", () => {
        var _a;
        var _b;
        const email = (_b = (_a = byId("login-email")) === null || _a === void 0 ? void 0 : _a.value.trim()) !== null && _b !== void 0 ? _b : "";
        guardarSesion(email.split("@")[0] || "Viajero");
    });
    bindForm("register-form", buildFields([
        ["reg-name", "reg-name-error", [required("El nombre"), minLength(3, "El nombre")]],
        ["reg-email", "reg-email-error", [required("El correo"), emailFormat]],
        ["reg-phone", "reg-phone-error", [required("El teléfono"), phoneFormat]],
        ["reg-password", "reg-password-error", [required("La contraseña"), passwordFormat]],
    ]), "register-form-message", "✅ Cuenta creada con éxito. Revisa tu correo para confirmarla.", () => {
        var _a;
        const nombre = ((_a = byId("reg-name")) === null || _a === void 0 ? void 0 : _a.value.trim()) || "Viajero";
        guardarSesion(nombre);
    });
    const regPass = byId("reg-password");
    if (regPass)
        regPass.addEventListener("input", () => updateStrength(regPass.value));
}
/* ------------------- Aceptación de términos (registro) -------------- */
function initTerminos() {
    const form = byId("register-form");
    const checkbox = byId("reg-terms");
    const error = byId("reg-terms-error");
    if (!form || !checkbox || !error)
        return;
    const revisar = () => {
        if (!checkbox.checked) {
            error.textContent = "⚠ Debes aceptar la Política de Privacidad para continuar.";
            error.classList.add("visible");
            return false;
        }
        error.textContent = "";
        error.classList.remove("visible");
        return true;
    };
    checkbox.addEventListener("change", revisar);
    // Registrado antes que bindForm("register-form", ...): al compartir el mismo
    // evento "submit" en el mismo formulario, se ejecuta primero y puede frenar
    // el envío con stopImmediatePropagation() si el checkbox no está marcado.
    form.addEventListener("submit", (e) => {
        if (!revisar()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            checkbox.focus();
        }
    });
}
/* ------------------------- CONTACTO ------------------------------- */
function initContacto() {
    const form = byId("contact-form");
    const feedback = document.querySelector(".form-feedback");
    const fields = buildFields([
        ["nombre", "nombre-error", [required("El nombre"), minLength(3, "El nombre"), nameFormat]],
        ["email", "email-error", [required("El correo"), emailFormat]],
        ["mensaje", "mensaje-error", [required("El mensaje"), minLength(10, "El mensaje"), maxLength(500, "El mensaje")]],
    ]);
    if (!form || !feedback || fields.length === 0)
        return;
    for (const cfg of fields) {
        cfg.input.addEventListener("blur", () => checkField(cfg));
        cfg.input.addEventListener("input", debounce(() => checkField(cfg), 300));
    }
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        feedback.className = "form-feedback";
        feedback.textContent = "";
        const idx = fields.map(checkField).findIndex((ok) => !ok);
        if (idx !== -1) {
            feedback.className = "form-feedback error";
            feedback.textContent = "⚠ No se pudo enviar. Revisa los campos marcados en rojo.";
            fields[idx].input.focus();
            return;
        }
        const nombre = fields[0].input.value.trim();
        const correo = fields[1].input.value.trim();
        feedback.className = "form-feedback success";
        feedback.textContent = `✅ ¡Gracias, ${nombre}! Tu mensaje fue enviado. Te responderemos a ${correo}.`;
        form.reset();
        for (const cfg of fields)
            clearError(cfg.input, cfg.error);
    });
}
/* =============== MENÚ HAMBURGUESA (accesible) ====================== */
function initMenu() {
    const toggle = byId("menu-toggle");
    const nav = byId("site-nav");
    if (!toggle || !nav)
        return;
    const cerrar = () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú de navegación");
    };
    toggle.addEventListener("click", () => {
        const abierto = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(abierto));
        toggle.setAttribute("aria-label", abierto ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    });
    // Cierra al elegir un enlace (móvil)
    nav.addEventListener("click", (e) => {
        if (e.target.closest("a"))
            cerrar();
    });
    // Cierra con Escape y devuelve el foco al botón
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("open")) {
            cerrar();
            toggle.focus();
        }
    });
    // Si se redimensiona a escritorio, limpia el estado "open"
    window.matchMedia("(min-width: 768px)").addEventListener("change", (m) => {
        if (m.matches)
            cerrar();
    });
}
/* =============== MODO CLARO / OSCURO con persistencia ============== */
function initTheme() {
    const btn = byId("theme-toggle");
    const icon = btn ? btn.querySelector(".theme-icon") : null;
    const root = document.documentElement;
    const aplicar = (oscuro) => {
        root.setAttribute("data-theme", oscuro ? "dark" : "light");
        try {
            window.localStorage.setItem("tema", oscuro ? "dark" : "light");
        }
        catch (err) { /* navegación privada */ }
        if (btn) {
            btn.setAttribute("aria-pressed", String(oscuro));
            btn.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
        }
        if (icon)
            icon.textContent = oscuro ? "☀️" : "🌙";
    };
    // Sincroniza el botón con el tema aplicado por el script del <head>
    aplicar(root.getAttribute("data-theme") === "dark");
    if (btn) {
        btn.addEventListener("click", () => aplicar(root.getAttribute("data-theme") !== "dark"));
    }
}
/* =============== SESIÓN SIMULADA (localStorage, sin backend) ======= */
function leerSesion() {
    try {
        const raw = window.localStorage.getItem(SESION_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch (err) {
        return null;
    }
}
function guardarSesion(nombre) {
    try {
        window.localStorage.setItem(SESION_KEY, JSON.stringify({ nombre }));
    }
    catch (err) { /* navegación privada */ }
    refrescarNavSesion();
}
function cerrarSesion() {
    try {
        window.localStorage.removeItem(SESION_KEY);
    }
    catch (err) { /* navegación privada */ }
    refrescarNavSesion();
}
function refrescarNavSesion() {
    var _a, _b;
    var _c, _d;
    // El indicador de sesión vive junto al logo (#nav-sesion-box), no dentro del
    // menú hamburguesa: así se ve siempre, sin depender de abrir el menú en móvil.
    const nav = byId("site-nav");
    const loginLi = (_c = (_a = nav === null || nav === void 0 ? void 0 : nav.querySelector('a[href="index.html#login"]')) === null || _a === void 0 ? void 0 : _a.closest("li")) !== null && _c !== void 0 ? _c : null;
    const registroLi = (_d = (_b = nav === null || nav === void 0 ? void 0 : nav.querySelector('a[href="index.html#registro"]')) === null || _b === void 0 ? void 0 : _b.closest("li")) !== null && _d !== void 0 ? _d : null;
    const sesionBox = byId("nav-sesion-box");
    const nombreSpan = byId("nav-sesion-nombre");
    const logoutBtn = byId("btn-logout");
    if (!sesionBox || !nombreSpan || !logoutBtn)
        return;
    if (!logoutBtn.dataset.bound) {
        logoutBtn.addEventListener("click", cerrarSesion);
        logoutBtn.dataset.bound = "true";
    }
    const sesion = leerSesion();
    const activo = !!sesion;
    if (loginLi)
        loginLi.hidden = activo;
    if (registroLi)
        registroLi.hidden = activo;
    sesionBox.hidden = !activo;
    if (activo && sesion)
        nombreSpan.textContent = `Hola, ${sesion.nombre}`;
}
/* --------------------- Contador de caracteres --------------------- */
function initCharCounter() {
    const area = byId("feedback-text");
    const counter = byId("feedback-counter");
    if (!area || !counter)
        return;
    const MAX = 500;
    const update = () => {
        const len = area.value.length;
        counter.textContent = `${len} / ${MAX}`;
        counter.classList.toggle("warn", len >= MAX * 0.9);
    };
    area.addEventListener("input", update);
    update();
}
/* --------------------- Mostrar / ocultar clave -------------------- */
function initPasswordToggles() {
    const pares = [
        ["toggle-password", "login-password"],
        ["reg-toggle-password", "reg-password"],
    ];
    for (const [btnId, inputId] of pares) {
        const btn = byId(btnId);
        const input = byId(inputId);
        if (!btn || !input)
            continue;
        btn.addEventListener("click", () => {
            const mostrar = input.type === "password";
            input.type = mostrar ? "text" : "password";
            btn.textContent = mostrar ? "Ocultar" : "Mostrar";
            btn.setAttribute("aria-pressed", String(mostrar));
            btn.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
        });
    }
}
/* --------------- Carrusel con autoplay accesible ------------------ */
function initCarousel() {
    const slides = Array.from(document.querySelectorAll(".carousel-slide"));
    const dots = Array.from(document.querySelectorAll(".dot-btn"));
    const frame = document.querySelector(".carousel-frame");
    if (slides.length === 0)
        return;
    let actual = 0;
    const irA = (i) => {
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
    const prev = byId("btn-prev");
    const next = byId("btn-next");
    if (prev)
        prev.addEventListener("click", () => irA(actual - 1));
    if (next)
        next.addEventListener("click", () => irA(actual + 1));
    dots.forEach((d, idx) => d.addEventListener("click", () => irA(idx)));
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;
    const parar = () => { window.clearInterval(timer); };
    const jugar = () => { if (!reducido) {
        parar();
        timer = window.setInterval(() => irA(actual + 1), 6000);
    } };
    if (frame) {
        frame.addEventListener("mouseenter", parar);
        frame.addEventListener("mouseleave", jugar);
        frame.addEventListener("focusin", parar);
        frame.addEventListener("focusout", jugar);
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? parar() : jugar()));
    jugar();
}
/* ----------------------------- Modal ------------------------------ */
function initModal() {
    const modal = byId("modal-experiencia");
    const abrir = byId("btn-open-modal");
    const cerrar = byId("btn-close-modal");
    const form = byId("modal-form");
    if (!modal || !abrir || !cerrar)
        return;
    abrir.addEventListener("click", () => {
        if (typeof modal.showModal === "function")
            modal.showModal();
        else
            modal.setAttribute("open", "true");
    });
    const cerrarModal = () => {
        if (typeof modal.close === "function")
            modal.close();
        else
            modal.removeAttribute("open");
    };
    cerrar.addEventListener("click", cerrarModal);
    modal.addEventListener("click", (e) => { if (e.target === modal)
        cerrarModal(); });
    if (form) {
        form.addEventListener("submit", (e) => {
            var _a, _b, _c, _d;
            var _e, _f, _g, _h;
            e.preventDefault();
            const autor = (_e = (_a = byId("exp-author")) === null || _a === void 0 ? void 0 : _a.value.trim()) !== null && _e !== void 0 ? _e : "";
            const lugar = (_f = (_b = byId("exp-place")) === null || _b === void 0 ? void 0 : _b.value.trim()) !== null && _f !== void 0 ? _f : "";
            const nota = Number((_g = (_c = byId("exp-rating")) === null || _c === void 0 ? void 0 : _c.value) !== null && _g !== void 0 ? _g : 5);
            const texto = (_h = (_d = byId("exp-comment")) === null || _d === void 0 ? void 0 : _d.value.trim()) !== null && _h !== void 0 ? _h : "";
            if (autor && lugar && texto)
                addExperienceCard(autor, lugar, nota, texto);
            form.reset();
            cerrarModal();
        });
    }
}
function crearExperienciaCard(autor, lugar, nota, texto) {
    const iniciales = autor.split(" ").map((p) => p.charAt(0)).join("").slice(0, 2).toUpperCase();
    const estrellas = "★".repeat(nota) + "☆".repeat(5 - nota);
    const li = document.createElement("li");
    li.className = "experience-card";
    li.innerHTML =
        `<div class="user-avatar" aria-hidden="true">${iniciales}</div>` +
            `<div class="user-info"><div class="user-name-wrapper"><span class="user-name">${autor}</span>` +
            `<span class="star-rating-static" role="img" aria-label="${nota} de 5 estrellas">${estrellas}</span></div>` +
            `<div class="user-place-tag">${lugar}</div><blockquote class="user-comment">"${texto}"</blockquote></div>`;
    return li;
}
function addExperienceCard(autor, lugar, nota, texto) {
    const list = byId("experiences-list-container");
    if (!list)
        return;
    list.prepend(crearExperienciaCard(autor, lugar, nota, texto));
    const guardadas = leerArray(EXPERIENCIAS_KEY);
    guardadas.push({ autor, lugar, nota, texto });
    guardarArray(EXPERIENCIAS_KEY, guardadas);
}
function cargarExperienciasGuardadas() {
    const list = byId("experiences-list-container");
    if (!list)
        return;
    for (const exp of leerArray(EXPERIENCIAS_KEY)) {
        list.prepend(crearExperienciaCard(exp.autor, exp.lugar, exp.nota, exp.texto));
    }
}
/* ------------------------- Valoración footer ---------------------- */
function initRating() {
    const form = byId("rating-form");
    const msg = byId("rating-message");
    if (!form || !msg)
        return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const sel = form.querySelector("input[name='rating']:checked");
        msg.classList.add("success");
        msg.textContent = sel ? `✅ ¡Gracias! Valoraste con ${sel.value} estrella(s).` : "✅ ¡Gracias por tus comentarios!";
        form.reset();
    });
}
/* ------------------- Reservas de planes de pago --------------------- */
function renderizarReservas() {
    const contenedor = byId("reservas-guardadas");
    if (!contenedor)
        return;
    const reservas = leerArray(RESERVAS_KEY);
    if (reservas.length === 0) {
        contenedor.innerHTML = "";
        return;
    }
    contenedor.innerHTML =
        `<h3 class="org-subtitle">Tus reservas</h3>` +
            `<ul class="budget-list" role="list">` +
            reservas.map((r, i) => `<li><span>${r.hotel} (${r.duracion})</span>` +
                `<span class="budget-list-actions"><strong>${r.precio}</strong>` +
                `<button type="button" class="btn-quitar" data-idx="${i}" aria-label="Quitar reserva de ${r.hotel}">Quitar</button></span></li>`).join("") +
            `</ul>`;
}
function initReservas() {
    const botones = Array.from(document.querySelectorAll(".plans-table button.btn-reserve"));
    const contenedor = byId("reservas-guardadas");
    if (botones.length === 0 || !contenedor)
        return;
    botones.forEach((btn) => {
        btn.addEventListener("click", () => {
            var _a, _b, _c, _d, _e, _f;
            var _g, _h, _j;
            const fila = btn.closest("tr");
            const hotel = (_g = (_b = (_a = fila === null || fila === void 0 ? void 0 : fila.querySelector(".hotel-name")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _g !== void 0 ? _g : "Plan seleccionado";
            const precio = (_h = (_d = (_c = fila === null || fila === void 0 ? void 0 : fila.querySelector(".plan-price")) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _h !== void 0 ? _h : "";
            const duracion = (_j = (_f = (_e = fila === null || fila === void 0 ? void 0 : fila.querySelector(".plan-duration")) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _j !== void 0 ? _j : "";
            const reservas = leerArray(RESERVAS_KEY);
            reservas.push({ hotel, precio, duracion, fecha: new Date().toLocaleDateString("es-EC") });
            guardarArray(RESERVAS_KEY, reservas);
            renderizarReservas();
        });
    });
    contenedor.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-quitar");
        if (!boton)
            return;
        const idx = Number(boton.dataset.idx);
        const reservas = leerArray(RESERVAS_KEY);
        reservas.splice(idx, 1);
        guardarArray(RESERVAS_KEY, reservas);
        renderizarReservas();
    });
    renderizarReservas();
}
/* ================== DESTINOS: filtro por región ==================== */
function initDestinosFilter() {
    const botones = Array.from(document.querySelectorAll(".filter-btn"));
    const cards = Array.from(document.querySelectorAll(".destino-card"));
    const vacio = byId("destinos-vacio");
    if (botones.length === 0)
        return;
    botones.forEach((btn) => {
        btn.addEventListener("click", () => {
            var _a;
            botones.forEach((b) => {
                b.classList.toggle("active", b === btn);
                b.setAttribute("aria-pressed", String(b === btn));
            });
            const region = (_a = btn.dataset.region) !== null && _a !== void 0 ? _a : "all";
            let visibles = 0;
            cards.forEach((c) => {
                const mostrar = region === "all" || c.dataset.region === region;
                c.hidden = !mostrar;
                if (mostrar)
                    visibles++;
            });
            if (vacio)
                vacio.hidden = visibles !== 0;
        });
    });
}
/* ============ ORGANIZADOR: presupuesto + itinerario ================ */
const DESTINOS = {
    galapagos: { nombre: "Islas Galápagos", costoDia: 120, highlight: "Snorkel con leones marinos y visita a la Estación Darwin" },
    quito: { nombre: "Quito", costoDia: 60, highlight: "Recorrido por el Centro Histórico y la Mitad del Mundo" },
    cotopaxi: { nombre: "Volcán Cotopaxi", costoDia: 70, highlight: "Caminata al refugio José Rivas y avistamiento de cóndores" },
    quilotoa: { nombre: "Laguna de Quilotoa", costoDia: 50, highlight: "Mirador de Shalalá y descenso al cráter" },
    banos: { nombre: "Baños de Agua Santa", costoDia: 55, highlight: "Ruta de cascadas y el Columpio del Fin del Mundo" },
    montanita: { nombre: "Montañita", costoDia: 45, highlight: "Clase de surf y atardecer en la playa" },
};
const HOSPEDAJE = {
    hostal: { nombre: "Hostal", precio: 25 },
    hotel: { nombre: "Hotel", precio: 70 },
    ecolodge: { nombre: "Eco-lodge", precio: 90 },
};
const COMIDA_POR_DIA = 30;
function initOrganizador() {
    const form = byId("org-form");
    const resultado = byId("org-resultado");
    const select = byId("org-destino");
    if (!form || !resultado || !select)
        return;
    const params = new URLSearchParams(window.location.search);
    const pre = params.get("destino");
    if (pre && DESTINOS[pre])
        select.value = pre;
    let ultimoPlan = null;
    form.addEventListener("submit", (e) => {
        var _a, _b, _c;
        var _d, _e, _f;
        e.preventDefault();
        const data = DESTINOS[select.value];
        const dias = Number((_d = (_a = byId("org-dias")) === null || _a === void 0 ? void 0 : _a.value) !== null && _d !== void 0 ? _d : 0);
        const personas = Number((_e = (_b = byId("org-personas")) === null || _b === void 0 ? void 0 : _b.value) !== null && _e !== void 0 ? _e : 0);
        if (!data || dias < 1 || dias > 15 || personas < 1 || personas > 12) {
            resultado.innerHTML =
                `<p class="form-feedback error" role="alert">⚠ Revisa los datos: elige un destino, ` +
                    `días entre 1 y 15 y viajeros entre 1 y 12.</p>`;
            ultimoPlan = null;
            return;
        }
        const hotelKey = (_f = (_c = form.querySelector("input[name='org-hotel']:checked")) === null || _c === void 0 ? void 0 : _c.value) !== null && _f !== void 0 ? _f : "hostal";
        const hotel = HOSPEDAJE[hotelKey];
        const extras = Array.from(form.querySelectorAll("input[name='org-extra']:checked"))
            .reduce((sum, chk) => sum + Number(chk.value), 0);
        const noches = dias >= 2 ? dias - 1 : 0;
        const cHospedaje = hotel.precio * noches;
        const cComida = COMIDA_POR_DIA * dias;
        const cActividades = data.costoDia * dias;
        const totalPersona = cHospedaje + cComida + cActividades + extras;
        const totalGrupo = totalPersona * personas;
        const plan = [];
        if (dias === 1) {
            plan.push(`Día 1: Excursión de un día a ${data.nombre} — ${data.highlight.toLowerCase()}.`);
        }
        else {
            plan.push(`Día 1: Llegada a ${data.nombre}, check-in en ${hotel.nombre.toLowerCase()} y caminata de reconocimiento.`);
            for (let d = 2; d < dias; d++)
                plan.push(`Día ${d}: ${data.highlight}.`);
            plan.push(`Día ${dias}: Desayuno, compras de recuerdos y regreso.`);
        }
        ultimoPlan = { destino: data.nombre, dias, personas, totalGrupo, fecha: new Date().toLocaleDateString("es-EC") };
        resultado.innerHTML =
            `<h3 class="org-subtitle">Presupuesto: ${data.nombre}</h3>` +
                `<ul class="budget-list" role="list">` +
                `<li><span>Alojamiento (${hotel.nombre} × ${noches} noches)</span><strong>$${cHospedaje}</strong></li>` +
                `<li><span>Alimentación ($30 × ${dias} días)</span><strong>$${cComida}</strong></li>` +
                `<li><span>Actividades ($${data.costoDia} × ${dias} días)</span><strong>$${cActividades}</strong></li>` +
                `<li><span>Extras por persona</span><strong>$${extras}</strong></li>` +
                `</ul>` +
                `<p class="budget-total">Total por persona: <strong>$${totalPersona}</strong></p>` +
                `<p class="budget-total">Total del grupo (${personas} viajero${personas > 1 ? "s" : ""}): <strong>$${totalGrupo}</strong></p>` +
                `<h3 class="org-subtitle">Itinerario sugerido</h3>` +
                `<ol class="itinerario-list">${plan.map((p) => `<li>${p}</li>`).join("")}</ol>` +
                `<button type="button" id="btn-guardar-plan" class="btn-submit">GUARDAR MI PLAN</button>`;
    });
    resultado.addEventListener("click", (e) => {
        if (!e.target.closest("#btn-guardar-plan") || !ultimoPlan)
            return;
        const guardados = leerArray(VIAJES_KEY);
        guardados.push(ultimoPlan);
        guardarArray(VIAJES_KEY, guardados);
        renderizarPlanesGuardados();
    });
    renderizarPlanesGuardados();
}
function renderizarPlanesGuardados() {
    const contenedor = byId("planes-guardados");
    if (!contenedor)
        return;
    const guardados = leerArray(VIAJES_KEY);
    if (guardados.length === 0) {
        contenedor.innerHTML = "";
        return;
    }
    contenedor.innerHTML =
        `<h3 class="org-subtitle">Mis planes guardados</h3>` +
            `<ul class="budget-list" role="list">` +
            guardados.map((p) => `<li><span>${p.destino} — ${p.dias} día(s), ${p.personas} viajero(s) (${p.fecha})</span><strong>$${p.totalGrupo}</strong></li>`).join("") +
            `</ul>`;
}
/* ----------------------------- Arranque --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMenu();
    refrescarNavSesion();
    initTerminos();
    initForms();
    initContacto();
    initPasswordToggles();
    initCharCounter();
    initCarousel();
    initModal();
    cargarExperienciasGuardadas();
    initRating();
    initDestinosFilter();
    initReservas();
    initOrganizador();
});
