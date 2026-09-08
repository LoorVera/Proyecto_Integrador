// Mapa interactivo de provincias del Ecuador (amCharts 5), coloreadas por región.
// Script independiente y sin build step: envuelve un widget de terceros
// (amCharts) en vez de la lógica propia del sitio, por eso no vive en ts/main.ts.
//
// Nota: NO se usa chart.set("homeGeoPoint"/"homeZoomLevel") ni chart.goHome():
// esa combinación deja los polígonos con ancho/alto 0 (no se dibuja nada).
// Dejar que el mapa haga su auto-fit por defecto es lo que realmente funciona.
// Tampoco se usa dataItem.get("name"): en series alimentadas con geoJSON el
// nombre de la provincia vive en dataItem.dataContext.name.
(function () {
  "use strict";

  var RESERVAS_KEY = "reservas-usuario";

  function leerArray(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function guardarArray(key, arr) {
    try { window.localStorage.setItem(key, JSON.stringify(arr)); } catch (err) { /* navegación privada */ }
  }

  var regionesData = {
    costa: {
      nombre: "Región Costa",
      descripcion: "Playas paradisíacas, gastronomía deliciosa y clima tropical.",
      color: 0xFF6B6B,
      provincias: ["Guayas", "Manabí", "Esmeraldas", "El Oro", "Los Ríos", "Santa Elena", "Santo Domingo de los Tsáchilas"],
      hoteles: [
        { nombre: "Hotel Oro Verde", ubicacion: "Guayaquil", provincia: "Guayas", precio: "$120/noche", rating: 5, features: ["WiFi", "Piscina", "Spa"] },
        { nombre: "Wyndham Guayaquil", ubicacion: "Guayaquil", provincia: "Guayas", precio: "$95/noche", rating: 4, features: ["WiFi", "Gimnasio"] },
        { nombre: "Hotel Colón Manta", ubicacion: "Manta", provincia: "Manabí", precio: "$85/noche", rating: 4, features: ["Vista al mar", "WiFi"] },
        { nombre: "Palm Beach Hotel", ubicacion: "Salinas", provincia: "Santa Elena", precio: "$110/noche", rating: 4, features: ["Playa", "Piscina"] }
      ]
    },
    sierra: {
      nombre: "Región Sierra",
      descripcion: "Montañas majestuosas, ciudades coloniales y cultura ancestral.",
      color: 0x4ECDC4,
      provincias: ["Pichincha", "Azuay", "Chimborazo", "Imbabura", "Loja", "Cotopaxi", "Carchi", "Cañar", "Bolivar", "Tungurahua"],
      hoteles: [
        { nombre: "Hotel Plaza Grande", ubicacion: "Quito", provincia: "Pichincha", precio: "$180/noche", rating: 5, features: ["Centro histórico", "Gourmet"] },
        { nombre: "Swissôtel Quito", ubicacion: "Quito", provincia: "Pichincha", precio: "$150/noche", rating: 5, features: ["Vista panorámica", "Spa"] },
        { nombre: "Mansión Alcázar", ubicacion: "Cuenca", provincia: "Azuay", precio: "$130/noche", rating: 5, features: ["Colonial", "Jardín"] },
        { nombre: "Hacienda Zuleta", ubicacion: "Imbabura", provincia: "Imbabura", precio: "$200/noche", rating: 5, features: ["Hacienda", "Cabalgatas"] }
      ]
    },
    oriente: {
      nombre: "Región Oriente / Amazonía",
      descripcion: "Selva amazónica, biodiversidad única y culturas indígenas.",
      color: 0x45B7D1,
      provincias: ["Napo", "Pastaza", "Morona Santiago", "Zamora Chinchipe", "Sucumbíos", "Orellana"],
      hoteles: [
        { nombre: "La Selva Eco Lodge", ubicacion: "Napo", provincia: "Napo", precio: "$140/noche", rating: 5, features: ["Ecolodge", "Tours"] },
        { nombre: "Kapawi Ecolodge", ubicacion: "Pastaza", provincia: "Pastaza", precio: "$200/noche", rating: 5, features: ["Remoto", "Cultura Achuar"] },
        { nombre: "Yachana Lodge", ubicacion: "Orellana", provincia: "Orellana", precio: "$175/noche", rating: 5, features: ["Conservación", "Tours"] },
        { nombre: "Napo Wildlife Center", ubicacion: "Yasuní", provincia: "Orellana", precio: "$350/noche", rating: 5, features: ["Lujo", "Vida silvestre"] }
      ]
    },
    insular: {
      nombre: "Región Insular (Galápagos)",
      descripcion: "Islas encantadas con fauna única y paisajes volcánicos.",
      color: 0x96CEB4,
      provincias: ["Galápagos"],
      hoteles: [
        { nombre: "Finch Bay Eco-Hotel", ubicacion: "Santa Cruz", provincia: "Galápagos", precio: "$450/noche", rating: 5, features: ["Frente al mar", "Tours"] },
        { nombre: "Red Mangrove Lodge", ubicacion: "Isabela", provincia: "Galápagos", precio: "$250/noche", rating: 5, features: ["Buceo", "Restaurante"] },
        { nombre: "Iguana Crossing", ubicacion: "Isabela", provincia: "Galápagos", precio: "$220/noche", rating: 4, features: ["Boutique", "Vista al volcán"] },
        { nombre: "Galápagos Safari Camp", ubicacion: "Santa Cruz", provincia: "Galápagos", precio: "$480/noche", rating: 5, features: ["Glamping", "Lujo"] }
      ]
    }
  };

  function getRegion(provincia) {
    for (var regionId in regionesData) {
      if (regionesData[regionId].provincias.indexOf(provincia) !== -1) return regionId;
    }
    return null;
  }

  function estrellas(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function reservarHotel(nombre, precio) {
    var reservas = leerArray(RESERVAS_KEY);
    reservas.push({ hotel: nombre, precio: precio, duracion: "Por noche", fecha: new Date().toLocaleDateString("es-EC") });
    guardarArray(RESERVAS_KEY, reservas);

    var anunciador = document.getElementById("aria-announcer");
    if (anunciador) anunciador.textContent = "Reserva de " + nombre + " guardada. Revísala en tus reservas.";
  }

  function mostrarHoteles(regionId, provincia) {
    var data = regionesData[regionId];
    var panel = document.getElementById("mapaPanelContent");
    if (!data || !panel) return;

    var hoteles = data.hoteles.filter(function (h) { return h.provincia === provincia; });

    var hotelesHtml = hoteles.length > 0
      ? hoteles.map(function (hotel) {
          var featuresHtml = hotel.features.map(function (f) { return "<span class=\"mapa-feature\">" + f + "</span>"; }).join("");
          return (
            "<div class=\"mapa-hotel-card\">" +
            "<div class=\"mapa-hotel-header\">" +
            "<span class=\"hotel-name\">" + hotel.nombre + "</span>" +
            "<span class=\"mapa-hotel-price\">" + hotel.precio + "</span>" +
            "</div>" +
            "<p class=\"hotel-location\">📍 " + hotel.ubicacion + "</p>" +
            "<p class=\"mapa-hotel-rating\" aria-label=\"" + hotel.rating + " de 5 estrellas\">" + estrellas(hotel.rating) + "</p>" +
            "<div class=\"mapa-hotel-features\">" + featuresHtml + "</div>" +
            "<button type=\"button\" class=\"btn-reserve mapa-book-btn\" data-hotel=\"" + hotel.nombre.replace(/"/g, "&quot;") + "\" data-precio=\"" + hotel.precio + "\">Reservar ahora</button>" +
            "</div>"
          );
        }).join("")
      : "<div class=\"mapa-placeholder\"><p>Todavía no tenemos hoteles cargados en " + provincia + ". Prueba con otra provincia de la " + data.nombre + ".</p></div>";

    panel.innerHTML =
      "<div class=\"mapa-region-header\">" +
      "<h2 id=\"mapa-panel-title\" class=\"box-title\"><span>" + provincia + "</span></h2>" +
      "<p class=\"mapa-region-tag\">" + data.nombre + "</p>" +
      "</div>" +
      "<div class=\"mapa-stats\">" +
      "<div class=\"mapa-stat-item\"><span class=\"mapa-stat-value\">" + hoteles.length + "</span><span class=\"mapa-stat-label\">Hoteles</span></div>" +
      "<div class=\"mapa-stat-item\"><span class=\"mapa-stat-value\">" + data.provincias.length + "</span><span class=\"mapa-stat-label\">Provincias en la región</span></div>" +
      "</div>" +
      "<h3 class=\"org-subtitle\">Hoteles en " + provincia + "</h3>" +
      hotelesHtml +
      "<button type=\"button\" class=\"btn-quitar mapa-reset-btn\" id=\"mapaResetBtn\">Ver todo el mapa</button>";

    panel.querySelectorAll(".mapa-book-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        reservarHotel(btn.dataset.hotel, btn.dataset.precio);
      });
    });

    var resetBtn = document.getElementById("mapaResetBtn");
    if (resetBtn) resetBtn.addEventListener("click", resetMapa);
  }

  var activePolygon = null;

  function resetMapa() {
    if (activePolygon) { activePolygon.states.applyAnimate("default"); activePolygon = null; }
    var panel = document.getElementById("mapaPanelContent");
    if (panel) panel.innerHTML = "<div class=\"mapa-placeholder\"><p>Haz clic en una provincia del mapa para ver los hoteles de su región.</p></div>";
  }

  function initMapa() {
    var root = am5.Root.new("mapdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5map.MapChart.new(root, { panX: "translateX", panY: "translateY", projection: am5map.geoMercator() })
    );

    var polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_ecuadorLow, exclude: ["AQ"] })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xcccccc),
      stroke: am5.color(0xffffff),
      strokeWidth: 1
    });

    polygonSeries.mapPolygons.template.states.create("hover", { fill: am5.color(0xffd700), strokeWidth: 2 });
    polygonSeries.mapPolygons.template.states.create("active", { strokeWidth: 3, stroke: am5.color(0x0b1329) });

    polygonSeries.mapPolygons.template.adapters.add("fill", function (fill, target) {
      var name = target.dataItem && target.dataItem.dataContext && target.dataItem.dataContext.name;
      var regionId = name ? getRegion(name) : null;
      return regionId ? am5.color(regionesData[regionId].color) : fill;
    });

    polygonSeries.mapPolygons.template.events.on("click", function (ev) {
      var name = ev.target.dataItem && ev.target.dataItem.dataContext && ev.target.dataItem.dataContext.name;
      var regionId = name ? getRegion(name) : null;
      if (!regionId) return;

      if (activePolygon && activePolygon !== ev.target) activePolygon.states.applyAnimate("default");
      ev.target.states.applyAnimate("active");
      activePolygon = ev.target;

      mostrarHoteles(regionId, name);
    });

    chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    chart.appear(1000, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMapa);
  } else {
    initMapa();
  }
})();
