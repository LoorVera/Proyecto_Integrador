# 🇪🇨 Ecuador Turismo — Semana 2

Portal turístico semántico, accesible y responsive, con validación de formularios en TypeScript.

## 📁 Estructura
```
index.html        → HTML semántico + ARIA + SEO
css/styles.css    → CSS con design tokens y mobile-first
ts/main.ts        → Código TypeScript (validaciones)
js/main.js        → TS compilado a JavaScript
robots.txt        → SEO técnico
```

## ▶️ Uso
1. Clona el repositorio y abre `index.html` en tu navegador (doble clic).
2. Prueba los formularios: los errores aparecen en tiempo real (al salir del campo o al escribir).

## 🛠️ Compilar TypeScript
```bash
npm install -g typescript   # solo la primera vez
cd ts
tsc                         # genera ../js/main.js
```
