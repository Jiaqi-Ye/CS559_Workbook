/**
 * sin-noise-demo.js
 * Self-contained 1D noise construction demo — div injection version.
 *
 * Usage (standalone HTML or Hugo markdown):
 *   <div class="sn-demo" data-step="1"></div>
 *   <div class="sn-demo" data-step="2"></div>
 *   <div class="sn-demo" data-step="3"></div>
 *   <script src="sin-noise-demo.js"></script>
 *
 * The script finds every .sn-demo[data-step] container, builds the full
 * UI inside it (line chart + flat texture + rotating surface), injects its
 * own CSS into <head>, and runs a shared animation loop.
 */

'use strict';

// ============================================================
// Constants
// ============================================================

const BANDS = 40.0;

// ============================================================
// JS noise functions — mirrors the GLSL shaders exactly
// ============================================================

function jsFract(x)      { return x - Math.floor(x); }
function jsSmoothstep(t) { return t * t * (3.0 - 2.0 * t); }

function noiseRaw(x)      { return jsFract(Math.sin(x * 100000.0) * 100000.0); }

function noiseBands(x, n) {
  return jsFract(Math.sin(Math.floor(x * n)) * 100000.0);
}

function noiseInterp(x, n) {
  const sc = x * n;
  const i  = Math.floor(sc);
  const f  = sc - i;
  const r0 = jsFract(Math.sin(i)       * 100000.0);
  const r1 = jsFract(Math.sin(i + 1.0) * 100000.0);
  return r0 + (r1 - r0) * jsSmoothstep(f);
}

// ============================================================
// GLSL shaders
// ============================================================

const VS_FLAT = `
  attribute vec2 aPos;
  varying   vec2 vUv;
  void main() {
    vUv         = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

// Y-axis rotation with perspective; UV is pre-rotation so it stays stable
const VS_3D = `
  attribute vec2  aPos;
  uniform   float uAngle;
  varying   vec2  vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    float c  = cos(uAngle);
    float s  = sin(uAngle);
    float x3 = aPos.x * c;
    float y3 = aPos.y * 0.85;
    float z3 = aPos.x * s + 2.5;
    float fov = 1.9;
    gl_Position = vec4(x3 * fov / z3, y3 * fov / z3, 0.0, 1.0);
  }
`;

const FS_RAW = `
  precision mediump float;
  varying vec2 vUv;
  void main() {
    float r = fract(sin(vUv.x * 100000.0) * 100000.0);
    gl_FragColor = vec4(r, r, r, 1.0);
  }
`;

const FS_BANDS = `
  precision mediump float;
  uniform float uBands;
  varying vec2  vUv;
  void main() {
    float i = floor(vUv.x * uBands);
    float r = fract(sin(i) * 100000.0);
    gl_FragColor = vec4(r, r, r, 1.0);
  }
`;

const FS_INTERP = `
  precision mediump float;
  uniform float uBands;
  varying vec2  vUv;
  void main() {
    float sc = vUv.x * uBands;
    float i  = floor(sc);
    float f  = fract(sc);
    float r0 = fract(sin(i)       * 100000.0);
    float r1 = fract(sin(i + 1.0) * 100000.0);
    float sf = smoothstep(0.0, 1.0, f);
    float r  = mix(r0, r1, sf);
    gl_FragColor = vec4(r, r, r, 1.0);
  }
