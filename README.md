# 🇪🇨 Ecuador Turismo

Portal turístico semántico, accesible y responsive, con validación de formularios en TypeScript.

## 📁 Estructura
```
index.html         → Landing principal: carrusel de destinos, experiencias de viajeros,
                      planes de pago, login, registro y contacto
destinos.html       → Catálogo de destinos filtrable por región
organizador.html    → Organizador de viaje: calcula presupuesto e itinerario día a día
css/variables.css   → Design tokens (colores, tipografía, espaciado) y reset base
css/layout.css      → Header, nav y contenedores estructurales (main, footer)
css/components.css  → Botones, tarjetas, formularios, modal, carrusel y estilos de páginas internas
css/responsive.css  → Media queries (mobile-first)
ts/main.ts          → Código TypeScript (validaciones, carrusel, menú, filtros, organizador)
js/main.js          → TS compilado a JavaScript
robots.txt          → SEO técnico
sitemap.xml         → Mapa del sitio para buscadores
```

## ▶️ Uso
1. Clona el repositorio y abre `index.html` en tu navegador (doble clic).
2. Navega a `destinos.html` para explorar el catálogo o a `organizador.html` para planificar un viaje.
3. Prueba los formularios: los errores aparecen en tiempo real (al salir del campo o al escribir).

## 🛠️ Compilar TypeScript
```bash
npm install -g typescript   # solo la primera vez
cd ts
tsc                         # genera ../js/main.js
```
