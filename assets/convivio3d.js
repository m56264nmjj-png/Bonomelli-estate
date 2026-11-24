/* CONVIVIO in 3D (solo per convivio-3d.html).
   Il tavolo è costruito qui, pezzo per pezzo, con geometrie di three.js: nessun file di modello, nessuna immagine scaricata.
   three.js sta in assets/vendor/three/ e si scarica solo quando il visitatore preme il pulsante.
   Nessuna chiamata di rete oltre a quei due file. I testi stanno nell'HTML, in due lingue. */
const stage = document.getElementById('c3d');
if (stage) start();

function start() {
  const root = document.documentElement;
  const btn = document.getElementById('c3d-open');
  const status = document.getElementById('c3d-status');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function say(key) {
    Array.prototype.forEach.call(status.querySelectorAll('[data-msg]'), function (m) { m.hidden = m.getAttribute('data-msg') !== key; });
    status.hidden = !key;
  }
  function text(id) {
    const m = document.getElementById(id);
    if (!m) return '';
    const sp = m.querySelector('[lang="' + (root.lang === 'en' ? 'en' : 'it') + '"]');
    return (sp || m).textContent.trim();
  }
  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  function fail(canvas) {
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    stage.classList.remove('is-live', 'is-loading');
    btn.hidden = true;
    say('fail');
  }

  btn.hidden = false;
  btn.addEventListener('click', function () {
    if (stage.classList.contains('is-loading') || stage.classList.contains('is-live')) return;
    if (!hasWebGL()) { fail(); return; }
    stage.classList.add('is-loading');
    btn.disabled = true;
    say('load');
    let canvas = null;
    Promise.all([
      import(new URL('./vendor/three/three.module.min.js', import.meta.url).href),
      import(new URL('./vendor/three/OrbitControls.js', import.meta.url).href)
    ]).then(function (mods) {
      canvas = document.createElement('canvas');
      canvas.className = 'c3d-canvas';
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', text('c3d-label'));
      canvas.setAttribute('aria-describedby', 'c3d-how');
      stage.insertBefore(canvas, stage.firstChild);
      const viewer = build(mods[0], mods[1].OrbitControls, canvas, stage, reduce, function () { fail(canvas); });
      stage.classList.remove('is-loading');
      stage.classList.add('is-live');
      say(null);
      btn.hidden = true;
      try { canvas.focus({ preventScroll: true }); } catch (e) {}
      stage.c3d = viewer; /* per le prove: lettura dell'angolo della camera */
    }).catch(function () { fail(canvas); });
  });
}

/* ---------- misure del pezzo, in metri (dalla scheda: 100 × 50 × h 45 cm, travertino circa 2 cm, vetro circa 6 mm) ---------- */
const L = 1.0, W = 0.5, H = 0.45;
const GLASS = 0.006, STONE = 0.02;
const BAND_FLAT = 0.006, BAND_WAVE = 0.005;          /* fascia in ferro sotto la pietra: piatto + bordo ondulato */
const Y_STONE = H - GLASS - STONE;                    /* sotto della pietra */
const Y_BAND = Y_STONE - BAND_FLAT - BAND_WAVE;       /* sotto della fascia */
const FRAME_X = 0.40;                                 /* i due cavalletti stanno a 10 cm dalle teste */
const BAR_W = 0.036, BAR_T = 0.012;                   /* piatto degli archi: largo 3,6 cm, spesso 1,2 cm */
const Y_ROS = 0.18;                                   /* altezza della rosetta, dove i due archi si toccano */
const FOOT_Z = 0.21, FOOT = 0.044, FOOT_H = 0.006;    /* piedini quadrati */
const ARM_Z = 0.22;                                   /* dove l'arco alto incontra la fascia */

