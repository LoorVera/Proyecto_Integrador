# Plan: Mejoras de producto — Ecuador Turismo (landing + páginas internas)

## Contexto
Proyecto académico (ESPOL) con entrega el **sábado 22 de agosto de 2026** (quedan ~4 días desde hoy, 18 de agosto). Es una landing de turismo/organización de viajes con 3 páginas reales (`index.html`, `destinos.html`, `organizador.html`), 100% frontend estático (HTML/CSS/TypeScript compilado a JS), sin backend.

El análisis del proyecto encontró:
- Archivos con errores tipográficos (`css/sytle.css`, `ts/Tsconfig.json`, `sistemap.xml` duplicado de `sitemap.xml`).
- SEO con dominio placeholder (`turismo-ecuador.example.com`) y una imagen OG referenciada que no existe.
- Botones "Reservar" sin funcionalidad (no hacen nada al hacer clic).
- Reseñas/experiencias y el itinerario del organizador se pierden al recargar la página (no hay persistencia).
- Login/registro muestran éxito simulado pero no reflejan ningún estado de sesión en la navegación.
- README desactualizado (no menciona 2 de las 3 páginas existentes).

Dado el plazo ajustado y que el proyecto se mantiene **100% frontend** (decisión del usuario: usar `localStorage` para simular persistencia, sin backend/BaaS), el plan se organiza en fases priorizadas: primero limpieza y SEO (prioridad explícita del usuario), luego funcionalidad rota de mayor impacto, y por último mejoras opcionales si el tiempo alcanza.

## Fase 0 — Limpieza y SEO (prioridad #1)
1. **Eliminar duplicado de sitemap**: borrar `sistemap.xml` (typo), dejar solo `sitemap.xml`.
2. **Renombrar `css/sytle.css` → `css/style.css`** y actualizar el `<link>` en `index.html`, `destinos.html`, `organizador.html`.
3. **Renombrar `ts/Tsconfig.json` → `ts/tsconfig.json`** (nombre estándar) y verificar que el comando de build (`tsc`) siga funcionando.
4. **Corregir metadatos SEO**: reemplazar el dominio placeholder `https://turismo-ecuador.example.com/` en canonical/Open Graph/Twitter Card de las 3 páginas por un dominio real si el usuario tiene uno (GitHub Pages u otro), o dejar URLs relativas como alternativa honesta.
5. **Arreglar imagen OG rota**: o se añade un archivo real en `img/og-ecuador.jpg` (usando una de las imágenes de Unsplash ya usadas en el hero, descargada localmente) o se actualiza el meta tag para apuntar a una URL de imagen que sí exista.
6. **Actualizar `README.md`**: reflejar las 3 páginas reales (`index.html`, `destinos.html`, `organizador.html`), corregir la ruta de CSS (`css/style.css`) y añadir una breve descripción del organizador de viajes y el catálogo de destinos que hoy faltan en el README.

## Fase 1 — Conectar funcionalidad rota (✅ completada 2026-08-18)
Se usó `localStorage` como capa de persistencia simulada, siguiendo el patrón ya existente en `ts/main.ts` (el tema/theme ya se persistía ahí — mismo mecanismo, nuevas claves: `reservas-usuario`, `experiencias-usuario`, `viajes-guardados`, `sesion-usuario`).

1. **Botones "Reservar"** (`index.html`, tabla de precios): `initReservas()` en `ts/main.ts` lee hotel/precio/duración desde la fila de la tabla al hacer clic, guarda la reserva en `localStorage` y la renderiza en un nuevo contenedor `#reservas-guardadas` dentro de la sección `#planes`.
2. **Persistir experiencias compartidas**: `addExperienceCard()` ahora también guarda cada experiencia en `localStorage`; `cargarExperienciasGuardadas()` las rehidrata al cargar `index.html` (las 3 tarjetas hardcodeadas del HTML no se tocan, solo se anteponen las nuevas).
3. **Persistir itinerario del organizador**: el resultado calculado añade un botón "GUARDAR MI PLAN"; `renderizarPlanesGuardados()` muestra la lista guardada en un nuevo contenedor `#planes-guardados` debajo del formulario, en `organizador.html`.
4. **Sesión simulada en el nav**: al enviar login/registro con éxito (`onSuccess` añadido a `bindForm()`), se guarda `{nombre}` en `localStorage` y `refrescarNavSesion()` oculta "INICIO DE SESIÓN"/"REGISTRO" del menú y muestra "Hola, {nombre}" + botón "CERRAR SESIÓN".

