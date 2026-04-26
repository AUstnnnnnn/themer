/* THEMER · brain ----------------------------------------------------------- */

// -- color math ------------------------------------------------------------

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const pad2  = (n) => n.toString(16).padStart(2, '0');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex({ r, g, b }) {
  return '#' + pad2(clamp(r|0,0,255)) + pad2(clamp(g|0,0,255)) + pad2(clamp(b|0,0,255));
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else              [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

const hexToHsl = (hex) => rgbToHsl(hexToRgb(hex));
const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl));

function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  });
}

function shiftHsl(hex, dh = 0, ds = 0, dl = 0) {
  const h = hexToHsl(hex);
  return hslToHex({ h: h.h + dh, s: clamp(h.s + ds, 0, 100), l: clamp(h.l + dl, 0, 100) });
}

// fl studio uses signed 32-bit int: 0xFFBBGGRR (alpha=FF), low byte = R.
// black #000000 -> 0xFF000000 -> -16777216 (matches dracula example)
function hexToFL(hex) {
  const { r, g, b } = hexToRgb(hex);
  const u = ((0xFF << 24) | (b << 16) | (g << 8) | r) >>> 0;
  return u | 0;
}

// -- key set ---------------------------------------------------------------

const KEY_GROUPS = {
  core: [
    ['BackColor',  'background'],
    ['TextColor',  'text'],
    ['Selected',   'selected'],
    ['Highlight',  'highlight'],
  ],
  grid: [
    ['PRGridback', 'piano roll'],
    ['PLGridback', 'playlist'],
    ['EEGridback', 'event editor'],
  ],
  meter: [
    ['Meter0', 'm0'], ['Meter1', 'm1'], ['Meter2', 'm2'],
    ['Meter3', 'm3'], ['Meter4', 'm4'], ['Meter5', 'm5'],
  ],
  wave: [
    ['WaveClr0', 'w0'], ['WaveClr1', 'w1'], ['WaveClr2', 'w2'],
    ['WaveClr3', 'w3'], ['WaveClr4', 'w4'], ['WaveClr5', 'w5'],
  ],
};

const ALL_KEYS = [...KEY_GROUPS.core, ...KEY_GROUPS.grid, ...KEY_GROUPS.meter, ...KEY_GROUPS.wave];

function deriveTheme(anchors) {
  const { bg, text, accent, accent2 } = anchors;
  return {
    BackColor:  bg,
    TextColor:  text,
    Selected:   accent,
    Highlight:  accent2,
    PRGridback: mixHex(bg, text,    0.03),
    PLGridback: mixHex(bg, accent,  0.06),
    EEGridback: mixHex(bg, accent2, 0.05),
    Meter0: mixHex('#1a8a3a', accent, 0.05),
    Meter1: mixHex('#4cb35a', accent, 0.10),
    Meter2: mixHex('#8fcf3f', accent, 0.10),
    Meter3: mixHex('#d3c63a', accent, 0.10),
    Meter4: mixHex('#e08a35', accent2, 0.15),
    Meter5: mixHex('#d6453d', accent2, 0.15),
    WaveClr0: accent,
    WaveClr1: mixHex(accent,  accent2, 0.25),
    WaveClr2: mixHex(accent,  accent2, 0.50),
    WaveClr3: mixHex(accent,  accent2, 0.75),
    WaveClr4: accent2,
    WaveClr5: mixHex(accent2, text,    0.30),
  };
}

// -- presets ---------------------------------------------------------------

