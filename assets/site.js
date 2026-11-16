/* Pune Metro Guide — progressive enhancement. No dependencies, no third parties.
   Every page works without this file; it adds the journey planner, the
   interactive map, search and filters, and motion (off under reduced-motion). */
(function () {
  "use strict";
  window.PMG = 1;
  var d = document, de = d.documentElement;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MR = (de.lang || "").indexOf("mr") === 0;
  var meta = function (n) { var m = d.querySelector('meta[name="' + n + '"]'); return m ? m.content : ""; };
  var ROOT = meta("pmg-root") || "./";
  var LP = MR ? "mr/" : "";
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  var S = MR ? {
    pick_from: "सुरुवातीचे स्थानक निवडा.", pick_to: "पोहोचायचे स्थानक निवडा.", same: "सुरुवात आणि शेवट एकच स्थानक आहे.",
    not_open: "{s} अद्याप सुरू नाही.", no_route: "या दोन स्थानकांमध्ये सध्या मार्ग नाही.", no_match: "जुळणारे स्थानक नाही",
    fare: "भाडे", time: "मेट्रोतील वेळ", stops: "थांबे", change: "बदल", changes: "बदल", none: "थेट",
    est: "अंदाज", min: "मि.", board: "{line} पकडा", towards: "{end} कडे", ride: "{n} थांबे", ride1: "1 थांबा",
    show: "{n} स्थानके दाखवा", hide: "लपवा", change_at: "{s} येथे {line} मध्ये बदला", arrive: "उतरा",
    ticket: "तिकीट", tickets: "{n} तिकिटे", skip: "थांबत नाही",
    est_note: "मेट्रोतील वेळेचा अंदाज स्थानकांमधील अंतर आणि पिंक लाईनच्या अधिकृत एका टोकापासून दुसऱ्या टोकापर्यंतच्या वेळेवरून काढला आहे; ही अधिकृत वेळ नाही. प्रतीक्षा आणि मार्ग बदलण्याचा वेळ त्यात नाही.",
    range_note: "अधिकृत महामेट्रो तक्त्यात काही स्थानक-जोड्यांसाठी दोन्ही दिशांना वेगवेगळे भाडे छापलेले आहे, त्यामुळे भाडे श्रेणीत दाखवले आहे.",
    two_note: "या प्रवासासाठी दोन तिकिटे लागतात: एक पुणेरी मेट्रोचे आणि एक महामेट्रोचे. अधिकृत ॲप दोन्ही एकाच पेमेंटमध्ये देते.",
    closed_note: "मार्गावरील काही स्थानके अद्याप सुरू नाहीत; मेट्रो तिथे थांबत नाही.",
    fare_src: "अधिकृत भाडे तक्ते", open_station: "{s} स्थानक", copy: "लिंक कॉपी करा", copied: "लिंक कॉपी झाली", back: "परतीचा प्रवास",
    lines: "मार्गिका", status: "स्थिती", open: "सुरू", closed: "अद्याप सुरू नाही", uc: "बांधकाम सुरू", interchange: "इंटरचेंज",
    from_here: "येथून", to_here: "येथे जायचे", details: "स्थानकाची माहिती", first: "पहिली मेट्रो", near: "जवळ",
    loading: "माहिती येत आहे…", load_fail: "माहिती आणता आली नाही. पान पुन्हा उघडा."
  } : {
    pick_from: "Choose where you're starting.", pick_to: "Choose where you're going.", same: "Start and destination are the same station.",
    not_open: "{s} isn't open yet.", no_route: "There's no route between these stations right now.", no_match: "No station matches",
    fare: "Fare", time: "On the train", stops: "Stops", change: "Change", changes: "Changes", none: "Direct",
    est: "estimate", min: "min", board: "Board the {line}", towards: "towards {end}", ride: "{n} stops", ride1: "1 stop",
    show: "Show {n} stations", hide: "Hide", change_at: "Change at {s} to the {line}", arrive: "Get off",
    ticket: "1 ticket", tickets: "{n} tickets", skip: "doesn't stop",
    est_note: "Time on the train is our estimate from station distances and the Pink Line's published end-to-end time. It's not an official figure and doesn't include waiting or changing trains.",
    range_note: "The official Maha Metro chart prints a different fare in each direction for a few station pairs, so this shows a range.",
    two_note: "This trip needs two tickets: one from Puneri Metro (Pink Line) and one from Maha Metro. The official app sells both in one payment.",
    closed_note: "Some stations on the way aren't open yet; trains run through without stopping.",
    fare_src: "Fares from the operators' official charts", open_station: "{s} station", copy: "Copy link", copied: "Link copied", back: "Return trip",
    lines: "Lines", status: "Status", open: "Open", closed: "Not open yet", uc: "Under construction", interchange: "Interchange",
    from_here: "From here", to_here: "Go here", details: "Station details", first: "First train", near: "Near",
    loading: "Loading stations…", load_fail: "Couldn't load the station data. Reload the page to try again."
  };
  var f = function (s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); };
  var ICON = {
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/></svg>'
  };

  /* ---------- header ---------- */
  var hd = $(".hd");
  if (hd) {
    var onScroll = function () { hd.classList.toggle("solid", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  var sheet = $("#menu"), mb = $(".menu-btn");
  if (sheet && mb) {
    var setMenu = function (open) {
      sheet.classList.toggle("open", open); d.body.classList.toggle("locked", open);
      mb.setAttribute("aria-expanded", open ? "true" : "false"); sheet.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) { var a = $("a", sheet); a && a.focus(); } else mb.focus();
    };
    mb.addEventListener("click", function () { setMenu(true); });
    $$("[data-close]", sheet).forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("open")) setMenu(false); });
  }
  $$(".theme-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = de.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = cur === "dark" ? "light" : "dark";
      de.setAttribute("data-theme", next);
      try { localStorage.setItem("pmg-theme", next); } catch (e) { /* storage blocked */ }
    });
  });

  /* ---------- reveal and counters ---------- */
  var io = "IntersectionObserver" in window;
  if (io && !RM) {
    de.classList.add("rv-on");
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { rio.observe(el); });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = 1100;
        var tick = function (t) { var p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v; if (p < 1) requestAnimationFrame(tick); };
        el.textContent = "0"; requestAnimationFrame(tick);
      });
    }, { threshold: .6 });
    $$("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* ---------- hero ---------- */
  var hero = $(".hero");
  if (hero) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add("go"); }); });
    var svg = $(".hero-map svg", hero);
    if (svg && !RM) {
      setTimeout(function () {
        $$(".fcard", hero).forEach(function (c) { c.classList.add("float"); });
        var trains = [], NS = "http://www.w3.org/2000/svg", layer = $(".hm-trains", svg);
        $$(".hm-track", svg).forEach(function (p, i) {
          var len = p.getTotalLength();
          [0, .5].forEach(function (off, k) {
            var c = d.createElementNS(NS, "circle"); c.setAttribute("r", "4.5"); c.setAttribute("class", "hm-train"); layer.appendChild(c);
            trains.push({ p: p, len: len, c: c, pos: (off + i * .17) % 1, dir: k ? -1 : 1, speed: 26 / len });
          });
        });
        var visible = true, last = performance.now();
        if (io) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);
        var loop = function (t) {
          var dt = Math.min(64, t - last) / 1000; last = t;
          if (visible && !d.hidden) trains.forEach(function (tr) {
            tr.pos += tr.dir * tr.speed * dt;
            if (tr.pos > 1) { tr.pos = 1; tr.dir = -1; } else if (tr.pos < 0) { tr.pos = 0; tr.dir = 1; }
            var pt = tr.p.getPointAtLength(tr.pos * tr.len); tr.c.setAttribute("cx", pt.x.toFixed(1)); tr.c.setAttribute("cy", pt.y.toFixed(1));
          });
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      }, 2600);
    }
  }

  /* ---------- network data ---------- */
  var NET = null, netP = null;
  function loadNet() {
    if (netP) return netP;
    netP = fetch(meta("pmg-data")).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { NET = prep(j); return NET; });
    return netP;
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ऀ-ॿ]+/g, ""); }
  function prep(j) {
    j.status = {}; j.idx = {}; j.bySlug = {};
    j.order.forEach(function (l) {
      j.lines[l].ids = j.lines[l].s.map(function (e) { j.status[l + "|" + e[0]] = e[1]; return e[0]; });
    });
    Object.keys(j.ch).forEach(function (op) { var m = {}; j.ch[op].s.forEach(function (sid, i) { (m[sid] = m[sid] || []).push(i); }); j.idx[op] = m; });
    Object.keys(j.st).forEach(function (id) {
      var s = j.st[id]; s.id = id; j.bySlug[s.slug] = id;
      s.keys = [s.en, s.mr].concat(s.a || []).map(norm);
    });
    return j;
  }
  var isOpen = function (l, s) { return NET.status[l + "|" + s] === "open"; };
  var stOpen = function (s) { return NET.st[s].l.some(function (l) { return isOpen(l, s); }); };
  var sname = function (s) { var x = NET.st[s]; return MR ? (x.mr || x.en) : x.en; };
  var lname = function (l) { return MR ? NET.lines[l].nm : NET.lines[l].n; };
  var money = function (lo, hi) { return lo === hi ? "₹" + lo : "₹" + lo + "–" + hi; };
  function quote(op, a, b) {
    var c = NET.ch[op], ix = NET.idx[op]; if (!ix[a] || !ix[b] || a === b) return null;
    var lo = 1e9, hi = 0;
    ix[a].forEach(function (i) { ix[b].forEach(function (k) { [c.r[i][k], c.r[k][i]].forEach(function (v) { lo = Math.min(lo, v); hi = Math.max(hi, v); }); }); });
    return [lo, hi];
  }
  function hav(a, b) {
    var R = 6371, p = Math.PI / 180, A = NET.st[a].ll, B = NET.st[b].ll;
    var x = Math.sin((B[0] - A[0]) * p / 2), y = Math.sin((B[1] - A[1]) * p / 2);
    return 2 * R * Math.asin(Math.sqrt(x * x + Math.cos(A[0] * p) * Math.cos(B[0] * p) * y * y));
  }
  /* Fewest changes, then fewest stations: the app's planner (and build_site.py's). */
  function trip(a, b) {
    if (a === b) return null;
    var best = null, dist = function (l, x, y) { var ids = NET.lines[l].ids; return Math.abs(ids.indexOf(x) - ids.indexOf(y)); };
    var consider = function (c) { if (!best || c[0] < best[0] || (c[0] === best[0] && c[1] < best[1])) best = c; };
    NET.st[a].l.forEach(function (la) {
      if (!isOpen(la, a)) return;
      if (NET.lines[la].ids.indexOf(b) > -1 && isOpen(la, b)) consider([0, dist(la, a, b), [[la, a, b]]]);
    });
    if (best) return info(best[2]);
    NET.st[a].l.forEach(function (la) {
      if (!isOpen(la, a)) return;
      NET.st[b].l.forEach(function (lb) {
        if (lb === la || !isOpen(lb, b)) return;
        NET.lines[la].ids.forEach(function (x) {
          if (x === a || x === b || NET.lines[lb].ids.indexOf(x) < 0 || !(isOpen(la, x) && isOpen(lb, x))) return;
          consider([1, dist(la, a, x) + dist(lb, x, b), [[la, a, x], [lb, x, b]]]);
        });
      });
    });
    return best ? info(best[2]) : null;
  }
  function info(legs) {
    var out = [], km = 0;
    legs.forEach(function (lg) {
      var l = lg[0], ids = NET.lines[l].ids, i = ids.indexOf(lg[1]), j = ids.indexOf(lg[2]), step = j > i ? 1 : -1, path = [];
      for (var k = i; k !== j + step; k += step) path.push(ids[k]);
      for (var m = 1; m < path.length; m++) km += hav(path[m - 1], path[m]);
      var mid = path.slice(1, -1);
      out.push({ line: l, from: lg[1], to: lg[2], mid: mid, stops: mid.filter(function (s) { return isOpen(l, s); }).length + 1, towards: step === 1 ? ids[ids.length - 1] : ids[0] });
    });
    var tk = [];
    out.forEach(function (lg) {
      var op = NET.lines[lg.line].op;
      if (tk.length && tk[tk.length - 1].op === op) tk[tk.length - 1].to = lg.to; else tk.push({ op: op, from: lg.from, to: lg.to });
    });
    var lo = 0, hi = 0;
    for (var n = 0; n < tk.length; n++) { var q = quote(tk[n].op, tk[n].from, tk[n].to); if (!q) return null; tk[n].fare = q; lo += q[0]; hi += q[1]; }
    return { legs: out, tickets: tk, fare: [lo, hi], min: Math.max(2, Math.round(km * NET.mpk)) };
  }

  /* ---------- combobox ---------- */
  function Combo(root, onPick) {
    var input = $("input", root), list = $(".combo-list", root), box = $(".combo-in", root), clr = $(".combo-clear", root);
    var self = { id: null }, items = [], act = -1;
    var render = function () {
      var q = norm(input.value), res = [];
      Object.keys(NET.st).forEach(function (id) {
        var s = NET.st[id], score = -1;
        if (!q) score = 1;
        else s.keys.forEach(function (k, i) { if (k.indexOf(q) === 0) score = Math.max(score, i < 2 ? 3 : 2); else if (k.indexOf(q) > 0) score = Math.max(score, 1); });
        if (score >= 0) res.push([score, stOpen(id) ? 1 : 0, s.o, id]);
      });
      res.sort(function (x, y) { return y[0] - x[0] || y[1] - x[1] || x[2] - y[2]; });
      items = res.slice(0, q ? 8 : 60).map(function (r) { return r[3]; });
      act = items.length ? 0 : -1;
      if (!items.length) { list.innerHTML = '<li class="combo-empty" role="option" aria-disabled="true">' + esc(S.no_match) + "</li>"; }
      else list.innerHTML = items.map(function (id, i) {
        var s = NET.st[id], nm = esc(sname(id)), open = stOpen(id);
        if (q && !MR) { var at = s.en.toLowerCase().indexOf(input.value.trim().toLowerCase()); if (at > -1 && input.value.trim()) nm = esc(s.en.slice(0, at)) + "<mark>" + esc(s.en.slice(at, at + input.value.trim().length)) + "</mark>" + esc(s.en.slice(at + input.value.trim().length)); }
        return '<li role="option" id="' + list.id + "-" + i + '" data-id="' + id + '"' + (i === act ? ' aria-selected="true"' : "") + (open ? "" : ' class="closed"') + ">" +
          '<span class="pips">' + s.l.map(function (l) { return '<i class="pip" style="--c:' + NET.lines[l].c + '"></i>'; }).join("") + "</span>" +
          '<span class="nm">' + nm + "</span>" + (open ? (s.l.length > 1 ? '<span class="sub">' + esc(S.interchange) + "</span>" : "") : '<span class="sub">' + esc(S.closed) + "</span>") + "</li>";
      }).join("");
      input.setAttribute("aria-activedescendant", act > -1 ? list.id + "-" + act : "");
    };
    var open = function () { if (!NET) return; render(); list.classList.add("open"); input.setAttribute("aria-expanded", "true"); };
    var close = function () { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); };
    var hl = function (i) {
      var lis = $$("li[data-id]", list); if (!lis.length) return; act = (i + lis.length) % lis.length;
      lis.forEach(function (li, k) { li.setAttribute("aria-selected", k === act ? "true" : "false"); });
      lis[act].scrollIntoView({ block: "nearest" }); input.setAttribute("aria-activedescendant", lis[act].id);
    };
    self.set = function (id, silent) {
      self.id = id || null; input.value = id ? sname(id) : ""; box.classList.toggle("has", !!id); close();
      if (!silent) onPick && onPick(self);
    };
    var pick = function (id) { self.set(id); };
    input.addEventListener("focus", function () { loadNet().then(function () { input.select && input.select(); open(); }); });
    input.addEventListener("input", function () { self.id = null; box.classList.toggle("has", !!input.value); open(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (!list.classList.contains("open")) open(); else hl(act + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); hl(act - 1); }
      else if (e.key === "Enter") { if (list.classList.contains("open") && items[act]) { e.preventDefault(); pick(items[act]); } }
      else if (e.key === "Escape") { close(); }
    });
    input.addEventListener("blur", function () { setTimeout(function () { close(); if (!self.id && NET && input.value) { var q = norm(input.value), hit = Object.keys(NET.st).filter(function (id) { return NET.st[id].keys.some(function (k) { return k === q; }); }); if (hit.length === 1) self.set(hit[0], true); } }, 160); });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    list.addEventListener("click", function (e) { var li = e.target.closest("li[data-id]"); if (li) pick(li.getAttribute("data-id")); });
    clr && clr.addEventListener("click", function () { self.set(null, true); input.focus(); });
    self.input = input;
    return self;
  }

  /* ---------- planner ---------- */
  function Planner(root) {
    var out = $(".result", root), msg = $(".planner-msg", root), isPage = root.getAttribute("data-planner") === "page";
    var from = Combo($(".field.from", root)), to = Combo($(".field.to", root), function () {});
    var run = function (push) {
      msg.textContent = "";
      if (!from.id) { msg.textContent = S.pick_from; out.classList.remove("show"); from.input.focus(); return; }
      if (!to.id) { msg.textContent = S.pick_to; out.classList.remove("show"); to.input.focus(); return; }
      if (from.id === to.id) { msg.textContent = S.same; out.classList.remove("show"); return; }
      var bad = [from.id, to.id].filter(function (s) { return !stOpen(s); });
      if (bad.length) { msg.textContent = f(S.not_open, { s: sname(bad[0]) }); out.classList.remove("show"); return; }
      var t = trip(from.id, to.id);
      if (!t) { msg.textContent = S.no_route; out.classList.remove("show"); return; }
      out.innerHTML = renderTrip(t, from.id, to.id);
      out.classList.remove("show"); void out.offsetWidth; out.classList.add("show");
      var mb = $(".rb-more", out); mb && mb.addEventListener("click", function () { var r = $(".ribbon", out), ex = r.classList.toggle("expanded"); mb.textContent = ex ? S.hide : mb.getAttribute("data-show"); mb.setAttribute("aria-expanded", ex); });
      var cp = $("[data-copy]", out); cp && cp.addEventListener("click", function () {
        var u = planUrl(from.id, to.id, true);
        if (navigator.share && /Mobi/.test(navigator.userAgent)) navigator.share({ url: u, title: d.title }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { cp.textContent = S.copied; });
      });
      var bk = $("[data-back]", out); bk && bk.addEventListener("click", function () { swap(); });
      if (isPage && push !== false) history.replaceState(null, "", "?from=" + NET.st[from.id].slug + "&to=" + NET.st[to.id].slug);
      if (push === true && !isPage) out.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "nearest" });
    };
    var swapBtn = $(".swap", root);
    var swap = function () { var a = from.id, b = to.id; from.set(b, true); to.set(a, true); swapBtn.classList.toggle("spin"); if (from.id && to.id) run(); };
    swapBtn.addEventListener("click", function () { loadNet().then(swap); });
    $("form", root).addEventListener("submit", function (e) { e.preventDefault(); loadNet().then(function () { run(true); }, fail); });
    $$("[data-quick]", root).forEach(function (b) {
      b.addEventListener("click", function () { var p = b.getAttribute("data-quick").split(">"); loadNet().then(function () { from.set(p[0], true); to.set(p[1], true); run(true); }); });
    });
    var fail = function () { msg.textContent = S.load_fail; };
    root.pmgSet = function (which, id) { loadNet().then(function () { (which === "from" ? from : to).set(id, true); if (from.id && to.id) run(true); else (which === "from" ? to : from).input.focus(); }); };
    var qs = new URLSearchParams(location.search);
    var preset = root.getAttribute("data-from");
    if (qs.get("from") || qs.get("to") || preset) {
      loadNet().then(function () {
        var fs = qs.get("from") ? NET.bySlug[qs.get("from")] : preset, ts = qs.get("to") ? NET.bySlug[qs.get("to")] : null;
        if (fs) from.set(fs, true); if (ts) to.set(ts, true);
        if (fs && ts) run(false);
      }, fail);
    } else if ("requestIdleCallback" in window) requestIdleCallback(function () { loadNet().catch(function () {}); });
  }
  function stUrl(id) { return ROOT + LP + "stations/" + NET.st[id].slug + "/"; }
  function planUrl(a, b, abs) {
    var u = ROOT + LP + "plan/?" + (a ? "from=" + NET.st[a].slug : "") + (a && b ? "&" : "") + (b ? "to=" + NET.st[b].slug : "");
    return abs ? new URL(u, location.href).href : u;
  }
  function renderTrip(t, a, b) {
    var changes = t.legs.length - 1, stops = 0, anyClosed = false;
    t.legs.forEach(function (l) { stops += l.stops; if (l.mid.some(function (s) { return !isOpen(l.line, s); })) anyClosed = true; });
    var ribbon = '<ol class="ribbon">', hiddenCount = 0;
    t.legs.forEach(function (lg, i) {
      var c = NET.lines[lg.line].c;
      ribbon += '<li class="rb-leg" style="--c:' + c + '">';
      if (i === 0) ribbon += '<div class="rb-stop end"><span>' + esc(sname(lg.from)) + "</span></div>";
      ribbon += '<div class="rb-ride"><span class="lbadge" style="--c:' + c + '">' + esc(lname(lg.line)) + "</span><span>" + esc(f(S.towards, { end: sname(lg.towards) })) + " · " + esc(lg.stops === 1 ? S.ride1 : f(S.ride, { n: lg.stops })) + "</span></div>";
      var many = lg.mid.length > 4;
      lg.mid.forEach(function (s, k) {
        var hide = many && k > 0 && k < lg.mid.length - 1; if (hide) hiddenCount++;
        var open = isOpen(lg.line, s);
        ribbon += '<div class="rb-stop' + (open ? "" : " closed") + (hide ? " rb-hidden" : "") + '"><span>' + esc(sname(s)) + (open ? "" : ' <span class="tag">' + esc(S.skip) + "</span>") + "</span></div>";
      });
      if (i === t.legs.length - 1) ribbon += '<div class="rb-stop end"><span>' + esc(sname(lg.to)) + "</span></div>";
      ribbon += "</li>";
      if (i < t.legs.length - 1) ribbon += '<li class="rb-change">' + esc(f(S.change_at, { s: sname(lg.to), line: lname(t.legs[i + 1].line) })) + "</li>";
    });
    ribbon += "</ol>";
    if (hiddenCount) ribbon += '<button type="button" class="rb-more" aria-expanded="false" data-show="' + esc(f(S.show, { n: hiddenCount })) + '">' + esc(f(S.show, { n: hiddenCount })) + "</button>";
    var tks = '<div class="tickets">' + t.tickets.map(function (k) {
      return '<div class="ticket"><span>' + esc(NET.ops[k.op][MR ? "nm" : "n"]) + ": " + esc(sname(k.from)) + " → " + esc(sname(k.to)) + "</span><b>" + money(k.fare[0], k.fare[1]) + "</b></div>";
    }).join("") + "</div>";
    var notes = [];
    if (t.tickets.length > 1) notes.push(["warn", S.two_note]);
    if (t.fare[0] !== t.fare[1]) notes.push(["", S.range_note]);
    if (anyClosed) notes.push(["", S.closed_note]);
    notes.push(["", S.est_note]);
    return '<div class="res-grid"><div>' +
      '<div class="res-sum"><div class="kpi fare"><span>' + esc(S.fare) + "</span><b>" + money(t.fare[0], t.fare[1]) + "</b></div>" +
      '<div class="kpi"><span>' + esc(S.time) + ' <span class="tag est">' + esc(S.est) + "</span></span><b>≈" + t.min + " " + esc(S.min) + "</b></div>" +
      '<div class="kpi"><span>' + esc(S.stops) + "</span><b>" + stops + '</b><span>' + esc(changes ? changes + " " + S.change : S.none) + "</span></div></div>" +
      tks + '<p class="tiny muted">' + esc(S.fare_src) + ".</p>" +
      '<div class="res-notes">' + notes.map(function (n) { return '<p class="note ' + n[0] + '">' + (n[0] ? ICON.warn : ICON.info) + "<span>" + esc(n[1]) + "</span></p>"; }).join("") + "</div>" +
      '<div class="res-actions"><a class="btn btn-sm btn-ghost" href="' + stUrl(b) + '">' + esc(f(S.open_station, { s: sname(b) })) + '</a><button type="button" class="btn btn-sm btn-ghost" data-back>' + esc(S.back) + '</button><button type="button" class="btn btn-sm btn-ghost" data-copy>' + esc(S.copy) + "</button></div>" +
      "</div><div>" + ribbon + "</div></div>";
  }
  $$("[data-planner]").forEach(Planner);

  /* ---------- interactive map ---------- */
  function MapView(shell) {
    var stage = $(".map-stage", shell), svg = $("svg.netmap", stage), panel = $(".map-panel", shell);
    if (!svg) return;
    var vb0 = svg.getAttribute("viewBox").split(/\s+/).map(Number), vb = vb0.slice();
    var apply = function () {
      svg.setAttribute("viewBox", vb.map(function (n) { return n.toFixed(1); }).join(" "));
      stage.classList.toggle("z1", vb0[2] / vb[2] > 1.6); svg.style.setProperty("--ts", (1 / Math.pow(vb0[2] / vb[2], .6)).toFixed(3));
    };
    var clamp = function () {
      var z = vb0[2] / vb[2]; if (z < 1) { vb = vb0.slice(); return; }
      var mx = vb0[2] * .25, my = vb0[3] * .25;
      vb[0] = Math.min(Math.max(vb[0], vb0[0] - mx), vb0[0] + vb0[2] - vb[2] + mx);
      vb[1] = Math.min(Math.max(vb[1], vb0[1] - my), vb0[1] + vb0[3] - vb[3] + my);
    };
    var toSvg = function (cx, cy) {
      var r = svg.getBoundingClientRect(), s = Math.max(vb[2] / r.width, vb[3] / r.height);
      var ox = (r.width * s - vb[2]) / 2, oy = (r.height * s - vb[3]) / 2;
      return [vb[0] - ox + (cx - r.left) * s, vb[1] - oy + (cy - r.top) * s, s];
    };
    var zoom = function (k, cx, cy) {
      var nz = Math.min(7, Math.max(1, (vb0[2] / vb[2]) * k)), nw = vb0[2] / nz, nh = vb0[3] / nz;
      var p = cx == null ? [vb[0] + vb[2] / 2, vb[1] + vb[3] / 2] : toSvg(cx, cy);
      var fx = (p[0] - vb[0]) / vb[2], fy = (p[1] - vb[1]) / vb[3];
      vb = [p[0] - fx * nw, p[1] - fy * nh, nw, nh]; clamp(); apply();
    };
    stage.addEventListener("wheel", function (e) { if (!e.ctrlKey && !e.metaKey && vb0[2] / vb[2] <= 1 && e.deltaY > 0) return; e.preventDefault(); zoom(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY); }, { passive: false });
    var ptrs = {}, start = null, moved = false, pinch0 = 0;
    stage.addEventListener("pointerdown", function (e) {
      ptrs[e.pointerId] = [e.clientX, e.clientY]; moved = false;
      if (Object.keys(ptrs).length === 2) { var p = Object.values(ptrs); pinch0 = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); }
      start = { x: e.clientX, y: e.clientY, vb: vb.slice() };
    });
    stage.addEventListener("pointermove", function (e) {
      if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = [e.clientX, e.clientY];
      var ks = Object.keys(ptrs);
      if (ks.length === 2) {
        var p = Object.values(ptrs), dd = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
        if (pinch0) { zoom(dd / pinch0, (p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2); pinch0 = dd; moved = true; }
        return;
      }
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { moved = true; stage.classList.add("drag"); try { stage.setPointerCapture(e.pointerId); } catch (er) { /* */ } }
      var s = toSvg(0, 0)[2];
      vb[0] = start.vb[0] - dx * s; vb[1] = start.vb[1] - dy * s; clamp(); apply();
    });
    var up = function (e) { delete ptrs[e.pointerId]; pinch0 = 0; stage.classList.remove("drag"); if (Object.keys(ptrs).length === 1) { var p = Object.values(ptrs)[0]; start = { x: p[0], y: p[1], vb: vb.slice() }; } };
    stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
    $$(".map-tools button", shell).forEach(function (b) {
      b.addEventListener("click", function () { var a = b.getAttribute("data-z"); if (a === "in") zoom(1.4); else if (a === "out") zoom(1 / 1.4); else { vb = vb0.slice(); apply(); } });
    });
    // line highlight
    var chips = $$(".map-legend [data-line]", shell), on = {};
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var l = c.getAttribute("data-line"); on[l] = !on[l]; c.setAttribute("aria-pressed", on[l] ? "true" : "false");
        var any = Object.keys(on).some(function (k) { return on[k]; });
        svg.classList.toggle("dim", any);
        $$(".ln", svg).forEach(function (p) { p.classList.toggle("on", !!on[p.getAttribute("data-line")]); });
        $$(".st", svg).forEach(function (s) { s.classList.toggle("on", s.getAttribute("data-lines").split(" ").some(function (x) { return on[x]; })); });
      });
    });
    // station selection
    var sel = null;
    svg.addEventListener("click", function (e) {
      var a = e.target.closest(".st"); if (!a || !panel) return;
      e.preventDefault(); if (moved) return;
      select(a.getAttribute("data-id"), a);
    });
    var select = function (id, a) {
      sel && sel.classList.remove("sel"); sel = a; a.classList.add("sel");
      loadNet().then(function () {
        var s = NET.st[id];
        var rows = s.l.map(function (l) {
          var st = NET.status[l + "|" + id];
          return '<div><dt><span class="lbadge" style="--c:' + NET.lines[l].c + '">' + esc(lname(l)) + "</span></dt><dd>" + esc(st === "open" ? S.open : st === "under_construction" ? S.uc : S.closed) + "</dd></div>";
        }).join("");
        if (s.f) rows += "<div><dt>" + esc(S.first) + '</dt><dd class="num">' + esc(s.f) + "</dd></div>";
        if (s.near) rows += "<div><dt>" + esc(S.near) + "</dt><dd>" + esc(MR ? (s.nearm || s.near) : s.near) + "</dd></div>";
        var open = stOpen(id), planner = $("[data-planner]");
        panel.innerHTML = "<div><h3>" + esc(sname(id)) + '</h3><p class="alt-name" lang="' + (MR ? "en" : "mr") + '">' + esc(MR ? s.en : s.mr) + "</p></div>" +
          (s.l.length > 1 ? '<p><span class="tag violet">' + esc(S.interchange) + "</span></p>" : "") +
          '<dl class="mp-rows">' + rows + "</dl>" +
          '<div class="mp-actions">' + (open ? '<a class="btn btn-sm btn-violet" data-pick="from" href="' + planUrl(id) + '">' + esc(S.from_here) + '</a><a class="btn btn-sm btn-ghost" data-pick="to" href="' + planUrl(null, id) + '">' + esc(S.to_here) + "</a>" : "") +
          '<a class="btn btn-sm btn-ghost" href="' + stUrl(id) + '">' + esc(S.details) + "</a></div>";
        panel.removeAttribute("data-anim"); void panel.offsetWidth; panel.setAttribute("data-anim", "");
        if (planner && planner.pmgSet) $$("[data-pick]", panel).forEach(function (b) {
          b.addEventListener("click", function (e) { e.preventDefault(); planner.pmgSet(b.getAttribute("data-pick"), id); planner.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" }); });
        });
        if (window.innerWidth < 900) panel.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "nearest" });
      });
    };
  }
  $$("[data-map]").forEach(MapView);

  /* ---------- station filters ---------- */
  $$("[data-filter]").forEach(function (box) {
    var q = $("[data-filter-q]", box), chips = $$("[data-filter-line]", box), items = $$("[data-item]", box), empty = $(".empty-state", box), line = "";
    var applyF = function () {
      var n = norm(q ? q.value : ""), shown = 0;
      items.forEach(function (it) {
        var ok = (!line || (" " + it.getAttribute("data-lines") + " ").indexOf(" " + line + " ") > -1) && (!n || it.getAttribute("data-q").indexOf(n) > -1);
        it.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    items.forEach(function (it) { it.setAttribute("data-q", norm(it.getAttribute("data-q"))); });
    q && q.addEventListener("input", applyF);
    chips.forEach(function (c) {
      c.addEventListener("click", function () { line = c.getAttribute("data-filter-line"); chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); }); applyF(); });
    });
  });
  $$("[data-table-filter]").forEach(function (inp) {
    var rows = $$("#" + inp.getAttribute("data-table-filter") + " tbody tr");
    rows.forEach(function (r) { r.setAttribute("data-q", norm(r.getAttribute("data-q") || r.textContent)); });
    inp.addEventListener("input", function () { var n = norm(inp.value); rows.forEach(function (r) { r.hidden = n && r.getAttribute("data-q").indexOf(n) < 0; }); });
  });
  /* fare matrix: highlight row and column */
  $$(".mx").forEach(function (t) {
    var last = [];
    t.addEventListener("mouseover", function (e) {
      var td = e.target.closest("td"); last.forEach(function (x) { x.classList.remove("hl"); }); last = []; if (!td) return;
      var tr = td.parentNode, ci = Array.prototype.indexOf.call(tr.children, td), th = t.tHead.rows[0].children[ci];
      [tr, th].forEach(function (x) { if (x) { x.classList.add("hl"); last.push(x); } });
    });
  });
  /* guide: highlight the section in view */
  var toc = $$(".toc a[href^='#']");
  if (toc.length && io) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    toc.forEach(function (a) { var s = d.getElementById(a.getAttribute("href").slice(1)); s && tio.observe(s); });
  }
})();
