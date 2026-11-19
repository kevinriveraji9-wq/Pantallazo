(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var slug = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item"; };
  var uniq = function (base, taken) { var id = base, n = 2; while (taken.indexOf(id) > -1) id = base + "-" + n++; return id; };
  var LOW = 3;

  var token = null, orig = null, draft = null, tab = "inv";
  try { token = sessionStorage.getItem("adm-token"); } catch (e) {}

  /* ---------- api ---------- */
  function api(method, url, body) {
    return fetch("api.php?r=" + url, {
      method: method,
      headers: Object.assign({ "Content-Type": "application/json" }, token ? { "X-Token": token } : {}),
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 && url !== "login") { logout(true); throw new Error(d.error || "Sesión expirada"); }
        if (!r.ok) throw new Error(d.error || "Error " + r.status);
        return d;
      });
    });
  }

  /* ---------- login ---------- */
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("#login-err").textContent = "";
    api("POST", "login", { password: $("#pass").value }).then(function (d) {
      token = d.token; try { sessionStorage.setItem("adm-token", token); } catch (e2) {}
      $("#pass").value = ""; start();
    }).catch(function (err) { $("#login-err").textContent = err.message; });
  });
  function logout(expired) {
    if (token && !expired) api("POST", "logout").catch(function () {});
    token = null; try { sessionStorage.removeItem("adm-token"); } catch (e) {}
    $("#app").hidden = true; $("#login").hidden = false;
    if (expired) $("#login-err").textContent = "Tu sesión expiró. Vuelve a entrar.";
    $("#pass").focus();
  }
  $("#logout").addEventListener("click", function () {
    if (dirty() && !confirm("Tienes cambios sin guardar. ¿Salir de todos modos?")) return;
    logout(false);
  });

  var cuentas = [];
  function start() {
    Promise.all([api("GET", "catalogo&raw=1"), api("GET", "cuentas")]).then(function (r) {
      orig = r[0]; draft = clone(r[0]); cuentas = r[1].cuentas || [];
      $("#login").hidden = true; $("#app").hidden = false;
      renderAll();
    }).catch(function (err) { if (token) toast(err.message || "No se pudo cargar el panel", true); });
  }
  if (token) start(); else $("#pass").focus();

  /* ---------- helpers ---------- */
  var catName = function (id) { var c = draft.categorias.filter(function (k) { return k.id === id; })[0]; return c ? c.nombre : "Sin categoría"; };
  var money = function (n) {
    try { return new Intl.NumberFormat(draft.locale, { style: "currency", currency: draft.moneda, maximumFractionDigits: 0 }).format(n).replace(/ /g, ""); }
    catch (e) { return "$" + n; }
  };
  /* dates */
  var hoy = function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var parse = function (s) { var x = s.split("-"); return new Date(+x[0], +x[1] - 1, +x[2]); };
  var fmtD = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var addMonths = function (s, n) { var d = parse(s), day = d.getDate(); d.setMonth(d.getMonth() + n); if (d.getDate() < day) d.setDate(0); return fmtD(d); };
  var dias = function (s) { return Math.round((parse(s) - parse(hoy())) / 864e5); };
  var bonita = function (s) { return s ? parse(s).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : "sin fecha"; };
  var venceBadge = function (s, warnDays) {
    if (!s) return '<span class="badge b-inf">Sin fecha</span>';
    var d = dias(s);
    if (d < 0) return '<span class="badge b-out">Vencido hace ' + -d + " d</span>";
    if (d === 0) return '<span class="badge b-out">Vence hoy</span>';
    if (d <= warnDays) return '<span class="badge b-low">Vence en ' + d + " d</span>";
    return '<span class="badge b-inf">Vence ' + bonita(s) + "</span>";
  };

  /* stock: manual value, or computed from accounts for automatic options */
  function stockCuentas() {
    var out = {}, t = hoy();
    cuentas.forEach(function (a) {
      if (a.vence && a.vence < t) return;
      var s = out[a.producto] || (out[a.producto] = { perfil: 0, cuenta: 0 });
      if (a.completa) return;
      var libres = a.perfiles.filter(function (p) { return p.estado === "libre"; }).length;
      s.perfil += libres;
      if (libres === a.perfiles.length) s.cuenta += 1;
    });
    return out;
  }
  var SC = {};
  var isAuto = function (o) { return o.tipo === "perfil" || o.tipo === "cuenta"; };
  var eff = function (p, o) { return isAuto(o) ? (SC[p.id] || { perfil: 0, cuenta: 0 })[o.tipo] : o.stock; };
  var estado = function (o, p) {
    var s = p ? eff(p, o) : o.stock;
    if (s === null || s === undefined) return { k: "inf", t: "Sin límite" };
    if (s <= 0) return { k: "out", t: "Agotado" };
    if (s <= LOW) return { k: "low", t: "Stock bajo" };
    return { k: "ok", t: "Disponible" };
  };
  function dirty() { return orig && JSON.stringify(orig) !== JSON.stringify(draft); }
  function changed() {
    $("#savebar").classList.toggle("show", dirty());
    renderStats();
  }
  window.addEventListener("beforeunload", function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- save ---------- */
  $("#save").addEventListener("click", saveNow);
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !$("#app").hidden) { e.preventDefault(); if (dirty()) saveNow(); }
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
  });
  function saveNow() {
    var b = $("#save"); b.disabled = true; b.textContent = "Guardando…";
    api("POST", "catalogo", draft).then(function (d) {
      orig = d; draft = clone(d); renderAll(); toast("Cambios guardados. La tienda ya está actualizada.");
    }).catch(function (err) { toast(err.message, true); })
      .then(function () { b.disabled = false; b.textContent = "Guardar cambios"; });
  }
  $("#discard").addEventListener("click", function () {
    if (!confirm("¿Descartar todos los cambios sin guardar?")) return;
    draft = clone(orig); renderAll();
  });

  /* ---------- tabs ---------- */
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      tab = t.dataset.tab;
      $$(".tab").forEach(function (o) { o.setAttribute("aria-selected", o === t); });
      $$("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== tab; });
    });
  });

  function renderAll() {
    SC = stockCuentas();
    $("#biz").textContent = draft.negocio;
    renderCatSelect(); renderInv(); renderAccs(); renderProds(); renderCats(); renderCfg(); changed();
  }

  /* ---------- stats ---------- */
  function renderStats() {
    var activos = draft.productos.filter(function (p) { return p.activo; });
    var unidades = 0, bajos = 0, agotados = 0;
    activos.forEach(function (p) {
      p.opciones.forEach(function (o) {
        var s = eff(p, o);
        if (s === null || s === undefined) return;
        unidades += s;
        if (s <= 0) agotados++; else if (s <= LOW) bajos++;
      });
    });
    $("#stats").innerHTML =
      '<div class="stat"><span>Productos visibles</span><b>' + activos.length + " / " + draft.productos.length + "</b></div>" +
      '<div class="stat"><span>Unidades en stock</span><b>' + unidades + "</b></div>" +
      '<div class="stat warn"><span>Opciones con stock bajo</span><b>' + bajos + "</b></div>" +
      '<div class="stat bad"><span>Opciones agotadas</span><b>' + agotados + "</b></div>";
  }

  /* ---------- inventory ---------- */
  function renderCatSelect() {
    var sel = $("#inv-cat"), v = sel.value || "all";
    sel.innerHTML = '<option value="all">Todas las categorías</option>' + draft.categorias.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.nombre) + "</option>"; }).join("");
    sel.value = draft.categorias.some(function (c) { return c.id === v; }) ? v : "all";
  }
  ["#inv-q", "#inv-cat", "#inv-st"].forEach(function (s) { $(s).addEventListener("input", renderInv); });

  function renderInv() {
    var q = $("#inv-q").value.trim().toLowerCase(), fc = $("#inv-cat").value, fs = $("#inv-st").value;
    var box = $("#inv"), html = "";
    draft.categorias.forEach(function (cat) {
      if (fc !== "all" && fc !== cat.id) return;
      var lista = draft.productos.filter(function (p) {
        if (p.categoria !== cat.id) return false;
        if (q && p.nombre.toLowerCase().indexOf(q) < 0) return false;
        if (fs === "off") return !p.activo;
        if (fs === "low") return p.opciones.some(function (o) { return estado(o, p).k === "low"; });
        if (fs === "out") return p.opciones.some(function (o) { return estado(o, p).k === "out"; });
        return true;
      });
      if (!lista.length) return;
      html += '<div class="cat-title"><h2>' + esc(cat.nombre) + "</h2><span>" + lista.length + (lista.length === 1 ? " producto" : " productos") + "</span></div>";
      html += '<div class="colhead"><span>Opción</span><span>Precio por mes</span><span>Stock</span><span>Estado</span></div>';
      lista.forEach(function (p) {
        var pi = draft.productos.indexOf(p);
        html += '<div class="pblock' + (p.activo ? "" : " off") + '" data-p="' + pi + '">' +
          '<div class="phead"><span class="dot" style="background:' + esc(p.color) + '"></span>' +
          '<span class="pname">' + esc(p.nombre) + (p.popular ? ' <span class="badge b-pop">Más pedido</span>' : "") + "</span>" +
          '<label class="check" title="Mostrar u ocultar en la tienda"><span class="hide-m" style="color:var(--muted);font-size:13px">' + (p.activo ? "Visible" : "Oculto") + '</span><span class="sw"><input type="checkbox" data-act ' + (p.activo ? "checked" : "") + ' aria-label="Visible en la tienda"><span></span></span></label>' +
          '<button class="btn sm" type="button" data-edit>Editar</button></div>';
        p.opciones.forEach(function (o, oi) {
          var st = estado(o, p), inf = o.stock === null || o.stock === undefined;
          html += '<div class="orow" data-o="' + oi + '">' +
            '<span class="oname">' + esc(o.nombre) + "</span>" +
            '<label class="money"><span>$</span><input type="number" min="0" step="500" value="' + o.precio + '" data-price aria-label="Precio de ' + esc(p.nombre + " " + o.nombre) + '"></label>' +
            '<div class="stepper">' +
              (isAuto(o) ? '<span class="auto" title="Se calcula desde Cuentas y perfiles">' + eff(p, o) + (o.tipo === "perfil" ? " perfiles libres" : " cuentas libres") + "</span>"
              : inf ? '<span class="inf">Sin límite</span><button class="btn sm" type="button" data-limit>Controlar</button>'
                   : '<button class="icon-btn" type="button" data-step="-1" aria-label="Restar uno" ' + (o.stock <= 0 ? "disabled" : "") + '>−</button><input type="number" min="0" step="1" value="' + o.stock + '" data-stock aria-label="Stock de ' + esc(p.nombre + " " + o.nombre) + '"><button class="icon-btn" type="button" data-step="1" aria-label="Sumar uno">+</button>') +
            "</div>" +
            '<span><span class="badge b-' + st.k + '">' + st.t + "</span></span></div>";
        });
        html += "</div>";
      });
    });
    box.innerHTML = html || '<div class="empty">No hay productos con ese filtro.</div>';
  }

  $("#inv").addEventListener("click", function (e) {
    var blk = e.target.closest("[data-p]"); if (!blk) return;
    var p = draft.productos[+blk.dataset.p];
    if (e.target.closest("[data-edit]")) return openModal(+blk.dataset.p);
    var row = e.target.closest("[data-o]");
    if (!row) return;
    var o = p.opciones[+row.dataset.o];
    var step = e.target.closest("[data-step]");
    if (step) { o.stock = Math.max(0, (o.stock || 0) + +step.dataset.step); renderInv(); changed(); }
    if (e.target.closest("[data-limit]")) { o.stock = 0; renderInv(); changed(); }
  });
  $("#inv").addEventListener("change", function (e) {
    var blk = e.target.closest("[data-p]"); if (!blk) return;
    var p = draft.productos[+blk.dataset.p];
    if (e.target.matches("[data-act]")) { p.activo = e.target.checked; renderInv(); renderProds(); changed(); return; }
    var row = e.target.closest("[data-o]"); if (!row) return;
    var o = p.opciones[+row.dataset.o];
    if (e.target.matches("[data-price]")) { o.precio = Math.max(0, Math.round(+e.target.value || 0)); changed(); }
    if (e.target.matches("[data-stock]")) { o.stock = Math.max(0, Math.round(+e.target.value || 0)); renderInv(); changed(); }
  });

  /* ---------- products ---------- */
  $("#prod-q").addEventListener("input", renderProds);
  function renderProds() {
    var q = $("#prod-q").value.trim().toLowerCase();
    var html = "";
    draft.categorias.forEach(function (cat) {
      var lista = draft.productos.filter(function (p) { return p.categoria === cat.id && (!q || p.nombre.toLowerCase().indexOf(q) > -1); });
      if (!lista.length) return;
      html += '<div class="cat-title"><h2>' + esc(cat.nombre) + "</h2><span>" + lista.length + "</span></div><div class=\"pgrid\">";
      lista.forEach(function (p) {
        var pi = draft.productos.indexOf(p);
        html += '<div class="pcard" style="--pc:' + esc(p.color) + '"><h3><span class="dot" style="background:' + esc(p.color) + '"></span>' + esc(p.nombre) + "</h3>" +
          "<p>" + esc(p.nota || "Sin descripción") + "</p>" +
          '<div class="ops">' + p.opciones.map(function (o) {
            var s = eff(p, o);
            return "<div><span>" + esc(o.nombre) + "</span><b>" + money(o.precio) + " · " + (s === null || s === undefined ? "∞" : s + " u.") + (isAuto(o) ? " (auto)" : "") + "</b></div>";
          }).join("") + "</div>" +
          "<div>" + (p.activo ? '<span class="badge b-ok">Visible</span>' : '<span class="badge b-inf">Oculto</span>') + (p.popular ? ' <span class="badge b-pop">Más pedido</span>' : "") + "</div>" +
          '<div class="acts"><button class="btn sm y" type="button" data-edit="' + pi + '">Editar</button><button class="btn sm" type="button" data-dup="' + pi + '">Duplicar</button></div></div>';
      });
      html += "</div>";
    });
    $("#prods").innerHTML = html || '<div class="empty">No hay productos todavía.</div>';
  }
  $("#prods").addEventListener("click", function (e) {
    var ed = e.target.closest("[data-edit]"), dp = e.target.closest("[data-dup]");
    if (ed) openModal(+ed.dataset.edit);
    if (dp) {
      var src = draft.productos[+dp.dataset.dup], copy = clone(src);
      copy.nombre = src.nombre + " (copia)"; copy.id = uniq(slug(copy.nombre), draft.productos.map(function (p) { return p.id; }));
      copy.activo = false;
      draft.productos.splice(+dp.dataset.dup + 1, 0, copy);
      renderAll(); toast("Producto duplicado. Quedó oculto hasta que lo actives.");
    }
  });
  $("#new-prod").addEventListener("click", function () { openModal(-1); });

  /* ---------- product modal ---------- */
  var editing = -1, mOps = [];
  function openModal(i) {
    editing = i;
    var p = i > -1 ? clone(draft.productos[i]) : { nombre: "", categoria: draft.categorias[0].id, color: "#FFC83D", nota: "", popular: false, activo: true, opciones: [{ id: "", nombre: "Cuenta individual", precio: 0, stock: 0 }] };
    $("#m-title").textContent = i > -1 ? "Editar " + p.nombre : "Nuevo producto";
    $("#m-nombre").value = p.nombre;
    $("#m-cat").innerHTML = draft.categorias.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.nombre) + "</option>"; }).join("");
    $("#m-cat").value = p.categoria;
    $("#m-nota").value = p.nota || "";
    $("#m-logo").value = p.logo || "";
    $("#m-color").value = /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : "#FFC83D";
    $("#m-pop").checked = !!p.popular; $("#m-act").checked = p.activo !== false;
    $("#m-del").hidden = i < 0;
    $("#m-err").textContent = "";
    mOps = p.opciones; drawOps();
    $("#modal").hidden = false; $("#m-nombre").focus();
  }
  function closeModal() { $("#modal").hidden = true; }
  $$("#modal [data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
  $("#modal").addEventListener("click", function (e) { if (e.target === $("#modal")) closeModal(); });

  function autoLibres(tipo) {
    var p = editing > -1 ? draft.productos[editing] : null;
    if (!p) return 0;
    return (SC[p.id] || { perfil: 0, cuenta: 0 })[tipo] || 0;
  }
  function drawOps() {
    $("#m-ops").innerHTML = mOps.map(function (o, i) {
      var auto = isAuto(o), inf = !auto && (o.stock === null || o.stock === undefined);
      var tipo = o.tipo || "manual";
      return '<div class="opedit" data-i="' + i + '">' +
        '<label class="f"><span>Nombre</span><input type="text" data-k="nombre" value="' + esc(o.nombre) + '" maxlength="40" placeholder="Pantalla"></label>' +
        '<label class="f"><span>Precio por mes</span><input type="number" min="0" step="500" data-k="precio" value="' + o.precio + '"></label>' +
        '<label class="f"><span>Stock</span><select data-k="tipo">' +
          '<option value="manual"' + (tipo === "manual" ? " selected" : "") + ">A mano</option>" +
          '<option value="perfil"' + (tipo === "perfil" ? " selected" : "") + ">Perfiles libres</option>" +
          '<option value="cuenta"' + (tipo === "cuenta" ? " selected" : "") + ">Cuentas libres</option></select></label>" +
        (auto
          ? '<div class="op-auto"><b>' + autoLibres(tipo) + "</b> " + (tipo === "perfil" ? "perfiles libres" : "cuentas libres") + " ahora<small>Se cuenta solo desde «Cuentas y perfiles»</small></div>"
          : '<label class="f"><span>Cantidad</span><input type="number" min="0" step="1" data-k="stock" value="' + (inf ? "" : o.stock) + '" ' + (inf ? "disabled" : "") + ' placeholder="sin límite"></label>' +
            '<label class="check" style="height:42px"><input type="checkbox" data-k="inf" ' + (inf ? "checked" : "") + "> Sin límite</label>") +
        '<button class="icon-btn" type="button" data-rm aria-label="Quitar opción" ' + (mOps.length < 2 ? "disabled" : "") + ">×</button></div>";
    }).join("");
  }
  $("#m-ops").addEventListener("input", function (e) {
    var row = e.target.closest("[data-i]"); if (!row) return;
    var o = mOps[+row.dataset.i], k = e.target.dataset.k;
    if (k === "nombre") o.nombre = e.target.value;
    if (k === "precio") o.precio = Math.max(0, Math.round(+e.target.value || 0));
    if (k === "stock") o.stock = Math.max(0, Math.round(+e.target.value || 0));
    if (k === "inf") { o.stock = e.target.checked ? null : 0; drawOps(); }
  });
  $("#m-ops").addEventListener("change", function (e) {
    var row = e.target.closest("[data-i]"); if (!row || e.target.dataset.k !== "tipo") return;
    var o = mOps[+row.dataset.i]; o.tipo = e.target.value;
    if (o.tipo === "manual" && (o.stock === null || o.stock === undefined)) o.stock = 0;
    drawOps();
  });
  $("#m-ops").addEventListener("click", function (e) {
    var rm = e.target.closest("[data-rm]"); if (!rm || mOps.length < 2) return;
    mOps.splice(+rm.closest("[data-i]").dataset.i, 1); drawOps();
  });
  $("#m-add-op").addEventListener("click", function () { mOps.push({ id: "", nombre: "", precio: 0, stock: 0 }); drawOps(); });

  $("#m-ok").addEventListener("click", function () {
    var nombre = $("#m-nombre").value.trim();
    if (!nombre) { $("#m-err").textContent = "Escribe el nombre del producto."; return; }
    if (mOps.some(function (o) { return !o.nombre.trim(); })) { $("#m-err").textContent = "Cada opción necesita un nombre (por ejemplo: Pantalla)."; return; }
    var otherIds = draft.productos.filter(function (_, i) { return i !== editing; }).map(function (p) { return p.id; });
    var takenOps = [];
    var ops = mOps.map(function (o) {
      var id = o.id || uniq(slug(o.nombre), takenOps); takenOps.push(id);
      return { id: id, nombre: o.nombre.trim(), precio: o.precio, stock: isAuto(o) ? 0 : o.stock, tipo: o.tipo || "manual" };
    });
    var p = {
      id: editing > -1 ? draft.productos[editing].id : uniq(slug(nombre), otherIds),
      nombre: nombre, categoria: $("#m-cat").value, color: $("#m-color").value, nota: $("#m-nota").value.trim(),
      logo: $("#m-logo").value.trim(),
      popular: $("#m-pop").checked, activo: $("#m-act").checked, opciones: ops
    };
    if (editing > -1) draft.productos[editing] = p; else draft.productos.push(p);
    closeModal(); renderAll();
    toast(editing > -1 ? "Producto actualizado. Recuerda guardar." : "Producto creado. Recuerda guardar.");
  });
  $("#m-del").addEventListener("click", function () {
    var p = draft.productos[editing];
    var n = cuentas.filter(function (a) { return a.producto === p.id; }).length;
    if (n) { $("#m-err").textContent = "Este producto tiene " + n + (n === 1 ? " cuenta registrada" : " cuentas registradas") + ". Elimínalas primero en Cuentas y perfiles, o mejor ocúltalo."; return; }
    if (!confirm("¿Eliminar " + p.nombre + "? Desaparecerá de la tienda cuando guardes.")) return;
    draft.productos.splice(editing, 1); closeModal(); renderAll();
  });

  /* ---------- accounts and profiles (saved instantly) ---------- */
  var prodById = function (id) { return draft.productos.filter(function (p) { return p.id === id; })[0]; };
  var rid = function () { return Math.random().toString(36).slice(2, 10); };

  function saveCuentas(next, okMsg) {
    var prev = cuentas; cuentas = next; SC = stockCuentas(); renderAccs(); renderInv(); renderStats();
    return api("POST", "cuentas", { cuentas: next }).then(function (d) {
      cuentas = d.cuentas; SC = stockCuentas(); renderAccs(); renderInv(); renderStats();
      if (okMsg) toast(okMsg);
    }).catch(function (err) {
      cuentas = prev; SC = stockCuentas(); renderAccs(); renderInv(); renderStats();
      toast("No se guardó: " + err.message, true);
    });
  }

  ["#acc-q", "#acc-prod", "#acc-st"].forEach(function (s) { $(s).addEventListener("input", renderAccs); });

  function renderAccs() {
    var sel = $("#acc-prod"), v = sel.value || "all";
    sel.innerHTML = '<option value="all">Todos los productos</option>' + draft.productos.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nombre) + "</option>"; }).join("");
    sel.value = draft.productos.some(function (p) { return p.id === v; }) ? v : "all";

    /* summary */
    var libres = 0, vendidos = 0, porVencer = 0, vencidos = 0, renovar = 0;
    cuentas.forEach(function (a) {
      if (a.vence && dias(a.vence) <= 5) renovar++;
      a.perfiles.forEach(function (p) {
        if (p.estado === "libre") { libres++; return; }
        vendidos++;
        if (p.vence) { var d = dias(p.vence); if (d < 0) vencidos++; else if (d <= 3) porVencer++; }
      });
    });
    $("#acc-stats").innerHTML =
      '<div class="stat"><span>Perfiles libres</span><b>' + libres + "</b></div>" +
      '<div class="stat"><span>Perfiles vendidos</span><b>' + vendidos + "</b></div>" +
      '<div class="stat warn"><span>Clientes por vencer (3 días)</span><b>' + porVencer + "</b></div>" +
      '<div class="stat bad"><span>Vencidos · cuentas por renovar</span><b>' + vencidos + " · " + renovar + "</b></div>";

    var q = $("#acc-q").value.trim().toLowerCase(), fp = sel.value, fs = $("#acc-st").value;
    var lista = cuentas.map(function (a, i) { return { a: a, i: i }; }).filter(function (x) {
      var a = x.a;
      if (fp !== "all" && a.producto !== fp) return false;
      if (q) {
        var hay = [a.correo, a.notas].concat(a.perfiles.map(function (p) { return p.cliente + " " + p.telefono + " " + p.nombre; })).join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      if (fs === "libres") return a.perfiles.some(function (p) { return p.estado === "libre"; });
      if (fs === "porvencer") return a.perfiles.some(function (p) { return p.estado === "vendido" && p.vence && dias(p.vence) >= 0 && dias(p.vence) <= 3; });
      if (fs === "vencidos") return a.perfiles.some(function (p) { return p.estado === "vendido" && p.vence && dias(p.vence) < 0; });
      if (fs === "cuentavence") return a.vence && dias(a.vence) <= 5;
      return true;
    });
    lista.sort(function (x, y) {
      var px = prodById(x.a.producto), py = prodById(y.a.producto);
      return (px ? px.nombre : "").localeCompare(py ? py.nombre : "") || (x.a.vence || "9").localeCompare(y.a.vence || "9");
    });

    if (!cuentas.length) {
      $("#accs").innerHTML = '<div class="empty">Todavía no registras cuentas. Agrega la primera con «+ Nueva cuenta»: anota el correo, la clave y cuántos perfiles tiene, y desde aquí vendes cada perfil.</div>';
      return;
    }
    $("#accs").innerHTML = lista.map(function (x) { return accHTML(x.a, x.i); }).join("") || '<div class="empty">No hay cuentas con ese filtro.</div>';
  }

  function accHTML(a, i) {
    var p = prodById(a.producto) || { nombre: a.producto, color: "#888888" };
    var libres = a.perfiles.filter(function (f) { return f.estado === "libre"; }).length;
    var h = '<div class="acc" data-a="' + i + '"><div class="acc-h">' +
      '<span class="dot" style="background:' + esc(p.color) + '"></span><span class="pname">' + esc(p.nombre) + "</span>" +
      '<span class="cred"><i>Correo</i><span>' + esc(a.correo || "—") + '</span><button class="mini" type="button" data-copy="correo">Copiar</button></span>' +
      '<span class="cred"><i>Clave</i><span data-secret>••••••••</span><button class="mini" type="button" data-show>Ver</button><button class="mini" type="button" data-copy="clave">Copiar</button></span>' +
      venceBadge(a.vence, 5) +
      '<span class="badge ' + (libres ? "b-ok" : "b-inf") + '">' + libres + "/" + a.perfiles.length + " libres</span>" +
      '<span class="sp"></span>' +
      (libres === a.perfiles.length && !a.completa ? '<button class="btn sm" type="button" data-sellall>Vender completa</button>' : "") +
      '<button class="btn sm" type="button" data-editacc>Editar</button></div>';
    if (a.completa) {
      var f = a.perfiles[0];
      h += '<div class="acc-full"><span>Cuenta completa de ' + esc(f.cliente || "cliente") + (f.telefono ? " · " + esc(f.telefono) : "") + "</span>" + venceBadge(f.vence, 3) +
        '<div class="acts">' + clientActs(f) + '<button class="btn sm danger" type="button" data-freeall>Liberar cuenta</button></div></div>';
    }
    h += '<div class="profs">' + a.perfiles.map(function (f, j) {
      if (a.completa) return '<div class="prof vendido"><b>' + esc(f.nombre) + "</b><small>" + (f.pin ? "PIN " + esc(f.pin) : "Sin PIN") + "</small></div>";
      if (f.estado === "libre") {
        return '<div class="prof libre" data-f="' + j + '"><b>' + esc(f.nombre) + "</b><small>Libre" + (f.pin ? " · PIN " + esc(f.pin) : "") + '</small><div class="acts"><button class="btn sm y" type="button" data-sell>Vender</button></div></div>';
      }
      var venc = f.vence && dias(f.vence) < 0;
      return '<div class="prof ' + (venc ? "vencido" : "vendido") + '" data-f="' + j + '"><b>' + esc(f.nombre) + (f.pin ? ' <small>· PIN ' + esc(f.pin) + "</small>" : "") + "</b>" +
        "<small>" + esc(f.cliente || "Sin nombre") + (f.telefono ? " · " + esc(f.telefono) : "") + "</small>" +
        "<div>" + venceBadge(f.vence, 3) + "</div>" +
        '<div class="acts">' + clientActs(f) + '<button class="btn sm danger" type="button" data-free>Liberar</button></div></div>';
    }).join("") + "</div>";
    if (a.notas) h += '<p class="acc-notes">' + esc(a.notas) + "</p>";
    return h + "</div>";
  }
  function clientActs(f) {
    var near = f.vence && dias(f.vence) <= 3;
    return (f.telefono ? '<button class="btn sm" type="button" data-wa="datos">Enviar datos</button>' : '<button class="btn sm" type="button" data-copyacc>Copiar datos</button>') +
      (f.telefono && near ? '<button class="btn sm" type="button" data-wa="recordar">Recordar</button>' : "") +
      '<button class="btn sm" type="button" data-renew>Renovar</button>';
  }

  /* messages for the customer */
  function telWa(t) {
    t = String(t || "").replace(/\D/g, "");
    if (t.length <= 10 && draft.whatsapp.length > 10) t = draft.whatsapp.slice(0, draft.whatsapp.length - 10) + t;
    return t;
  }
  function datosMsg(a, f) {
    var p = prodById(a.producto) || { nombre: a.producto };
    var l = ["Hola" + (f.cliente ? " " + f.cliente : "") + ", estos son los datos de tu " + p.nombre + ":", "",
      "Correo: " + a.correo, "Clave: " + a.clave];
    if (!a.completa) l.push("Perfil: " + f.nombre + (f.pin ? " (PIN " + f.pin + ")" : ""));
    if (f.vence) l.push("Vence: " + bonita(f.vence));
    l.push("", a.completa ? "Por favor no cambies el correo ni la clave sin avisarnos." : "Por favor usa solo tu perfil y no cambies la clave.",
      "Cualquier problema, escríbenos por aquí. — " + draft.negocio);
    return l.join("\n");
  }
  function recordarMsg(a, f) {
    var p = prodById(a.producto) || { nombre: a.producto };
    var d = dias(f.vence);
    return "Hola" + (f.cliente ? " " + f.cliente : "") + ", te escribimos de " + draft.negocio + ". Tu " + p.nombre +
      (d < 0 ? " venció el " : d === 0 ? " vence hoy, " : " vence el ") + bonita(f.vence) + ". ¿Quieres renovarlo? Te lo dejamos listo en minutos.";
  }
  function copiar(text, ok) {
    var done = function () { toast(ok || "Copiado"); };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(done, fallback);
    fallback();
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("No se pudo copiar", true); }
      t.remove();
    }
  }

  $("#accs").addEventListener("click", function (e) {
    var card = e.target.closest("[data-a]"); if (!card) return;
    var ai = +card.dataset.a, a = cuentas[ai];
    var pf = e.target.closest("[data-f]"), fi = pf ? +pf.dataset.f : 0, f = a.perfiles[fi];
    var b;
    if ((b = e.target.closest("[data-copy]"))) return copiar(a[b.dataset.copy] || "", b.dataset.copy === "clave" ? "Clave copiada" : "Correo copiado");
    if (e.target.closest("[data-show]")) {
      var s = $("[data-secret]", card), show = s.textContent.charAt(0) === "•";
      s.textContent = show ? (a.clave || "—") : "••••••••"; e.target.textContent = show ? "Ocultar" : "Ver"; return;
    }
    if (e.target.closest("[data-editacc]")) return openAcc(ai);
    if (e.target.closest("[data-sell]")) return openSell(ai, fi, "vender");
    if (e.target.closest("[data-sellall]")) return openSell(ai, 0, "completa");
    if (e.target.closest("[data-renew]")) return openSell(ai, fi, "renovar");
    if (e.target.closest("[data-copyacc]")) return copiar(datosMsg(a, f), "Datos copiados. Pégalos en el chat del cliente.");
    if ((b = e.target.closest("[data-wa]"))) {
      var msg = b.dataset.wa === "recordar" ? recordarMsg(a, f) : datosMsg(a, f);
      window.open("https://wa.me/" + telWa(f.telefono) + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      return;
    }
    if (e.target.closest("[data-free]")) {
      if (!confirm("¿Liberar " + f.nombre + " de " + (f.cliente || "este cliente") + "? Antes cambia el PIN del perfil en la plataforma.")) return;
      var next = clone(cuentas);
      next[ai].perfiles[fi] = { id: f.id, nombre: f.nombre, pin: "", estado: "libre" };
      return saveCuentas(next, f.nombre + " quedó libre");
    }
    if (e.target.closest("[data-freeall]")) {
      if (!confirm("¿Liberar la cuenta completa? Antes cambia la clave de la cuenta en la plataforma.")) return;
      var n2 = clone(cuentas);
      n2[ai].completa = false;
      n2[ai].perfiles = n2[ai].perfiles.map(function (x) { return { id: x.id, nombre: x.nombre, pin: "", estado: "libre" }; });
      return saveCuentas(n2, "La cuenta quedó libre");
    }
  });

  /* account modal */
  var accEditing = -1;
  function openAcc(i) {
    accEditing = i;
    var a = i > -1 ? cuentas[i] : { producto: ($("#acc-prod").value !== "all" && $("#acc-prod").value) || draft.productos[0].id, correo: "", clave: "", perfiles: [1, 2, 3, 4], vence: addMonths(hoy(), 1), costo: "", notas: "" };
    $("#a-title").textContent = i > -1 ? "Editar cuenta" : "Nueva cuenta";
    $("#a-prod").innerHTML = draft.productos.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nombre) + "</option>"; }).join("");
    $("#a-prod").value = a.producto; $("#a-prod").disabled = i > -1 && a.perfiles.some(function (f) { return f.estado === "vendido"; });
    $("#a-correo").value = a.correo; $("#a-clave").value = a.clave;
    $("#a-n").value = a.perfiles.length; $("#a-vence").value = a.vence || "";
    $("#a-costo").value = a.costo || ""; $("#a-notas").value = a.notas || "";
    $("#a-del").hidden = i < 0; $("#a-err").textContent = "";
    $("#acc-modal").hidden = false; $("#a-correo").focus();
  }
  $("#new-acc").addEventListener("click", function () { openAcc(-1); });
  $("#a-ok").addEventListener("click", function () {
    var n = Math.round(+$("#a-n").value || 0);
    if (!$("#a-correo").value.trim()) { $("#a-err").textContent = "Escribe el correo de la cuenta."; return; }
    if (n < 1 || n > 20) { $("#a-err").textContent = "El número de perfiles debe estar entre 1 y 20."; return; }
    var next = clone(cuentas);
    var a = accEditing > -1 ? next[accEditing] : { id: rid(), perfiles: [], completa: false };
    var vendidos = a.perfiles.filter(function (f) { return f.estado === "vendido"; }).length;
    if (n < a.perfiles.length) {
      var quitar = a.perfiles.length - n, libresFinal = 0;
      for (var k = a.perfiles.length - 1; k >= 0 && libresFinal < quitar; k--) if (a.perfiles[k].estado === "libre") libresFinal++;
      if (libresFinal < quitar) { $("#a-err").textContent = "No puedes bajar a " + n + " perfiles: hay " + vendidos + " vendidos. Libera alguno primero."; return; }
      var q2 = quitar;
      for (var j = a.perfiles.length - 1; j >= 0 && q2 > 0; j--) if (a.perfiles[j].estado === "libre") { a.perfiles.splice(j, 1); q2--; }
    }
    while (a.perfiles.length < n) a.perfiles.push({ id: rid(), nombre: "Perfil " + (a.perfiles.length + 1), pin: "", estado: "libre" });
    a.producto = $("#a-prod").value; a.correo = $("#a-correo").value.trim(); a.clave = $("#a-clave").value;
    a.vence = $("#a-vence").value; a.costo = Math.round(+$("#a-costo").value || 0); a.notas = $("#a-notas").value.trim();
    if (accEditing < 0) next.push(a);
    $("#acc-modal").hidden = true;
    saveCuentas(next, accEditing > -1 ? "Cuenta actualizada" : "Cuenta agregada con " + n + " perfiles libres");
  });
  $("#a-del").addEventListener("click", function () {
    var a = cuentas[accEditing];
    var v = a.perfiles.filter(function (f) { return f.estado === "vendido"; }).length;
    if (!confirm(v ? "Esta cuenta tiene " + v + " perfiles vendidos. ¿Eliminarla de todos modos?" : "¿Eliminar esta cuenta?")) return;
    var next = clone(cuentas); next.splice(accEditing, 1);
    $("#acc-modal").hidden = true; saveCuentas(next, "Cuenta eliminada");
  });

  /* sell / renew modal */
  var sellCtx = null;
  function precioSugerido(a, modo, meses) {
    var p = prodById(a.producto); if (!p) return 0;
    var tipo = modo === "completa" || a.completa ? "cuenta" : "perfil";
    var op = p.opciones.filter(function (o) { return o.tipo === tipo; })[0] || p.opciones.filter(function (o) { return /cuenta|complet/i.test(o.nombre) === (tipo === "cuenta"); })[0] || p.opciones[0];
    var m = draft.meses.filter(function (x) { return x.meses === meses; })[0] || { descuento: 0 };
    return Math.round(op.precio * meses * (1 - m.descuento));
  }
  function openSell(ai, fi, modo) {
    var a = cuentas[ai], f = a.perfiles[fi];
    sellCtx = { ai: ai, fi: fi, modo: modo };
    var p = prodById(a.producto) || { nombre: a.producto };
    $("#s-title").textContent = modo === "renovar" ? "Renovar" : modo === "completa" ? "Vender cuenta completa" : "Vender " + f.nombre;
    $("#s-sub").textContent = p.nombre + " · " + a.correo;
    $("#s-cliente").value = modo === "renovar" ? f.cliente : ""; $("#s-tel").value = modo === "renovar" ? f.telefono : "";
    $("#s-perfil").value = f.nombre; $("#s-pin").value = f.pin || "";
    $("#s-perfil-w").hidden = $("#s-pin-w").hidden = modo === "completa" || (modo === "renovar" && a.completa);
    $("#s-meses").innerHTML = draft.meses.map(function (m) { return '<option value="' + m.meses + '">' + m.meses + (m.meses === 1 ? " mes" : " meses") + "</option>"; }).join("");
    $("#s-ok").textContent = modo === "renovar" ? "Renovar" : "Registrar venta";
    $("#s-err").textContent = "";
    updSell(); $("#sell-modal").hidden = false; $(modo === "renovar" ? "#s-meses" : "#s-cliente").focus();
  }
  function baseFecha() {
    var a = cuentas[sellCtx.ai], f = a.perfiles[sellCtx.fi];
    return sellCtx.modo === "renovar" && f.vence && f.vence > hoy() ? f.vence : hoy();
  }
  function updSell() {
    var a = cuentas[sellCtx.ai], m = +$("#s-meses").value;
    $("#s-precio").value = precioSugerido(a, sellCtx.modo, m);
    var v = addMonths(baseFecha(), m);
    $("#s-vence").textContent = "Vencerá el " + bonita(v) + (a.vence && v > a.vence ? " · ojo: la cuenta vence antes, el " + bonita(a.vence) : "");
  }
  $("#s-meses").addEventListener("change", updSell);
  $("#s-ok").addEventListener("click", function () {
    var cliente = $("#s-cliente").value.trim(), tel = $("#s-tel").value.replace(/\D/g, "");
    if (!cliente) { $("#s-err").textContent = "Escribe el nombre del cliente."; return; }
    var next = clone(cuentas), a = next[sellCtx.ai], m = +$("#s-meses").value;
    var venta = { cliente: cliente, telefono: tel, vence: addMonths(baseFecha(), m), precio: Math.round(+$("#s-precio").value || 0) };
    if (sellCtx.modo === "completa" || (sellCtx.modo === "renovar" && a.completa)) {
      a.completa = true;
      a.perfiles = a.perfiles.map(function (f) { return Object.assign({}, f, venta, { estado: "vendido", venta: sellCtx.modo === "renovar" ? (f.venta || hoy()) : hoy() }); });
    } else {
      var f = a.perfiles[sellCtx.fi];
      Object.assign(f, venta, { estado: "vendido", nombre: $("#s-perfil").value.trim() || f.nombre, pin: $("#s-pin").value.trim(), venta: sellCtx.modo === "renovar" ? (f.venta || hoy()) : hoy() });
    }
    $("#sell-modal").hidden = true;
    var fRef = a.perfiles[sellCtx.modo === "completa" ? 0 : sellCtx.fi];
    saveCuentas(next, sellCtx.modo === "renovar" ? "Renovado hasta el " + bonita(fRef.vence) : "Venta registrada. Ahora envíale los datos.");
  });

  /* ---------- import / export (CSV, Excel paste) ---------- */
  var COLS = ["producto", "correo", "clave", "vence_cuenta", "perfiles", "cuenta_completa", "perfil", "pin", "cliente", "telefono", "vence_cliente", "precio", "costo", "notas"];
  var ALIAS = {
    plataforma: "producto", servicio: "producto", email: "correo", usuario: "correo", mail: "correo",
    contrasena: "clave", password: "clave", vencimiento_cuenta: "vence_cuenta", vence: "vence_cuenta",
    num_perfiles: "perfiles", cantidad_perfiles: "perfiles", completa: "cuenta_completa",
    nombre_perfil: "perfil", nombre_cliente: "cliente", whatsapp: "telefono", celular: "telefono",
    vencimiento_cliente: "vence_cliente", precio_cobrado: "precio"
  };
  var norm = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); };
  var key = function (s) { return norm(s).replace(/[^a-z0-9]+/g, ""); };

  function parseTable(text) {
    text = String(text || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim();
    if (!text) return [];
    var first = text.split("\n")[0];
    var count = function (ch) { return first.split(ch).length - 1; };
    var sep = [["\t", count("\t")], [";", count(";")], [",", count(",")]].sort(function (a, b) { return b[1] - a[1]; })[0][0];
    var rows = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"' && cell === "") q = true;
      else if (ch === sep) { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    row.push(cell); rows.push(row);
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  function fechaCSV(v) {
    v = String(v || "").trim(); if (!v) return { ok: true, v: "" };
    var m;
    if ((m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return okDate(+m[1], +m[2], +m[3]);
    if ((m = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/))) return okDate(+m[3] < 100 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
    return { ok: false };
    function okDate(y, mo, d) {
      var dt = new Date(y, mo - 1, d);
      if (dt.getMonth() !== mo - 1 || dt.getDate() !== d) return { ok: false };
      return { ok: true, v: fmtD(dt) };
    }
  }
  function findProd(v) {
    var k = key(v); if (!k) return null;
    return draft.productos.filter(function (p) { return key(p.id) === k || key(p.nombre) === k; })[0] ||
      draft.productos.filter(function (p) { return key(p.nombre).indexOf(k) === 0 || k.indexOf(key(p.nombre)) === 0; })[0] || null;
  }
  var siNo = function (v) { return /^(si|sí|s|x|1|true|yes)$/i.test(String(v || "").trim()); };
  var numCSV = function (v) { var n = Number(String(v || "").replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")); return Number.isFinite(n) ? Math.round(n) : 0; };

  var importPlan = null;
  function analizar(text) {
    var rows = parseTable(text), errs = [];
    if (rows.length < 2) return { errs: ["No encontré filas. Incluye la fila de títulos y al menos una cuenta."] };
    var head = rows[0].map(function (h) { var k2 = norm(h).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); return ALIAS[k2] || k2; });
    if (head.indexOf("producto") < 0 || head.indexOf("correo") < 0) return { errs: ["La primera fila debe tener los títulos de la plantilla. Faltan «producto» o «correo»."] };
    var groups = {}, order = [];
    rows.slice(1).forEach(function (r, idx) {
      var line = idx + 2, o = {};
      head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); });
      var p = findProd(o.producto);
      if (!p) { errs.push("Fila " + line + ": no reconozco el producto «" + (o.producto || "vacío") + "»."); return; }
      if (!o.correo) { errs.push("Fila " + line + ": falta el correo de la cuenta."); return; }
      var vc = fechaCSV(o.vence_cuenta), vcl = fechaCSV(o.vence_cliente);
      if (!vc.ok) { errs.push("Fila " + line + ": la fecha «" + o.vence_cuenta + "» no es válida (usa 18/12/2026 o 2026-12-18)."); return; }
      if (!vcl.ok) { errs.push("Fila " + line + ": la fecha del cliente «" + o.vence_cliente + "» no es válida."); return; }
      var n = o.perfiles ? Math.round(+o.perfiles) : 0;
      if (o.perfiles && !(n >= 1 && n <= 20)) { errs.push("Fila " + line + ": «perfiles» debe ser un número entre 1 y 20."); return; }
      var gk = p.id + "|" + o.correo.toLowerCase();
      var g = groups[gk];
      if (!g) { g = groups[gk] = { producto: p.id, correo: o.correo, clave: "", vence: "", n: 0, costo: 0, notas: "", completa: null, perfiles: [], line: line }; order.push(gk); }
      if (o.clave && !g.clave) g.clave = o.clave;
      if (vc.v && !g.vence) g.vence = vc.v;
      if (n > g.n) g.n = n;
      if (o.costo && !g.costo) g.costo = numCSV(o.costo);
      if (o.notas && !g.notas) g.notas = o.notas;
      var venta = o.cliente ? { cliente: o.cliente, telefono: o.telefono.replace(/\D/g, ""), vence: vcl.v, precio: numCSV(o.precio), venta: hoy() } : null;
      if (siNo(o.cuenta_completa)) {
        if (!venta) { errs.push("Fila " + line + ": una cuenta completa vendida necesita el nombre del cliente."); return; }
        g.completa = venta; return;
      }
      if (o.perfil || venta) g.perfiles.push({ nombre: o.perfil, pin: o.pin, venta: venta, line: line });
    });

    var cuentasNuevas = order.map(function (gk) {
      var g = groups[gk];
      var total = Math.max(g.n, g.perfiles.length, 1);
      if (total > 20) { errs.push("La cuenta " + g.correo + " tendría " + total + " perfiles; el máximo es 20."); return null; }
      var usados = {}, perfiles = g.perfiles.map(function (f, i) {
        var nombre = f.nombre || "Perfil " + (i + 1); usados[key(nombre)] = 1;
        var base = { id: rid(), nombre: nombre, pin: f.pin || "", estado: "libre" };
        return f.venta ? Object.assign(base, f.venta, { estado: "vendido" }) : base;
      });
      for (var k = 1; perfiles.length < total; k++) if (!usados[key("Perfil " + k)]) perfiles.push({ id: rid(), nombre: "Perfil " + k, pin: "", estado: "libre" });
      if (g.completa) perfiles = perfiles.map(function (f) { return Object.assign({}, f, g.completa, { estado: "vendido" }); });
      return { id: rid(), producto: g.producto, correo: g.correo, clave: g.clave, vence: g.vence, costo: g.costo, notas: g.notas, completa: !!g.completa, perfiles: perfiles };
    }).filter(Boolean);
    return { errs: errs, cuentas: cuentasNuevas };
  }

  function leerFuente() {
    var f = $("#imp-file").files[0];
    if (f) return f.text ? f.text() : new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsText(f); });
    return Promise.resolve($("#imp-text").value);
  }
  $("#imp-open").addEventListener("click", function () {
    importPlan = null; $("#imp-file").value = ""; $("#imp-text").value = ""; $("#imp-prev").innerHTML = ""; $("#imp-ok").disabled = true;
    $("#imp-modal").hidden = false;
  });
  ["#imp-file", "#imp-text"].forEach(function (s) { $(s).addEventListener("input", function () { importPlan = null; $("#imp-ok").disabled = true; }); });
  $("#imp-check").addEventListener("click", function () {
    leerFuente().then(function (text) {
      var r = analizar(text), replace = $("#imp-replace").checked;
      var idx = {}; cuentas.forEach(function (a, i) { idx[a.producto + "|" + a.correo.toLowerCase()] = i; });
      var nuevas = 0, reemplazos = 0, omitidas = 0, perf = 0, vend = 0;
      (r.cuentas || []).forEach(function (a) {
        var k = a.producto + "|" + a.correo.toLowerCase();
        if (k in idx) { if (replace) reemplazos++; else { omitidas++; return; } } else nuevas++;
        perf += a.perfiles.length; vend += a.perfiles.filter(function (f) { return f.estado === "vendido"; }).length;
      });
      importPlan = r.cuentas && r.cuentas.length ? { cuentas: r.cuentas, replace: replace } : null;
      var h = "";
      if (r.cuentas) h += '<div class="imp-sum"><div>Cuentas nuevas<b>' + nuevas + "</b></div><div>Se reemplazan<b>" + reemplazos + "</b></div><div>Perfiles en total<b>" + perf + "</b></div><div>Perfiles vendidos<b>" + vend + "</b></div></div>";
      if (omitidas) h += '<p class="hint">' + omitidas + " cuentas ya existen y se van a omitir (activa «reemplazarla» para actualizarlas).</p>";
      if (r.errs.length) h += '<ul class="imp-errs">' + r.errs.slice(0, 50).map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" + (r.errs.length ? '<p class="hint">Las filas con error no se importan. Corrígelas y vuelve a revisar, o importa el resto.</p>' : "");
      else if (importPlan) h += '<p class="imp-ok">Todo se ve bien. Revisa los números y pulsa Importar.</p>';
      $("#imp-prev").innerHTML = h;
      $("#imp-ok").disabled = !importPlan || (nuevas + reemplazos) === 0;
      $("#imp-ok").textContent = "Importar " + (nuevas + reemplazos) + ((nuevas + reemplazos) === 1 ? " cuenta" : " cuentas");
    });
  });
  $("#imp-ok").addEventListener("click", function () {
    if (!importPlan) return;
    var next = clone(cuentas), idx = {};
    next.forEach(function (a, i) { idx[a.producto + "|" + a.correo.toLowerCase()] = i; });
    var n = 0;
    importPlan.cuentas.forEach(function (a) {
      var k = a.producto + "|" + a.correo.toLowerCase();
      if (k in idx) { if (!importPlan.replace) return; a.id = next[idx[k]].id; next[idx[k]] = a; }
      else { idx[k] = next.length; next.push(a); }
      n++;
    });
    $("#imp-modal").hidden = true;
    saveCuentas(next, n + (n === 1 ? " cuenta importada" : " cuentas importadas") + ". El stock de la tienda ya se actualizó.");
  });

  function csvCell(v) { v = v == null ? "" : String(v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function descargar(nombre, filas) {
    var text = "﻿" + filas.map(function (r) { return r.map(csvCell).join(";"); }).join("\r\n");
    var url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    var a = document.createElement("a"); a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  var dmy = function (s) { if (!s) return ""; var x = s.split("-"); return x[2] + "/" + x[1] + "/" + x[0]; };
  $("#imp-tpl").addEventListener("click", function () {
    descargar("plantilla-inventario.csv", [COLS,
      ["Netflix", "cuenta1@correo.com", "ClaveDeLaCuenta", "30/12/2026", "4", "", "Perfil 1", "1234", "Ana Gómez", "3001234567", "18/12/2026", "16000", "45000", "Proveedor A"],
      ["Netflix", "cuenta1@correo.com", "", "", "", "", "Perfil 2", "5678", "Luis Pérez", "3109876543", "25/12/2026", "16000", "", ""],
      ["Disney+", "cuenta2@correo.com", "ClaveDeLaCuenta", "15/01/2027", "4", "", "", "", "", "", "", "", "30000", "4 perfiles libres"],
      ["Max", "cuenta3@correo.com", "ClaveDeLaCuenta", "10/01/2027", "3", "si", "", "", "Familia Ruiz", "3205551234", "10/01/2027", "26000", "", "Vendida completa"],
      ["Spotify Premium", "cuenta4@correo.com", "ClaveDeLaCuenta", "05/01/2027", "1", "", "", "", "", "", "", "", "", "Cuenta individual libre"]
    ]);
  });
  $("#exp-csv").addEventListener("click", function () {
    if (!cuentas.length) { toast("Todavía no hay cuentas para exportar", true); return; }
    var filas = [COLS];
    cuentas.forEach(function (a) {
      var p = prodById(a.producto) || { nombre: a.producto };
      a.perfiles.forEach(function (f, i) {
        var first = i === 0, vend = f.estado === "vendido";
        filas.push([p.nombre, a.correo, first ? a.clave : "", first ? dmy(a.vence) : "", first ? a.perfiles.length : "", first && a.completa ? "si" : "",
          f.nombre, f.pin, vend ? f.cliente : "", vend ? f.telefono : "", vend ? dmy(f.vence) : "", vend ? f.precio : "", first ? a.costo || "" : "", first ? a.notas : ""]);
      });
    });
    descargar("inventario-" + hoy() + ".csv", filas);
    toast("Inventario exportado. Guárdalo en un lugar seguro: tiene las claves.");
  });

  /* close any modal */
  $$(".scrim").forEach(function (sc) {
    sc.addEventListener("click", function (e) { if (e.target === sc || e.target.closest("[data-close]")) sc.hidden = true; });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $$(".scrim").forEach(function (sc) { sc.hidden = true; }); });

  /* ---------- categories ---------- */
  function renderCats() {
    $("#cats").innerHTML = draft.categorias.map(function (c, i) {
      var n = draft.productos.filter(function (p) { return p.categoria === c.id; }).length;
      return '<div class="lrow" data-i="' + i + '">' +
        '<input type="text" value="' + esc(c.nombre) + '" maxlength="40" aria-label="Nombre de la categoría">' +
        '<span class="cnt">' + n + (n === 1 ? " producto" : " productos") + "</span>" +
        '<button class="icon-btn" type="button" data-mv="-1" aria-label="Subir" ' + (i === 0 ? "disabled" : "") + ">↑</button>" +
        '<button class="icon-btn" type="button" data-mv="1" aria-label="Bajar" ' + (i === draft.categorias.length - 1 ? "disabled" : "") + ">↓</button>" +
        '<button class="icon-btn" type="button" data-del aria-label="Eliminar categoría"' + (n ? ' title="Tiene productos"' : "") + ">×</button></div>";
    }).join("");
  }
  $("#cats").addEventListener("input", function (e) {
    var row = e.target.closest("[data-i]"); if (!row) return;
    draft.categorias[+row.dataset.i].nombre = e.target.value;
    renderCatSelect(); changed();
  });
  $("#cats").addEventListener("change", function () { renderInv(); renderProds(); });
  $("#cats").addEventListener("click", function (e) {
    var row = e.target.closest("[data-i]"); if (!row) return;
    var i = +row.dataset.i, c = draft.categorias[i];
    var mv = e.target.closest("[data-mv]");
    if (mv) {
      var j = i + +mv.dataset.mv; if (j < 0 || j >= draft.categorias.length) return;
      draft.categorias.splice(j, 0, draft.categorias.splice(i, 1)[0]); renderAll();
    }
    if (e.target.closest("[data-del]")) {
      var n = draft.productos.filter(function (p) { return p.categoria === c.id; }).length;
      if (n) { toast("Primero mueve o elimina los " + n + " productos de " + c.nombre, true); return; }
      if (draft.categorias.length < 2) { toast("Debe quedar al menos una categoría", true); return; }
      draft.categorias.splice(i, 1); renderAll();
    }
  });
  $("#new-cat").addEventListener("click", function () {
    var nombre = prompt("Nombre de la nueva categoría:");
    if (!nombre || !nombre.trim()) return;
    draft.categorias.push({ id: uniq(slug(nombre), draft.categorias.map(function (c) { return c.id; })), nombre: nombre.trim() });
    renderAll();
  });

  /* ---------- settings ---------- */
  function renderCfg() {
    $$("[data-cfg]").forEach(function (inp) { inp.value = draft[inp.dataset.cfg] || ""; });
    $("#combo").value = Math.round((draft.comboDescuento || 0) * 100);
    $("#meses").innerHTML = draft.meses.map(function (m, i) {
      return '<div class="lrow" data-i="' + i + '">' +
        '<label class="f" style="flex:1"><span>Meses</span><input type="number" min="1" max="36" data-k="meses" value="' + m.meses + '"></label>' +
        '<label class="f" style="flex:1"><span>Descuento (%)</span><input type="number" min="0" max="90" data-k="descuento" value="' + Math.round(m.descuento * 100) + '"></label>' +
        '<button class="icon-btn" type="button" data-rm aria-label="Quitar duración" style="align-self:flex-end" ' + (draft.meses.length < 2 ? "disabled" : "") + ">×</button></div>";
    }).join("");
  }
  $$("[data-cfg]").forEach(function (inp) {
    inp.addEventListener("input", function () {
      draft[inp.dataset.cfg] = inp.dataset.cfg === "whatsapp" ? inp.value.replace(/\D/g, "") : inp.value;
      if (inp.dataset.cfg === "negocio") $("#biz").textContent = inp.value;
      changed();
    });
  });
  $("#combo").addEventListener("input", function (e) { draft.comboDescuento = Math.min(90, Math.max(0, +e.target.value || 0)) / 100; changed(); });
  $("#meses").addEventListener("input", function (e) {
    var row = e.target.closest("[data-i]"); if (!row) return;
    var m = draft.meses[+row.dataset.i];
    if (e.target.dataset.k === "meses") m.meses = Math.max(1, Math.round(+e.target.value || 1));
    if (e.target.dataset.k === "descuento") m.descuento = Math.min(90, Math.max(0, +e.target.value || 0)) / 100;
    changed();
  });
  $("#meses").addEventListener("click", function (e) {
    if (!e.target.closest("[data-rm]") || draft.meses.length < 2) return;
    draft.meses.splice(+e.target.closest("[data-i]").dataset.i, 1); renderCfg(); changed();
  });
  $("#add-mes").addEventListener("click", function () {
    var max = Math.max.apply(null, draft.meses.map(function (m) { return m.meses; }));
    draft.meses.push({ meses: max + 6, descuento: 0.15 }); renderCfg(); changed();
  });

  /* ---------- toast ---------- */
  var tt;
  function toast(msg, bad) {
    var t = $("#toast"); t.textContent = msg; t.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(tt); tt = setTimeout(function () { t.className = "toast"; }, 2600);
  }
})();