const PRESETS = [
  { name: 'Dracula',     bg: '#282A36', text: '#F8F8F2', accent: '#BD93F9', accent2: '#FF79C6' },
  { name: 'Cyberpunk',   bg: '#0A0E14', text: '#F0F6FC', accent: '#FF2A6D', accent2: '#05D9E8' },
  { name: 'Hyper Light', bg: '#0F1A2E', text: '#C9F4F2', accent: '#F8367A', accent2: '#F2D74A' },
  { name: 'Synthwave',   bg: '#241B2F', text: '#FFE4F1', accent: '#F92AAD', accent2: '#36F9F6' },
  { name: 'Vapor',       bg: '#0F1B2D', text: '#C8D8FF', accent: '#5EE7FF', accent2: '#FF61DC' },
  { name: 'Tokyo Night', bg: '#1A1B26', text: '#C0CAF5', accent: '#7AA2F7', accent2: '#BB9AF7' },
  { name: 'Madoka',      bg: '#14080F', text: '#FFE9F2', accent: '#FF4FA3', accent2: '#FFFFFF' },
  { name: 'Pac-Man',     bg: '#000000', text: '#FFE600', accent: '#FFB8FF', accent2: '#00FFFF' },
  { name: 'Toxic',       bg: '#0B0F0A', text: '#D4FFC8', accent: '#B6FF1A', accent2: '#4DFF89' },
  { name: 'Vader',       bg: '#0A0506', text: '#F2D6D6', accent: '#E10600', accent2: '#8C1A1A' },
  { name: 'Carbon',      bg: '#1B1B1F', text: '#C8C9CD', accent: '#FFB347', accent2: '#5B5E66' },
  { name: 'Eye Safe',    bg: '#2A1F12', text: '#F5DCAF', accent: '#E89A3C', accent2: '#B07034' },
  { name: 'Gold Foil',   bg: '#0E0C08', text: '#F2EAD3', accent: '#D4AF37', accent2: '#8C7A4A' },
  { name: 'Plasma',      bg: '#160B14', text: '#FFE0CC', accent: '#FF5E1A', accent2: '#FF1E8E' },
  { name: 'Mono Black',  bg: '#0E0E10', text: '#E6E6E6', accent: '#FFFFFF', accent2: '#A8A8A8' },
  { name: 'Ivory',       bg: '#F5F1E8', text: '#1A1612', accent: '#C2410C', accent2: '#7C2D12' },
];

// -- state -----------------------------------------------------------------

const state = {
  name: 'Untitled Theme',
  lightMode: false,
  hue: 0, sat: 0, light: 0,
  anchors: { ...PRESETS[0] },
  theme: deriveTheme(PRESETS[0]),
  background: null, // { dataUrl, name, mime, bytes }
  harmony: { base: '#7C5CFF', scheme: 'analogous', colors: [] },
};

// -- PERSIST ---------------------------------------------------------------

const STORE = 'themer:v1';

function saveState() {
  try {
    localStorage.setItem(STORE, JSON.stringify({
      name: state.name,
      lightMode: state.lightMode,
      hue: state.hue, sat: state.sat, light: state.light,
      theme: state.theme,
      anchors: state.anchors,
      harmonyBase: state.harmony.base,
      harmonyScheme: state.harmony.scheme,
    }));
  } catch {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.name)        state.name = d.name;
    if (typeof d.lightMode === 'boolean') state.lightMode = d.lightMode;
    if (typeof d.hue === 'number')   state.hue = d.hue;
    if (typeof d.sat === 'number')   state.sat = d.sat;
    if (typeof d.light === 'number') state.light = d.light;
    if (d.theme)   state.theme   = { ...state.theme, ...d.theme };
    if (d.anchors) state.anchors = d.anchors;
    if (d.harmonyBase)   state.harmony.base   = d.harmonyBase;
    if (d.harmonyScheme) state.harmony.scheme = d.harmonyScheme;
    return true;
  } catch { return false; }
}

// -- HARMONY ---------------------------------------------------------------

function buildHarmony(baseHex, scheme) {
  const m = (dh, ds = 0, dl = 0) => shiftHsl(baseHex, dh, ds, dl);
  switch (scheme) {
    case 'mono':           return [m(0, -10, -28), m(0, -5, -14), m(0, 0, 0), m(0, 5, 14), m(0, 10, 28)];
    case 'analogous':      return [m(-50), m(-25), m(0), m(25), m(50)];
    case 'complementary':  return [m(0, -10, -20), m(0, -5, -10), m(0, 0, 0), m(180, -5, -10), m(180, -10, -20)];
    case 'split':          return [m(0, -10, -15), m(0, 0, 0), m(150), m(180, 5, 10), m(210)];
    case 'triadic':        return [m(0, -10, -15), m(0, 0, 0), m(120), m(240), m(0, 10, 15)];
    case 'tetradic':       return [m(0, 0, 0), m(60), m(180), m(240), m(0, 10, 15)];
    default:               return [m(0)];
  }
}

