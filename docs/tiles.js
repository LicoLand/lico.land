/* The LicoLand cipher alphabet. Anything unreadable on any LicoLand site is drawn
   with these tiles: quarter discs, a dome, a bowl, a disc and a block. */
(() => {
  "use strict";
  const TAU = Math.PI * 2;
  const hash = (n) => { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return (n ^ (n >>> 15)) >>> 0; };
  const disc = (c, cx, cy, rx, ry) => { c.moveTo(cx + rx, cy); c.ellipse(cx, cy, rx, ry, 0, 0, TAU); };
  const quarter = (c, cx, cy, rx, ry, from) => { c.moveTo(cx, cy); c.ellipse(cx, cy, rx, ry, 0, from, from + Math.PI / 2); c.closePath(); };
  const half = (c, cx, cy, rx, ry, from) => { c.moveTo(cx + rx * Math.cos(from), cy + ry * Math.sin(from)); c.ellipse(cx, cy, rx, ry, 0, from, from + Math.PI); c.closePath(); };
  const TILE = [
    (c, x, y, w, h) => quarter(c, x + w, y + h, w, h, Math.PI),
    (c, x, y, w, h) => quarter(c, x, y + h, w, h, Math.PI * 1.5),
    (c, x, y, w, h) => quarter(c, x + w, y, w, h, Math.PI / 2),
    (c, x, y, w, h) => quarter(c, x, y, w, h, 0),
    (c, x, y, w, h) => half(c, x + w / 2, y + h, w / 2, h, Math.PI),
    (c, x, y, w, h) => half(c, x + w / 2, y, w / 2, h, 0),
    (c, x, y, w, h) => disc(c, x + w / 2, y + h / 2, w / 2, h / 2),
    (c, x, y, w, h) => c.rect(x, y, w, h),
  ];
  /* Two tiles stacked: the pairs that make a good tall shape. */
  const PAIRS = [[4, 7], [7, 5], [4, 5], [5, 4], [6, 6], [0, 2], [1, 3], [0, 3], [1, 2], [6, 7], [7, 6], [0, 7], [7, 3], [4, 6], [6, 5]];
  const SINGLE = [0, 1, 2, 3, 0, 1, 2, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7];
  const INKS = ["#fff8ea", "#bba5fb", "#5b82ff", "#f2c14e"];
  const column = (seed, tall) => (tall ? PAIRS[seed % PAIRS.length] : [SINGLE[seed % SINGLE.length]]);
  /* A glyph for a box w by h: one or two rows of square-ish tiles. */
  const glyph = (seed, w, h, tall, born = 0) => {
    const rows = tall ? 2 : 1, cols = Math.max(1, Math.round(w / (h / rows))), tiles = new Array(rows * cols);
    for (let i = 0; i < cols; i += 1) column(hash(seed + i * 131), tall).forEach((id, row) => { tiles[row * cols + i] = { id, born }; });
    return { rows, cols, tiles };
  };
  const flip = (g, now, pop) => {
    const i = Math.floor(Math.random() * g.cols);
    column(hash(Math.floor(Math.random() * 1e9)), g.rows === 2).forEach((id, row) => { const tile = g.tiles[row * g.cols + i]; tile.id = id; if (pop) tile.born = now; });
  };
  const backOut = (t) => { const s = 1.7, u = t - 1; return u * u * ((s + 1) * u + s) + 1; };
  const trace = (c, g, x, y, w, h, now = 1e12) => {
    const tw = w / g.cols, th = h / g.rows;
    for (let i = 0; i < g.tiles.length; i += 1) {
      const tile = g.tiles[i], age = (now - tile.born) / 280, s = age >= 1 ? 1 : age <= 0 ? 0 : backOut(age);
      if (s < 0.03) continue;
      const cx = x + (i % g.cols + 0.5) * tw, cy = y + (Math.floor(i / g.cols) + 0.5) * th;
      TILE[tile.id](c, cx - (tw * s) / 2, cy - (th * s) / 2, tw * s, th * s);
    }
  };
  window.LicoTiles = { TAU, hash, disc, TILE, INKS, glyph, flip, trace };
})();