function rng(seed) { /* numeri casuali ripetibili: il modello è uguale a ogni visita */
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function canvas2d(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* Travertino tagliato controfalda: fasce e vene lungo il lato lungo, piccoli pori. */
function drawTravertineTop() {
  const w = 2048, h = 1024, c = canvas2d(w, h), g = c.getContext('2d'), r = rng(7);
  g.fillStyle = '#bdb5a6'; g.fillRect(0, 0, w, h);
  const tones = ['#d2cbbd', '#c6bfb1', '#b3a895', '#a99a83', '#b59f84', '#beb6a9', '#9c9383', '#dad4c8', '#aea596', '#b9b1a6', '#c9c1b2'];
  function wave() {
    const a1 = 1 + r() * 5, f1 = 0.002 + r() * 0.004, p1 = r() * 6.3, a2 = 0.5 + r() * 2, f2 = 0.01 + r() * 0.02, p2 = r() * 6.3, tilt = (r() - 0.5) * 10;
    return function (x) { return a1 * Math.sin(x * f1 + p1) + a2 * Math.sin(x * f2 + p2) + tilt * (x / w - 0.5); };
  }
  let y = -10;
  while (y < h + 10) {
    const bh = 2 + r() * r() * 52, top = wave(), bot = wave();
    g.globalAlpha = 0.3 + r() * 0.55;
    const tone = tones[Math.floor(r() * tones.length)], fade = g.createLinearGradient(0, 0, w, 0); /* la falda si accende e si spegne lungo la lastra */
    for (let k = 0; k <= 6; k++) fade.addColorStop(k / 6, tone + (r() < 0.3 ? '30' : r() < 0.6 ? '90' : 'ff'));
    g.fillStyle = fade;
    g.beginPath();
    for (let x = 0; x <= w; x += 16) g.lineTo(x, y + top(x));
    for (let x = w; x >= 0; x -= 16) g.lineTo(x, y + bh + bot(x));
    g.closePath(); g.fill();
    y += bh * (0.45 + r() * 0.6);
  }
  for (let i = 0; i < 26; i++) { /* nuvole di tono, allungate */
    const cx = r() * w, cy = r() * h, rad = 120 + r() * 260;
    g.save(); g.translate(cx, cy); g.scale(3.2, 1);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rad);
    const light = r() > 0.5;
    gr.addColorStop(0, light ? 'rgba(232,227,216,.2)' : 'rgba(140,126,106,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(-rad, -rad, rad * 2, rad * 2); g.restore();
  }
  for (let i = 0; i < 150; i++) { /* vene sottili */
    const f = wave(), y0 = r() * h, x0 = r() * w * 0.6 - 100, len = 200 + r() * 1100;
    g.globalAlpha = 0.18 + r() * 0.36;
    g.strokeStyle = r() > 0.35 ? (r() > 0.5 ? '#8a7556' : '#7d705e') : '#e9e0cf';
    g.lineWidth = 0.6 + r() * 1.8;
    g.beginPath();
    for (let x = x0; x <= x0 + len; x += 14) g.lineTo(x, y0 + f(x));
    g.stroke();
  }
  const rows = []; for (let i = 0; i < 46; i++) rows.push(r() * h);
  for (let i = 0; i < 2600; i++) { /* pori, raccolti lungo le falde */
    const x = r() * w, yy = rows[Math.floor(r() * rows.length)] + (r() + r() + r() - 1.5) * 14;
    const rx = 1 + r() * r() * 7, ry = 0.6 + r() * 1.5;
    const filled = r() < 0.3;
    g.globalAlpha = filled ? 0.55 : 0.3 + r() * 0.5;
    g.fillStyle = filled ? '#e6e0d3' : '#5a4e3e';
    g.beginPath(); g.ellipse(x, yy, rx, ry, 0, 0, 6.3); g.fill();
  }
  g.globalAlpha = 1;
  const im = g.getImageData(0, 0, w, h), d = im.data; /* grana fine */
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 12; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(im, 0, 0);
  return c;
}
/* Costa della lastra: più chiara, con i pori aperti. Restituisce colore e rilievo. */
function drawTravertineEdge() {
  const w = 2048, h = 48, c = canvas2d(w, h), b = canvas2d(w, h), g = c.getContext('2d'), gb = b.getContext('2d'), r = rng(23);
  g.fillStyle = '#d8ccb5'; g.fillRect(0, 0, w, h);
  gb.fillStyle = '#fff'; gb.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    g.globalAlpha = 0.12 + r() * 0.25; g.fillStyle = ['#efe7d6', '#cfc0a4', '#c2b193', '#d9ccb4'][Math.floor(r() * 4)];
    g.fillRect(r() * w - 200, r() * h, 200 + r() * 900, 1 + r() * 5);
  }
  for (let i = 0; i < 620; i++) {
    const x = r() * w, y = 3 + r() * (h - 6), big = r() < 0.07, rx = big ? 3 + r() * 7 : 0.7 + r() * 2.6, ry = big ? 1.2 + r() * 2.2 : 0.5 + r() * 1.2;
    const a = 0.3 + r() * 0.45;
    g.globalAlpha = a; g.fillStyle = big ? '#4a3d2e' : '#6a5842';
    g.beginPath(); g.ellipse(x, y, rx, ry, (r() - 0.5) * 0.5, 0, 6.3); g.fill();
    gb.globalAlpha = Math.min(1, a + 0.3); gb.fillStyle = '#000';
    gb.beginPath(); gb.ellipse(x, y, rx, ry, 0, 0, 6.3); gb.fill();
  }
  return { color: c, bump: b };
}
/* Grana del ferro battuto e verniciato: rilievo fine, irregolare. */
function drawIronGrain() {
  const s = 256, c = canvas2d(s, s), g = c.getContext('2d'), r = rng(51);
  g.fillStyle = '#808080'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 5200; i++) {
    const v = Math.floor(70 + r() * 120);
    g.globalAlpha = 0.5; g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
    g.beginPath(); g.arc(r() * s, r() * s, 0.6 + r() * 2.2, 0, 6.3); g.fill();
  }
  return c;
}
function drawBlob(inner, outer) {
  const s = 256, c = canvas2d(s, s), g = c.getContext('2d');
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, inner); gr.addColorStop(0.55, outer.replace('ALPHA', '0.35')); gr.addColorStop(1, outer.replace('ALPHA', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  return c;
}

function build(THREE, OrbitControls, canvas, stage, reduce, onLost) {
  const GROUND = 0x11150f;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(GROUND);
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.05, 30);
  const target = new THREE.Vector3(0, 0.215, 0);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function tex(cnv, srgb, rx, ry) {
    const t = new THREE.CanvasTexture(cnv);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (rx) t.repeat.set(rx, ry || rx);
    t.anisotropy = maxAniso;
    return t;
  }

  /* ---- luce di studio: un ambiente morbido costruito qui (riflessi su vetro e ferro), più tre luci ---- */
  (function () {
    const env = new THREE.Scene();
    const c = canvas2d(16, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#f3ede2'); gr.addColorStop(0.32, '#8d8a80'); gr.addColorStop(0.5, '#3a3d36'); gr.addColorStop(0.62, '#1a1e17'); gr.addColorStop(1, '#0c0f0a');
    g.fillStyle = gr; g.fillRect(0, 0, 16, 256);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ map: tex(c, true), side: THREE.BackSide }));
    env.add(dome);
    function box(col, k, w, h, x, y, z) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0.3, 0); env.add(m);
    }
    box(0xfff1dc, 9, 4, 3, 4, 6, 4);       /* luce principale, calda */
    box(0xdfe8ff, 3, 5, 2.5, -6, 3, 1);    /* schiarita fredda */
    box(0xeed3a6, 3.5, 3, 2, -3, 2.5, -6);   /* controluce bronzo */
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.03).texture;
    pm.dispose(); dome.geometry.dispose();
  })();
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x262b22, 0.75));
  const key = new THREE.DirectionalLight(0xfff0dc, 1.9);
  key.position.set(0.7, 2.6, 1.1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -0.9; key.shadow.camera.right = 0.9; key.shadow.camera.top = 0.9; key.shadow.camera.bottom = -0.9;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 6;
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.004; key.shadow.radius = 5;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf0d6ab, 1.0);
  rim.position.set(-1.6, 1.1, -1.9);
  scene.add(rim);

  /* ---- materiali ---- */
  const edge = drawTravertineEdge();
  const stoneTop = new THREE.MeshStandardMaterial({ map: tex(drawTravertineTop(), true), roughness: 0.6, metalness: 0, envMapIntensity: 0.45 });
  const stoneEdge = new THREE.MeshStandardMaterial({ map: tex(edge.color, true), bumpMap: tex(edge.bump, false), bumpScale: 1.2, roughness: 0.9, metalness: 0, envMapIntensity: 0.6 });
  const grain = drawIronGrain();
  const iron = new THREE.MeshStandardMaterial({ color: 0x56595b, metalness: 0.32, roughness: 0.6, bumpMap: tex(grain, false, 48), bumpScale: 0.6, envMapIntensity: 1.1 });
  const ironSmall = iron.clone(); ironSmall.bumpMap = tex(grain, false, 3, 2); /* per i pezzi con coordinate 0-1 */
  const glassTop = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: GLASS, ior: 1.5, roughness: 0.03, metalness: 0, envMapIntensity: 1.25, specularIntensity: 1 });
  const glassEdge = new THREE.MeshPhysicalMaterial({ color: 0xb4dccd, transmission: 0.8, thickness: 0.03, ior: 1.5, roughness: 0.12, metalness: 0, envMapIntensity: 1, emissive: 0x16372d, emissiveIntensity: 0.5 });

  const table = new THREE.Group();
  scene.add(table);
  function add(geo, mat, x, y, z, noShadow) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = !noShadow; m.receiveShadow = !noShadow;
    table.add(m);
    return m;
  }
  function rect(w, d, r) {
    const s = new THREE.Shape(), x = w / 2, y = d / 2;
    if (!r) { s.moveTo(-x, -y); s.lineTo(x, -y); s.lineTo(x, y); s.lineTo(-x, y); s.closePath(); return s; }
    s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x, y - r); s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
    s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }
  function flat(shape, depth, bevel) { /* estrusione in piedi: la sagoma è la pianta, lo spessore sale lungo Y */
    const g = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2, curveSegments: 6 });
    g.rotateX(-Math.PI / 2); g.translate(0, bevel, 0);
    return g;
  }

  /* ---- piano in travertino, spigoli appena smussati ---- */
  (function () {
    const g = flat(rect(L, W, 0.003), STONE, 0.0015);
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    const side = g.groups[1];
    for (let i = 0; i < p.count; i++) {
      if (i >= side.start && i < side.start + side.count) uv.setXY(i, (Math.abs(n.getX(i)) > Math.abs(n.getZ(i)) ? p.getZ(i) : p.getX(i)) + 0.5, p.getY(i) / STONE);
      else uv.setXY(i, p.getX(i) / L + 0.5, 0.5 - p.getZ(i) / W);
    }
    add(g, [stoneTop, stoneEdge], 0, Y_STONE, 0);
  })();

  /* ---- vetro temperato sopra la pietra, con la costa verde ---- */
  add(new THREE.BoxGeometry(L, GLASS, W), [glassEdge, glassEdge, glassTop, glassTop, glassEdge, glassEdge], 0, H - GLASS / 2, 0, true);

  /* ---- fascia in ferro sotto la pietra: un piatto e, sopra, il bordo ondulato ---- */
  (function () {
    const inner = function () { const h = new THREE.Path(); const x = L / 2 - 0.045, y = W / 2 - 0.045; h.moveTo(-x, -y); h.lineTo(-x, y); h.lineTo(x, y); h.lineTo(x, -y); h.closePath(); return h; };
    const plate = rect(L - 0.014, W - 0.014, 0.002); plate.holes.push(inner());
    add(flat(plate, BAND_FLAT, 0.001), iron, 0, Y_BAND, 0);
    const amp = 0.005, hx = L / 2 - 0.001 - amp, hy = W / 2 - 0.001 - amp, pts = [];
    function run(x0, y0, x1, y1, nx, ny, lobes) {
      const steps = lobes * 8;
      for (let i = 0; i < steps; i++) {
        const t = i / steps, a = amp * Math.abs(Math.sin(Math.PI * t * lobes));
        pts.push(new THREE.Vector2(x0 + (x1 - x0) * t + nx * a, y0 + (y1 - y0) * t + ny * a));
      }
    }
    run(-hx, -hy, hx, -hy, 0, -1, 18); run(hx, -hy, hx, hy, 1, 0, 9); run(hx, hy, -hx, hy, 0, 1, 18); run(-hx, hy, -hx, -hy, -1, 0, 9);
    const wave = new THREE.Shape(pts); wave.holes.push(inner());
    add(flat(wave, BAND_WAVE, 0.001), iron, 0, Y_BAND + BAND_FLAT, 0);
  })();

  /* ---- i due cavalletti: un arco basso con i piedi a terra e un arco alto che regge la fascia, uniti dalla rosetta ---- */
  function arc(R, a0, a1) { /* piatto curvato: settore di corona, estruso per la larghezza del piatto */
    const s = new THREE.Shape();
    s.absarc(0, 0, R + BAR_T / 2, a0, a1, false);
    s.absarc(0, 0, R - BAR_T / 2, a1, a0, true);
    s.closePath();
    const b = 0.0015;
    const g = new THREE.ExtrudeGeometry(s, { depth: BAR_W - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: 56 });
    g.translate(0, 0, -(BAR_W - 2 * b) / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }
  (function () {
    /* arco basso: passa dai piedini e sale fin sotto la rosetta */
    const yA = Y_ROS - BAR_T / 2, yF = FOOT_H - 0.002, h1 = yA - yF;
    const R1 = (FOOT_Z * FOOT_Z + h1 * h1) / (2 * h1), c1 = yA - R1, t1 = Math.asin((yF - c1) / R1);
    const low = arc(R1, t1, Math.PI - t1);
    /* arco alto: parte dalla rosetta e arriva sotto la fascia */
    const yB = Y_ROS + BAR_T / 2, yE = Y_BAND + 0.002, h2 = yE - yB;
    const R2 = (ARM_Z * ARM_Z + h2 * h2) / (2 * h2), c2 = yB + R2, t2 = Math.asin((yE - c2) / R2);
    const up = arc(R2, Math.PI - t2, Math.PI * 2 + t2);

    const footG = new THREE.BoxGeometry(FOOT, FOOT_H, FOOT);
    /* rosetta forgiata: disco a bordo lobato, petali in rilievo, bottone al centro */
    const lobes = 14, rp = [];
    for (let i = 0; i < lobes * 10; i++) { const a = i / (lobes * 10) * Math.PI * 2, rr = 0.031 * (1 + 0.075 * Math.cos(a * lobes)); rp.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr)); }
    const disc = new THREE.ExtrudeGeometry(new THREE.Shape(rp), { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelOffset: -0.002, bevelSegments: 2 });
    disc.rotateY(Math.PI / 2);
    const petal = new THREE.SphereGeometry(1, 10, 8); petal.scale(0.0022, 0.0105, 0.0042);
    const boss = new THREE.SphereGeometry(1, 14, 10); boss.scale(0.004, 0.0075, 0.0075);

    [-1, 1].forEach(function (sx) {
      const x = sx * FRAME_X;
      add(low, iron, x, c1, 0);
      add(up, iron, x, c2, 0);
      add(footG, ironSmall, x, FOOT_H / 2, FOOT_Z);
      add(footG, ironSmall, x, FOOT_H / 2, -FOOT_Z);
      const ros = new THREE.Group();
      ros.position.set(x + sx * BAR_W / 2, Y_ROS, 0);
      if (sx < 0) ros.rotation.y = Math.PI;
      const d = new THREE.Mesh(disc, ironSmall); d.castShadow = true; d.receiveShadow = true; ros.add(d);
      for (let i = 0; i < lobes; i++) {
        const a = i / lobes * Math.PI * 2, p = new THREE.Mesh(petal, ironSmall);
        p.position.set(0.0075, Math.cos(a) * 0.018, Math.sin(a) * 0.018); p.rotation.x = a; ros.add(p);
      }
      const bm = new THREE.Mesh(boss, ironSmall); bm.position.x = 0.0085; ros.add(bm);
      table.add(ros);
    });
  })();

  /* ---- traversa forgiata tra le due rosette, con il nodo al centro: quadro, due svasature, una sfera ---- */
  (function () {
    const side = 0.016, half = FRAME_X - BAR_W / 2 + 0.002, k = Math.SQRT1_2;
    function sq(s0, s1, len) { /* tronco di piramide a base quadra, lungo X */
      const g = new THREE.CylinderGeometry(s1 * k, s0 * k, len, 4, 1).toNonIndexed(); /* facce piane, spigoli vivi */
      g.computeVertexNormals();
      g.rotateY(Math.PI / 4); g.rotateZ(-Math.PI / 2);
      return g;
    }
    const barLen = half - 0.062;
    [-1, 1].forEach(function (sx) {
      add(sq(side, side, barLen), ironSmall, sx * (0.062 + barLen / 2), Y_ROS, 0);
      const fl = add(sq(side, 0.042, 0.036), ironSmall, sx * (0.026 + 0.018), Y_ROS, 0);
      const cap = add(sq(0.042, 0.013, 0.01), ironSmall, sx * 0.021, Y_ROS, 0);
      if (sx > 0) { fl.rotation.y = Math.PI; cap.rotation.y = Math.PI; }
    });
    add(new THREE.SphereGeometry(0.023, 28, 20), ironSmall, 0, Y_ROS, 0);
  })();

  /* ---- pavimento: un alone chiaro, l'ombra morbida di contatto e l'ombra della luce principale ---- */
  (function () {
    function plane(cnv, w, d, y, opacity) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex(cnv, true), transparent: true, depthWrite: false, opacity: opacity, toneMapped: false }));
      m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = -2; scene.add(m);
      return m;
    }
    plane(drawBlob('rgba(58,64,50,.9)', 'rgba(40,46,35,ALPHA)'), 4.6, 4.6, 0, 1);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.ShadowMaterial({ opacity: 0.24 }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.0004; sh.receiveShadow = true; sh.renderOrder = -1; scene.add(sh);
    plane(drawBlob('rgba(0,0,0,.62)', 'rgba(0,0,0,ALPHA)'), 1.55, 0.95, 0.0008, 1);
  })();

  /* ---- comandi: si gira e si avvicina, non si sposta; la camera non scende sotto il pavimento ---- */
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.75;
  controls.zoomSpeed = 0.7;
  controls.minPolarAngle = 0.1;
  controls.maxPolarAngle = 1.5;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.9;
  canvas.style.touchAction = 'none';

  let fit = 2, zoom = 0.86, raf = 0, last = 0, dirty = true, inView = true, dead = false;
  const sph = new THREE.Spherical(1, 1.2, 0.62), off = new THREE.Vector3();
  function place() { off.setFromSpherical(sph); camera.position.copy(target).add(off); camera.lookAt(target); }
  function size() {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const v = THREE.MathUtils.degToRad(camera.fov) / 2, hz = Math.atan(Math.tan(v) * camera.aspect);
    const cur = camera.position.distanceTo(target);
    if (fit && cur) zoom = THREE.MathUtils.clamp(cur / fit, 0.55, 1.1);
    fit = 0.6 / Math.sin(Math.min(v, hz));
    controls.minDistance = fit * 0.55; controls.maxDistance = fit * 1.1;
    off.copy(camera.position).sub(target); sph.setFromVector3(off); sph.radius = fit * zoom; place();
    kick();
  }
  function running() { return !dead && !document.hidden && inView; }
  function schedule() { if (!raf && running()) raf = requestAnimationFrame(frame); }
  function kick() { dirty = true; schedule(); }
  function frame(t) {
    raf = 0;
    if (!running()) return;
    const dt = last && t - last < 100 ? (t - last) / 1000 : 1 / 60;
    last = t;
    const moved = controls.update(dt);
    if (moved || dirty) { dirty = false; renderer.render(scene, camera); }
    if (moved || controls.autoRotate) schedule(); else last = 0;
  }
  function stopAuto() { controls.autoRotate = false; }

  camera.position.set(1, 1, 1); place(); sph.radius = 1;
  camera.position.copy(target).add(off.setFromSpherical(sph));
  fit = 0; size();
  renderer.render(scene, camera); dirty = false; /* primo fotogramma subito: qui si compilano i materiali */

  controls.addEventListener('start', stopAuto);
  controls.addEventListener('change', kick);
  canvas.addEventListener('keydown', function (e) {
    const k = e.key;
    if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'ArrowUp' && k !== 'ArrowDown' && k !== '+' && k !== '-' && k !== '=') return;
    e.preventDefault(); stopAuto();
    off.copy(camera.position).sub(target); sph.setFromVector3(off);
    if (k === 'ArrowLeft') sph.theta -= 0.14;
    if (k === 'ArrowRight') sph.theta += 0.14;
    if (k === 'ArrowUp') sph.phi -= 0.1;
    if (k === 'ArrowDown') sph.phi += 0.1;
    if (k === '+' || k === '=') sph.radius *= 0.92;
    if (k === '-') sph.radius *= 1.08;
    sph.phi = THREE.MathUtils.clamp(sph.phi, controls.minPolarAngle, controls.maxPolarAngle);
    sph.radius = THREE.MathUtils.clamp(sph.radius, controls.minDistance, controls.maxDistance);
    place(); kick();
  });
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(stage); else window.addEventListener('resize', size);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[es.length - 1].isIntersecting; if (inView) kick(); }, { threshold: 0.01 }).observe(stage);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); dead = true; if (raf) cancelAnimationFrame(raf); raf = 0; onLost(); });
  schedule();

  return {
    azimuth: function () { return controls.getAzimuthalAngle(); },
    polar: function () { return controls.getPolarAngle(); },
    distance: function () { return camera.position.distanceTo(target); },
    autoRotate: function () { return controls.autoRotate; },
    loopActive: function () { return !!raf; },
    view: function (theta, phi, z) { stopAuto(); sph.theta = theta; sph.phi = phi; sph.radius = fit * (z || 0.86); place(); controls.update(); kick(); }
  };
}