function harmonyToAnchors(colors, baseHex) {
  // pick darkest as bg, lightest as text, two saturated as accents
  const sorted = colors.map(c => ({ c, l: hexToHsl(c).l })).sort((a, b) => a.l - b.l);
  const bg     = shiftHsl(sorted[0].c, 0, -20, -Math.max(0, sorted[0].l - 12));
  const text   = shiftHsl(sorted[sorted.length - 1].c, 0, -10, +Math.max(0, 92 - sorted[sorted.length - 1].l));
  const mids   = colors.slice().sort((a, b) => hexToHsl(b).s - hexToHsl(a).s);
  const accent  = mids[0] || baseHex;
  const accent2 = mids[1] || shiftHsl(accent, 30);
  return { bg, text, accent, accent2 };
}

// -- DOM refs --------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const els = {
  name: $('themeName'), lightMode: $('lightMode'),
  presets: $('presets'),
  harmonyBase: $('harmonyBase'), harmonyBaseHex: $('harmonyBaseHex'),
  schemeGrid: $('schemeGrid'), harmonyOut: $('harmonyOut'),
  randomize: $('randomize'), reset: $('resetBtn'),
  bgDrop: $('bgDrop'), bgFile: $('bgFile'), bgThumb: $('bgThumb'),
  bgMeta: $('bgMeta'), bgPick: $('bgPick'), bgClear: $('bgClear'),
  hue: $('hue'), sat: $('sat'), light: $('light'),
  hueVal: $('hueVal'), satVal: $('satVal'), lightVal: $('lightVal'),
  coreKeys: $('coreKeys'), gridKeys: $('gridKeys'),
  meterKeys: $('meterKeys'), waveKeys: $('waveKeys'),
  download: $('downloadBtn'),
  rackRows: $('rackRows'), prGrid: $('prGrid'),
  plBody: $('plBody'), mixStrips: $('mixStrips'),
  flBg: $('flBg'),
  thumbCanvas: $('thumbCanvas'),
  toast: $('toast'),
  flPreview: $('flPreview'),
};

function toast(msg) {
  const t = els.toast;
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2400);
}

// -- RENDER: presets -------------------------------------------------------

function renderPresets() {
  els.presets.innerHTML = PRESETS.map((p, i) => `
    <button class="preset" data-i="${i}">
      <div class="preset-swatch">
        <span style="background:${p.bg}"></span>
        <span style="background:${p.text}"></span>
        <span style="background:${p.accent}"></span>
        <span style="background:${p.accent2}"></span>
      </div>
      <div class="preset-name">${p.name}</div>
    </button>
  `).join('');
  els.presets.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = PRESETS[+btn.dataset.i];
      state.anchors = { ...p };
      state.theme = deriveTheme(p);
      els.presets.querySelectorAll('.preset').forEach(b => b.classList.toggle('active', b === btn));
      paint();
    });
  });
  els.presets.querySelector('.preset')?.classList.add('active');
}

// -- RENDER: key swatches --------------------------------------------------

function renderKeyGroup(container, group) {
  container.innerHTML = group.map(([key, label]) => `
    <label class="k" data-key="${key}">
      <span class="k-swatch" style="background:${state.theme[key]}">
        <input type="color" value="${state.theme[key]}" data-k="${key}" />
      </span>
      <span class="k-meta">
        <span class="k-name">${label}</span>
        <span class="k-hex">${state.theme[key].toUpperCase()}</span>
      </span>
    </label>
  `).join('');
  container.querySelectorAll('input[type="color"]').forEach(input => {
    input.addEventListener('input', e => {
      const k = e.target.dataset.k;
      state.theme[k] = e.target.value;
      paint();
    });
  });
}

function renderAllKeys() {
  renderKeyGroup(els.coreKeys,  KEY_GROUPS.core);
  renderKeyGroup(els.gridKeys,  KEY_GROUPS.grid);
  renderKeyGroup(els.meterKeys, KEY_GROUPS.meter);
  renderKeyGroup(els.waveKeys,  KEY_GROUPS.wave);
}

// -- RENDER: harmony out ---------------------------------------------------

