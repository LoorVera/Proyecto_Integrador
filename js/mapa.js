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
        { nombre: "Sonesta Hotel Guayaquil", ubicacion: "Guayaquil", provincia: "Guayas", precio: "$100/noche", rating: 4, features: ["WiFi", "Restaurante"] },
        { nombre: "Hotel del Parque", ubicacion: "Guayaquil", provincia: "Guayas", precio: "$90/noche", rating: 4, features: ["Histórico", "WiFi"] },
        { nombre: "Hotel Colón Manta", ubicacion: "Manta", provincia: "Manabí", precio: "$85/noche", rating: 4, features: ["Vista al mar", "WiFi"] },
        { nombre: "Hotel Balandra", ubicacion: "Manta", provincia: "Manabí", precio: "$70/noche", rating: 4, features: ["Frente al mar", "WiFi"] },
        { nombre: "Barceló Colón Miramar", ubicacion: "Manta", provincia: "Manabí", precio: "$130/noche", rating: 5, features: ["Piscina", "Spa"] },
        { nombre: "Hostería Mandala", ubicacion: "Puerto López", provincia: "Manabí", precio: "$60/noche", rating: 4, features: ["Ecológico", "Playa"] },
        { nombre: "Hotel Casino del Sol", ubicacion: "Esmeraldas", provincia: "Esmeraldas", precio: "$75/noche", rating: 4, features: ["Piscina", "WiFi"] },
        { nombre: "Palma Real Hotel", ubicacion: "Atacames", provincia: "Esmeraldas", precio: "$65/noche", rating: 3, features: ["Playa", "Bar"] },
        { nombre: "Hostería Le Château", ubicacion: "Same", provincia: "Esmeraldas", precio: "$80/noche", rating: 4, features: ["Playa", "Restaurante"] },
        { nombre: "Cocobongo Beach Hotel", ubicacion: "Tonsupa", provincia: "Esmeraldas", precio: "$70/noche", rating: 3, features: ["Playa", "Piscina"] },
        { nombre: "Oro Hotel", ubicacion: "Machala", provincia: "El Oro", precio: "$65/noche", rating: 4, features: ["WiFi", "Restaurante"] },
        { nombre: "Aloha Hotel", ubicacion: "Machala", provincia: "El Oro", precio: "$55/noche", rating: 3, features: ["WiFi", "Piscina"] },
        { nombre: "Puerto Jelí Resort", ubicacion: "Puerto Jelí", provincia: "El Oro", precio: "$90/noche", rating: 4, features: ["Playa", "Piscina"] },
        { nombre: "Hostal Regional", ubicacion: "Machala", provincia: "El Oro", precio: "$40/noche", rating: 3, features: ["Económico", "WiFi"] },
        { nombre: "Hotel El Rey", ubicacion: "Babahoyo", provincia: "Los Ríos", precio: "$50/noche", rating: 3, features: ["WiFi", "Aire acondicionado"] },
        { nombre: "Hotel Quevedo Internacional", ubicacion: "Quevedo", provincia: "Los Ríos", precio: "$60/noche", rating: 4, features: ["Piscina", "WiFi"] },
        { nombre: "Hostal Río Babahoyo", ubicacion: "Babahoyo", provincia: "Los Ríos", precio: "$45/noche", rating: 3, features: ["Económico", "WiFi"] },
        { nombre: "Hotel Olímpico", ubicacion: "Quevedo", provincia: "Los Ríos", precio: "$55/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Palm Beach Hotel", ubicacion: "Salinas", provincia: "Santa Elena", precio: "$110/noche", rating: 4, features: ["Playa", "Piscina"] },
        { nombre: "Hotel Barceló Salinas", ubicacion: "Salinas", provincia: "Santa Elena", precio: "$140/noche", rating: 5, features: ["Playa", "Spa"] },
        { nombre: "Hostería Montañita Beach", ubicacion: "Montañita", provincia: "Santa Elena", precio: "$50/noche", rating: 4, features: ["Surf", "Bar"] },
        { nombre: "Hotel Cautivo", ubicacion: "Ayangue", provincia: "Santa Elena", precio: "$65/noche", rating: 4, features: ["Playa", "Vista al mar"] },
        { nombre: "Hotel Zaracay", ubicacion: "Santo Domingo", provincia: "Santo Domingo de los Tsáchilas", precio: "$70/noche", rating: 4, features: ["Piscina", "Jardines"] },
        { nombre: "Hotel Del Toachi", ubicacion: "Santo Domingo", provincia: "Santo Domingo de los Tsáchilas", precio: "$55/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Sabana Real Hotel", ubicacion: "Santo Domingo", provincia: "Santo Domingo de los Tsáchilas", precio: "$60/noche", rating: 3, features: ["Piscina", "WiFi"] },
        { nombre: "Hotel Diana Real", ubicacion: "Santo Domingo", provincia: "Santo Domingo de los Tsáchilas", precio: "$45/noche", rating: 3, features: ["Económico", "WiFi"] }
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
        { nombre: "JW Marriott Quito", ubicacion: "Quito", provincia: "Pichincha", precio: "$160/noche", rating: 5, features: ["Spa", "Gimnasio"] },
        { nombre: "Hotel Casona de la Ronda", ubicacion: "Quito", provincia: "Pichincha", precio: "$95/noche", rating: 4, features: ["Centro histórico", "Colonial"] },
        { nombre: "Mansión Alcázar", ubicacion: "Cuenca", provincia: "Azuay", precio: "$130/noche", rating: 5, features: ["Colonial", "Jardín"] },
        { nombre: "Hotel Santa Lucía", ubicacion: "Cuenca", provincia: "Azuay", precio: "$100/noche", rating: 4, features: ["Colonial", "Restaurante"] },
        { nombre: "Hotel Victoria", ubicacion: "Cuenca", provincia: "Azuay", precio: "$110/noche", rating: 4, features: ["Vista al río", "WiFi"] },
        { nombre: "Hostal Casa San Rafael", ubicacion: "Cuenca", provincia: "Azuay", precio: "$60/noche", rating: 3, features: ["Económico", "WiFi"] },
        { nombre: "Mansión Santa Isabella", ubicacion: "Riobamba", provincia: "Chimborazo", precio: "$85/noche", rating: 4, features: ["Colonial", "Restaurante"] },
        { nombre: "Hotel Abraspungo", ubicacion: "Riobamba", provincia: "Chimborazo", precio: "$95/noche", rating: 4, features: ["Vista al volcán", "Jardines"] },
        { nombre: "Hostería Andaluza", ubicacion: "Riobamba", provincia: "Chimborazo", precio: "$70/noche", rating: 3, features: ["Hacienda", "WiFi"] },
        { nombre: "Hotel Zeus", ubicacion: "Riobamba", provincia: "Chimborazo", precio: "$55/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Hacienda Zuleta", ubicacion: "Imbabura", provincia: "Imbabura", precio: "$200/noche", rating: 5, features: ["Hacienda", "Cabalgatas"] },
        { nombre: "Hotel Otavalo", ubicacion: "Otavalo", provincia: "Imbabura", precio: "$65/noche", rating: 4, features: ["Mercado artesanal", "WiFi"] },
        { nombre: "Hostería Puertolago", ubicacion: "San Pablo del Lago", provincia: "Imbabura", precio: "$90/noche", rating: 4, features: ["Vista al lago", "Piscina"] },
        { nombre: "Hotel Ali Shungu", ubicacion: "Otavalo", provincia: "Imbabura", precio: "$55/noche", rating: 4, features: ["Jardines", "Restaurante"] },
        { nombre: "Hotel Podocarpus", ubicacion: "Loja", provincia: "Loja", precio: "$65/noche", rating: 4, features: ["WiFi", "Restaurante"] },
        { nombre: "Grand Hotel Loja", ubicacion: "Loja", provincia: "Loja", precio: "$80/noche", rating: 4, features: ["Piscina", "Gimnasio"] },
        { nombre: "Hostal Vilcabamba Garden", ubicacion: "Vilcabamba", provincia: "Loja", precio: "$45/noche", rating: 4, features: ["Naturaleza", "Jardines"] },
        { nombre: "Hotel Christye's Palace", ubicacion: "Loja", provincia: "Loja", precio: "$50/noche", rating: 3, features: ["Económico", "WiFi"] },
        { nombre: "Hacienda San Agustín de Callo", ubicacion: "Cotopaxi", provincia: "Cotopaxi", precio: "$220/noche", rating: 5, features: ["Hacienda", "Vista al volcán"] },
        { nombre: "Hostería La Ciénega", ubicacion: "Lasso", provincia: "Cotopaxi", precio: "$90/noche", rating: 4, features: ["Colonial", "Jardines"] },
        { nombre: "Hotel Rodelu", ubicacion: "Latacunga", provincia: "Cotopaxi", precio: "$55/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Secret Garden Cotopaxi", ubicacion: "Cotopaxi", provincia: "Cotopaxi", precio: "$75/noche", rating: 4, features: ["Vista al volcán", "Caminatas"] },
        { nombre: "Hotel Sara Espíndola", ubicacion: "Tulcán", provincia: "Carchi", precio: "$45/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Hotel Palacio Imperial", ubicacion: "Tulcán", provincia: "Carchi", precio: "$50/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Hostería Rumichaca", ubicacion: "Tulcán", provincia: "Carchi", precio: "$40/noche", rating: 3, features: ["Frontera", "Económico"] },
        { nombre: "Hotel Alejandra", ubicacion: "Tulcán", provincia: "Carchi", precio: "$42/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Hostería Dumapara", ubicacion: "Cañar", provincia: "Cañar", precio: "$55/noche", rating: 3, features: ["Naturaleza", "WiFi"] },
        { nombre: "Hotel Cañari", ubicacion: "Azogues", provincia: "Cañar", precio: "$45/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Posada Ingapirca", ubicacion: "Ingapirca", provincia: "Cañar", precio: "$60/noche", rating: 4, features: ["Arqueología", "Vista panorámica"] },
        { nombre: "Hotel Gran Cañar", ubicacion: "Azogues", provincia: "Cañar", precio: "$48/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Hotel Bolívar Internacional", ubicacion: "Guaranda", provincia: "Bolivar", precio: "$45/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Hostería Salinas de Guaranda", ubicacion: "Salinas de Guaranda", provincia: "Bolivar", precio: "$55/noche", rating: 4, features: ["Comunitario", "Quesos artesanales"] },
        { nombre: "Hotel La Colina", ubicacion: "Guaranda", provincia: "Bolivar", precio: "$40/noche", rating: 3, features: ["Económico", "WiFi"] },
        { nombre: "Hostal Las Colinas", ubicacion: "Guaranda", provincia: "Bolivar", precio: "$38/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Hotel Ambato Palace", ubicacion: "Ambato", provincia: "Tungurahua", precio: "$65/noche", rating: 4, features: ["WiFi", "Restaurante"] },
        { nombre: "Quinta Loren", ubicacion: "Ambato", provincia: "Tungurahua", precio: "$70/noche", rating: 4, features: ["Jardines", "Piscina"] },
        { nombre: "Hostería Runa Wasi", ubicacion: "Baños de Agua Santa", provincia: "Tungurahua", precio: "$50/noche", rating: 4, features: ["Vista al volcán", "Aguas termales"] },
        { nombre: "Hotel Sangay Spa", ubicacion: "Baños de Agua Santa", provincia: "Tungurahua", precio: "$85/noche", rating: 4, features: ["Spa", "Aguas termales"] }
      ]
    },
    oriente: {
      nombre: "Región Oriente / Amazonía",
      descripcion: "Selva amazónica, biodiversidad única y culturas indígenas.",
      color: 0x45B7D1,
      provincias: ["Napo", "Pastaza", "Morona Santiago", "Zamora Chinchipe", "Sucumbíos", "Orellana"],
      hoteles: [
        { nombre: "La Selva Eco Lodge", ubicacion: "Napo", provincia: "Napo", precio: "$140/noche", rating: 5, features: ["Ecolodge", "Tours"] },
        { nombre: "Hakuna Matata Lodge", ubicacion: "Cotundo", provincia: "Napo", precio: "$120/noche", rating: 4, features: ["Naturaleza", "Cabalgatas"] },
        { nombre: "Cotococha Amazon Lodge", ubicacion: "Tena", provincia: "Napo", precio: "$150/noche", rating: 4, features: ["Río Napo", "Tours"] },
        { nombre: "Hotel Christian's Palace", ubicacion: "Tena", provincia: "Napo", precio: "$45/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Kapawi Ecolodge", ubicacion: "Pastaza", provincia: "Pastaza", precio: "$200/noche", rating: 5, features: ["Remoto", "Cultura Achuar"] },
        { nombre: "Hotel Puyo Amazónico", ubicacion: "Puyo", provincia: "Pastaza", precio: "$55/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Turingia Hotel", ubicacion: "Puyo", provincia: "Pastaza", precio: "$60/noche", rating: 4, features: ["Jardines", "Piscina"] },
        { nombre: "Hostería Safari", ubicacion: "Puyo", provincia: "Pastaza", precio: "$65/noche", rating: 4, features: ["Naturaleza", "Tours"] },
        { nombre: "Hotel Español", ubicacion: "Macas", provincia: "Morona Santiago", precio: "$45/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Hostal Casa Blanca", ubicacion: "Macas", provincia: "Morona Santiago", precio: "$40/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Manshi Lodge", ubicacion: "Macas", provincia: "Morona Santiago", precio: "$90/noche", rating: 4, features: ["Selva", "Tours"] },
        { nombre: "Hotel Peñón del Oriente", ubicacion: "Macas", provincia: "Morona Santiago", precio: "$50/noche", rating: 3, features: ["Vista panorámica", "WiFi"] },
        { nombre: "Hotel Copalinga", ubicacion: "Zamora", provincia: "Zamora Chinchipe", precio: "$95/noche", rating: 4, features: ["Aviturismo", "Naturaleza"] },
        { nombre: "Hotel Maguna", ubicacion: "Zamora", provincia: "Zamora Chinchipe", precio: "$45/noche", rating: 3, features: ["WiFi", "Económico"] },
        { nombre: "Hostal Seyma", ubicacion: "Zamora", provincia: "Zamora Chinchipe", precio: "$40/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Cabañas Yankuam", ubicacion: "Zamora", provincia: "Zamora Chinchipe", precio: "$70/noche", rating: 4, features: ["Cascadas", "Naturaleza"] },
        { nombre: "La Selva Jungle Lodge Sucumbíos", ubicacion: "Nueva Loja", provincia: "Sucumbíos", precio: "$110/noche", rating: 4, features: ["Selva", "Tours"] },
        { nombre: "Hotel El Cofán", ubicacion: "Nueva Loja", provincia: "Sucumbíos", precio: "$50/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Hotel D'Mario", ubicacion: "Nueva Loja", provincia: "Sucumbíos", precio: "$45/noche", rating: 3, features: ["Económico", "WiFi"] },
        { nombre: "Sacha Lodge Sucumbíos", ubicacion: "Río Napo", provincia: "Sucumbíos", precio: "$180/noche", rating: 5, features: ["Reserva natural", "Torre de observación"] },
        { nombre: "Yachana Lodge", ubicacion: "Orellana", provincia: "Orellana", precio: "$175/noche", rating: 5, features: ["Conservación", "Tours"] },
        { nombre: "Napo Wildlife Center", ubicacion: "Yasuní", provincia: "Orellana", precio: "$350/noche", rating: 5, features: ["Lujo", "Vida silvestre"] },
        { nombre: "Hotel La Misión", ubicacion: "Francisco de Orellana", provincia: "Orellana", precio: "$60/noche", rating: 3, features: ["WiFi", "Restaurante"] },
        { nombre: "Hotel Auca", ubicacion: "Francisco de Orellana", provincia: "Orellana", precio: "$50/noche", rating: 3, features: ["Económico", "WiFi"] }
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
    if (typeof mixpanel !== "undefined") mixpanel.track("hotel_book_clicked", { name: nombre });
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
      cursorOverStyle: "pointer",
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

      if (typeof mixpanel !== "undefined") mixpanel.track("province_clicked", { provincia: name });
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