`;

// ============================================================
// Per-step content (defined after shaders so fragSrc refs work)
// ============================================================

const STEP_CONFIG = [
  null,   // index 0 unused — steps are 1-indexed
  {
    badge:      'STEP 1',
    title:      'Raw pseudo-random function',
    desc:       'Start with a simple trick: multiply the texture coordinate by a large number, take sin(), then fract() to keep the result in [0,1]. The output changes wildly for even tiny changes in the input — it <em>looks</em> random.',
    code:       'r = fract( sin(vUv.x * 100000.0) * 100000.0 );',
    chartLabel: 'noise(x) — 1D signal',
    chartColor: '#b03030',
    sampleDots: false,
    noiseFn:    (x) => noiseRaw(x),
    fragSrc:    FS_RAW,
    label3d:    'On a rotating surface — watch carefully',
    observation:'<strong>Problem:</strong> As the surface tilts, the noise pattern shifts and shimmers. The function oscillates so fast that a tiny change in viewing angle maps different screen pixels to wildly different UV values — classic aliasing. The pattern is useless on any surface that moves.',
  },
  {
    badge:      'STEP 2',
    title:      'Quantize — sample only at integer positions',
    desc:       'Instead of evaluating the pseudo-random function at every possible UV value, evaluate it only at evenly-spaced integer positions. Every fragment in the same band gets <em>exactly the same</em> value — no matter what angle we view it from.',
    code:       'float i = floor(vUv.x * 40.0);&nbsp;&nbsp;&nbsp;// which of 40 bands?<br>float r = fract( sin(i) * 100000.0 );',
    chartLabel: 'noise(x) — 1D signal (dots = sample values; line = staircase)',
    chartColor: '#2a5fa0',
    sampleDots: true,
    noiseFn:    (x) => noiseBands(x, BANDS),
    fragSrc:    FS_BANDS,
    label3d:    'On a rotating surface — stable!',
    observation:'<strong>Fixed:</strong> The pattern is now perfectly stable — the bands don\'t shift as the surface rotates. The cost is hard edges between each band, which look artificial. We need smooth transitions between the random values.',
  },
  {
    badge:      'STEP 3',
    title:      'Interpolate — smooth transitions between samples',
    desc:       'For each fragment, find the two neighboring sample points, look up the random value at each, and mix between them based on position within the interval. Use <code>smoothstep</code> rather than linear interpolation to avoid visible kinks at the sample points.',
    code:       'float sc = vUv.x * 40.0;<br>float i&nbsp; = floor(sc);<br>float r0 = fract( sin(i)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * 100000.0 );<br>float r1 = fract( sin(i + 1.0) * 100000.0 );<br>float r&nbsp; = mix(r0, r1, smoothstep(0.0, 1.0, fract(sc)));',
    chartLabel: 'noise(x) — 1D signal (dots = same sample values as Step 2; line = smoothstep)',
    chartColor: '#2a7a38',
    sampleDots: true,
    noiseFn:    (x) => noiseInterp(x, BANDS),
    fragSrc:    FS_INTERP,
    label3d:    'On a rotating surface — smooth and stable',
    observation:'<strong>Result:</strong> A smoothly-varying, deterministic noise function — stable across frames and viewing angles, with controlled spatial frequency. This is the foundation of all practical noise functions in computer graphics.',
  },
];

// ============================================================
// Component CSS — injected once into <head>
// ============================================================

const SN_STYLES_ID = 'sin-noise-demo-styles';

const SN_CSS = `
.sn-demo {
  background: #fff;
  border: 1px solid #d4d4cc;
  border-radius: 6px;
  padding: 18px 20px;
  margin-bottom: 20px;
  max-width: 650px;
  box-sizing: border-box;
  font-family: Georgia, serif;
}
.sn-demo .sn-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}
.sn-demo .sn-badge {
  font-size: 0.75em;
  font-weight: bold;
  color: #fff;
  background: #2a6096;
  border-radius: 3px;
  padding: 2px 8px;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  font-family: sans-serif;
}
.sn-demo .sn-title {
  font-size: 1.0em;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}