function renderHarmonyOut() {
  els.harmonyOut.innerHTML = state.harmony.colors.map(c => `<span style="background:${c}" title="${c}"></span>`).join('');
}

// -- RENDER: fl preview innards --------------------------------------------

const RACK_PATTERNS = [
  { name: 'Kick',    steps: 'X...X...X...X...' },
  { name: 'Snare',   steps: '....X.......X...' },
  { name: 'Hat',     steps: 'X.X.X.X.X.X.X.X.' },
  { name: 'Clap',    steps: '....X..X....X...' },
  { name: 'Perc',    steps: '..X...X.X...X.X.' },
  { name: 'Bass',    steps: 'X..X..X..X..X..X' },
];

function renderRack() {
  els.rackRows.innerHTML = RACK_PATTERNS.map((p, i) => {
    const wave = `var(--fl-wave-${i % 6})`;
    const stepsHtml = [...p.steps].map((c, j) => {
      const beat = j % 4 === 0 ? ' beat' : '';
      const on   = c === 'X' ? ' on' : '';
      return `<div class="rack-step${beat}${on}"></div>`;
    }).join('');
    return `<div class="rack-row" style="--rack-clr:${wave}">
      <div class="rack-name">${p.name}</div>
      <div class="rack-steps">${stepsHtml}</div>
    </div>`;
  }).join('');
}

function renderPianoRoll() {
  // melodic line: sequence of (start%, length%, row 0..7)
  const notes = [
    [0,   8,  4],  [10,  8,  3],  [20,  8,  2],  [30, 12,  1],
    [44, 14,  0],  [60,  6,  2],  [68, 10,  3],  [80, 18,  4],
  ];
  els.prGrid.innerHTML = notes.map(([x, w, r]) =>
    `<div class="pr-note" style="left:${x}%;width:${w}%;top:calc(${r} * (100%/8) + 1px)"></div>`
  ).join('');
}

function renderPlaylist() {
  const tracks = [
    [{ x: 0,  w: 38, c: 0, name: 'Drums' }, { x: 50, w: 30, c: 0, name: 'Drums' }],
    [{ x: 12, w: 26, c: 1, name: 'Bass'  }, { x: 50, w: 26, c: 1, name: 'Bass'  }],
    [{ x: 20, w: 60, c: 4, name: 'Lead'  }],
    [{ x: 32, w: 48, c: 2, name: 'Pad'   }],
    [{ x: 40, w: 40, c: 5, name: 'Vox'   }],
    [{ x: 8,  w: 12, c: 3, name: 'FX'    }, { x: 56, w: 12, c: 3, name: 'FX' }],
  ];
  els.plBody.innerHTML = tracks.map(track => `
    <div class="pl-track">
      ${track.map(c => `<div class="pl-clip" style="left:${c.x}%;width:${c.w}%;--clip-clr:var(--fl-wave-${c.c})">${c.name}</div>`).join('')}
    </div>
  `).join('');
}

function renderMixer() {
  const labels = ['MASTER', 'KICK', 'BASS', 'LEAD', 'PAD', 'VOX', 'FX', 'BUS'];
  els.mixStrips.innerHTML = labels.map((label, i) => {
    const fader = 35 + (i * 7) % 40;          // 35..75
    const meter = 20 + (i * 13) % 60;         // 20..80
    return `<div class="mix-strip">
      <div class="mix-label">${label}</div>
      <div class="mix-fader">
        <div class="fader-track"><div class="fader-thumb" style="bottom:${fader}%"></div></div>
        <div class="meter-track"><div class="meter-fill" style="height:${meter}%"></div></div>
      </div>
      <div class="mix-knob"></div>
      <div class="mix-wave"></div>
    </div>`;
  }).join('');
}

// -- PAINT (theme → CSS vars + UI sync) ------------------------------------

