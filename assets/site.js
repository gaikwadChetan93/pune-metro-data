/* Pune Metro Guide — progressive enhancement. No dependencies.
   Every page works without this file; it adds the journey planner, the
   interactive map, search and filters, and motion (off under reduced-motion).
   Third parties (Google Tag Manager → GA4, Microsoft Clarity) load only after the
   visitor opts in; see the analytics section and ANALYTICS_SETUP.md. */
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

  /* ---------- analytics: consent, loaders and event tracking ----------
     Nothing is requested from Google or Microsoft until the visitor opts in (Consent Mode v2,
     basic implementation). Two choices: "analytics" (GA4 through Google Tag Manager) and
     "replay" (Microsoft Clarity). The IDs come from <meta name="pmg-gtm"> and
     <meta name="pmg-clarity">, written by build_site.py from analytics/config.json; without
     them there's no banner and nothing leaves the page. Events go through track() only, and
     only names and parameters in analytics/taxonomy.json (check_site.py enforces it).
     ?pmg_debug=1 logs every event to the console (and keeps logging; ?pmg_debug=0 stops). */
  var A = (function () {
    var GTM = meta("pmg-gtm"), CLR = meta("pmg-clarity"), CTX = {};
    try { CTX = JSON.parse(meta("pmg-ctx") || "{}"); } catch (e) { /* bad meta */ }
    var store = function (s, k, v) {
      try { var st = window[s]; if (v === undefined) return st.getItem(k); if (v === null) st.removeItem(k); else st.setItem(k, v); } catch (e) { /* storage blocked */ }
      return null;
    };
    var qd = /[?&]pmg_debug=([01])/.exec(location.search);
    if (qd) store("localStorage", "pmg-debug", qd[1] === "1" ? "1" : null);
    var DEBUG = store("localStorage", "pmg-debug") === "1";
    var LOG = window.__pmgLog = [];
    var OFFER = (GTM ? "a" : "") + (CLR ? "r" : "");
    var KEY = "pmg-consent", YEAR = 365 * 864e5;
    var C = null;
    try {
      var c0 = JSON.parse(store("localStorage", KEY) || "null");
      // A choice counts if it's recent and covered everything offered now (a new tool asks again).
      if (c0 && c0.v === 1 && Date.now() - c0.t < YEAR && OFFER.split("").every(function (k) { return (c0.o || "").indexOf(k) > -1; })) C = c0;
    } catch (e) { /* */ }
    var dl = function () { return (window.dataLayer = window.dataLayer || []); };
    var gtag = function () { dl().push(arguments); };

    /* Campaign and referrer of the tab's first page, kept on the device so they still count if
       the visitor accepts on a later page (GA4 would otherwise see an internal referrer). */
    var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
    var land = null;
    try { land = JSON.parse(store("sessionStorage", "pmg-land") || "null"); } catch (e) { /* */ }
    if (!land) {
      var q0 = new URLSearchParams(location.search), keep = [];
      UTM.forEach(function (k) { if (q0.get(k)) keep.push(k + "=" + encodeURIComponent(q0.get(k).slice(0, 100))); });
      var ref = "";
      try { var ru = new URL(d.referrer); if (ru.host !== location.host) ref = ru.origin + ru.pathname; } catch (e) { /* none */ }
      land = { q: keep.join("&"), r: ref, s: 0 };
      store("sessionStorage", "pmg-land", JSON.stringify(land));
    }
    function pageCtx() {
      var loc = location.href, ref = d.referrer;
      if (!land.s) {
        if (land.q && !/[?&]utm_/.test(location.search)) loc = location.origin + location.pathname + (location.search ? location.search + "&" : "?") + land.q + location.hash;
        ref = land.r || ref;
        land.s = 1; store("sessionStorage", "pmg-land", JSON.stringify(land));
      }
      return { content_group: CTX.g || "other", content_id: CTX.id || undefined, page_language: MR ? "mr" : "en", page_location: loc, page_referrer: ref || undefined };
    }

    function loadGTM() {
      if (!GTM || window.__pmgGtm) return;
      window.__pmgGtm = 1;
      gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied",
        functionality_storage: "denied", personalization_storage: "denied", security_storage: "granted" });
      gtag("set", "ads_data_redaction", true);
      gtag("consent", "update", { analytics_storage: "granted" });
      /* The Google tag ignores settings passed to it from Tag Manager (seen Nov 2026), but it honours
         gtag("set"). So the page sets page_location / page_referrer here (campaign carry-over), turns
         off the automatic page_view, and sends its own page_view through the GTM event tag, which
         adds content_group, content_id and page_language. One page_view per page load. */
      var pc = pageCtx(), st = { send_page_view: false, page_location: pc.page_location };
      if (pc.page_referrer) st.page_referrer = pc.page_referrer;
      gtag("set", st);
      dl().push({ pmg_page: pc });
      dl().push({ "gtm.start": Date.now(), event: "gtm.js" });
      dl().push({ pmg_p: null });
      dl().push({ event: "pmg_event", pmg_name: "page_view", pmg_p: {} });
      LOG.push({ event: "page_view", params: {}, ga: true, clarity: false });
      var s = d.createElement("script");
      s.async = true; s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM);
      s.onerror = function () { if (DEBUG) console.info("[pmg] GTM didn't load (blocked or offline). The site works the same."); };
      (d.head || de).appendChild(s);
    }
    function loadClarity() {
      if (!CLR || window.__pmgClr) return;
      window.__pmgClr = 1;
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, d, "clarity", "script", CLR);
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
      window.clarity("set", "content_group", CTX.g || "other");
      window.clarity("set", "page_language", MR ? "mr" : "en");
    }
    function wipe(re) {
      d.cookie.split(";").forEach(function (c) {
        var n = c.split("=")[0].trim(); if (!re.test(n)) return;
        var h = location.hostname.split(".");
        for (var i = 0; i < h.length - 1; i++) d.cookie = n + "=;Max-Age=0;path=/;domain=." + h.slice(i).join(".");
        d.cookie = n + "=;Max-Age=0;path=/";
      });
    }
    function apply(next) {
      var prev = C || {};
      C = { v: 1, a: !!next.a && !!GTM, r: !!next.r && !!CLR, o: OFFER, t: Date.now() };
      store("localStorage", KEY, JSON.stringify(C));
      var reload = false;
      if (prev.a && !C.a) { wipe(/^_ga|^_gid$|^_gat/); if (window.__pmgGtm) { gtag("consent", "update", { analytics_storage: "denied" }); reload = true; } }
      if (prev.r && !C.r) { wipe(/^_clck$|^_clsk$/); if (window.__pmgClr) { window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" }); window.clarity("consent", false); reload = true; } }
      // A tag that's already running can't be unloaded, so a withdrawal reloads the page without it.
      if (reload) { location.reload(); return; }
      if (C.a) loadGTM();
      if (C.r) loadClarity();
    }

    /* ---- the banner and the settings panel (non-modal; equal weight for yes and no) ---- */
    var T = MR ? {
      title: "पुणे मेट्रो मार्गदर्शक अधिक चांगले करण्यास मदत करा",
      a_intro: "तुमची परवानगी असल्यास आम्ही Google Analytics ने भेटी मोजतो आणि कोणती पाने आणि सुविधा वापरल्या जातात ते पाहतो.",
      r_intro: "Microsoft Clarity ने पाने कशी वापरली जातात (क्लिक आणि स्क्रोल) ते पाहतो; तुम्ही टाइप केलेले लपवले जाते.",
      tail: "जाहिराती नाहीत, खाते नाही. हा निर्णय पानाच्या तळाशी 'गोपनीयता सेटिंग्ज' मधून कधीही बदला.",
      more: "गोपनीयता धोरण", all: "सर्व स्वीकारा", none: "नाकारा", choose: "निवडा", save: "निवड जतन करा",
      a_name: "आकडेवारी (Google Analytics)", a_desc: "भेटी आणि वापरलेली पाने व सुविधा मोजते. _ga कुकीज, 13 महिन्यांपर्यंत.",
      r_name: "सत्र रेकॉर्डिंग आणि हीटमॅप (Microsoft Clarity)", r_desc: "क्लिक, स्क्रोल आणि पानाची मांडणी नोंदवते. टाइप केलेला मजकूर लपवला जातो. _clck/_clsk कुकीज, 1 वर्षापर्यंत.",
      saved: "तुमची निवड जतन झाली."
    } : {
      title: "Help improve Pune Metro Guide",
      a_intro: "With your OK, we use Google Analytics to count visits and see which pages and features people use.",
      r_intro: "Microsoft Clarity shows us how pages are used (clicks and scrolling), with anything you type hidden.",
      tail: "No ads, no account. Change your mind any time under Privacy settings at the bottom of every page.",
      more: "Privacy policy", all: "Allow all", none: "Reject all", choose: "Choose", save: "Save choices",
      a_name: "Analytics (Google Analytics)", a_desc: "Counts visits and which pages and features are used. _ga cookies, up to 13 months.",
      r_name: "Session replay and heatmaps (Microsoft Clarity)", r_desc: "Records clicks, scrolling and page layout so we can fix what's confusing. Typed text is hidden. _clck/_clsk cookies, up to a year.",
      saved: "Your choice is saved."
    };
    var box = null;
    function panel(focus) {
      if (!OFFER) return;
      if (box) box.remove();
      var cur = C || { a: false, r: false };
      var opt = function (k, name, desc) {
        return '<label class="cc-opt"><input type="checkbox" data-cc-k="' + k + '"' + (cur[k] ? " checked" : "") + '><span><b>' + esc(name) + "</b><small>" + esc(desc) + "</small></span></label>";
      };
      box = d.createElement("section");
      box.className = "cc"; box.setAttribute("aria-label", T.title); box.setAttribute("data-nosnippet", "");
      box.innerHTML = '<div class="cc-in"><p class="cc-t">' + esc(T.title) + "</p><p>" + esc((GTM ? T.a_intro + " " : "") + (CLR ? T.r_intro + " " : "") + T.tail) +
        ' <a href="' + ROOT + 'privacy.html#website">' + esc(T.more) + "</a></p>" +
        '<div class="cc-opts"' + (focus ? "" : " hidden") + ">" + (GTM ? opt("a", T.a_name, T.a_desc) : "") + (CLR ? opt("r", T.r_name, T.r_desc) : "") + "</div>" +
        '<div class="cc-act"><button type="button" class="btn btn-sm" data-cc="all">' + esc(T.all) + '</button><button type="button" class="btn btn-sm" data-cc="none">' + esc(T.none) +
        '</button><button type="button" class="btn btn-sm btn-ghost" data-cc="' + (focus ? "save" : "choose") + '">' + esc(focus ? T.save : T.choose) + "</button></div></div>";
      d.body.appendChild(box);
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-cc]"); if (!b) return;
        var k = b.getAttribute("data-cc");
        if (k === "choose") { $(".cc-opts", box).hidden = false; b.setAttribute("data-cc", "save"); b.textContent = T.save; var cb = $("input", box); cb && cb.focus(); return; }
        var pick = { a: k === "all", r: k === "all" };
        if (k === "save") $$("[data-cc-k]", box).forEach(function (i) { pick[i.getAttribute("data-cc-k")] = i.checked; });
        box.remove(); box = null;
        var opener = $("[data-consent-open]"); if (focus && opener) opener.focus();
        apply(pick);
      });
      if (focus) { var first = $("input", box); first && first.focus(); }
    }
    if (OFFER) {
      $$("[data-consent-open]").forEach(function (b) { b.hidden = false; b.addEventListener("click", function () { panel(true); }); });
      if (C) { if (C.a) loadGTM(); if (C.r) loadClarity(); }
      else panel(false);
    }

    /* ---- track(): the only way events leave the page ---- */
    var EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/, PHONE = /\+?\d[\d\s().-]{7,}\d/;
    function clean(p) {
      var o = {};
      Object.keys(p || {}).forEach(function (k) {
        var v = p[k];
        if (v === undefined || v === null || v === "" || !/^[a-z][a-z0-9_]{0,39}$/.test(k)) return;
        if (typeof v === "boolean") v = v ? "true" : "false";
        else if (typeof v === "number") { if (!isFinite(v)) return; }
        else { v = String(v).replace(/\s+/g, " ").trim().slice(0, 100); if (EMAIL.test(v) || PHONE.test(v)) v = "(redacted)"; }
        o[k] = v;
      });
      return o;
    }
    var recent = {}, count = 0, once = {};
    function track(name, p) {
      var params = clean(p), sig = name + JSON.stringify(params), now = Date.now();
      if (recent[sig] && now - recent[sig] < 700) return; // the same event twice in a row is a double fire
      recent[sig] = now;
      var ga = !!(C && C.a && window.__pmgGtm), cl = !!(C && C.r && window.__pmgClr);
      LOG.push({ event: name, params: params, ga: ga, clarity: cl });
      if (DEBUG) console.info("[pmg] " + name, params, ga ? "→ GA4" : "(not sent to GA4: no consent or not configured)");
      if (++count > 300) return; // hard cap per page view
      if (ga) {
        dl().push({ pmg_p: null }); // reset, so parameters of the previous event can't carry over
        dl().push({ event: "pmg_event", pmg_name: name, pmg_p: params });
      }
      if (cl) window.clarity("event", name);
    }
    track.once = function (key, name, p) { if (once[key]) return; once[key] = 1; track(name, p); };
    return { track: track, ctx: CTX, on: !!OFFER };
  })();
  var track = A.track, PG = A.ctx.g || "other";

  /* ---------- app promotion (APP_CONVERSION_STRATEGY.md) ----------
     Promotions are marked data-promo="<placement>" in the HTML. One counts as seen (app_promotion_view)
     once half of it has been on screen for a second. Store links carry data-slot; a click is an
     app_download_click. That is a click, not an install: installs are only in Play Console, by the
     referrer each link carries (utm_medium = page_slot, utm_campaign = web_<variant>). */
  var PROMO = (function () {
    var cfg = {}; try { cfg = JSON.parse(meta("pmg-app") || "{}"); } catch (e) { /* */ }
    var ua = navigator.userAgent || "";
    var IOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    de.className += IOS ? " is-ios" : /Android/i.test(ua) ? " is-android" : "";
    /* The App Store link (build_site.py APP_STORE_URL). Safari on an iPhone shows Apple's own banner for it
       (apple-itunes-app), so the site's banner is for the other iPhone browsers. */
    var AS = cfg.ios || "", SAFARI = IOS && /Version\/[\d.]+.*Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
    var toStore = function (root) { if (IOS && AS) $$('a[href^="https://play.google.com/store/apps/details"]', root).forEach(function (a) { a.href = AS; }); };
    var st = function (s, k, v) { try { var o = window[s]; if (v === undefined) return o.getItem(k); o.setItem(k, v); } catch (e) { /* blocked */ } return null; };
    /* The experiment: one at a time, a random variant kept on the device, ?pmg_xp=<variant> to force one. */
    var V = "none", vs = cfg.v || [];
    if (vs.length) {
      var key = "pmg-xp-" + cfg.xp, qv = /[?&]pmg_xp=([a-z0-9_]+)/.exec(location.search);
      V = qv && vs.indexOf(qv[1]) > -1 ? qv[1] : st("localStorage", key);
      if (vs.indexOf(V) < 0) V = vs[Math.floor(Math.random() * vs.length)];
      st("localStorage", key, V);
    }
    var pv = (+st("sessionStorage", "pmg-pv") || 0) + 1; st("sessionStorage", "pmg-pv", String(pv));
    /* Play links: put the variant in the referrer so Play Console can split installs by it. */
    $$('a[href^="https://play.google.com/store/apps/details"]').forEach(function (a) {
      try {
        var u = new URL(a.href), r = new URLSearchParams(u.searchParams.get("referrer") || "");
        if (V !== "none") r.set("utm_campaign", "web_" + V);
        u.searchParams.set("referrer", r.toString()); a.href = u.href;
      } catch (e) { /* leave it */ }
    });
    /* /app/?get=qr (the QR code on wide screens): a phone goes straight to its own store. */
    if (/[?&]get=qr(&|$)/.test(location.search)) {
      var and = /Android/i.test(ua), dest = IOS ? AS : and && cfg.play ? cfg.play + "&referrer=" + encodeURIComponent("utm_source=website&utm_medium=desktop_qr&utm_campaign=web" + (V !== "none" ? "_" + V : "")) : "";
      if (dest) {
        track("app_download_click", { promotion_placement: "qr", promotion_variant: V, app_platform: IOS ? "ios" : "android", link_domain: IOS ? "apps.apple.com" : "play.google.com" });
        location.replace(dest);
      }
    }
    var place = function (el) { var p = el.closest("[data-promo]"); return p ? p.getAttribute("data-promo") : ""; };
    var seen = function (pl) { track.once("apv" + pl, "app_promotion_view", { promotion_placement: pl, promotion_variant: V, app_platform: IOS ? "ios" : "android" }); };
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) el.pmgT = setTimeout(function () { io.unobserve(el); seen(el.getAttribute("data-promo")); }, 1000);
        else clearTimeout(el.pmgT);
      });
    }, { threshold: 0.5 }) : null;
    var watch = function (el) { if (io && el.getAttribute("data-promo") !== "sticky_banner") io.observe(el); };
    $$("[data-promo]").forEach(watch);
    var installed = false;
    // Chrome on Android can tell whether the app is installed, once the app declares this site (see APP_CONVERSION_STRATEGY.md).
    if (navigator.getInstalledRelatedApps) navigator.getInstalledRelatedApps().then(function (l) { if (l && l.length) { installed = true; de.className += " has-app"; } }).catch(function () {});

    /* Sticky banner: phones only (on an iPhone it leads to the App Store, and not in Safari, which shows Apple's banner), never over the consent banner, the menu
       or a focused field, never twice in a session after a dismissal or a click, and after two
       dismissals it rests for a week. When it appears depends on the variant:
         st_a: after 35% of the page (at least 700 px), or a journey result.
         st_b: only once the visitor is engaged: a journey result, a second page in this visit with 25% scrolled, or 70% of one page. */
    var sb = $("#pmg-sb"), sbOn = false, signal = false;
    var phone = window.matchMedia && matchMedia("(max-width:760px)").matches;
    var n = +st("localStorage", "pmg-sb-n") || 0, last = +st("localStorage", "pmg-sb-t") || 0;
    var resting = n >= 2 && Date.now() - last < 7 * 864e5;
    var allowed = sb && phone && (!IOS || (AS && !SAFARI)) && !st("sessionStorage", "pmg-sb") && !resting;
    if (allowed) toStore(sb);
    var depth = function () { var h = de.scrollHeight - innerHeight; return h > 0 ? scrollY / h : 0; };
    var due = function () {
      if (signal) return true;
      if (V === "st_b") return depth() >= 0.7 || (pv >= 2 && depth() >= 0.25);
      return depth() >= 0.35 && scrollY >= 700;
    };
    var clear = function () {
      if (installed || $(".cc") || d.body.classList.contains("locked")) return false;
      var a = d.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
      // Not while an in-page promotion is on screen: one ask at a time.
      return !$$(".apromo,.showcase-in,.plan-promo").some(function (el) { var r = el.getBoundingClientRect(); return r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2; });
    };
    var show = function () {
      sbOn = true; sb.hidden = false; void sb.offsetWidth; sb.classList.add("in"); d.body.classList.add("sb-on");
      seen("sticky_banner");
    };
    var hide = function (why) {
      sb.classList.remove("in"); d.body.classList.remove("sb-on");
      st("sessionStorage", "pmg-sb", why);
      setTimeout(function () { sb.hidden = true; }, 500);
      allowed = false;
    };
    var check = function () { if (allowed && !sbOn && due() && clear()) show(); };
    if (allowed) {
      var busy = false;
      addEventListener("scroll", function () { if (busy) return; busy = true; setTimeout(function () { busy = false; check(); }, 250); }, { passive: true });
      $(".sb-x", sb).addEventListener("click", function () {
        st("localStorage", "pmg-sb-n", String(n + 1)); st("localStorage", "pmg-sb-t", String(Date.now()));
        track("sticky_banner_dismiss", { promotion_variant: V });
        hide("x");
      });
      // Tuck it away while typing (the keyboard is up) or while the menu is open.
      d.addEventListener("focusin", function (e) { if (sbOn && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) sb.classList.add("tuck"); });
      d.addEventListener("focusout", function () { if (sbOn) setTimeout(function () { var a = d.activeElement; if (!a || !/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) sb.classList.remove("tuck"); }, 200); });
    }
    return {
      v: V, ios: IOS, place: place,
      clicked: function () { st("sessionStorage", "pmg-sb", "c"); if (sbOn) hide("c"); else allowed = false; },
      /* After a journey result: a small card in the result, and a signal for the banner. */
      journey: function (out) {
        var tpl = $("#pmg-tpl-plan");
        if (tpl && (!IOS || AS) && !installed && !$(".plan-promo", out)) {
          var node = tpl.content ? tpl.content.firstElementChild.cloneNode(true) : null;
          if (node) {
            $$("a[href]", node).forEach(function (a) {
              try { var u = new URL(a.href), r = new URLSearchParams(u.searchParams.get("referrer") || ""); if (V !== "none") r.set("utm_campaign", "web_" + V); u.searchParams.set("referrer", r.toString()); a.href = u.href; } catch (e) { /* */ }
            });
            toStore(node);
            out.appendChild(node); watch(node);
          }
        }
        signal = true; setTimeout(check, 4000);
      }
    };
  })();

  /* Search terms leave the page only when they matched public text (a station name or list
     entry), so free text can't. */
  var termOf = function (q, n) { q = String(q || "").toLowerCase().replace(/\s+/g, " ").trim(); return n > 0 ? q.slice(0, 40) : "(no match)"; };
  var debounced = function (ms, fn) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; };
  var area = function (el) {
    var x = el.closest("[data-area]"); if (x) return x.getAttribute("data-area");
    return el.closest(".hd") ? "header" : el.closest("#menu") ? "menu" : el.closest(".ft") ? "footer" : el.closest(".crumbs") ? "breadcrumb" :
      el.closest(".toc") ? "guide_toc" : el.closest(".map-panel") ? "map_panel" : el.closest(".result") ? "planner_result" : "content";
  };

  /* Clicks: declared events first (data-track="name" data-track-<param>="value"), then
     links by kind. One click sends at most one event. */
  d.addEventListener("click", function (e) {
    if (e.pmgDone) return; // a component already tracked this click (map station, planner chip)
    var t = e.target.closest ? e.target : e.target.parentElement; if (!t) return;
    var dt = t.closest("[data-track]");
    if (dt) {
      var p = {};
      Array.prototype.forEach.call(dt.attributes, function (at) { if (at.name.indexOf("data-track-") === 0) p[at.name.slice(11).replace(/-/g, "_")] = at.value; });
      track(dt.getAttribute("data-track"), p); return;
    }
    var a = t.closest("a[href]"); if (!a) return;
    var href = a.getAttribute("href");
    if (/^mailto:/i.test(href)) return track("contact_click", { method: "email", nav_area: area(a) });
    if (/^tel:/i.test(href)) return track("contact_click", { method: "phone", nav_area: area(a) });
    var u; try { u = new URL(href, location.href); } catch (er) { return; } // getAttribute: SVG links have no string .href
    if (!/^https?:$/.test(u.protocol)) return;
    if (u.host === location.host) {
      if (a.hasAttribute("hreflang")) return track("language_change", { from_language: MR ? "mr" : "en", to_language: MR ? "en" : "mr" });
      if (u.pathname === location.pathname) return; // in-page anchors
      var pp = PROMO.place(a);
      if (pp) return track("app_promotion_click", { promotion_placement: pp, promotion_variant: PROMO.v, link_url: u.pathname });
      return track("navigation_click", { nav_area: area(a), link_url: u.pathname, link_text: a.textContent });
    }
    if (u.host === "play.google.com" || u.host === "apps.apple.com") {
      var slot = a.getAttribute("data-slot") || PROMO.place(a) || "other";
      PROMO.clicked();
      return track("app_download_click", { promotion_placement: slot, promotion_variant: PROMO.v, app_platform: u.host === "apps.apple.com" ? "ios" : "android", link_domain: u.host });
    }
    var kind = /(^|\.)google\.[a-z.]+$/.test(u.host) && u.pathname.indexOf("/maps") === 0 ? "maps" : /punemetrorail|punerimetro|mahametro/.test(u.host) ? "official" : "other";
    track("outbound_link_click", { link_url: u.origin + u.pathname, link_domain: u.host, link_type: kind, nav_area: area(a) });
  });
  /* Scroll depth: 25/50/75/90 once each, on real scrolling only. */
  (function () {
    var marks = [25, 50, 75, 90], busy = false;
    window.addEventListener("scroll", function () {
      if (busy) return; busy = true;
      requestAnimationFrame(function () {
        busy = false;
        var h = de.scrollHeight - window.innerHeight; if (h < 240) return;
        var pct = window.scrollY / h * 100;
        marks.forEach(function (m) { if (pct >= m) track.once("sd" + m, "scroll_depth", { percent_scrolled: m }); });
      });
    }, { passive: true });
  })();
  /* FAQ: toggle doesn't bubble, so listen in the capture phase. */
  d.addEventListener("toggle", function (e) {
    var el = e.target; if (!el.open || !el.matches || !el.matches("details.acc")) return;
    var all = $$("details.acc"), i = all.indexOf(el), s = $("summary", el);
    track.once("faq" + i, "faq_expand", { faq_question: s ? s.textContent : "", faq_index: i + 1 });
  }, true);

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
      track("theme_change", { theme: next });
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
  function Combo(root, onPick, ploc) {
    var input = $("input", root), list = $(".combo-list", root), box = $(".combo-in", root), clr = $(".combo-clear", root);
    var self = { id: null }, items = [], act = -1, field = root.classList.contains("to") ? "to" : "from", searched = {};
    var report = debounced(1500, function () {
      var q = input.value.trim(); if (q.length < 2 || self.id) return;
      var term = termOf(norm(q) ? q : "", items.length);
      if (searched[term]) return; searched[term] = 1;
      track("station_search", { field: field, search_term: term, search_result_count: items.length, planner_location: ploc });
    });
    var chosen = function (id, how) {
      if (!id) return;
      track("station_search_result_select", { field: field, station_id: NET.st[id].slug, station_name: NET.st[id].en, selection_method: how, planner_location: ploc });
    };
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
    var pick = function (id, how) { self.set(id); chosen(id, how); };
    input.addEventListener("focus", function () { self.onOpen && self.onOpen(); loadNet().then(function () { input.select && input.select(); open(); }); });
    input.addEventListener("input", function () { self.id = null; box.classList.toggle("has", !!input.value); open(); report(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (!list.classList.contains("open")) open(); else hl(act + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); hl(act - 1); }
      else if (e.key === "Enter") { if (list.classList.contains("open") && items[act]) { e.preventDefault(); pick(items[act], "keyboard"); } }
      else if (e.key === "Escape") { close(); }
    });
    input.addEventListener("blur", function () { setTimeout(function () { close(); if (!self.id && NET && input.value) { var q = norm(input.value), hit = Object.keys(NET.st).filter(function (id) { return NET.st[id].keys.some(function (k) { return k === q; }); }); if (hit.length === 1) { self.set(hit[0], true); chosen(hit[0], "typed"); } } }, 160); });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    list.addEventListener("click", function (e) { var li = e.target.closest("li[data-id]"); if (li) pick(li.getAttribute("data-id"), "list"); });
    clr && clr.addEventListener("click", function () { self.set(null, true); input.focus(); });
    self.input = input;
    return self;
  }

  /* ---------- planner ---------- */
  function Planner(root) {
    var out = $(".result", root), msg = $(".planner-msg", root), mode = root.getAttribute("data-planner") || "home", isPage = mode === "page";
    var ploc = mode;
    var from = Combo($(".field.from", root), null, ploc), to = Combo($(".field.to", root), function () {}, ploc);
    var opened = false, route = "";
    var openP = function () { if (!opened) { opened = true; track("journey_planner_open", { planner_location: ploc }); } };
    from.onOpen = to.onOpen = openP;
    var slug = function (id) { return id ? NET.st[id].slug : undefined; };
    var run = function (push, trig) {
      msg.textContent = "";
      var status = "ok", t = null;
      if (!from.id) status = "missing_origin";
      else if (!to.id) status = "missing_destination";
      else if (from.id === to.id) status = "same_station";
      else if (!stOpen(from.id) || !stOpen(to.id)) status = "station_not_open";
      else if (!(t = trip(from.id, to.id))) status = "no_route";
      track("journey_search", { planner_location: ploc, trigger: trig || "submit", origin_station: slug(from.id), destination_station: slug(to.id), result_status: status });
      if (status === "missing_origin") { msg.textContent = S.pick_from; out.classList.remove("show"); from.input.focus(); return; }
      if (status === "missing_destination") { msg.textContent = S.pick_to; out.classList.remove("show"); to.input.focus(); return; }
      if (status === "same_station") { msg.textContent = S.same; out.classList.remove("show"); return; }
      if (status === "station_not_open") { msg.textContent = f(S.not_open, { s: sname(stOpen(from.id) ? to.id : from.id) }); out.classList.remove("show"); return; }
      if (status === "no_route") { msg.textContent = S.no_route; out.classList.remove("show"); return; }
      route = slug(from.id) + ">" + slug(to.id);
      var stops = 0; t.legs.forEach(function (l) { stops += l.stops; });
      track("journey_result_view", { planner_location: ploc, trigger: trig || "submit", origin_station: slug(from.id), destination_station: slug(to.id), route: route,
        total_stops: stops, interchange_count: t.legs.length - 1, metro_line: t.legs.map(function (l) { return l.line; }).join(">"),
        estimated_fare: t.fare[0], estimated_fare_max: t.fare[1], estimated_duration: t.min, ticket_count: t.tickets.length });
      out.innerHTML = renderTrip(t, from.id, to.id);
      out.classList.remove("show"); void out.offsetWidth; out.classList.add("show");
      PROMO.journey(out);
      var rc = function (action) { track("journey_result_click", { action: action, planner_location: ploc, route: route }); };
      $$("[data-rc]", out).forEach(function (el) { el.addEventListener("click", function (e) { e.pmgDone = true; rc(el.getAttribute("data-rc")); }); });
      var mb = $(".rb-more", out); mb && mb.addEventListener("click", function () { var r = $(".ribbon", out), ex = r.classList.toggle("expanded"); mb.textContent = ex ? S.hide : mb.getAttribute("data-show"); mb.setAttribute("aria-expanded", ex); if (ex) rc("show_stops"); });
      var cp = $("[data-copy]", out); cp && cp.addEventListener("click", function () {
        var u = planUrl(from.id, to.id, true);
        if (navigator.share && /Mobi/.test(navigator.userAgent)) { rc("share"); navigator.share({ url: u, title: d.title }).catch(function () {}); }
        else if (navigator.clipboard) { rc("copy_link"); navigator.clipboard.writeText(u).then(function () { cp.textContent = S.copied; }); }
      });
      var bk = $("[data-back]", out); bk && bk.addEventListener("click", function () { rc("return_trip"); swap("return_trip"); });
      if (isPage && push !== false) history.replaceState(null, "", "?from=" + NET.st[from.id].slug + "&to=" + NET.st[to.id].slug);
      if (push === true && !isPage) out.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "nearest" });
    };
    var swapBtn = $(".swap", root);
    var swap = function (trig) { var a = from.id, b = to.id; from.set(b, true); to.set(a, true); swapBtn.classList.toggle("spin"); if (from.id && to.id) run(undefined, trig || "swap"); };
    swapBtn.addEventListener("click", function () { openP(); track("journey_station_swap", { planner_location: ploc }); loadNet().then(function () { swap(); }); });
    $("form", root).addEventListener("submit", function (e) { e.preventDefault(); openP(); loadNet().then(function () { run(true, "submit"); }, fail); });
    $$("[data-quick]", root).forEach(function (b) {
      b.addEventListener("click", function () { openP(); var p = b.getAttribute("data-quick").split(">"); loadNet().then(function () { from.set(p[0], true); to.set(p[1], true); run(true, "quick_route"); }); });
    });
    var fail = function () { msg.textContent = S.load_fail; track("journey_search", { planner_location: ploc, result_status: "data_error" }); };
    root.pmgSet = function (which, id) { openP(); loadNet().then(function () { (which === "from" ? from : to).set(id, true); if (from.id && to.id) run(true, "map_panel"); else (which === "from" ? to : from).input.focus(); }); };
    var qs = new URLSearchParams(location.search);
    var preset = root.getAttribute("data-from");
    if (qs.get("from") || qs.get("to") || preset) {
      loadNet().then(function () {
        var fs = qs.get("from") ? NET.bySlug[qs.get("from")] : preset, ts = qs.get("to") ? NET.bySlug[qs.get("to")] : null;
        if (fs) from.set(fs, true); if (ts) to.set(ts, true);
        if (fs && ts) run(false, "shared_link");
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
      '<div class="res-actions"><a class="btn btn-sm btn-ghost" data-rc="open_station" href="' + stUrl(b) + '">' + esc(f(S.open_station, { s: sname(b) })) + '</a><button type="button" class="btn btn-sm btn-ghost" data-back>' + esc(S.back) + '</button><button type="button" class="btn btn-sm btn-ghost" data-copy>' + esc(S.copy) + "</button></div>" +
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
    /* One zoom event per gesture: reported 1 s after the last change, at most 10 per page view. */
    var zMethod = "", zSent = 0, zLast = 1;
    var zReport = debounced(1000, function () {
      var z = Math.round(vb0[2] / vb[2] * 10) / 10;
      if (z === zLast || zSent >= 10) return; zLast = z; zSent++;
      track("metro_map_zoom", { zoom_method: zMethod, zoom_level: z, map_location: PG });
    });
    var zoom = function (k, cx, cy, how) {
      var nz = Math.min(7, Math.max(1, (vb0[2] / vb[2]) * k)), nw = vb0[2] / nz, nh = vb0[3] / nz;
      var p = cx == null ? [vb[0] + vb[2] / 2, vb[1] + vb[3] / 2] : toSvg(cx, cy);
      var fx = (p[0] - vb[0]) / vb[2], fy = (p[1] - vb[1]) / vb[3];
      vb = [p[0] - fx * nw, p[1] - fy * nh, nw, nh]; clamp(); apply();
      zMethod = how || "button"; zReport();
    };
    if ("IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { mio.disconnect(); track("metro_map_view", { map_location: PG }); } }, { threshold: .4 });
      mio.observe(stage);
    }
    stage.addEventListener("wheel", function (e) { if (!e.ctrlKey && !e.metaKey && vb0[2] / vb[2] <= 1 && e.deltaY > 0) return; e.preventDefault(); zoom(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY, "wheel"); }, { passive: false });
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
        if (pinch0) { zoom(dd / pinch0, (p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2, "pinch"); pinch0 = dd; moved = true; }
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
      b.addEventListener("click", function () { var a = b.getAttribute("data-z"); if (a === "in") zoom(1.4); else if (a === "out") zoom(1 / 1.4); else { vb = vb0.slice(); apply(); zMethod = "reset"; zReport(); } });
    });
    // line highlight
    var chips = $$(".map-legend [data-line]", shell), on = {};
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var l = c.getAttribute("data-line"); on[l] = !on[l]; c.setAttribute("aria-pressed", on[l] ? "true" : "false");
        track("metro_map_line_select", { metro_line: l, selected: !!on[l], map_location: PG });
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
      e.preventDefault(); e.pmgDone = true; if (moved) return;
      select(a.getAttribute("data-id"), a);
    });
    var select = function (id, a) {
      sel && sel.classList.remove("sel"); sel = a; a.classList.add("sel");
      loadNet().then(function () {
        var s = NET.st[id];
        track("metro_map_station_select", { station_id: s.slug, station_name: s.en, metro_line: s.l.join(" "), is_interchange: s.l.length > 1,
          station_status: stOpen(id) ? "open" : "not_open", map_location: PG });
        var mpa = function (action) { return ' data-track="metro_map_panel_action" data-track-action="' + action + '" data-track-station_id="' + esc(s.slug) + '" data-track-map_location="' + esc(PG) + '"'; };
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
          '<div class="mp-actions">' + (open ? '<a class="btn btn-sm btn-violet" data-pick="from"' + mpa("plan_from") + ' href="' + planUrl(id) + '">' + esc(S.from_here) + '</a><a class="btn btn-sm btn-ghost" data-pick="to"' + mpa("plan_to") + ' href="' + planUrl(null, id) + '">' + esc(S.to_here) + "</a>" : "") +
          '<a class="btn btn-sm btn-ghost"' + mpa("station_details") + ' href="' + stUrl(id) + '">' + esc(S.details) + "</a></div>";
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
    var shownN = 0, done = {};
    var applyF = function () {
      var n = norm(q ? q.value : ""), shown = 0;
      items.forEach(function (it) {
        var ok = (!line || (" " + it.getAttribute("data-lines") + " ").indexOf(" " + line + " ") > -1) && (!n || it.getAttribute("data-q").indexOf(n) > -1);
        it.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      shownN = shown;
    };
    var report = debounced(1500, function () {
      var v = q.value.trim(); if (v.length < 2) return;
      var term = termOf(v, shownN); if (done[term]) return; done[term] = 1;
      track("search", { search_type: "station_list", search_term: term, search_result_count: shownN });
    });
    items.forEach(function (it) { it.setAttribute("data-q", norm(it.getAttribute("data-q"))); });
    q && q.addEventListener("input", function () { applyF(); report(); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () { line = c.getAttribute("data-filter-line"); chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); }); applyF(); track("station_list_filter", { metro_line: line }); });
    });
  });
  $$("[data-table-filter]").forEach(function (inp) {
    var rows = $$("#" + inp.getAttribute("data-table-filter") + " tbody tr"), shownN = 0, done = {};
    rows.forEach(function (r) { r.setAttribute("data-q", norm(r.getAttribute("data-q") || r.textContent)); });
    var report = debounced(1500, function () {
      var v = inp.value.trim(); if (v.length < 2) return;
      var term = termOf(v, shownN); if (done[term]) return; done[term] = 1;
      track("search", { search_type: "fare_table", search_term: term, search_result_count: shownN });
    });
    inp.addEventListener("input", function () { var n = norm(inp.value); shownN = 0; rows.forEach(function (r) { r.hidden = n && r.getAttribute("data-q").indexOf(n) < 0; if (!r.hidden) shownN++; }); report(); });
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
