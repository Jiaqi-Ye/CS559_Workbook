// @ts-check

/*
  Demo implemented by GitHub Copilot (GPT-5.3-Codex), directed by user request.
*/

import * as T from "three";

const modeDefs = [
  { name: "ClampToEdge", value: T.ClampToEdgeWrapping },
  { name: "Repeat", value: T.RepeatWrapping },
  { name: "MirroredRepeat", value: T.MirroredRepeatWrapping }
];

const texturePath = "/textures/simple/checkerboard_rg_gradient_256.png";
//const texturePath = "/models/ambientcg/Wood052/baseColor.jpg";

const host = document.getElementById("demo");
if (!host) {
  throw new Error("Missing #demo container for wrapping grid demo.");
}

const heading = document.createElement("h3");
heading.textContent = "Texture Wrapping: U (columns) x V (rows)";
host.append(heading);

const note = document.createElement("p");
note.className = "wrap-note";
note.textContent =
  "Each plane uses UV coordinates from -1 to 2 in both directions. Columns change U wrapping mode; rows change V wrapping mode.";
host.append(note);

const uvPlane = new T.BufferGeometry();
uvPlane.setAttribute(
  "position",
  new T.BufferAttribute(
    new Float32Array([
      -0.9, -0.9, 0,
      0.9, -0.9, 0,
      -0.9, 0.9, 0,
      0.9, 0.9, 0
    ]),
    3
  )
);
uvPlane.setAttribute(
  "uv",
  new T.BufferAttribute(
    new Float32Array([
      -1, -1,
      2, -1,
      -1, 2,
      2, 2
    ]),
    2
  )
);
uvPlane.setIndex([0, 1, 2, 2, 1, 3]);
uvPlane.computeVertexNormals();

const matrix = document.createElement("div");
matrix.className = "wrap-matrix";
host.append(matrix);

const blank = document.createElement("div");
blank.className = "matrix-corner";
matrix.append(blank);

for (let col = 0; col < 3; col++) {
  const topLabel = document.createElement("div");
  topLabel.className = "matrix-col-label";
  topLabel.textContent = `U: ${modeDefs[col].name}`;
  matrix.append(topLabel);
}

new T.TextureLoader().load(texturePath, (baseTexture) => {
  baseTexture.flipY = false;

  for (let row = 0; row < 3; row++) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "matrix-row-label";
    rowLabel.textContent = `V: ${modeDefs[row].name}`;
    matrix.append(rowLabel);

    for (let col = 0; col < 3; col++) {
      const cell = document.createElement("div");
      cell.className = "matrix-cell";
      matrix.append(cell);

      drawCell(cell, baseTexture, modeDefs[col].value, modeDefs[row].value);
    }
  }
});

function drawCell(cell, baseTexture, wrapS, wrapT) {
  const scene = new T.Scene();
  scene.background = new T.Color("#ffffff");

  const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;

  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cell.append(renderer.domElement);

  const texture = baseTexture.clone();
  texture.wrapS = wrapS;
  texture.wrapT = wrapT;
  texture.needsUpdate = true;

  const material = new T.MeshBasicMaterial({
    map: texture,
    color: "white",
    side: T.DoubleSide
  });

  const mesh = new T.Mesh(uvPlane, material);
  scene.add(mesh);

  const edges = new T.LineSegments(
    new T.EdgesGeometry(uvPlane),
    new T.LineBasicMaterial({ color: "#222222" })
  );
  scene.add(edges);

  const renderCell = () => {
    const width = Math.max(80, cell.clientWidth);
    const height = Math.max(80, cell.clientHeight);
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  };

  renderCell();
  window.addEventListener("resize", renderCell);
}
