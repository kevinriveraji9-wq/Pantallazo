(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var color = function (c) { return /^#[0-9a-f]{6}$/i.test(c) ? c : "#FFC83D"; };

  function load() {
    return fetch("api.php?r=catalogo", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
  }
  load().then(init).catch(function () {
    $("#loading").textContent = "No pudimos cargar el catálogo. Escríbenos por WhatsApp y te pasamos los precios.";
    reveal();
  });

  function init(C) {
    var fmt = new Intl.NumberFormat(C.locale || "es-CO", { style: "currency", currency: C.moneda || "COP", maximumFractionDigits: 0 });
    var money = function (n) { return fmt.format(Math.round(n)).replace(/ /g, ""); };
    var pct = function (x) { return Math.round(x * 100) + " %"; };
    var waLink = function (msg) { return "https://wa.me/" + C.whatsapp + (msg ? "?text=" + encodeURIComponent(msg) : ""); };
    var mesTxt = function (m) { return m + (m === 1 ? " mes" : " meses"); };
    var productos = C.productos.filter(function (p) { return p.activo !== false; });
    var byId = {}; productos.forEach(function (p) { byId[p.id] = p; });
    var mesesBy = {}; C.meses.forEach(function (m) { mesesBy[m.meses] = m; });
    var opOf = function (p, oid) { return p.opciones.filter(function (o) { return o.id === oid; })[0]; };
    var priceOf = function (op, m) { return op.precio * m * (1 - mesesBy[m].descuento); };
    var disponible = function (op) { return op.stock === null || op.stock === undefined || op.stock > 0; };

    /* ---------- texts ---------- */
    $$("[data-negocio]").forEach(function (el) { el.textContent = C.negocio; });
    $$("[data-horario]").forEach(function (el) { el.textContent = C.horario; });
    $$("[data-phone]").forEach(function (el) { el.textContent = C.whatsappVisible; });
    $$("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-msg") || ("Hola " + C.negocio + ", quiero información sobre las pantallas y cuentas.")); });
    var precios = []; productos.forEach(function (p) { p.opciones.forEach(function (o) { if (disponible(o)) precios.push(o.precio); }); });
    if (precios.length) $$("[data-desde]").forEach(function (el) { el.textContent = money(Math.min.apply(null, precios)); });
    $("#year").textContent = new Date().getFullYear();
    if (C.comboDescuento > 0) {
      $("#promo").textContent = "Lleva 2 o más plataformas: " + pct(C.comboDescuento) + " de descuento";
      $("#combo-t").textContent = "Elige 2 o más plataformas y obtienes " + pct(C.comboDescuento) + " de descuento en tu pedido.";
    } else { $("#promo").hidden = true; $("#combo").hidden = true; }

    /* ---------- hero wall ---------- */
    var wall = $("#wall"), cols = [[], [], [], []], variants = ["a", "d", "o"];
    productos.forEach(function (p, i) { cols[i % 4].push(p); });
    cols.forEach(function (list, ci) {
      var col = document.createElement("div"); col.className = "col";
      var html = list.map(function (p, j) {
        var min = Math.min.apply(null, p.opciones.map(function (o) { return o.precio; }));
        return '<div class="tile ' + variants[(ci + j) % 3] + '"><small>desde ' + money(min) + "/mes</small>" + esc(p.nombre) + "</div>";
      }).join("");
      col.innerHTML = html + html;
      wall.appendChild(col);
    });

    /* ---------- cart state ---------- */
    var cart = {};
    try {
      var saved = JSON.parse(localStorage.getItem("pedido-v3") || "{}");
      Object.keys(saved).forEach(function (k) {
        var x = k.split(":"), p = byId[x[0]], op = p && opOf(p, x[1]);
        if (op && mesesBy[x[2]] && saved[k] > 0) cart[k] = Math.min(saved[k], 20);
      });
    } catch (e) {}
    var save = function () { try { localStorage.setItem("pedido-v3", JSON.stringify(cart)); } catch (e) {} };
    var enCarrito = function (pid, oid) {
      return Object.keys(cart).reduce(function (a, k) { var x = k.split(":"); return x[0] === pid && x[1] === oid ? a + cart[k] : a; }, 0);
    };
    var libre = function (p, op) { return op.stock === null || op.stock === undefined ? Infinity : op.stock - enCarrito(p.id, op.id); };

    /* ---------- catalog by category ---------- */
    var cats = $("#cats"); cats.innerHTML = "";
    var chips = $("#chips"), cards = [], sections = [];
    C.categorias.forEach(function (cat) {
      var lista = productos.filter(function (p) { return p.categoria === cat.id; });
      if (!lista.length) return;
      var ch = document.createElement("button");
      ch.type = "button"; ch.className = "chip"; ch.dataset.f = cat.id; ch.setAttribute("aria-pressed", "false");
      ch.innerHTML = esc(cat.nombre) + "<small>" + lista.length + "</small>";
      chips.appendChild(ch);

      var sec = document.createElement("section");
      sec.className = "cat"; sec.id = "cat-" + cat.id; sec.dataset.cat = cat.id;
      sec.innerHTML = '<div class="cat-h"><h3>' + esc(cat.nombre) + "</h3><span>" + lista.length + (lista.length === 1 ? " plataforma" : " plataformas") + '</span></div><div class="grid"></div>';
      var grid = $(".grid", sec);
      lista.forEach(function (p, idx) { var c = card(p, idx); grid.appendChild(c); cards.push(c); });
      cats.appendChild(sec); sections.push(sec);
    });

    function card(p, idx) {
      var abiertas = p.opciones.filter(disponible);
      var op = abiertas[0] || p.opciones[0];
      var agotado = !abiertas.length;
      var el = document.createElement("article");
      el.className = "prod" + (agotado ? " agotado" : "");
      el.setAttribute("data-rise", ""); el.style.setProperty("--i", idx % 4);
      el.dataset.cat = p.categoria; el.dataset.name = (p.nombre + " " + p.nota).toLowerCase();
      var seg = p.opciones.length > 1
        ? '<div class="seg" role="group" aria-label="Tipo de acceso" style="grid-template-columns:repeat(' + p.opciones.length + ',1fr)">' +
          p.opciones.map(function (o) { return '<button type="button" data-o="' + esc(o.id) + '" aria-pressed="' + (o === op) + '">' + esc(o.nombre) + "</button>"; }).join("") + "</div>"
        : '<div class="seg-one">' + esc(op.nombre) + "</div>";
      var tag = agotado ? '<span class="tag out">Agotado</span>' : p.popular ? '<span class="tag">Más pedido</span>' : "<span></span>";
      el.innerHTML =
        '<div class="prod-top" style="--pc:' + color(p.color) + '">' + tag +
        '<h3 class="prod-name"><span class="dot" aria-hidden="true"></span>' + esc(p.nombre) + "</h3></div>" +
        '<div class="prod-body"><p class="prod-note">' + esc(p.nota || "") + ' <span class="stock" data-stock></span></p>' + seg + '<div class="rows"></div>' +
        (agotado ? '<a class="btn btn-ghost" style="min-height:44px;font-size:14px" target="_blank" rel="noopener" href="' + esc(waLink("Hola " + C.negocio + ", ¿cuándo vuelve a haber " + p.nombre + "?")) + '">Avísame cuando haya</a>' : "") + "</div>";
      var rows = $(".rows", el), stockEl = $("[data-stock]", el);
      function draw() {
        var queda = libre(p, op);
        stockEl.className = "stock" + (op.stock === null || op.stock === undefined ? "" : queda <= 0 ? " out" : queda <= 3 ? " low" : "");
        stockEl.textContent = op.stock === null || op.stock === undefined ? "" : op.stock <= 0 ? "· Agotado" : queda <= 0 ? "· Ya tienes todas las disponibles" : queda <= 3 ? "· Quedan " + queda : "";
        rows.innerHTML = "";
        C.meses.forEach(function (m) {
          var full = op.precio * m.meses, price = priceOf(op, m.meses);
          var r = document.createElement("div"); r.className = "row" + (queda <= 0 ? " out" : "");
          r.innerHTML = '<div class="row-l"><span>' + mesTxt(m.meses) + (m.descuento ? '<em class="save">−' + pct(m.descuento) + "</em>" : "") + "</span>" +
            "<strong>" + money(price) + "</strong>" + (m.descuento ? "<s>" + money(full) + "</s>" : "") + "</div>";
          var b = document.createElement("button");
          b.type = "button"; b.className = "add"; b.disabled = queda <= 0;
          b.setAttribute("aria-label", (queda <= 0 ? "Agotado: " : "Agregar ") + p.nombre + ", " + op.nombre + " por " + mesTxt(m.meses) + ", " + money(price));
          b.innerHTML = '<svg><use href="#i-plus"/></svg>';
          b.addEventListener("click", function () {
            if (libre(p, op) <= 0) return;
            add(p.id + ":" + op.id + ":" + m.meses, 1);
            toast(p.nombre + " · " + op.nombre + " · " + mesTxt(m.meses) + " agregado");
          });
          r.appendChild(b); rows.appendChild(r);
        });
      }
      $$(".seg button", el).forEach(function (b) {
        b.addEventListener("click", function () {
          op = opOf(p, b.dataset.o);
          $$(".seg button", el).forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
          draw();
        });
      });
      el._draw = draw;
      draw();
      return el;
    }

    /* search + category filter */
    var filtro = "todo";
    function applyFilter() {
      var q = $("#q").value.trim().toLowerCase(), total = 0;
      sections.forEach(function (sec) {
        var shown = 0;
        $$(".prod", sec).forEach(function (c) {
          var ok = !q || c.dataset.name.indexOf(q) > -1;
          c.hidden = !ok; if (ok) { shown++; c.classList.add("in"); }
        });
        sec.hidden = !shown || (filtro !== "todo" && sec.dataset.cat !== filtro);
        if (!sec.hidden) total += shown;
      });
      $("#empty-grid").style.display = total ? "none" : "block";
    }
    $("#q").addEventListener("input", applyFilter);
    $$(".chip", chips).forEach(function (ch) {
      ch.addEventListener("click", function () {
        filtro = ch.dataset.f;
        $$(".chip", chips).forEach(function (o) { o.setAttribute("aria-pressed", o === ch); });
        applyFilter();
        var top = $("#chips").getBoundingClientRect().top + window.scrollY - 90;
        if (window.scrollY > top) window.scrollTo({ top: top });
      });
    });

    /* ---------- cart ---------- */
    function add(key, d) {
      var x = key.split(":"), p = byId[x[0]], op = opOf(p, x[1]);
      if (d > 0 && libre(p, op) <= 0) { toast("No hay más disponibles de " + p.nombre + " · " + op.nombre); return; }
      var n = (cart[key] || 0) + d;
      if (n <= 0) delete cart[key]; else cart[key] = Math.min(n, 20);
      render();
    }
    function lines() {
      return Object.keys(cart).map(function (k) {
        var x = k.split(":"), p = byId[x[0]], op = opOf(p, x[1]), m = +x[2], q = cart[k];
        return { key: k, p: p, op: op, m: m, q: q, sub: priceOf(op, m) * q };
      });
    }
    function totals(ls) {
      var sub = ls.reduce(function (a, l) { return a + l.sub; }, 0);
      var distinct = {}; ls.forEach(function (l) { distinct[l.p.id] = 1; });
      var combo = C.comboDescuento > 0 && Object.keys(distinct).length >= 2 ? sub * C.comboDescuento : 0;
      return { sub: sub, combo: combo, total: sub - combo, count: ls.reduce(function (a, l) { return a + l.q; }, 0) };
    }
    function message(ls, t) {
      if (!ls.length) return "Hola " + C.negocio + ", quiero información sobre las pantallas y cuentas.";
      var name = $("#nombre").value.trim();
      var out = ["Hola " + C.negocio + (name ? ", soy " + name : "") + ". Quiero hacer este pedido:", ""];
      ls.forEach(function (l) { out.push("• " + l.p.nombre + " — " + l.op.nombre + " × " + l.q + " · " + mesTxt(l.m) + ": " + money(l.sub)); });
      out.push("");
      if (t.combo) { out.push("Subtotal: " + money(t.sub)); out.push("Descuento combo (" + pct(C.comboDescuento) + "): −" + money(t.combo)); }
      out.push("Total: " + money(t.total));
      out.push(""); out.push("¿Me confirmas disponibilidad y cómo pago?");
      return out.join("\n");
    }

    var body = $("#d-body");
    function render() {
      var ls = lines(), t = totals(ls);
      if (!ls.length) {
        body.innerHTML = '<div class="d-empty"><svg><use href="#i-cart"/></svg>Tu pedido está vacío.<br>Agrega una plataforma del catálogo.</div>';
      } else {
        body.innerHTML = "";
        ls.forEach(function (l) {
          var it = document.createElement("div"); it.className = "item";
          it.innerHTML = '<div class="item-sw" style="--pc:' + color(l.p.color) + '">' + esc(l.p.nombre.charAt(0)) + "</div>" +
            '<div class="item-t"><strong>' + esc(l.p.nombre) + "</strong><span>" + esc(l.op.nombre) + " · " + mesTxt(l.m) + "</span></div>" +
            '<div class="item-r"><b>' + money(l.sub) + '</b><div class="qty"><button type="button" aria-label="Quitar uno">−</button><output>' + l.q + '</output><button type="button" aria-label="Agregar uno">+</button></div></div>';
          var bs = $$(".qty button", it);
          bs[0].addEventListener("click", function () { add(l.key, -1); });
          bs[1].addEventListener("click", function () { add(l.key, 1); });
          body.appendChild(it);
        });
      }
      $("#s-sub").textContent = money(t.sub);
      $("#s-disc-row").hidden = !t.combo;
      $("#s-disc-l").textContent = "Descuento combo (" + pct(C.comboDescuento) + ")";
      $("#s-disc").textContent = "−" + money(t.combo);
      $("#s-total").textContent = money(t.total);
      $("#send").href = waLink(message(ls, t));
      $$("[data-count]").forEach(function (b) { b.textContent = t.count; b.setAttribute("data-n", t.count); });
      var has = t.count > 0;
      $("#mbar-n").textContent = has ? t.count + (t.count === 1 ? " producto" : " productos") + (t.combo ? " · combo −" + pct(C.comboDescuento) : "") : "¿Tienes dudas?";
      $("#mbar-t").textContent = has ? money(t.total) : "Te respondemos ya";
      $("#mbar-wa").hidden = has; $("#mbar-cart").hidden = !has;
      $("#mbar").classList.toggle("show", !document.body.classList.contains("open"));
      cards.forEach(function (c) { c._draw(); });
      save();
    }
    $("#nombre").addEventListener("input", function () { $("#send").href = waLink(message(lines(), totals(lines()))); });

    /* drawer */
    var drawer = $("#drawer"), lastFocus = null;
    function openCart() {
      lastFocus = document.activeElement;
      document.body.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
      $("#mbar").classList.remove("show");
      setTimeout(function () { $(".x", drawer).focus(); }, 50);
    }
    function closeCart() {
      document.body.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
      render(); if (lastFocus) lastFocus.focus();
    }
    $$("[data-open-cart]").forEach(function (b) { b.addEventListener("click", openCart); });
    $$("[data-close-cart]").forEach(function (b) { b.addEventListener("click", closeCart); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("open")) closeCart(); });

    var toastEl = $("#toast"), tt;
    function toast(msg) {
      toastEl.textContent = msg; toastEl.classList.add("show");
      clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
    }

    render();
    reveal();
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var rise = $$("[data-rise]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var showAll = function () { rise.forEach(function (el) { el.classList.add("in"); }); };
    if (!("IntersectionObserver" in window) || reduce) { showAll(); return; }
    var fired = false;
    var io = new IntersectionObserver(function (es) {
      fired = true;
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    rise.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!fired) showAll(); }, 1500);
  }
})();
