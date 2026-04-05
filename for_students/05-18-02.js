// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({
  where: parentOfCanvas,
  // light "desk white" instead of default green ground plane
  groundplanecolor: "#f2f2f2",
});

// textures for book tops / backs
const loader = new T.TextureLoader();
const book1Top = loader.load("/images/book1_top.jpeg");
const book1Back = loader.load("/images/book1_back.jpeg");
const book2Top = loader.load("/images/book2_top.jpeg");
const book2Back = loader.load("/images/book2_back.jpeg");
const keyboardTex = loader.load("/images/keyboard.jpeg");
book1Top.colorSpace = T.SRGBColorSpace;
book1Back.colorSpace = T.SRGBColorSpace;
book2Top.colorSpace = T.SRGBColorSpace;
book2Back.colorSpace = T.SRGBColorSpace;
keyboardTex.colorSpace = T.SRGBColorSpace;

class DeskBook extends GrObject {
  /**
   * @param {string} name
   * @param {T.Texture} topTex
   * @param {T.Texture} backTex
   * @param {number} w
   * @param {number} h
   * @param {number} d
   */
  constructor(name, topTex, backTex, w, h, d) {
    const geom = new T.BoxGeometry(w, h, d);
    const paper = new T.MeshStandardMaterial({ color: "#f7f2e8" });
    const coverTop = new T.MeshStandardMaterial({ map: topTex });
    const coverBack = new T.MeshStandardMaterial({ map: backTex });
    const materials = [
      paper,      // right
      paper,      // left
      coverTop,   // top
      paper,      // bottom
      paper,      // front
      coverBack,  // back
    ];
    const mesh = new T.Mesh(geom, materials);
    super(name, mesh);
  }
}


// Books (different sizes, overlapped)
const bookA = new DeskBook("BookA", book1Top, book1Back, 2.0, 0.22, 3.0); // 4:6 ratio
bookA.objects[0].position.set(-0.9, 0.12, 0.3);
bookA.objects[0].rotation.y = 0.2;
world.add(bookA);

const bookB = new DeskBook("BookB", book2Top, book2Back, 1.6, 0.18, 2.4); // 4:6 ratio
bookB.objects[0].position.set(-0.15, 0.23, -0.15); // smaller overlap area
bookB.objects[0].rotation.y = -0.05;
world.add(bookB);

// Open white laptop
class OpenLaptop extends GrObject {
  constructor() {
    const group = new T.Group();
    const bodyMat = new T.MeshStandardMaterial({ color: "#f5f5f5", roughness: 0.7 });
    const keyMat = new T.MeshStandardMaterial({ map: keyboardTex });
    const screenMat = new T.MeshStandardMaterial({ color: "#111111", roughness: 0.9 });
    const hingeMat = new T.MeshStandardMaterial({ color: "#dcdcdc", roughness: 0.5 });

    const baseDepth = 1.1;
    const baseGeom = new T.BoxGeometry(1.6, 0.05, baseDepth);
    const baseMats = [
      bodyMat, // right
      bodyMat, // left
      keyMat,  // top (keyboard)
      bodyMat, // bottom
      bodyMat, // front
      bodyMat, // back
    ];
    const base = new T.Mesh(baseGeom, baseMats);
    base.position.y = 0.03;
    group.add(base);

    // screen group is attached to the hinge line on the base
    const screenGroup = new T.Group();
    screenGroup.position.set(0, 0.055, -baseDepth / 2);
    screenGroup.rotation.x = -0.85; // more upright
    group.add(screenGroup);

    const hinge = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.2, 16), hingeMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.0, 0.0);
    screenGroup.add(hinge);

    const screen = new T.Mesh(new T.BoxGeometry(1.5, 1.0, 0.04), screenMat);
    screen.position.set(0, 0.5, -0.02);
    screenGroup.add(screen);

    super("OpenLaptop", group);
  }
}

const laptop = new OpenLaptop();
laptop.objects[0].position.set(2.2, 0, 0.8);
laptop.objects[0].rotation.y = -0.4;
laptop.objects[0].scale.set(1.3, 1.3, 1.3);
world.add(laptop);

world.go();



// 2026 Workbook