function paint() {
  const t = state.theme;
  const r = document.documentElement.style;
  r.setProperty('--fl-bg',        t.BackColor);
  r.setProperty('--fl-text',      t.TextColor);
  r.setProperty('--fl-selected',  t.Selected);
  r.setProperty('--fl-highlight', t.Highlight);
  r.setProperty('--fl-grid-pr',   t.PRGridback);
  r.setProperty('--fl-grid-pl',   t.PLGridback);
  r.setProperty('--fl-grid-ee',   t.EEGridback);
  for (let i = 0; i < 6; i++) {
    r.setProperty(`--fl-meter-${i}`, t['Meter' + i]);
    r.setProperty(`--fl-wave-${i}`,  t['WaveClr' + i]);
  }
  // global tint sliders → preview filter (matches FL post-processing intent)
  r.setProperty('--fl-tint-h', `${state.hue}deg`);
  r.setProperty('--fl-tint-s', String(1 + state.sat / 128));
  r.setProperty('--fl-tint-b', String(1 + state.light / 256));

  // light mode preview class
  els.flPreview?.classList.toggle('is-light', state.lightMode);

  // hide bg-clear when no bg
  if (els.bgClear) els.bgClear.style.display = state.background ? '' : 'none';

  // sync swatches
  document.querySelectorAll('.k').forEach(el => {
    const k = el.dataset.key;
    const sw = el.querySelector('.k-swatch');
    const inp = el.querySelector('input[type="color"]');
    const hex = el.querySelector('.k-hex');
    if (sw && t[k]) {
      sw.style.background = t[k];
      inp.value = t[k];
      if (hex) hex.textContent = t[k].toUpperCase();
    }
  });

  saveState();
}

// -- HARMONY UI ------------------------------------------------------------

function syncHarmony() {
  state.harmony.colors = buildHarmony(state.harmony.base, state.harmony.scheme);
  renderHarmonyOut();
  els.harmonyBase.value = state.harmony.base.toLowerCase();
  els.harmonyBaseHex.value = state.harmony.base.toUpperCase();
  els.schemeGrid.querySelectorAll('.scheme').forEach(b =>
    b.classList.toggle('active', b.dataset.scheme === state.harmony.scheme));
}

function applyHarmonyToTheme() {
  const anchors = harmonyToAnchors(state.harmony.colors, state.harmony.base);
  state.anchors = anchors;
  state.theme = deriveTheme(anchors);
  els.presets.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
  paint();
}

function randomize() {
  const baseHue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.random() * 30;
  const lit = 55 + Math.random() * 20;
  state.harmony.base = hslToHex({ h: baseHue, s: sat, l: lit });
  const schemes = ['analogous', 'complementary', 'split', 'triadic', 'tetradic'];
  state.harmony.scheme = schemes[Math.floor(Math.random() * schemes.length)];
  syncHarmony();
  applyHarmonyToTheme();
}

// -- BACKGROUND ------------------------------------------------------------

function setBackgroundFromFile(file) {
  if (!file) return;
  if (!/^image\//.test(file.type)) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    state.background = {
      dataUrl,
      name: file.name,
      mime: file.type,
      ext: file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1],
    };
    els.bgThumb.style.backgroundImage = `url("${dataUrl}")`;
    els.bgThumb.querySelector('.bg-empty')?.remove();
    els.bgMeta.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;
    els.flBg.style.backgroundImage = `url("${dataUrl}")`;
    document.documentElement.style.setProperty('--fl-bg-image', `url("${dataUrl}")`);
  };
  reader.readAsDataURL(file);
}

function clearBackground() {
  state.background = null;
  els.bgThumb.style.backgroundImage = '';
  if (!els.bgThumb.querySelector('.bg-empty')) {
    els.bgThumb.insertAdjacentHTML('beforeend', `<span class="bg-empty">drop image · or click</span>`);
  }
  els.bgMeta.textContent = 'no background';
  els.flBg.style.backgroundImage = '';
  document.documentElement.style.setProperty('--fl-bg-image', 'none');
}

// -- THUMBNAIL CANVAS ------------------------------------------------------

