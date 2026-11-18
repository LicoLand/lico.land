/* LicoLand home: the page is ciphertext. Every character is drawn as cipher tiles
   in the place its letter occupies; it reads only inside the lens that follows the
   visitor, or everywhere once the visitor switches to Plain. */
(() => {
  "use strict";

  const { TAU, hash, disc, TILE, INKS, glyph, flip, trace } = window.LicoTiles;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  document.documentElement.classList.add("veiled");
  const GROUND = "#0a0820", QUIET = "#6d659e", FLOOR = "#100d2e";
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------- where every character sits ---------- */
  const probe = document.createElement("canvas").getContext("2d"), metrics = new Map();
  const measure = (style) => {
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if (!metrics.has(font)) {
      probe.font = font;
      const box = probe.measureText("Hxg");
      metrics.set(font, { up: box.fontBoundingBoxAscent, down: box.fontBoundingBoxDescent, cap: probe.measureText("H").actualBoundingBoxAscent, mid: probe.measureText("x").actualBoundingBoxAscent });
    }
    return metrics.get(font);
  };
  let glyphs = [];
  const collect = () => {
    const list = [], range = document.createRange(), born = performance.now();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.parentElement.closest("script, style, [data-clear], .mode") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    let node, index = 0, lastInk = -1;
    while ((node = walker.nextNode())) {
      const style = getComputedStyle(node.parentElement);
      const size = parseFloat(style.fontSize), m = measure(style), text = node.data;
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (/\s/.test(ch)) continue;
        range.setStart(node, i); range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const base = r.top + scrollY + (r.height * m.up) / (m.up + m.down), pad = Math.max(r.width * 0.07, 0.5);
        let x = r.left + scrollX + pad, w = r.width - pad * 2, y, h, kind = 0;
        const tall = /[A-Z0-9bdfhijklt]/.test(ch);
        if (/[.,:;'"!?]/.test(ch)) { const d = m.cap * 0.2; kind = 2; x += w / 2 - d / 2; w = d; h = d; y = base - d; }
        else if (/[-–—/]/.test(ch)) { kind = 3; h = m.mid * 0.26; y = base - m.mid * 0.62; }
        else if (tall) { y = base - m.cap; h = m.cap; }
        else if (/[gjpqy]/.test(ch)) { y = base - m.mid; h = m.mid + m.cap * 0.28; }
        else { y = base - m.mid; h = m.mid; }
        if (kind === 0 && w / h < (tall ? 0.36 : 0.5)) kind = 1;
        index += 1;
        const tier = size >= 44 ? 2 : size >= 24 ? 1 : 0, seed = hash(index * 7919 + 77);
        let ink = QUIET;
        if (tier === 1) ink = INKS[0];
        if (tier === 2) { let k = seed % 7 < 3 ? 0 : 1 + (seed % 3); if (k && k === lastInk) k = 1 + (k % 3); lastInk = k; ink = INKS[k]; }
        const start = born + (reduced.matches ? 0 : 140 + (r.left / innerWidth) * 560 + Math.random() * 180);
        list.push({ x, y, w, h, kind, tier, ink, seed, inside: false, ...glyph(seed, w, h, tall && kind === 0, start), flip: born + 2200 + Math.random() * (tier ? 6000 : 13000) });
      }
    }
    glyphs = list;
  };
  const draw = (c, g, x, y, w, h, now) => {
    if (g.kind === 2) return disc(c, x + w / 2, y + h / 2, w / 2, h / 2);
    if (g.kind === 3) return c.rect(x, y, w, h);
    if (g.kind === 1) {
      const r = w / 2, style = g.seed % 3;
      if (style === 0 || h < w * 2.4) return c.rect(x, y, w, h);
      if (style === 1) { c.rect(x, y + w * 1.4, w, h - w * 1.4); return disc(c, x + r, y + r, r, r); }
      c.rect(x, y, w, h - w * 1.4); return disc(c, x + r, y + h - r, r, r);
    }
    return trace(c, g, x, y, w, h, now);
  };

  /* ---------- the veil and the lens ---------- */
  const veil = document.getElementById("veil"), ctx = veil.getContext("2d"), mark = document.querySelector(".mark");
  const clears = [...document.querySelectorAll("[data-clear]")];
  let dpr = 1, vw = 0, vh = 0, last = 0;
  const lens = { x: -400, y: -400, tx: -400, ty: -400, r: 0, led: false, rest: 0 };
  let plain = reduced.matches, open = plain ? 1 : 0;
  const fit = () => {
    dpr = Math.min(devicePixelRatio || 1, 2); vw = innerWidth; vh = innerHeight;
    veil.width = Math.round(vw * dpr); veil.height = Math.round(vh * dpr);
    collect();
  };
  const buckets = new Map();
  const paint = (now) => {
    requestAnimationFrame(paint);
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    open += ((plain ? 1 : 0) - open) * (1 - Math.exp(-dt * 5.2));
    if (Math.abs((plain ? 1 : 0) - open) < 0.002) open = plain ? 1 : 0;
    veil.style.visibility = open === 1 ? "hidden" : "visible";
    if (open === 1) return;

    if (!lens.led) {
      const box = mark.getBoundingClientRect(), t = now / 1000, away = box.bottom < 80;
      lens.tx = away ? vw * (0.5 + 0.3 * Math.sin(t * 0.5)) : box.left + box.width * (0.5 + 0.44 * Math.sin(t * 0.62 - 1.2));
      lens.ty = away ? vh * (0.45 + 0.2 * Math.sin(t * 0.8)) : box.top + box.height * (0.52 + 0.2 * Math.sin(t * 1.07));
    }
    const follow = 1 - Math.exp(-dt * (lens.led ? 16 : 5));
    lens.x += (lens.tx - lens.x) * follow; lens.y += (lens.ty - lens.y) * follow;
    lens.r += (clamp(vw * 0.118, 104, 188) - lens.r) * (1 - Math.exp(-dt * 6));
    const cover = Math.hypot(Math.max(lens.x, vw - lens.x), Math.max(lens.y, vh - lens.y)) + 24;
    const eased = open * open * (3 - 2 * open), radius = lens.r + (cover - lens.r) * eased;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = GROUND; ctx.fillRect(0, 0, vw, vh);
    /* The floor: ciphertext everywhere, barely above the ground. */
    const cell = vw < 760 ? 30 : 40, shift = scrollY % cell, turn = Math.floor(now / 900);
    ctx.fillStyle = FLOOR; ctx.beginPath();
    for (let j = -1; j * cell < vh + cell; j += 1) {
      const row = j + Math.floor(scrollY / cell);
      for (let i = 0; i * cell < vw; i += 1) {
        const base = hash(i * 92821 + row * 68917), id = hash(base + Math.floor((turn + (base % 23)) / 23));
        if (id % 5 === 0) continue;
        TILE[id % 6](ctx, i * cell, j * cell - shift, cell, cell);
      }
    }
    ctx.fill();

    for (const items of buckets.values()) items.length = 0;
    const top = scrollY - 40, bottom = scrollY + vh + 40, reach = radius + 6;
    for (const g of glyphs) {
      if (g.y + g.h < top || g.y > bottom) continue;
      /* What the visitor has read is sealed again behind them. */
      const inside = Math.hypot(g.x + g.w / 2 - scrollX - lens.x, g.y + g.h / 2 - scrollY - lens.y) < reach;
      if (g.inside && !inside && g.kind === 0) g.flip = now + Math.random() * 260;
      g.inside = inside;
      if (now > g.flip) { if (g.kind === 0) flip(g, now, g.tier > 0); g.flip = now + 2200 + Math.random() * (g.tier ? 6000 : 13000); }
      if (!buckets.has(g.ink)) buckets.set(g.ink, []);
      buckets.get(g.ink).push(g);
    }
    for (const [ink, items] of buckets) {
      if (!items.length) continue;
      ctx.fillStyle = ink; ctx.beginPath();
      for (const g of items) draw(ctx, g, g.x - scrollX, g.y - scrollY, g.w, g.h, now);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(lens.x, lens.y, radius, 0, TAU);
    for (const el of clears) {
      const box = el.getBoundingClientRect(), pad = Number(el.dataset.clear) || 0;
      if (box.bottom < 0 || box.top > vh) continue;
      ctx.roundRect(box.left - pad, box.top - pad, box.width + pad * 2, box.height + pad * 2, pad);
    }
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = `rgba(255, 248, 234, ${0.6 * (1 - eased)})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(lens.x, lens.y, radius, 0, TAU); ctx.stroke();
  };

  const cipherButton = document.getElementById("mode-cipher"), plainButton = document.getElementById("mode-plain");
  const setPlain = (value) => {
    plain = value;
    if (value) document.documentElement.classList.add("has-read");
    cipherButton.setAttribute("aria-pressed", String(!value)); plainButton.setAttribute("aria-pressed", String(value));
  };
  cipherButton.addEventListener("click", () => setPlain(false));
  plainButton.addEventListener("click", () => setPlain(true));
  document.addEventListener("click", (event) => { if (!event.target.closest("a, button, input, form")) setPlain(!plain); });
  addEventListener("keydown", (event) => { if (event.key === "Escape") setPlain(false); });
  const lead = (x, y) => { lens.led = true; lens.tx = x; lens.ty = y; clearTimeout(lens.rest); };
  addEventListener("pointermove", (event) => lead(event.clientX, event.clientY), { passive: true });
  addEventListener("pointerdown", (event) => lead(event.clientX, event.clientY), { passive: true });
  addEventListener("pointerup", (event) => { if (event.pointerType === "touch") lens.rest = setTimeout(() => { lens.led = false; }, 1600); }, { passive: true });
  document.addEventListener("focusin", (event) => { if (!event.target.closest || event.target.matches("input")) return; const box = event.target.getBoundingClientRect(); lead(box.left + Math.min(box.width / 2, 120), box.top + box.height / 2); });
  let refit = 0;
  addEventListener("resize", () => { clearTimeout(refit); refit = setTimeout(fit, 120); });
  if (matchMedia("(hover: none)").matches) document.querySelector(".mode-hint").textContent = "Tap anywhere to read";
  setPlain(plain);

  /* ---------- the wire: one message from edge to edge ---------- */
  const wire = document.getElementById("wire"), pen = wire.getContext("2d"), seen = document.getElementById("seen");
  const lines = ["Meet at nine?", "Approve the draft?", "Ship it."];
  let turn = 0, units = 0, message = null, pending = null, wireVisible = false, waiting = 0;
  const keyReady = crypto.subtle ? crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt"]) : null;
  const sealedSize = async (text) => {
    const data = new TextEncoder().encode(text);
    if (!keyReady) return data.length + 28;
    const sealed = await crypto.subtle.encrypt({ name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) }, await keyReady, data);
    return sealed.byteLength + 12;
  };
  const send = async (text) => {
    const bytes = await sealedSize(text);
    message = { text, start: performance.now(), bytes, counted: false, glyphs: [...text].map((ch, i) => { const seed = hash(i * 53 + units * 977 + text.length); return { ink: INKS[seed % INKS.length], ...glyph(seed, 0.8, 1.04, /[A-Zbdfhijklt?]/.test(ch)) }; }) };
  };
  document.getElementById("say").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("say-input"), text = input.value.trim();
    if (text) { pending = text; input.value = ""; }
  });
  const drawWire = (now) => {
    requestAnimationFrame(drawWire);
    if (!wireVisible) return;
    const W = wire.clientWidth, H = wire.clientHeight, ratio = Math.min(devicePixelRatio || 1, 2);
    if (wire.width !== Math.round(W * ratio)) { wire.width = Math.round(W * ratio); wire.height = Math.round(H * ratio); }
    pen.setTransform(ratio, 0, 0, ratio, 0, 0); pen.clearRect(0, 0, W, H);
    const step = clamp(W / 23, 20, 60), base = H * 0.54 + step * 0.4, edgeA = W * 0.27, edgeB = W * 0.73;
    pen.fillStyle = "#bba5fb";
    for (const x of [edgeA, edgeB]) { pen.beginPath(); pen.roundRect(x - 3, H * 0.1, 6, H * 0.88, 3); pen.fill(); }
    if (message) {
      const { text } = message, span = W + (text.length + 2) * step, elapsed = reduced.matches ? 4.1 : (now - message.start) / 1000;
      const head = -step + (elapsed / 8.2) * span;
      pen.textAlign = "center"; pen.textBaseline = "alphabetic"; pen.font = `660 ${step * 1.52}px "Bricolage Grotesque", sans-serif`;
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === " ") continue;
        const x = head - (text.length - 1 - i) * step;
        if (x < -step || x > W + step) continue;
        const sealed = clamp(Math.min(x - edgeA, edgeB - x) / (step * 0.12), -1, 1) * 0.5 + 0.5;
        if (sealed < 1) { pen.globalAlpha = 1 - sealed; pen.fillStyle = "#fff8ea"; pen.fillText(text[i], x, base); }
        if (sealed > 0) {
          const g = message.glyphs[i], bw = step * 0.8, bh = step * (g.rows === 2 ? 1.08 : 0.78);
          pen.globalAlpha = sealed; pen.fillStyle = g.ink; pen.beginPath(); trace(pen, g, x - bw / 2, base - bh, bw, bh); pen.fill();
        }
      }
      pen.globalAlpha = 1;
      if (!message.counted && head > W * 0.5) { message.counted = true; units += 1; seen.textContent = `${units} unit${units === 1 ? "" : "s"}, ${message.bytes} bytes`; }
      if (!reduced.matches && head - text.length * step > W + step) message = null;
    } else if (!waiting) {
      waiting = setTimeout(() => { waiting = 0; send(pending || lines[turn++ % lines.length]); pending = null; }, pending ? 0 : 700);
    }
    /* The station: a tower the record passes behind. */
    const sw = clamp(step * 2.5, 60, 150), sx = W / 2 - sw / 2, notch = sw / 5;
    pen.fillStyle = "#231d5e"; pen.beginPath();
    pen.rect(sx, notch * 0.95, sw, H - notch * 0.95);
    for (let i = 0; i < 3; i += 1) pen.rect(sx + i * notch * 2, 0, notch, notch);
    pen.fill();
  };
  new IntersectionObserver(([entry]) => { wireVisible = entry.isIntersecting; }).observe(wire);

  (document.fonts?.ready ?? Promise.resolve()).then(() => { fit(); requestAnimationFrame(paint); requestAnimationFrame(drawWire); });
})();
