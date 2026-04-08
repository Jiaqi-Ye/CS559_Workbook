import * as THREE from "three";

/**
 * AliasingDemo — creates 3 canvases inside a div:
 *   small (50×50):   real GPU rasterization, antialias off
 *   ref   (250×250): true geometry at 5× scale + pixel grid + pixel-center dots
 *   zoom  (250×250): pixel-replicated view of small (nearest-neighbor)
 */
class AliasingDemo {
  constructor(divId, label) {
    const container = document.getElementById(divId);
    container.style.marginBottom = "28px";

    if (label) {
      const h3 = document.createElement("h3");
      h3.textContent = label;
      h3.style.cssText = "margin:0 0 6px 0; font-family:sans-serif; font-size:14px;";
      container.appendChild(h3);
    }

    // Canvas row
    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:10px; align-items:flex-start;";
    container.appendChild(row);

    // Sub-label row
    const labelRow = document.createElement("div");
    labelRow.style.cssText =
      "display:flex; gap:10px; font-family:sans-serif; font-size:11px; color:#888; margin-top:3px;";
    container.appendChild(labelRow);

    // Small canvas (50×50, displayed at natural size)
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = 50;
    smallCanvas.height = 50;
    smallCanvas.style.imageRendering = "pixelated";
    row.appendChild(smallCanvas);

    // Reference canvas (250×250)
    const refCanvas = document.createElement("canvas");
    refCanvas.width = 250;
    refCanvas.height = 250;
    row.appendChild(refCanvas);

    // Zoom canvas (250×250, plain 2D — pixel-replicated from small)
    this._zoomCanvas = document.createElement("canvas");
    this._zoomCanvas.width = 250;
    this._zoomCanvas.height = 250;
    row.appendChild(this._zoomCanvas);
    this._zoomCtx = this._zoomCanvas.getContext("2d");

    for (const [txt, w] of [
      ["Rasterized (50×50)", 50],
      ["True geometry + pixel grid", 250],
      ["Zoomed — pixel replicated", 250],
    ]) {
      const d = document.createElement("div");
      d.style.width = w + "px";
      d.textContent = String(txt);
      labelRow.appendChild(d);
    }

    // Shared orthographic camera: world coords [0,50]×[0,50]
    // (0,0) = bottom-left, (50,50) = top-right — Y-up convention
    this.camera = new THREE.OrthographicCamera(0, 50, 50, 0, -1, 1);

    this.smallScene = new THREE.Scene();
    this.refScene = new THREE.Scene();

    // Small renderer — no antialias, exact 50×50 drawing buffer
    this.smallRenderer = new THREE.WebGLRenderer({ canvas: smallCanvas, antialias: false });
    this.smallRenderer.setPixelRatio(1);
    this.smallRenderer.setSize(50, 50, false);
    this.smallRenderer.setClearColor(0x000000, 1);

    // Ref renderer — antialias on for smooth geometry display
    this.refRenderer = new THREE.WebGLRenderer({ canvas: refCanvas, antialias: true });
    this.refRenderer.setPixelRatio(1);
    this.refRenderer.setSize(250, 250, false);
    this.refRenderer.setClearColor(0x000000, 1);

    this._buildRefOverlay();
  }

  /** Add pixel grid lines and pixel-center dots to the reference scene. */
  _buildRefOverlay() {
    // Grid: lines at every integer world-unit (= every pixel boundary)
    const gridPts = [];
    for (let i = 0; i <= 50; i++) {
      gridPts.push(0, i, 0.05, 50, i, 0.05); // horizontal
      gridPts.push(i, 0, 0.05, i, 50, 0.05); // vertical
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(gridPts), 3)
    );
    const gridMat = new THREE.LineBasicMaterial({ color: 0x2a2a2a, depthTest: false });
    const grid = new THREE.LineSegments(gridGeo, gridMat);
    grid.renderOrder = 0;
    this.refScene.add(grid);