async function renderThumbnail() {
  const c = els.thumbCanvas;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const t = state.theme;

  // background
  ctx.fillStyle = t.BackColor;
  ctx.fillRect(0, 0, W, H);

  if (state.background) {
    await new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const ar = img.width / img.height;
        let dw = W, dh = W / ar;
        if (dh < H) { dh = H; dw = H * ar; }
        const dx = (W - dw) / 2, dy = (H - dh) / 2;
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
        // scrim for legibility
        ctx.fillStyle = t.BackColor + 'cc';
        ctx.fillRect(0, 0, W, H);
        resolve();
      };
      img.onerror = resolve;
      img.src = state.background.dataUrl;
    });
  }

  // four quadrant accent blocks
  ctx.fillStyle = t.Selected;
  ctx.fillRect(16, 16, W - 32, 70);
  ctx.fillStyle = t.Highlight;
  ctx.fillRect(16, 96, (W - 32) * 0.55, 12);
  ctx.fillStyle = t.WaveClr2;
  ctx.fillRect(16, 116, (W - 32) * 0.40, 12);
  ctx.fillStyle = t.WaveClr4;
  ctx.fillRect(16, 136, (W - 32) * 0.70, 12);

  // wave gradient strip
  const grad = ctx.createLinearGradient(16, 0, W - 16, 0);
  grad.addColorStop(0,    t.WaveClr0);
  grad.addColorStop(0.2,  t.WaveClr1);
  grad.addColorStop(0.4,  t.WaveClr2);
  grad.addColorStop(0.6,  t.WaveClr3);
  grad.addColorStop(0.8,  t.WaveClr4);
  grad.addColorStop(1,    t.WaveClr5);
  ctx.fillStyle = grad;
  ctx.fillRect(16, 158, W - 32, 16);

  // meter ladder
  const meterColors = [t.Meter0, t.Meter1, t.Meter2, t.Meter3, t.Meter4, t.Meter5];
  const mw = (W - 32) / 6 - 4;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = meterColors[i];
    ctx.fillRect(16 + i * (mw + 4), 184, mw, 16);
  }

  // text label
  ctx.fillStyle = t.TextColor;
  ctx.font = '600 14px "Inter", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.name.slice(0, 26), 16, 220);

  // brand
  ctx.fillStyle = t.TextColor + 'aa';
  ctx.font = '10px "Inter", system-ui, sans-serif';
  ctx.fillText('THEMER · FL Studio', 16, 240);

  return await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.9));
}

// -- .flstheme builder -----------------------------------------------------

function buildFLTheme() {
  const t = state.theme;
  const lines = [];
  const push = (k, v) => lines.push(`${k}=${v}`);

  push('Lightmode',     state.lightMode ? 1 : 0);
  push('Hue',           state.hue);
  push('Saturation',    state.sat);
  push('Lightness',     state.light);
  push('OverrideClips', 0);
  push('BackMode',      state.background ? 1 : 0);

  push('BackColor',  hexToFL(t.BackColor));
  push('TextColor',  hexToFL(t.TextColor));
  push('Selected',   hexToFL(t.Selected));
  push('Highlight',  hexToFL(t.Highlight));
  push('PRGridback', hexToFL(t.PRGridback));
  push('PLGridback', hexToFL(t.PLGridback));
  push('EEGridback', hexToFL(t.EEGridback));

  for (let i = 0; i < 6; i++) push(`Meter${i}`,   hexToFL(t['Meter' + i]));
  for (let i = 0; i < 6; i++) push(`WaveClr${i}`, hexToFL(t['WaveClr' + i]));
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  stops.forEach((s, i) => push(`WaveSpc${i}`, s.toFixed(2)));

  if (state.background) {
    push('BackPicFilename', `bg.${state.background.ext}`);
    push('BackHTMLFileName', '');
  }
  return lines.join('\r\n') + '\r\n';
}

function safeFolderName(name) {
  return name.trim().replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 40) || 'Untitled_Theme';
}

