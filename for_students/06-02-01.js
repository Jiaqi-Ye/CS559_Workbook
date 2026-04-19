import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";

const bodyMat = new T.MeshPhongMaterial({ shininess: 25, flatShading: true });
const wheelMat = new T.MeshPhongMaterial({ color: "#222222", shininess: 0, flatShading: true });
const windowMat = new T.MeshPhongMaterial({
    color: "#8fd8ff",
    transparent: true,
    opacity: 0.85,
    flatShading: true
});
const wheelCapMat = new T.MeshPhongMaterial({ color: "#8b8f96", shininess: 5, flatShading: true });

function makeCargoPrintTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#d6f2f4";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#c86a5a";
    ctx.fillRect(0, 0, 256, 12);
    ctx.fillRect(0, 244, 256, 12);
    ctx.fillStyle = "#5bb7b1";
    for (let x = -26; x < 300; x += 38) {
        ctx.fillRect(x, 90, 16, 74);
    }
    ctx.fillStyle = "#e9f8f9";
    ctx.fillRect(24, 58, 208, 140);
    ctx.strokeStyle = "#be5f4f";
    ctx.lineWidth = 5;
    ctx.strokeRect(24, 58, 208, 140);
    ctx.lineWidth = 8;
    for (let i = -40; i < 250; i += 34) {
        ctx.strokeStyle = "#4ca9a4";
        ctx.beginPath();
        ctx.moveTo(24 + i, 198);
        ctx.lineTo(24 + i + 52, 58);
        ctx.stroke();
    }
    ctx.fillStyle = "#4ca9a4";
    ctx.fillRect(168, 68, 50, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(174, 74, 38, 8);
    const tex = new T.CanvasTexture(canvas);
    tex.wrapS = T.RepeatWrapping;
    tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
}

class IsometricTruck extends GrObject {
    constructor(name, x, z) {
        const truck = new T.Group();
        const cargoMat = new T.MeshStandardMaterial({
            color: "#ffffff",
            roughness: 0.16,
            metalness: 0.42
        });
        cargoMat.map = makeCargoPrintTexture();
        cargoMat.needsUpdate = true;
        const cargo = new T.Mesh(new T.BoxGeometry(2.2, 1.22, 1.16), cargoMat);
        cargo.position.set(-0.05, 0.71, 0);
        truck.add(cargo);
        const cabMat = new T.MeshPhongMaterial({ color: "#76e0e3", shininess: 25, flatShading: true });
        const cabLow = new T.Mesh(new T.BoxGeometry(0.74, 0.58, 1.02), cabMat);
        cabLow.position.set(1.46, 0.33, 0);
        truck.add(cabLow);
        const cabTop = new T.Mesh(new T.BoxGeometry(0.56, 0.34, 0.96), cabMat);
        cabTop.position.set(1.32, 0.78, 0);
        truck.add(cabTop);
        const frontWindow = new T.Mesh(new T.BoxGeometry(0.03, 0.26, 0.74), windowMat);
        frontWindow.position.set(1.605, 0.79, 0);
        truck.add(frontWindow);
        const sideWindow = new T.Mesh(new T.BoxGeometry(0.3, 0.25, 0.05), windowMat);
        sideWindow.position.set(1.38, 0.72, 0.52);
        truck.add(sideWindow);
        const sideWindow2 = sideWindow.clone();
        sideWindow2.position.set(1.38, 0.72, -0.52);
        truck.add(sideWindow2);
        const trimMat = new T.MeshPhongMaterial({ color: "#d97d72", shininess: 10, flatShading: true });
        const trimTop = new T.Mesh(new T.BoxGeometry(2.21, 0.03, 0.03), trimMat);
        trimTop.position.set(-0.05, 1.325, 0.595);
        truck.add(trimTop);
        const trimTop2 = trimTop.clone();
        trimTop2.position.z = -0.595;
        truck.add(trimTop2);
        const trimBack = new T.Mesh(new T.BoxGeometry(0.03, 1.22, 0.03), trimMat);
        trimBack.position.set(-1.15, 0.71, 0.595);
        truck.add(trimBack);
        const trimBack2 = trimBack.clone();
        trimBack2.position.z = -0.595;
        truck.add(trimBack2);
        const wheelGeo = new T.CylinderGeometry(0.25, 0.25, 0.2, 18);
        const addWheel = (wx, wz) => {
            const wg = new T.Group();
            const w = new T.Mesh(wheelGeo, wheelMat);
            w.rotation.x = Math.PI / 2;
            wg.add(w);
            const cap = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.22, 14), wheelCapMat);
            cap.rotation.x = Math.PI / 2;
            wg.add(cap);
            wg.position.set(wx, 0.25, wz);
            truck.add(wg);
        };
        addWheel(-0.85, 0.63);
        addWheel(1.38, 0.63);
        addWheel(-0.85, -0.63);
        addWheel(1.38, -0.63);
        const bumper = new T.Mesh(
            new T.BoxGeometry(0.08, 0.08, 0.96),
            new T.MeshPhongMaterial({ color: "#6f757d", shininess: 35, flatShading: true })
        );
        bumper.position.set(1.86, 0.12, 0);
        truck.add(bumper);
        const headlightMat = new T.MeshPhongMaterial({ color: "#f4be2a", shininess: 60, flatShading: true });
        const headlightL = new T.Mesh(new T.BoxGeometry(0.05, 0.06, 0.12), headlightMat);
        headlightL.position.set(1.86, 0.2, 0.45);
        truck.add(headlightL);
        const headlightR = headlightL.clone();
        headlightR.position.z = -0.45;
        truck.add(headlightR);
        super(name, truck);
        this.setPos(x, 0, z);
    }
}