    // Dots: one point per pixel center at (x+0.5, y+0.5) for x,y in [0,49]
    const dotPts = [];
    for (let y = 0; y < 50; y++)
      for (let x = 0; x < 50; x++)
        dotPts.push(x + 0.5, y + 0.5, 0.1);
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(dotPts), 3)
    );
    const dotMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false,
      depthTest: false,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    dots.renderOrder = 1;
    this.refScene.add(dots);
  }

  /**
   * Add pre-built geometry (a flat Float32Array of xyz triples) to both scenes.
   * refRenderOrder controls layering in the ref scene (default -1 = behind grid/dots).
   */
  addGeometry(positions, colorHex, refRenderOrder = -1) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    this.smallScene.add(new THREE.Mesh(geo, mat));
    const refMesh = new THREE.Mesh(geo, mat);
    refMesh.renderOrder = refRenderOrder;
    this.refScene.add(refMesh);
  }

  /**
   * Add a triangle to both the small and reference scenes.
   * v0, v1, v2 — [x, y] pairs in world (pixel) coordinates.
   * Returns a handle with setVertices(v0, v1, v2) for animation.
   */
  addTriangle(v0, v1, v2, colorHex) {
    const pos = new Float32Array([
      v0[0], v0[1], 0,
      v1[0], v1[1], 0,
      v2[0], v2[1], 0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      depthTest: false,
    });

    // Both meshes share the same geometry — updating pos updates both renders
    this.smallScene.add(new THREE.Mesh(geo, mat));
    const refMesh = new THREE.Mesh(geo, mat);
    refMesh.renderOrder = 2; // draw triangles on top of grid and dots
    this.refScene.add(refMesh);

    return {
      setVertices(v0, v1, v2) {
        pos[0] = v0[0]; pos[1] = v0[1];
        pos[3] = v1[0]; pos[4] = v1[1];
        pos[6] = v2[0]; pos[7] = v2[1];
        geo.attributes.position.needsUpdate = true;
      },
    };
  }

  /** Render small + ref, then pixel-replicate small into zoom. */
  render() {
    this.smallRenderer.render(this.smallScene, this.camera);
    this.refRenderer.render(this.refScene, this.camera);
    this._zoomCtx.imageSmoothingEnabled = false;
    this._zoomCtx.drawImage(this.smallRenderer.domElement, 0, 0, 250, 250);
  }

  /** Start an animation loop. updateFn() is called before each render. */
  animate(updateFn) {
    const loop = () => {
      updateFn();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// ---------------------------------------------------------------------------
// Demo 1 — Static triangles: some fit between pixels, some hit pixel centers
// ---------------------------------------------------------------------------
{
  const demo = new AliasingDemo(
    "demo1",
    "Demo 1 — Small Triangles: Hitting vs. Missing Pixel Centers"
  );

  // Half-size S = 0.42.  When centered at a pixel-corner (integer world coords),
  // the nearest pixel center is √2/2 ≈ 0.71 away — safely outside.
  const S = 0.42;

  // Group A: right triangles centered at pixel corners → no pixel center inside → invisible in small/zoom
  // Bright yellow so they're clearly visible in the ref canvas but absent from small/zoom
  for (const [cx, cy] of [
    [10, 20], [25, 35], [38, 12], [15, 8],
    [5, 30],  [32, 5],  [44, 28], [20, 43],
    [8, 45],  [35, 22], [48, 40], [12, 15],
  ]) {
    demo.addTriangle(
      [cx - S, cy - S],
      [cx - S, cy + S],
      [cx + S, cy - S],
      0xffff00
    );
  }

  // Group B: isosceles triangles centered at pixel centers (half-integer coords)
  // → the center pixel is always covered → visible in all three canvases
  for (const [cx, cy] of [[14.5, 24.5], [30.5, 39.5], [42.5, 16.5], [20.5, 8.5]]) {
    demo.addTriangle(
      [cx,     cy + S],
      [cx - S, cy - S * 0.5],
      [cx + S, cy - S * 0.5],
      0xff6600
    );
  }

  demo.render();
}

// ---------------------------------------------------------------------------
// Demo 2 — Moving triangles: occasionally cover a pixel center and flash
// ---------------------------------------------------------------------------
{
  const demo = new AliasingDemo(
    "demo2",
    "Demo 2 — Moving Triangles: Occasional Pixel Coverage"
  );

  // Triangles slightly larger than 0.5 so they sometimes straddle a pixel center
  const S = 0.48;

  const movers = [
    { cx: 12.3, cy: 18.7, vx:  0.06, vy:  0.04, color: 0xff4444 },
    { cx: 28.1, cy: 31.4, vx: -0.05, vy:  0.07, color: 0x44cc44 },
    { cx: 41.9, cy: 12.2, vx:  0.07, vy: -0.05, color: 0x4488ff },
    { cx:  8.6, cy: 42.3, vx: -0.04, vy: -0.06, color: 0xffcc00 },
    { cx: 10.0, cy: 80.2, vx: -0.07, vy: 0,     color: 0xffffff },
  ];

  for (const m of movers) {
    m.tri = demo.addTriangle(
      [m.cx,     m.cy + S],
      [m.cx - S, m.cy - S * 0.5],
      [m.cx + S, m.cy - S * 0.5],
      m.color
    );
  }

  demo.animate(() => {
    for (const m of movers) {
      m.cx = ((m.cx + m.vx) % 50 + 50) % 50;
      m.cy = ((m.cy + m.vy) % 50 + 50) % 50;
      m.tri.setVertices(
        [m.cx,     m.cy + S],
        [m.cx - S, m.cy - S * 0.5],
        [m.cx + S, m.cy - S * 0.5]
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Demo 3 — Tall skinny triangle sweeping left-to-right
// Vertices: (x, 50), (x+1.75, 50), (x, 0)  — right triangle along the left edge,
// 1.75 px wide at base, full canvas height.  As x moves slowly, the rasterized
// pixel columns hop between 1 and 2 whenever x crosses a half-pixel boundary.
// ---------------------------------------------------------------------------
{
  const demo = new AliasingDemo(
    "demo3",
    "Demo 3 — Tall Skinny Triangle: Pixel Column Aliasing"
  );

  let x = 1.0;
  const tri = demo.addTriangle([x, 50], [x + 1.75, 50], [x, 0], 0x00ccff);

  // Speed: ~0.03 world-units/frame → takes ~28 s to cross full width.
  // Slow enough that students can watch individual column changes.
  demo.animate(() => {
    x = (x + 0.03) % 50;
    tri.setVertices([x, 50], [x + 1.75, 50], [x, 0]);
  });
}



// ---------------------------------------------------------------------------
// Demo 4 — Checkerboard built from triangles, moving right-to-left
//
// Each square is 2 triangles.  The full checkerboard is batched into one
// large mesh (per scene), then translated each frame.
// ---------------------------------------------------------------------------
{
  const demo = new AliasingDemo(
    "demo4",
    "Demo 4 — Moving Triangle Checkerboard"
  );

  const CHECK_SIZE = .5;     // world-units per checker square
  const COLOR_A = 0xff8800;   // orange
  const COLOR_B = 0x0055ff;   // blue
  const SPEED = 0.03;         // world-units per frame, moving left
  const PHASE_X = 0.5 * CHECK_SIZE; // avoids boundary lock at tiny check sizes

  const boardWidth = 50;
  const boardHeight = 50;
  const cols = Math.ceil(boardWidth / CHECK_SIZE) + 2;
  const rows = Math.ceil(boardHeight / CHECK_SIZE) + 1;

  /** @type {number[]} */
  const positions = [];
  /** @type {number[]} */
  const colors = [];

  /**
   * @param {[number, number]} v0
   * @param {[number, number]} v1
   * @param {[number, number]} v2
   * @param {number} colorHex
   */
  function pushTri(v0, v1, v2, colorHex) {
    positions.push(
      v0[0], v0[1], 0,
      v1[0], v1[1], 0,
      v2[0], v2[1], 0
    );

    const c = new THREE.Color(colorHex);
    for (let i = 0; i < 3; i++) {
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let iy = 0; iy < rows; iy++) {
    for (let ix = -1; ix < cols - 1; ix++) {
      const color = ((ix + iy) & 1) === 0 ? COLOR_A : COLOR_B;
      const x0 = ix * CHECK_SIZE + PHASE_X;
      const y0 = iy * CHECK_SIZE;
      const x1 = x0 + CHECK_SIZE;
      const y1 = y0 + CHECK_SIZE;

      pushTri([x0, y0], [x0, y1], [x1, y0], color);
      pushTri([x0, y1], [x1, y1], [x1, y0], color);
    }
  }

  const checkerGeo = new THREE.BufferGeometry();
  checkerGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  checkerGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));

  const checkerMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    depthTest: false,
  });

  const smallMesh = new THREE.Mesh(checkerGeo, checkerMat);
  demo.smallScene.add(smallMesh);

  const refMesh = new THREE.Mesh(checkerGeo, checkerMat);
  refMesh.renderOrder = 2;
  demo.refScene.add(refMesh);

  let offset = 0;
  demo.animate(() => {
    offset += SPEED/2;
    if (offset > 40*CHECK_SIZE) offset=0;

    // Single transform update for the entire checkerboard mesh.
    smallMesh.position.x = offset;
    refMesh.position.x = offset;
  });
}

