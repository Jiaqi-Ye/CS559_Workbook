/**
 * noise-frequency.js
 * Self-contained noise frequency control demo — div injection version.
 *
 * Usage (standalone HTML or Hugo markdown):
 *   <div class="sn-freq-demo"></div>
 *   <script src="noise-frequency.js"></script>
 *
 * The script finds every .sn-freq-demo container, builds a slider +
 * two side-by-side WebGL canvases inside it, injects its own CSS,
 * and wires up the slider events.
 */

'use strict';

// ============================================================
// GLSL shaders
// ============================================================

const SNF_VS = `
  attribute vec2 aPos;
  varying   vec2 vUv;
  void main() {
    vUv         = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const SNF_FS_BANDS = `
  precision mediump float;
  uniform float uBands;
  varying vec2  vUv;
  void main() {
    float i = floor(vUv.x * uBands);
    float r = fract(sin(i) * 100000.0);
    gl_FragColor = vec4(r, r, r, 1.0);
  }
`;

const SNF_FS_INTERP = `
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
// Component CSS — injected once into <head>
// ============================================================

const SNF_STYLES_ID = 'sn-freq-demo-styles';

const SNF_CSS = `
.sn-freq-demo {
  background: #fff;
  border: 1px solid #d4d4cc;
  border-radius: 6px;
  padding: 18px 20px;
  max-width: 650px;
  box-sizing: border-box;
  font-family: Georgia, serif;
  margin-bottom: 20px;
}
.sn-freq-demo .snf-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  font-size: 0.9em;
  color: #333;
  font-family: sans-serif;
}
.sn-freq-demo .snf-controls label { white-space: nowrap; }
.sn-freq-demo .snf-slider {
  width: 240px;
  cursor: pointer;
  accent-color: #2a6096;
}
.sn-freq-demo .snf-count {
  font-size: 1.1em;
  font-weight: bold;
  color: #2a6096;
  min-width: 2.5em;
  text-align: right;
  font-family: 'Courier New', monospace;
}
.sn-freq-demo .snf-unit { font-size: 0.85em; color: #666; }
.sn-freq-demo .snf-canvases {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.sn-freq-demo .snf-canvas-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sn-freq-demo .snf-canvas-label {
  font-size: 0.8em;
  color: #555;
  margin-bottom: 6px;
  font-style: italic;
  text-align: center;
  font-family: Georgia, serif;
}
.sn-freq-demo .snf-canvas-wrap canvas {
  display: block;
  border: 1px solid #bbb;
  background: #111;
}
.sn-freq-demo .snf-explanation {
  font-size: 0.84em;
  color: #444;
  line-height: 1.5;
  margin-top: 14px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}
.sn-freq-demo .snf-explanation strong { color: #222; }
.sn-freq-demo .snf-explanation code {
  font-family: 'Courier New', monospace;
  font-size: 0.92em;
  background: #f0f4f0;
  padding: 1px 5px;
  border-radius: 3px;
}
`;

function injectSNFStyles() {
  if (document.getElementById(SNF_STYLES_ID)) return;
  const el = document.createElement('style');
  el.id = SNF_STYLES_ID;
  el.textContent = SNF_CSS;
  document.head.appendChild(el);
}

// ============================================================
// WebGL helpers
// ============================================================

function snfInitGL(canvas) {
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

function snfCompileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function snfBuildProgram(gl, vsSrc, fsSrc) {
  const vs = snfCompileShader(gl, gl.VERTEX_SHADER,   vsSrc);
  const fs = snfCompileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Link error:', gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function snfMakeQuad(gl) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1,  1,-1,  -1,1,  1,1]),
    gl.STATIC_DRAW);
  return buf;
}

function snfRender(gl, prog, buf, bands) {
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const uLoc = gl.getUniformLocation(prog, 'uBands');
  if (uLoc !== null) gl.uniform1f(uLoc, bands);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// ============================================================
// Build the frequency demo into a container div
// ============================================================

// Counter so multiple instances on one page get unique element IDs
let _snfCount = 0;

function snfBuild(container) {
  const pfx = 'snf-' + (++_snfCount);

  container.innerHTML = `
    <div class="snf-controls">
      <label for="${pfx}-slider">Number of bands:</label>
      <input class="snf-slider" type="range" id="${pfx}-slider"
             min="2" max="120" value="20" step="1">
      <span class="snf-count" id="${pfx}-count">20</span>
      <span class="snf-unit">bands</span>
    </div>
    <div class="snf-canvases">
      <div class="snf-canvas-wrap">
        <span class="snf-canvas-label">Solid bands<br>(quantized — <code>floor</code>)</span>
        <canvas id="${pfx}-bands" width="290" height="185"></canvas>
      </div>
      <div class="snf-canvas-wrap">
        <span class="snf-canvas-label">Smooth noise<br>(interpolated — <code>smoothstep</code>)</span>
        <canvas id="${pfx}-interp" width="290" height="185"></canvas>
      </div>
    </div>
    <div class="snf-explanation">
      <strong>Few bands (low frequency):</strong> large features, slow variation — suitable for
      large-scale material structure like the overall color variation in a stone slab.<br><br>
      <strong>Many bands (high frequency):</strong> fine-grained detail, rapid variation — suitable for
      surface roughness, fine texture, or noise that breaks up sharp edges.<br><br>
      In practice you combine multiple frequencies (octaves), each at lower amplitude, to get
      detail at many scales simultaneously — the topic of multi-frequency (fractal) noise.
    </div>
  `;

  const bandsCanvas = document.getElementById(`${pfx}-bands`);
  const interpCanvas = document.getElementById(`${pfx}-interp`);
  if (!bandsCanvas || !interpCanvas) return;

  const glBands  = snfInitGL(bandsCanvas);
  const glInterp = snfInitGL(interpCanvas);
  if (!glBands || !glInterp) return;

  const progBands  = snfBuildProgram(glBands,  SNF_VS, SNF_FS_BANDS);
  const progInterp = snfBuildProgram(glInterp, SNF_VS, SNF_FS_INTERP);
  const bufBands   = snfMakeQuad(glBands);
  const bufInterp  = snfMakeQuad(glInterp);

  function draw(n) {
    snfRender(glBands,  progBands,  bufBands,  n);
    snfRender(glInterp, progInterp, bufInterp, n);
  }

  draw(20);  // initial render

  const slider  = document.getElementById(`${pfx}-slider`);
  const display = document.getElementById(`${pfx}-count`);

  if (slider) {
    slider.addEventListener('input', () => {
      if (display) display.textContent = slider.value;
      draw(parseFloat(slider.value));
    });
  }
}

// ============================================================
// Auto-initialization
// ============================================================

function _snfInit() {
  injectSNFStyles();
  document.querySelectorAll('.sn-freq-demo').forEach(snfBuild);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _snfInit);
} else {
  _snfInit();
}
