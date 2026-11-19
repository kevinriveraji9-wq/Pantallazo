(function () {
  "use strict";
  var C = window.CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = new Intl.NumberFormat(C.locale, { style: "currency", currency: C.moneda, maximumFractionDigits: 0 });
  var money = function (n) { return fmt.format(Math.round(n)).replace(/ /g, ""); };
  var waLink = function (msg) { return "https://wa.me/" + C.whatsapp + (msg ? "?text=" + encodeURIComponent(msg) : ""); };
  var byId = {};
  C.servicios.forEach(function (s) { byId[s.id] = s; });
  var TIPO = { pantalla: ["pantalla", "pantallas"], cuenta: ["cuenta completa", "cuentas completas"] };
  var label = function (s, tipo) {
    if (tipo === "cuenta" && s.pantalla === null) return ["cuenta", "cuentas"];
    return TIPO[tipo];
  };

  /* ---------- shared bits from config ---------- */
  $$("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-msg") || ("Hola " + C.negocio + ", quiero información.")); });
  $$("[data-phone]").forEach(function (a) { a.textContent = C.whatsappVisible; });
  var minimo = Math.min.apply(null, C.servicios.map(function (s) { return s.pantalla || s.cuenta; }));
  $$("[data-desde]").forEach(function (el) { el.textContent = money(minimo); });
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- state ---------- */
  var state = { cart: {}, meses: C.meses[0].meses, nombre: "" };
  try {
    var saved = JSON.parse(localStorage.getItem("pedido") || "null");
    if (saved && saved.cart) {
      Object.keys(saved.cart).forEach(function (k) {
        var p = k.split(":"); var s = byId[p[0]];
        if (s && s[p[1]] != null && saved.cart[k] > 0) state.cart[k] = Math.min(saved.cart[k], 20);
      });
      if (C.meses.some(function (m) { return m.meses === saved.meses; })) state.meses = saved.meses;
    }
  } catch (e) {}
  var save = function () { try { localStorage.setItem("pedido", JSON.stringify({ cart: state.cart, meses: state.meses })); } catch (e) {} };

  /* ---------- price list ---------- */
  var body = $("#menu-body");
  C.servicios.forEach(function (s) {
    var tr = document.createElement("tr");
    var cell = function (tipo, lab) {
      var td = document.createElement("td");
      td.setAttribute("data-l", lab);
      if (s[tipo] == null) { td.innerHTML = '<span class="na">No disponible</span>'; return td; }
      var b = document.createElement("button");
      b.type = "button"; b.className = "add"; b.dataset.key = s.id + ":" + tipo;
      b.setAttribute("aria-label", "Agregar " + label(s, tipo)[0] + " de " + s.nombre + ", " + money(s[tipo]) + " al mes");
      b.innerHTML = "<span>" + money(s[tipo]) + "</span>";
      b.addEventListener("click", function () { change(b.dataset.key, 1); });
      td.appendChild(b); return td;
    };
    var name = document.createElement("td");
    name.innerHTML = '<span class="svc">' + s.nombre + '</span><span class="svc-note">' + s.nota + "</span>";
    tr.appendChild(name);
    tr.appendChild(cell("pantalla", "Una pantalla"));
    tr.appendChild(cell("cuenta", "Cuenta completa"));
    body.appendChild(tr);
  });

  /* ---------- months ---------- */
  var monthsBox = $("#months");
  C.meses.forEach(function (m) {
    var l = document.createElement("label");
    l.innerHTML = '<input type="radio" name="meses" value="' + m.meses + '"><span>' + m.meses + (m.meses === 1 ? " mes" : " meses") +
      (m.descuento ? "<small>" + Math.round(m.descuento * 100) + "% menos</small>" : "<small>sin descuento</small>") + "</span>";
    var i = l.querySelector("input");
    i.checked = m.meses === state.meses;
    i.addEventListener("change", function () { state.meses = m.meses; render(); });
    monthsBox.appendChild(l);
  });
  $("#nombre").addEventListener("input", function (e) { state.nombre = e.target.value.trim(); render(); });

  function change(key, d) {
    var n = (state.cart[key] || 0) + d;
    if (n <= 0) delete state.cart[key]; else state.cart[key] = Math.min(n, 20);
    render();
  }

  /* ---------- ticket ---------- */
  function lines() {
    return Object.keys(state.cart).map(function (k) {
      var p = k.split(":"), s = byId[p[0]], q = state.cart[k];
      return { key: k, s: s, tipo: p[1], q: q, unit: s[p[1]], sub: s[p[1]] * q };
    });
  }
  function totals(ls) {
    var m = C.meses.filter(function (x) { return x.meses === state.meses; })[0];
    var mensual = ls.reduce(function (a, l) { return a + l.sub; }, 0);
    return { mensual: mensual, m: m, total: mensual * m.meses * (1 - m.descuento) };
  }
  function message(ls, t) {
    if (!ls.length) return "Hola " + C.negocio + ", quiero información sobre las pantallas y cuentas.";
    var out = ["Hola " + C.negocio + (state.nombre ? ", soy " + state.nombre : "") + ". Quiero hacer este pedido:", ""];
    ls.forEach(function (l) {
      var w = label(l.s, l.tipo);
      out.push("• " + l.q + " " + (l.q === 1 ? w[0] : w[1]) + " de " + l.s.nombre + " — " + money(l.sub) + "/mes");
    });
    out.push("");
    out.push("Duración: " + t.m.meses + (t.m.meses === 1 ? " mes" : " meses") + (t.m.descuento ? " (" + Math.round(t.m.descuento * 100) + "% de descuento)" : ""));
    out.push("Total: " + money(t.total));
    out.push("");
    out.push("¿Me confirmas disponibilidad y cómo pago?");
    return out.join("\n");
  }

  var itemsEl = $("#items"), emptyEl = $("#empty");
  function render() {
    var ls = lines(), t = totals(ls);
    itemsEl.innerHTML = "";
    ls.forEach(function (l) {
      var w = label(l.s, l.tipo);
      var li = document.createElement("li");
      li.innerHTML = '<span class="what"><strong>' + l.s.nombre + "</strong><span>" + w[0].charAt(0).toUpperCase() + w[0].slice(1) + " · " + money(l.unit) + " al mes</span></span>" +
        '<span class="qty"><button type="button" aria-label="Quitar uno">−</button><output>' + l.q + '</output><button type="button" aria-label="Agregar uno">+</button></span>' +
        '<span class="line-total">' + money(l.sub) + "/mes</span>";
      var bs = li.querySelectorAll("button");
      bs[0].addEventListener("click", function () { change(l.key, -1); });
      bs[1].addEventListener("click", function () { change(l.key, 1); });
      itemsEl.appendChild(li);
    });
    emptyEl.hidden = ls.length > 0;
    $$(".add").forEach(function (b) { b.setAttribute("data-qty", state.cart[b.dataset.key] || 0); });

    $("#total").textContent = money(t.total);
    $("#total-note").textContent = ls.length
      ? "por " + t.m.meses + (t.m.meses === 1 ? " mes" : " meses") + (t.m.descuento ? ", ahorras " + money(t.mensual * t.m.meses * t.m.descuento) : "")
      : "elige al menos una plataforma";
    $("#send").href = waLink(message(ls, t));

    var count = ls.reduce(function (a, l) { return a + l.q; }, 0);
    $("#bar-count").textContent = count + (count === 1 ? " artículo" : " artículos") + " · " + t.m.meses + (t.m.meses === 1 ? " mes" : " meses");
    $("#bar-sum").textContent = money(t.total);
    bar.dataset.has = count > 0 ? "1" : "";
    updateBar();
    stubSize();
    save();
  }

  /* ---------- phone bottom bar ---------- */
  var bar = $("#bar"), ticket = $("#pedido"), precios = $("#precios");
  function updateBar() {
    var vh = window.innerHeight, p = precios.getBoundingClientRect(), t = ticket.getBoundingClientRect();
    var inPrecios = p.top < vh * 0.6 && p.bottom > 0;
    var ticketOnScreen = t.top < vh - 80 && t.bottom > 80;
    bar.classList.toggle("show", !!bar.dataset.has && inPrecios && !ticketOnScreen);
  }
  window.addEventListener("scroll", updateBar, { passive: true });
  window.addEventListener("resize", updateBar);
  function stubSize() { var t = $("#pedido"); t.style.setProperty("--stub-h", $("#stub").offsetHeight + "px"); }
  window.addEventListener("resize", stubSize);

  render();

  /* ---------- hero crossfade ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var imgs = $$(".room img"), cur = 0;
  imgs[0].classList.add("on");
  if (!reduce && imgs.length > 1) {
    setInterval(function () {
      if (document.hidden) return;
      imgs[cur].classList.remove("on");
      cur = (cur + 1) % imgs.length;
      imgs[cur].classList.add("on");
    }, 6000);
  }

  /* ---------- drag row ---------- */
  var row = $("#moments"), prog = $("#prog");
  function updProg() {
    var max = row.scrollWidth - row.clientWidth;
    var vis = row.clientWidth / row.scrollWidth;
    prog.style.width = (vis + (1 - vis) * (max > 0 ? row.scrollLeft / max : 1)) * 100 + "%";
  }
  row.addEventListener("scroll", updProg, { passive: true });
  window.addEventListener("resize", updProg); updProg();
  $$(".arrows button").forEach(function (b) {
    b.addEventListener("click", function () { row.scrollBy({ left: +b.dataset.dir * 312, behavior: reduce ? "auto" : "smooth" }); });
  });
  var drag = null;
  row.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; drag = { x: e.clientX, l: row.scrollLeft }; row.style.scrollSnapType = "none"; });
  window.addEventListener("pointermove", function (e) { if (drag) row.scrollLeft = drag.l - (e.clientX - drag.x); });
  window.addEventListener("pointerup", function () { if (drag) { drag = null; row.style.scrollSnapType = ""; } });
  row.addEventListener("dragstart", function (e) { e.preventDefault(); });

  /* ---------- FAQ drawer ---------- */
  var cards = $$(".fcard button");
  cards.forEach(function (b) {
    b.addEventListener("click", function () {
      cards.forEach(function (o) {
        var open = o === b;
        o.setAttribute("aria-expanded", open);
        document.getElementById(o.getAttribute("aria-controls")).hidden = !open;
      });
    });
  });

  /* ---------- entrances ---------- */
  var rise = $$("[data-rise]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rise.forEach(function (el) { io.observe(el); });
  } else {
    rise.forEach(function (el) { el.classList.add("in"); });
  }
})();