.sn-demo .sn-desc {
  font-size: 0.85em;
  color: #444;
  margin: 0 0 10px 0;
  line-height: 1.5;
}
.sn-demo .sn-code {
  font-family: 'Courier New', monospace;
  font-size: 0.82em;
  background: #f0f4f0;
  border: 1px solid #c8d8c8;
  border-radius: 4px;
  padding: 8px 12px;
  color: #1a3a1a;
  margin-bottom: 12px;
  display: inline-block;
  line-height: 1.6;
}
.sn-demo .sn-chart-wrap { margin-bottom: 12px; }
.sn-demo .sn-canvas-label {
  display: block;
  font-size: 0.78em;
  color: #666;
  margin-bottom: 5px;
  font-style: italic;
}
.sn-demo .sn-chart-canvas {
  display: block;
  border: 1px solid #ccc;
  background: #fafaf8;
  width: 100%;
  height: auto;
}
.sn-demo .sn-canvases {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.sn-demo .sn-canvas-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sn-demo .sn-canvas-wrap canvas {
  display: block;
  border: 1px solid #bbb;
  background: #111;
}
.sn-demo .sn-obs {
  font-size: 0.82em;
  color: #555;
  margin: 10px 0 0 0;
  font-style: italic;
  border-left: 3px solid #ddd;
  padding-left: 10px;
  line-height: 1.5;
}
.sn-demo .sn-obs strong { color: #333; font-style: normal; }
`;

function injectSNStyles() {
  if (document.getElementById(SN_STYLES_ID)) return;
  const el = document.createElement('style');
  el.id = SN_STYLES_ID;
  el.textContent = SN_CSS;
  document.head.appendChild(el);
}

// ============================================================
// WebGL helpers
// ============================================================

function snInitGL(canvas) {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    const p = document.createElement('p');
    p.style.cssText = 'color:red;padding:8px;font-size:0.85em;';
    p.textContent = 'WebGL not supported in this browser.';
    canvas.replaceWith(p);
    return null;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  return gl;
}

function snCompileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function snBuildProgram(gl, vsSrc, fsSrc) {
  const vs = snCompileShader(gl, gl.VERTEX_SHADER,   vsSrc);
  const fs = snCompileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function snMakeQuad(gl) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1,  1,-1,  -1,1,  1,1]),
    gl.STATIC_DRAW);
  return buf;
}

function snDrawQuad(gl, prog, buf, uniforms) {
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  if (uniforms) {
    for (const [name, val] of Object.entries(uniforms)) {
      const loc = gl.getUniformLocation(prog, name);
      if (loc !== null) gl.uniform1f(loc, val);
    }
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// ============================================================
// Line chart (Canvas 2D)
// ============================================================

function snDrawLineChart(canvas, noiseFn, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { left: 44, right: 12, top: 14, bottom: 26 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top  - pad.bottom;
  const lineColor = opts.lineColor || '#2a6096';

  // Background
  ctx.fillStyle = '#fafaf8';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = '#e6e6e0'; ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad.top + ph * (1 - g / 4);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + pw, y); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + ph);
  ctx.lineTo(pad.left + pw, pad.top + ph);
  ctx.stroke();

  // Y labels
  ctx.fillStyle = '#888'; ctx.font = '10px sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let g = 0; g <= 4; g++) {
    const y = pad.top + ph * (1 - g / 4);
    ctx.fillText((g / 4).toFixed(2), pad.left - 5, y);
  }

  // X label
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#777'; ctx.font = '10px sans-serif';
  ctx.fillText('x  (0 \u2192 1)', pad.left + pw / 2, pad.top + ph + 6);

  // Sample dots (steps 2 & 3)
  if (opts.sampleDots && opts.nBands) {
    const n = opts.nBands;
    ctx.fillStyle = lineColor; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    for (let k = 0; k <= n; k++) {
      const xn = k / n;
      const yv = jsFract(Math.sin(k) * 100000.0);
      const px = pad.left + xn * pw;
      const py = pad.top  + (1 - yv) * ph;
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }

  // Curve
  const nSamples = opts.sampleDots ? Math.max(1200, (opts.nBands || 40) * 6) : 3000;
  ctx.strokeStyle = lineColor; ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= nSamples; i++) {
    const xn = i / nSamples;
    const yv = noiseFn(xn);
    const px = pad.left + xn * pw;
    const py = pad.top  + (1 - yv) * ph;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

// ============================================================
// Build one step into its container div
// ============================================================

function snBuildStep(container, stepNum) {
  const cfg = STEP_CONFIG[stepNum];
  if (!cfg) { console.error('sn-demo: unknown data-step value', stepNum); return null; }

  // Use step number as ID prefix so multiple steps on the same page don't collide
  const pfx = 'sn-s' + stepNum;

  container.innerHTML = `
    <div class="sn-header">
      <span class="sn-badge">${cfg.badge}</span>
      <h3 class="sn-title">${cfg.title}</h3>
    </div>
    <p class="sn-desc">${cfg.desc}</p>
    <div class="sn-code">${cfg.code}</div>
    <div class="sn-chart-wrap">
      <span class="sn-canvas-label">${cfg.chartLabel}</span>
      <canvas class="sn-chart-canvas" id="${pfx}-lc" width="610" height="120"></canvas>
    </div>
    <div class="sn-canvases">
      <div class="sn-canvas-wrap">
        <span class="sn-canvas-label">Flat texture</span>
        <canvas id="${pfx}-flat" width="240" height="160"></canvas>
      </div>
      <div class="sn-canvas-wrap">
        <span class="sn-canvas-label">${cfg.label3d}</span>
        <canvas id="${pfx}-3d" width="350" height="160"></canvas>
      </div>
    </div>
    <p class="sn-obs">${cfg.observation}</p>
  `;

  // --- Line chart (drawn once, static) ---
  snDrawLineChart(document.getElementById(`${pfx}-lc`), cfg.noiseFn, {
    lineColor:  cfg.chartColor,
    sampleDots: cfg.sampleDots,
    nBands:     BANDS,
  });

  // --- WebGL flat canvas (drawn once, static) ---
  const flatCanvas = document.getElementById(`${pfx}-flat`);
  const glFlat = snInitGL(flatCanvas);
  if (glFlat) {
    const prog = snBuildProgram(glFlat, VS_FLAT, cfg.fragSrc);
    const buf  = snMakeQuad(glFlat);
    snDrawQuad(glFlat, prog, buf, { uBands: BANDS });
  }

  // --- WebGL 3D canvas (animated) ---
  const d3Canvas = document.getElementById(`${pfx}-3d`);
  const gl3d = snInitGL(d3Canvas);
  if (!gl3d) return null;
  const prog3d = snBuildProgram(gl3d, VS_3D, cfg.fragSrc);
  const buf3d  = snMakeQuad(gl3d);

  return { gl3d, prog3d, buf3d };
}

// ============================================================
// Animation loop (shared by all steps on the page)
// ============================================================

const _snActiveSteps = [];

function _snAnimate(ms) {
  const t     = ms * 0.001;
  const angle = Math.sin(t * (2 * Math.PI / 9)) * 1.22;  // ±70°, 9-second period

  for (const { gl3d, prog3d, buf3d } of _snActiveSteps) {
    snDrawQuad(gl3d, prog3d, buf3d, { uAngle: angle, uBands: BANDS });
  }

  requestAnimationFrame(_snAnimate);
}

// ============================================================
// Auto-initialization
// ============================================================

function _snInit() {
  injectSNStyles();

  document.querySelectorAll('.sn-demo[data-step]').forEach(container => {
    const stepNum = parseInt(container.dataset.step, 10);
    const step = snBuildStep(container, stepNum);
    if (step) _snActiveSteps.push(step);
  });

  if (_snActiveSteps.length > 0) {
    requestAnimationFrame(_snAnimate);
  }
}

// Works whether the script is in <head> or at the bottom of <body>
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _snInit);
} else {
  _snInit();
}