async function exportZip() {
  const folder = safeFolderName(state.name);
  const fileBase = folder.toLowerCase();

  const flText = buildFLTheme();
  const thumbBlob = await renderThumbnail();

  const zip = new JSZip();
  const dir = zip.folder(folder);
  dir.file(`${fileBase}.flstheme`, flText);
  dir.file(`thm${fileBase}.jpg`, thumbBlob);

  if (state.background) {
    const dataUrl = state.background.dataUrl;
    const base64 = dataUrl.split(',')[1];
    dir.file(`bg.${state.background.ext}`, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folder}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// -- WIRING ----------------------------------------------------------------

function wireTopbar() {
  els.name.addEventListener('input', () => { state.name = els.name.value || 'Untitled Theme'; saveState(); });
  els.lightMode.addEventListener('change', () => {
    state.lightMode = els.lightMode.checked;
    paint();
  });
  els.download.addEventListener('click', () => {
    exportZip().then(() => toast('exported · check downloads'))
               .catch(err => toast('export failed: ' + err.message));
  });
  els.reset?.addEventListener('click', () => {
    state.anchors = { ...PRESETS[0] };
    state.theme   = deriveTheme(PRESETS[0]);
    state.hue = state.sat = state.light = 0;
    state.lightMode = false;
    els.lightMode.checked = false;
    els.hue.value = 0; els.sat.value = 0; els.light.value = 0;
    els.hueVal.textContent = '0'; els.satVal.textContent = '0'; els.lightVal.textContent = '0';
    clearBackground();
    els.presets.querySelectorAll('.preset').forEach((b, i) => b.classList.toggle('active', i === 0));
    paint();
    toast('reset');
  });
}

function wireHarmony() {
  els.harmonyBase.addEventListener('input', e => {
    state.harmony.base = e.target.value.toUpperCase();
    syncHarmony();
  });
  els.harmonyBase.addEventListener('change', () => applyHarmonyToTheme());
  els.harmonyBaseHex.addEventListener('input', e => {
    let v = e.target.value.trim();
    if (v[0] !== '#') v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      state.harmony.base = v.toUpperCase();
      syncHarmony();
      applyHarmonyToTheme();
    }
  });
  els.schemeGrid.querySelectorAll('.scheme').forEach(btn => {
    btn.addEventListener('click', () => {
      state.harmony.scheme = btn.dataset.scheme;
      syncHarmony();
      applyHarmonyToTheme();
    });
  });
  els.randomize.addEventListener('click', () => {
    randomize();
    toast('palette randomized');
  });
}

function wireBackground() {
  els.bgPick.addEventListener('click', e => { e.stopPropagation(); els.bgFile.click(); });
  els.bgClear.addEventListener('click', e => { e.stopPropagation(); clearBackground(); });
  els.bgDrop.addEventListener('click', () => els.bgFile.click());
  els.bgFile.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) setBackgroundFromFile(f);
  });
  ['dragenter', 'dragover'].forEach(ev =>
    els.bgDrop.addEventListener(ev, e => { e.preventDefault(); els.bgDrop.classList.add('dragging'); })
  );
  ['dragleave', 'drop'].forEach(ev =>
    els.bgDrop.addEventListener(ev, e => { e.preventDefault(); els.bgDrop.classList.remove('dragging'); })
  );
  els.bgDrop.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (f) setBackgroundFromFile(f);
  });
}

function wireSliders() {
  const bind = (input, val, key) => {
    input.addEventListener('input', () => {
      state[key] = +input.value;
      val.textContent = input.value;
      paint();
    });
  };
  bind(els.hue,   els.hueVal,   'hue');
  bind(els.sat,   els.satVal,   'sat');
  bind(els.light, els.lightVal, 'light');
}

// -- BOOT ------------------------------------------------------------------

function boot() {
  const restored = loadState();
  renderPresets();
  renderAllKeys();
  renderRack();
  renderPianoRoll();
  renderPlaylist();
  renderMixer();
  syncHarmony();
  wireTopbar();
  wireHarmony();
  wireBackground();
  wireSliders();

  // restore UI from loaded state
  if (restored) {
    els.name.value         = state.name;
    els.lightMode.checked  = state.lightMode;
    els.hue.value          = state.hue;
    els.sat.value          = state.sat;
    els.light.value        = state.light;
    els.hueVal.textContent = state.hue;
    els.satVal.textContent = state.sat;
    els.lightVal.textContent = state.light;
    // deactivate any preset highlight (custom theme loaded)
    els.presets.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
  }

  paint();

  // animate mixer meters subtly
  setInterval(() => {
    document.querySelectorAll('.meter-fill').forEach((el, i) => {
      const base = 25 + (i * 11) % 50;
      const wobble = Math.random() * 25;
      el.style.height = clamp(base + wobble, 5, 95) + '%';
    });
  }, 380);
}

document.addEventListener('DOMContentLoaded', boot);