## Addendum — Ajustes solicitados tras probar la Fase 1 (2026-08-18)
- **Quitar reservas**: `renderizarReservas()` ahora agrega un botón "Quitar" por reserva (`.btn-quitar` en `css/components.css`); `initReservas()` escucha clics delegados en `#reservas-guardadas` y elimina la reserva del arreglo en `localStorage` por índice.
- **Indicador de sesión junto al logo, no en el menú**: se movió de dentro de `#site-nav .nav-links` a un contenedor nuevo `#nav-sesion-box` (`.header-session` en `css/layout.css`) ubicado justo después del logo en el `header-container` de las 4 páginas — así se ve siempre, sin depender de abrir el menú hamburguesa en móvil. Los enlaces "INICIO DE SESIÓN"/"REGISTRO" del menú se siguen ocultando cuando hay sesión activa.

## Addendum — Checkbox de Términos y Condiciones (2026-08-18)
A pedido del usuario, aprovechando que ya existe `privacidad.html`: se añadió un checkbox obligatorio "He leído y acepto la Política de Privacidad y los Términos y Condiciones" (enlaza a `privacidad.html`) en el formulario de registro (`index.html`). Validado con `initTerminos()` en `ts/main.ts`, registrado antes que `bindForm("register-form", ...)` para poder bloquear el envío con `stopImmediatePropagation()` si no está marcado. Es una aceptación provisional (no hay términos y condiciones dedicados, solo la política de privacidad ya existente).

## Fase 2 — Opcional / si el tiempo alcanza antes del sábado
Solo si las Fases 0 y 1 se completan con margen:
- Página simple de "Mis reservas" que liste lo guardado en `localStorage` (extensión natural de la Fase 1.1).
- Página 404 básica.
- Sección de detalle por destino (hoy las tarjetas de `destinos.html` van directo al organizador genérico).

Estas no son parte del compromiso principal — se mencionan para que quede explícito qué se decidió dejar fuera por el plazo, no que se haya olvidado.

## Archivos principales a modificar
- `ts/main.ts` (única fuente de lógica; los cambios se recompilan a `js/main.js`)
- `index.html`, `destinos.html`, `organizador.html` (referencias a CSS, meta tags, markup nuevo para botones/sección de planes guardados)
- `css/sytle.css` → `css/style.css` (rename + posibles estilos nuevos para confirmaciones/estado de sesión)
- `README.md`
- `sitemap.xml` / eliminar `sistemap.xml`

## Fase 0.5 — Refactor de mantenimiento (no bloqueante, ya aplicado)
- **Modularización de `css/style.css`**: dividido en `css/variables.css` (tokens + reset), `css/layout.css` (header/nav/contenedores), `css/components.css` (botones/tarjetas/formularios/modal/carrusel/páginas internas) y `css/responsive.css` (media queries). Corte hecho sobre los límites de sección ya existentes, sin reescribir reglas, para no alterar el resultado visual. Los 3 HTML cargan los 4 archivos en ese mismo orden vía 4 `<link>`.

## Fase 0.6 — Página nueva: Política de Privacidad (agregada fuera del alcance original, a pedido del usuario)
- **`privacidad.html`**: página nueva con la misma estructura de header/nav/footer que `destinos.html`/`organizador.html`, usando `css/components.css` (clases nuevas `.policy-content`, `.policy-updated`) para el contenido de texto. Contenido tipo plantilla genérica de política de privacidad (introducción, datos recopilados, cookies/localStorage, derechos del usuario, contacto, etc.), sin bloquear el alcance original de las fases 0–2.
- Se agregó un enlace "Política de Privacidad" en el footer de las 4 páginas (`index.html`, `destinos.html`, `organizador.html`, `privacidad.html`) y una entrada en `sitemap.xml`.

## Verificación
- Recompilar TypeScript (`cd ts && tsc`) y confirmar que `js/main.js` se regenera sin errores.
- Abrir `index.html` en el navegador: probar reservar un plan, agregar una experiencia, refrescar la página y confirmar que ambos persisten.
- Probar login/registro y confirmar que el nav cambia a estado "sesión iniciada" y que "Cerrar sesión" lo revierte.
- Abrir `organizador.html`, generar un itinerario, guardarlo, refrescar y confirmar que aparece en la lista de planes guardados.
- Revisar que los 3 `<link rel="stylesheet">` apunten a `css/style.css` y que no haya 404 de assets en la consola del navegador.
- Verificar que `sitemap.xml` es el único archivo de sitemap y que las URLs canónicas/OG ya no apuntan al dominio placeholder.