class IsometricSedan extends GrObject {
    constructor(name, x, z) {
        const sedan = new T.Group();
        const sedanMat = bodyMat.clone();
        sedanMat.color.set("#ee7eb4");
        sedanMat.shininess = 10;
        sedanMat.specular = new T.Color("#2a1e2a");
        const roofMat = new T.MeshPhongMaterial({ color: "#f189bf", shininess: 16, specular: "#3e2a3e", flatShading: true });
        const hoodMat = new T.MeshPhongMaterial({ color: "#e878ad", shininess: 20, specular: "#4a324a", flatShading: true });
        const body = new T.Mesh(new T.BoxGeometry(2.4, 0.42, 1.08), sedanMat);
        body.position.set(-0.15, 0.34, 0);
        sedan.add(body);
        const roof = new T.Mesh(new T.BoxGeometry(1.16, 0.35, 0.9), roofMat);
        roof.position.set(-0.1, 0.73, 0);
        sedan.add(roof);
        const rearDeck = new T.Mesh(new T.BoxGeometry(0.8, 0.2, 0.88), roofMat);
        rearDeck.position.set(0.65, 0.58, 0);
        sedan.add(rearDeck);
        const hood = new T.Mesh(new T.BoxGeometry(0.7, 0.18, 0.9), hoodMat);
        hood.position.set(-1.0, 0.5, 0);
        hood.rotation.z = -0.02;
        sedan.add(hood);
        const windshield = new T.Mesh(new T.BoxGeometry(0.3, 0.28, 0.78), windowMat);
        windshield.position.set(-0.65, 0.72, 0);
        windshield.rotation.z = -0.35;
        sedan.add(windshield);
        const winLeft = new T.Mesh(new T.BoxGeometry(0.52, 0.25, 0.05), windowMat);
        winLeft.position.set(-0.1, 0.75, 0.45);
        sedan.add(winLeft);
        const winRight = winLeft.clone();
        winRight.position.set(-0.1, 0.75, -0.45);
        sedan.add(winRight);
        const frontBumper = new T.Mesh(
            new T.BoxGeometry(0.09, 0.08, 0.95),
            new T.MeshPhongMaterial({ color: "#c1c5c9", shininess: 30, flatShading: true })
        );
        frontBumper.position.set(-1.35, 0.13, 0);
        sedan.add(frontBumper);
        const headlightMat = new T.MeshPhongMaterial({
            color: "#fff4cc",
            emissive: "#fff2aa",
            emissiveIntensity: 0.6,
            shininess: 80,
            flatShading: true
        });
        const headlightL = new T.Mesh(new T.BoxGeometry(0.04, 0.08, 0.16), headlightMat);
        headlightL.position.set(-1.34, 0.25, 0.38);
        sedan.add(headlightL);
        const headlightR = headlightL.clone();
        headlightR.position.z = -0.38;
        sedan.add(headlightR);
        const wheelGeo = new T.CylinderGeometry(0.25, 0.25, 0.2, 18);
        const addWheel = (wx, wz) => {
            const wg = new T.Group();
            const w = new T.Mesh(wheelGeo, wheelMat);
            w.rotation.x = Math.PI / 2;
            wg.add(w);
            const cap = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.22, 14), wheelCapMat);
            cap.rotation.x = Math.PI / 2;
            wg.add(cap);
            wg.position.set(wx, 0.25, wz);
            sedan.add(wg);
        };
        addWheel(-0.72, 0.61);
        addWheel(0.95, 0.61);
        addWheel(-0.72, -0.61);
        addWheel(0.95, -0.61);
        const rearBumper = new T.Mesh(
            new T.BoxGeometry(0.09, 0.08, 0.95),
            new T.MeshPhongMaterial({ color: "#c1c5c9", shininess: 30, flatShading: true })
        );
        rearBumper.position.set(1.065, 0.13, 0);
        sedan.add(rearBumper);
        const taillightMat = new T.MeshPhongMaterial({ color: "#d84040", shininess: 20, flatShading: true });
        const taillightL = new T.Mesh(new T.BoxGeometry(0.03, 0.08, 0.16), taillightMat);
        taillightL.position.set(1.055, 0.24, 0.38);
        sedan.add(taillightL);
        const taillightR = taillightL.clone();
        taillightR.position.z = -0.38;
        sedan.add(taillightR);
        super(name, sedan);
        this.setPos(x, 0, z);
    }
}

const world = await GrWorld.new();
const ambientLight = new T.AmbientLight(0xffffff, 0.9);
world.scene.add(ambientLight);
const keyLight = new T.DirectionalLight(0xffffff, 0.65);
keyLight.position.set(3, 5, 2);
world.scene.add(keyLight);
world.add(new IsometricTruck("IsometricTruck", -1.8, 0));
world.add(new IsometricSedan("IsometricSedan", 1.8, 0));
world.go();
