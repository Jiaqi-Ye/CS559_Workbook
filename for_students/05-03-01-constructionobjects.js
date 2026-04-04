// @ts-check

import * as T from "three";
import { GrObject } from "CS559-Framework/GrObject.js";

function degreesToRadians(deg) {
  return (deg * Math.PI) / 180;
}

let craneObCtr = 0;

// A simple crane
/**
 * @typedef CraneProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrCrane extends GrObject {
  /**
   * @param {CraneProperties} params
   */
  constructor(params = {}) {
    let crane = new T.Group();

    let exSettings = {
      steps: 2,
      depth: 0.5,
      bevelEnabled: false
    };

    // first, we define the base of the crane.
    // Just draw a curve for the shape, then use three's "ExtrudeGeometry"
    // to create the shape itself.
    /**@type T.Shape */
    let base_curve = new T.Shape();
    base_curve.moveTo(-0.5, 0);
    base_curve.lineTo(-0.5, 2);
    base_curve.lineTo(-0.25, 2.25);
    base_curve.lineTo(-0.25, 5);
    base_curve.lineTo(-0.2, 5);
    base_curve.lineTo(-0.2, 5.5);
    base_curve.lineTo(0.2, 5.5);
    base_curve.lineTo(0.2, 5);
    base_curve.lineTo(0.25, 5);
    base_curve.lineTo(0.25, 2.25);
    base_curve.lineTo(0.5, 2);
    base_curve.lineTo(0.5, 0);
    base_curve.lineTo(-0.5, 0);
    let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
    let crane_mat = new T.MeshStandardMaterial({
      color: "#f1c40f",
      metalness: 0.5,
      roughness: 0.7
    });
    let crane_dark = new T.MeshStandardMaterial({
      color: "#4b4b4b",
      metalness: 0.6,
      roughness: 0.4
    });
    let base = new T.Mesh(base_geom, crane_mat);
    crane.add(base);
    base.translateZ(-0.25);

    // Use a similar process to create the cross-arm.
    // Note, we create a group for the arm, and move it to the proper position.
    // This ensures rotations will behave nicely,
    // and we just have that one point to work with for animation/sliders.
    let arm_group = new T.Group();
    crane.add(arm_group);
    arm_group.translateY(4.5);
    let arm_curve = new T.Shape();
    arm_curve.moveTo(-1.5, 0);
    arm_curve.lineTo(-1.5, 0.25);
    arm_curve.lineTo(-0.5, 0.5);
    arm_curve.lineTo(4, 0.4);
    arm_curve.lineTo(4, 0);
    arm_curve.lineTo(-1.5, 0);
    let arm_geom = new T.ExtrudeGeometry(arm_curve, exSettings);
    let arm = new T.Mesh(arm_geom, crane_dark);
    arm_group.add(arm);
    arm.translateZ(-0.25);

    // Finally, add the hanging "wire" for the crane arm,
    // which is what carries materials in a real crane.
    // The extrusion makes this not look very wire-like, but that's fine for what we're doing.
    let wire_group = new T.Group();
    arm_group.add(wire_group);
    wire_group.translateX(3);
    let wire_curve = new T.Shape();
    wire_curve.moveTo(-0.25, 0);
    wire_curve.lineTo(-0.25, -0.25);
    wire_curve.lineTo(-0.05, -0.3);
    wire_curve.lineTo(-0.05, -3);
    wire_curve.lineTo(0.05, -3);
    wire_curve.lineTo(0.05, -0.3);
    wire_curve.lineTo(0.25, -0.25);
    wire_curve.lineTo(0.25, 0);
    wire_curve.lineTo(-0.25, 0);
    let wire_geom = new T.ExtrudeGeometry(wire_curve, exSettings);
    let wire_mat = new T.MeshStandardMaterial({
      color: "#222222",
      metalness: 0.6,
      roughness: 0.3
    });
    let wire = new T.Mesh(wire_geom, wire_mat);
    wire_group.add(wire);
    wire.translateZ(-0.25);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    // This is also where we define parameters for UI sliders.
    // These have format "name," "min", "max", "starting value."
    // Sliders are standardized to have 30 "steps" per slider,
    // so if your starting value does not fall on one of the 30 steps,
    // the starting value in the UI may be slightly different from the starting value you gave.
    super(`Crane-${craneObCtr++}`, crane, [
      ["x", -4, 4, 0],
      ["z", -4, 4, 0],
      ["theta", 0, 360, 0],
      ["wire", 1, 3.5, 2],
      ["arm_rotation", 0, 360, 0]
    ]);
    // Here, we store the crane, arm, and wire groups as part of the "GrCrane" object.
    // This allows us to modify transforms as part of the update function.
    this.whole_ob = crane;
    this.arm = arm_group;
    this.wire = wire_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    crane.scale.set(scale, scale, scale);
  }

  // Wire up the wire position and arm rotation to match parameters,
  // given in the call to "super" above.
  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.wire.position.x = paramValues[3];
    this.arm.rotation.y = degreesToRadians(paramValues[4]);
  }
}

let excavatorObCtr = 0;

// A simple excavator
/**
 * @typedef ExcavatorProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrExcavator extends GrObject {
  /**
   * @param {ExcavatorProperties} params
   */
  constructor(params = {}) {
    let excavator = new T.Group();

    let exSettings = {
      steps: 2,
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 2
    };

    // As with the crane, we define the base (treads) of the excavator.
    // We draw a line, then extrude the line with ExtrudeGeometry,
    // to get the "cutout" style object.
    // Note, for this object, we translate each piece by 0.25 on the negative x-axis.
    // This makes rotation about the y-axis work nicely
    // (since the extrusion happens along +z, a y-rotation goes around an axis on the back face of the piece,
    //  rather than an axis through the center of the piece).
    /**@type T.Shape */
    let base_curve = new T.Shape();
    base_curve.moveTo(-1, 0);
    base_curve.lineTo(-1.2, 0.2);
    base_curve.lineTo(-1.2, 0.4);
    base_curve.lineTo(-1, 0.6);
    base_curve.lineTo(1, 0.6);
    base_curve.lineTo(1.2, 0.4);
    base_curve.lineTo(1.2, 0.2);
    base_curve.lineTo(1, 0);
    base_curve.lineTo(-1, 0);
    let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
    let excavator_mat = new T.MeshStandardMaterial({
      color: "#f1c40f",
      metalness: 0.5,
      roughness: 0.7
    });
    let tread_mat = new T.MeshStandardMaterial({
      color: "#444444",
      metalness: 0.4,
      roughness: 0.6
    });
    let base = new T.Mesh(base_geom, tread_mat);
    excavator.add(base);
    base.translateZ(-0.2);

    // We'll add the "pedestal" piece for the cab of the excavator to sit on.
    // It can be considered a part of the treads, to some extent,
    // so it doesn't need a group of its own.
    let pedestal_curve = new T.Shape();
    pedestal_curve.moveTo(-0.35, 0);
    pedestal_curve.lineTo(-0.35, 0.25);
    pedestal_curve.lineTo(0.35, 0.25);
    pedestal_curve.lineTo(0.35, 0);
    pedestal_curve.lineTo(-0.35, 0);
    let pedestal_geom = new T.ExtrudeGeometry(pedestal_curve, exSettings);
    let pedestal = new T.Mesh(pedestal_geom, tread_mat);
    excavator.add(pedestal);
    pedestal.translateY(0.6);
    pedestal.translateZ(-0.2);

    // For the cab, we create a new group, since the cab should be able to spin on the pedestal.
    let cab_group = new T.Group();
    excavator.add(cab_group);
    cab_group.translateY(0.7);
    let cab_curve = new T.Shape();
    cab_curve.moveTo(-1, 0);
    cab_curve.lineTo(1, 0);
    cab_curve.lineTo(1.2, 0.35);
    cab_curve.lineTo(1, 0.75);
    cab_curve.lineTo(0.25, 0.75);
    cab_curve.lineTo(0, 1.5);
    cab_curve.lineTo(-0.8, 1.5);
    cab_curve.lineTo(-1, 1.2);
    cab_curve.lineTo(-1, 0);
    let cab_geom = new T.ExtrudeGeometry(cab_curve, exSettings);
    let cab = new T.Mesh(cab_geom, excavator_mat);
    cab_group.add(cab);
    cab.translateZ(-0.2);

    // Next up is the first part of the bucket arm.
    // In general, each piece is just a series of line segments,
    // plus a bit of extra to get the geometry built and put into a group.
    // We always treat the group as the "pivot point" around which the object should rotate.
    // It is helpful to draw the lines for extrusion with the zero at our desired "pivot point."
    // This minimizes the fiddling needed to get the piece placed correctly relative to its parent's origin.
    // The remaining few pieces are very similar to the arm piece.
    let arm_group = new T.Group();
    cab_group.add(arm_group);
    arm_group.position.set(-0.8, 0.5, 0);
    let arm_curve = new T.Shape();
    arm_curve.moveTo(-2.25, 0);
    arm_curve.lineTo(-2.35, 0.15);
    arm_curve.lineTo(-1, 0.5);
    arm_curve.lineTo(0, 0.25);
    arm_curve.lineTo(-0.2, 0);
    arm_curve.lineTo(-1, 0.3);
    arm_curve.lineTo(-2.25, 0);
    let arm_geom = new T.ExtrudeGeometry(arm_curve, exSettings);
    let arm_mat = new T.MeshStandardMaterial({
      color: "#b0b0b0",
      metalness: 0.6,
      roughness: 0.3
    });
    let arm = new T.Mesh(arm_geom, arm_mat);
    arm_group.add(arm);
    arm.translateZ(-0.2);

    let forearm_group = new T.Group();
    arm_group.add(forearm_group);
    forearm_group.position.set(-2.1, 0, 0);
    let forearm_curve = new T.Shape();
    forearm_curve.moveTo(-1.5, 0);
    forearm_curve.lineTo(-1.5, 0.1);
    forearm_curve.lineTo(0, 0.15);
    forearm_curve.lineTo(0.15, 0);
    forearm_curve.lineTo(-1.5, 0);
    let forearm_geom = new T.ExtrudeGeometry(forearm_curve, exSettings);
    let forearm = new T.Mesh(forearm_geom, arm_mat);
    forearm_group.add(forearm);
    forearm.translateZ(-0.2);

    let bucket_group = new T.Group();
    forearm_group.add(bucket_group);
    bucket_group.position.set(-1.4, 0, 0);
    let bucket_curve = new T.Shape();
    bucket_curve.moveTo(-0.25, -0.9);
    bucket_curve.lineTo(-0.5, -0.5);
    bucket_curve.lineTo(-0.45, -0.3);
    bucket_curve.lineTo(-0.3, -0.2);
    bucket_curve.lineTo(-0.15, 0);
    bucket_curve.lineTo(0.1, 0);
    bucket_curve.lineTo(0.05, -0.2);
    bucket_curve.lineTo(0.5, -0.7);
    bucket_curve.lineTo(-0.25, -0.9);
    let bucket_geom = new T.ExtrudeGeometry(bucket_curve, exSettings);
    let bucket_mat = new T.MeshStandardMaterial({
      color: "#555555",
      metalness: 0.5,
      roughness: 0.4
    });
    let bucket = new T.Mesh(bucket_geom, bucket_mat);
    bucket_group.add(bucket);
    bucket.translateZ(-0.2);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    // The parameters for sliders are also defined here.
    super(`Excavator-${excavatorObCtr++}`, excavator, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["spin", 0, 360, 0],
      ["arm_rotate", 0, 50, 45],
      ["forearm_rotate", 0, 90, 45],
      ["bucket_rotate", -90, 45, 0]
    ]);
    // As with the crane, we save the "excavator" group as the "whole object" of the GrExcavator class.
    // We also save the groups of each object that may be manipulated by the UI.
    this.whole_ob = excavator;
    this.cab = cab_group;
    this.arm = arm_group;
    this.forearm = forearm_group;
    this.bucket = bucket_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    excavator.scale.set(scale, scale, scale);
  }

  // As with the crane, we wire up each saved group with the appropriate parameter defined in the "super" call.
  // Note, with the forearm, there is an extra bit of rotation added, which allows us to create a rotation offset,
  // while maintaining a nice 0-90 range for the slider itself.
  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.cab.rotation.y = degreesToRadians(paramValues[3]);
    this.arm.rotation.z = degreesToRadians(-paramValues[4]);
    this.forearm.rotation.z = degreesToRadians(paramValues[5]) + Math.PI / 16;
    this.bucket.rotation.z = degreesToRadians(paramValues[6]);
  }
}

let towerCraneObCtr = 0;
/**
 * @typedef TowerCraneProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrTowerCrane extends GrObject {
  /**
   * @param {TowerCraneProperties} params
   */
  constructor(params = {}) {
    let crane = new T.Group();

    let base = new T.Mesh(
      new T.CylinderGeometry(0.9, 1.1, 0.4, 16),
      new T.MeshStandardMaterial({
        color: "#555555",
        metalness: 0.4,
        roughness: 0.6
      })
    );
    base.position.y = 0.2;
    crane.add(base);

    let towerMat = new T.MeshStandardMaterial({
      color: "#f39c12",
      metalness: 0.5,
      roughness: 0.6
    });
    let tower = new T.Mesh(new T.BoxGeometry(0.4, 5, 0.4), towerMat);
    tower.position.y = 2.7;
    crane.add(tower);

    let topGroup = new T.Group();
    topGroup.position.y = 5.2;
    crane.add(topGroup);

    let jibMat = new T.MeshStandardMaterial({
      color: "#e67e22",
      metalness: 0.5,
      roughness: 0.6
    });
    let jib = new T.Mesh(new T.BoxGeometry(5, 0.2, 0.2), jibMat);
    jib.position.x = 2.3;
    topGroup.add(jib);

    let counterJib = new T.Mesh(new T.BoxGeometry(2, 0.2, 0.2), jibMat);
    counterJib.position.x = -1.2;
    topGroup.add(counterJib);

    let trolley = new T.Group();
    topGroup.add(trolley);
    trolley.position.set(2.3, -0.1, 0);
    let trolleyBody = new T.Mesh(
      new T.BoxGeometry(0.3, 0.2, 0.3),
      new T.MeshStandardMaterial({
        color: "#34495e",
        metalness: 0.6,
        roughness: 0.4
      })
    );
    trolley.add(trolleyBody);

    let hook = new T.Group();
    trolley.add(hook);
    hook.position.y = -0.1;
    let cable = new T.Mesh(
      new T.CylinderGeometry(0.03, 0.03, 2.5, 8),
      new T.MeshStandardMaterial({
        color: "#222222",
        metalness: 0.6,
        roughness: 0.4
      })
    );
    cable.position.y = -1.25;
    hook.add(cable);
    let hookBlock = new T.Mesh(
      new T.BoxGeometry(0.2, 0.2, 0.2),
      new T.MeshStandardMaterial({
        color: "#c0392b",
        metalness: 0.4,
        roughness: 0.5
      })
    );
    hookBlock.position.y = -2.5;
    hook.add(hookBlock);

    super(`TowerCrane-${towerCraneObCtr++}`, crane, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["spin", 0, 360, 0],
      ["jib_angle", -20, 20, 0],
      ["trolley", 0.5, 4.2, 2.3],
      ["hook", 0.5, 3.0, 2.5]
    ]);

    this.whole_ob = crane;
    this.topGroup = topGroup;
    this.jib = jib;
    this.trolley = trolley;
    this.hook = hook;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    crane.scale.set(scale, scale, scale);
  }

  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.topGroup.rotation.y = degreesToRadians(paramValues[3]);
    this.jib.rotation.z = degreesToRadians(paramValues[4]);
    this.trolley.position.x = paramValues[5];
    this.hook.position.y = -paramValues[6];
  }
}

let mixerObCtr = 0;
/**
 * @typedef MixerTruckProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrMixerTruck extends GrObject {
  /**
   * @param {MixerTruckProperties} params
   */
  constructor(params = {}) {
    let truck = new T.Group();

    let chassisMat = new T.MeshStandardMaterial({
      color: "#2c3e50",
      metalness: 0.4,
      roughness: 0.6
    });
    let cabMat = new T.MeshStandardMaterial({
      color: "#3498db",
      metalness: 0.4,
      roughness: 0.5
    });
    let drumMat = new T.MeshStandardMaterial({
      color: "#ecf0f1",
      metalness: 0.3,
      roughness: 0.4
    });

    let chassis = new T.Mesh(new T.BoxGeometry(3, 0.4, 1.2), chassisMat);
    chassis.position.y = 0.4;
    truck.add(chassis);

    let cab = new T.Mesh(new T.BoxGeometry(1, 0.9, 1.1), cabMat);
    cab.position.set(1.1, 0.95, 0);
    truck.add(cab);

    let drumGroup = new T.Group();
    drumGroup.position.set(-0.6, 1.1, 0);
    truck.add(drumGroup);
    let drum = new T.Mesh(new T.CylinderGeometry(0.6, 0.8, 1.6, 16), drumMat);
    drum.rotation.z = Math.PI / 2;
    drumGroup.add(drum);

    let chute = new T.Group();
    chute.position.set(-1.6, 0.7, 0);
    drumGroup.add(chute);
    let chuteMesh = new T.Mesh(new T.BoxGeometry(0.8, 0.1, 0.3), chassisMat);
    chute.add(chuteMesh);

    let wheelMat = new T.MeshStandardMaterial({
      color: "#111111",
      metalness: 0.2,
      roughness: 0.8
    });
    let wheelGeom = new T.CylinderGeometry(0.25, 0.25, 0.2, 12);
    let wheelPositions = [
      [1.1, 0.2, 0.6],
      [1.1, 0.2, -0.6],
      [-0.2, 0.2, 0.6],
      [-0.2, 0.2, -0.6],
      [-1.4, 0.2, 0.6],
      [-1.4, 0.2, -0.6]
    ];
    let wheels = [];
    for (let p of wheelPositions) {
      let w = new T.Mesh(wheelGeom, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(p[0], p[1], p[2]);
      truck.add(w);
      wheels.push(w);
    }

    super(`MixerTruck-${mixerObCtr++}`, truck, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["drum_spin", 0, 360, 0],
      ["drum_tilt", -20, 20, 0],
      ["chute_angle", -45, 45, 10]
    ]);

    this.whole_ob = truck;
    this.drumGroup = drumGroup;
    this.drum = drum;
    this.chute = chute;
    this.wheels = wheels;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    truck.scale.set(scale, scale, scale);
  }

  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.drum.rotation.x = degreesToRadians(paramValues[3]);
    this.drumGroup.rotation.z = degreesToRadians(paramValues[4]);
    this.chute.rotation.z = degreesToRadians(paramValues[5]);
  }
}

let dumpObCtr = 0;
/**
 * @typedef DumpTruckProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrDumpTruck extends GrObject {
  /**
   * @param {DumpTruckProperties} params
   */
  constructor(params = {}) {
    let truck = new T.Group();

    let redMat = new T.MeshStandardMaterial({
      color: "#b10f0f",
      metalness: 0.4,
      roughness: 0.6
    });
    let redAccent = new T.MeshStandardMaterial({
      color: "#d64545",
      metalness: 0.3,
      roughness: 0.5
    });
    let darkMat = new T.MeshStandardMaterial({
      color: "#3b3b3b",
      metalness: 0.5,
      roughness: 0.6
    });
    let hazardYellow = new T.MeshStandardMaterial({
      color: "#f1c40f",
      metalness: 0.2,
      roughness: 0.6
    });

    let chassis = new T.Mesh(new T.BoxGeometry(3.3, 0.35, 1.25), darkMat);
    chassis.position.y = 0.4;
    truck.add(chassis);

    let cab = new T.Mesh(new T.BoxGeometry(1.15, 0.85, 1.15), redMat);
    cab.position.set(1.25, 0.95, 0);
    cab.rotation.z = 0.06;
    truck.add(cab);

    let windshield = new T.Mesh(new T.BoxGeometry(0.55, 0.35, 1.02), redAccent);
    windshield.position.set(1.45, 1.1, 0);
    windshield.rotation.z = 0.25;
    truck.add(windshield);

    // light bar on cab roof
    let lightMat = new T.MeshStandardMaterial({
      color: "#ffd27f",
      emissive: "#ffd27f",
      emissiveIntensity: 0.8,
      roughness: 0.4
    });
    let lightBar = new T.Mesh(new T.BoxGeometry(0.5, 0.08, 0.18), lightMat);
    lightBar.position.set(1.25, 1.35, 0);
    truck.add(lightBar);

    // headlights
    let headlightMat = new T.MeshStandardMaterial({
      color: "#fff0cc",
      emissive: "#fff0cc",
      emissiveIntensity: 0.8,
      roughness: 0.4
    });
    let hlL = new T.Mesh(new T.BoxGeometry(0.14, 0.1, 0.08), headlightMat);
    let hlR = new T.Mesh(new T.BoxGeometry(0.14, 0.1, 0.08), headlightMat);
    hlL.position.set(1.85, 0.55, 0.32);
    hlR.position.set(1.85, 0.55, -0.32);
    truck.add(hlL);
    truck.add(hlR);

    // bed pivot at the rear hinge
    let bedPivot = new T.Group();
    bedPivot.position.set(-1.5, 0.75, 0);
    truck.add(bedPivot);

    let bedGroup = new T.Group();
    bedGroup.position.set(0.9, 0, 0);
    bedPivot.add(bedGroup);
    let bed = new T.Mesh(new T.BoxGeometry(1.85, 0.6, 1.15), redMat);
    bed.position.set(0, 0.3, 0);
    bedGroup.add(bed);

    // tailgate pivoted at top edge
    let tailGatePivot = new T.Group();
    tailGatePivot.position.set(-0.95, 0.55, 0);
    bedGroup.add(tailGatePivot);
    let tailGate = new T.Mesh(new T.BoxGeometry(0.1, 0.5, 1.12), redMat);
    tailGate.position.set(0, -0.25, 0);
    tailGatePivot.add(tailGate);

    let sideRailL = new T.Mesh(new T.BoxGeometry(1.85, 0.08, 0.08), redAccent);
    let sideRailR = new T.Mesh(new T.BoxGeometry(1.85, 0.08, 0.08), redAccent);
    sideRailL.position.set(0, 0.63, 0.58);
    sideRailR.position.set(0, 0.63, -0.58);
    bedGroup.add(sideRailL);
    bedGroup.add(sideRailR);

    // hazard stripes on rear of bed
    let stripeCount = 5;
    for (let i = 0; i < stripeCount; i++) {
      let stripe = new T.Mesh(
        new T.BoxGeometry(0.12, 0.48, 0.04),
        i % 2 === 0 ? darkMat : hazardYellow
      );
      stripe.position.set(0, 0.05, -0.45 + i * 0.225);
      tailGatePivot.add(stripe);
    }

    // "W" logo on cab side
    let logoMat = new T.MeshStandardMaterial({
      color: "#ffffff",
      metalness: 0.2,
      roughness: 0.5
    });
    // "W" logo made of 4 strokes (connected look)
    let wGroup = new T.Group();
    let vGeom = new T.BoxGeometry(0.05, 0.3, 0.02);
    let dGeom = new T.BoxGeometry(0.05, 0.28, 0.02);
    let left = new T.Mesh(vGeom, logoMat);
    let right = new T.Mesh(vGeom, logoMat);
    let dL = new T.Mesh(dGeom, logoMat);
    let dR = new T.Mesh(dGeom, logoMat);

    left.position.set(0.0, 0.02, 0);
    right.position.set(0.36, 0.02, 0);
    dL.rotation.z = -0.65;
    dR.rotation.z = 0.65;
    dL.position.set(0.12, -0.08, 0);
    dR.position.set(0.24, -0.08, 0);

    wGroup.add(left);
    wGroup.add(dL);
    wGroup.add(dR);
    wGroup.add(right);
    wGroup.position.set(1.05, 0.9, 0.62);
    truck.add(wGroup);

    let wheelMat = new T.MeshStandardMaterial({
      color: "#151515",
      metalness: 0.2,
      roughness: 0.8
    });
    let stripeMat = new T.MeshStandardMaterial({
      color: "#d9d9d9",
      metalness: 0.2,
      roughness: 0.6
    });
    let wheelGeom = new T.CylinderGeometry(0.27, 0.27, 0.22, 12);
    let wheelPositions = [
      [1.3, 0.25, 0.65],
      [1.3, 0.25, -0.65],
      [0.1, 0.25, 0.65],
      [0.1, 0.25, -0.65],
      [-1.2, 0.25, 0.65],
      [-1.2, 0.25, -0.65]
    ];
    let wheels = [];
    for (let p of wheelPositions) {
      let wheelGroup = new T.Group();
      let w = new T.Mesh(wheelGeom, wheelMat);
      // orient wheel so it rolls forward (+X), axis along Z
      w.rotation.x = Math.PI / 2;
      w.position.set(0, 0, 0);
      wheelGroup.add(w);

      // ring stripe to show rotation
      let stripe = new T.Mesh(
        new T.TorusGeometry(0.24, 0.02, 8, 24),
        stripeMat
      );
      stripe.rotation.x = Math.PI / 2;
      wheelGroup.add(stripe);

      wheelGroup.position.set(p[0], p[1], p[2]);
      truck.add(wheelGroup);
      wheels.push(wheelGroup);
    }

    super(`DumpTruck-${dumpObCtr++}`, truck, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["bed_tilt", 0, 60, 0],
      ["tailgate", 0, 90, 0],
      ["wheel_spin", 0, 360, 0]
    ]);

    this.whole_ob = truck;
    this.bedPivot = bedPivot;
    this.tailGatePivot = tailGatePivot;
    this.wheels = wheels;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    truck.scale.set(scale, scale, scale);
  }

  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    // dump bed tilts backward (positive rotation)
    this.bedPivot.rotation.z = degreesToRadians(paramValues[3]);
    // tailgate opens downward
    this.tailGatePivot.rotation.z = degreesToRadians(-paramValues[4]);
    for (let w of this.wheels) {
      w.rotation.z = degreesToRadians(paramValues[5]);
    }
  }
}

let forkObCtr = 0;
/**
 * @typedef ForkliftProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrForklift extends GrObject {
  /**
   * @param {ForkliftProperties} params
   */
  constructor(params = {}) {
    let lift = new T.Group();

    let blueMat = new T.MeshStandardMaterial({
      color: "#0073bb",
      metalness: 0.4,
      roughness: 0.6
    });
    let blueAccent = new T.MeshStandardMaterial({
      color: "#2a8fd4",
      metalness: 0.3,
      roughness: 0.5
    });
    let darkMat = new T.MeshStandardMaterial({
      color: "#2f2f2f",
      metalness: 0.5,
      roughness: 0.6
    });
    let hazardYellow = new T.MeshStandardMaterial({
      color: "#f1c40f",
      metalness: 0.2,
      roughness: 0.6
    });

    let body = new T.Mesh(new T.BoxGeometry(1.7, 0.35, 0.95), blueMat);
    body.position.y = 0.35;
    lift.add(body);

    let cab = new T.Mesh(new T.BoxGeometry(0.75, 0.65, 0.85), blueMat);
    cab.position.set(0.25, 0.88, 0);
    cab.rotation.z = -0.04;
    lift.add(cab);

    let roof = new T.Mesh(new T.BoxGeometry(0.85, 0.08, 0.9), blueAccent);
    roof.position.set(0.2, 1.23, 0);
    lift.add(roof);

    // light bar
    let lightMat = new T.MeshStandardMaterial({
      color: "#ffd27f",
      emissive: "#ffd27f",
      emissiveIntensity: 0.8,
      roughness: 0.4
    });
    let lightBar = new T.Mesh(new T.BoxGeometry(0.5, 0.06, 0.2), lightMat);
    lightBar.position.set(0.2, 1.32, 0);
    lift.add(lightBar);

    // headlights
    let headlightMat = new T.MeshStandardMaterial({
      color: "#fff0cc",
      emissive: "#fff0cc",
      emissiveIntensity: 0.8,
      roughness: 0.4
    });
    let hlL = new T.Mesh(new T.BoxGeometry(0.12, 0.08, 0.07), headlightMat);
    let hlR = new T.Mesh(new T.BoxGeometry(0.12, 0.08, 0.07), headlightMat);
    hlL.position.set(0.95, 0.5, 0.24);
    hlR.position.set(0.95, 0.5, -0.24);
    lift.add(hlL);
    lift.add(hlR);

    let mastGroup = new T.Group();
    mastGroup.position.set(-0.75, 0.5, 0);
    lift.add(mastGroup);
    let mast = new T.Mesh(new T.BoxGeometry(0.16, 1.65, 0.9), darkMat);
    mast.position.y = 0.8;
    mastGroup.add(mast);

    let carriage = new T.Group();
    carriage.position.y = 0.45;
    mastGroup.add(carriage);
    let carriagePlate = new T.Mesh(new T.BoxGeometry(0.1, 0.6, 0.82), darkMat);
    carriage.add(carriagePlate);

    // hazard stripes on carriage
    for (let i = 0; i < 4; i++) {
      let stripe = new T.Mesh(
        new T.BoxGeometry(0.02, 0.45, 0.06),
        i % 2 === 0 ? darkMat : hazardYellow
      );
      stripe.position.set(0.06, -0.05, -0.24 + i * 0.16);
      carriage.add(stripe);
    }

    let forkFrame = new T.Group();
    carriage.add(forkFrame);
    forkFrame.position.x = -0.08;

    let forks = new T.Group();
    forkFrame.add(forks);
    let forkMat = new T.MeshStandardMaterial({
      color: "#6b6b6b",
      metalness: 0.6,
      roughness: 0.4
    });
    let forkL = new T.Mesh(new T.BoxGeometry(0.65, 0.06, 0.12), forkMat);
    let forkR = new T.Mesh(new T.BoxGeometry(0.65, 0.06, 0.12), forkMat);
    forkL.position.set(-0.35, -0.28, 0.18);
    forkR.position.set(-0.35, -0.28, -0.18);
    forks.add(forkL);
    forks.add(forkR);

    // "W" logo on cab side
    let logoMat = new T.MeshStandardMaterial({
      color: "#ffffff",
      metalness: 0.2,
      roughness: 0.5
    });
    let wGroup = new T.Group();
    let vGeom = new T.BoxGeometry(0.04, 0.22, 0.02);
    let dGeom = new T.BoxGeometry(0.04, 0.2, 0.02);
    let left = new T.Mesh(vGeom, logoMat);
    let right = new T.Mesh(vGeom, logoMat);
    let dL = new T.Mesh(dGeom, logoMat);
    let dR = new T.Mesh(dGeom, logoMat);

    left.position.set(0.0, 0.02, 0);
    right.position.set(0.3, 0.02, 0);
    dL.rotation.z = -0.65;
    dR.rotation.z = 0.65;
    dL.position.set(0.1, -0.07, 0);
    dR.position.set(0.2, -0.07, 0);

    wGroup.add(left);
    wGroup.add(dL);
    wGroup.add(dR);
    wGroup.add(right);
    wGroup.position.set(0.2, 0.78, 0.5);
    lift.add(wGroup);

    let wheelMat = new T.MeshStandardMaterial({
      color: "#151515",
      metalness: 0.2,
      roughness: 0.8
    });
    let stripeMat = new T.MeshStandardMaterial({
      color: "#d9d9d9",
      metalness: 0.2,
      roughness: 0.6
    });
    let wheelGeom = new T.CylinderGeometry(0.18, 0.18, 0.15, 12);
    let wheelPositions = [
      [0.6, 0.18, 0.45],
      [0.6, 0.18, -0.45],
      [-0.6, 0.18, 0.45],
      [-0.6, 0.18, -0.45]
    ];
    let wheels = [];
    for (let p of wheelPositions) {
      let wheelGroup = new T.Group();
      let w = new T.Mesh(wheelGeom, wheelMat);
      // orient wheel so it rolls forward (+X), axis along Z
      w.rotation.x = Math.PI / 2;
      w.position.set(0, 0, 0);
      wheelGroup.add(w);

      let stripe = new T.Mesh(
        new T.TorusGeometry(0.17, 0.015, 8, 24),
        stripeMat
      );
      stripe.rotation.x = Math.PI / 2;
      wheelGroup.add(stripe);

      wheelGroup.position.set(p[0], p[1], p[2]);
      lift.add(wheelGroup);
      wheels.push(wheelGroup);
    }

    super(`Forklift-${forkObCtr++}`, lift, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["mast_tilt", -10, 12, 0],
      ["lift_height", 0.2, 1.3, 0.6],
      ["fork_extend", 0, 0.5, 0.1],
      ["wheel_spin", 0, 360, 0]
    ]);

    this.whole_ob = lift;
    this.mastGroup = mastGroup;
    this.carriage = carriage;
    this.forkFrame = forkFrame;
    this.forks = forks;
    this.wheels = wheels;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    lift.scale.set(scale, scale, scale);
  }

  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.mastGroup.rotation.z = degreesToRadians(paramValues[3]);
    this.carriage.position.y = paramValues[4];
    this.forks.position.x = -paramValues[5];
    for (let w of this.wheels) {
      w.rotation.z = degreesToRadians(paramValues[6]);
    }
  }
}

let miniExcavatorObCtr = 0;
/**
 * @typedef MiniExcavatorProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrMiniExcavator extends GrObject {
  /**
   * @param {MiniExcavatorProperties} params
   */
  constructor(params = {}) {
    let excavator = new T.Group();

    let bodyMat = new T.MeshStandardMaterial({
      color: "#8e44ad",
      metalness: 0.4,
      roughness: 0.6
    });
    let darkMat = new T.MeshStandardMaterial({
      color: "#444444",
      metalness: 0.4,
      roughness: 0.6
    });

    // base
    let base = new T.Mesh(new T.BoxGeometry(1.9, 0.35, 1.05), darkMat);
    base.position.y = 0.25;
    excavator.add(base);

    // wheels
    let wheelMat = new T.MeshStandardMaterial({
      color: "#1d1d1d",
      metalness: 0.2,
      roughness: 0.8
    });
    let wheelGeom = new T.CylinderGeometry(0.18, 0.18, 0.14, 12);
    let wheelPositions = [
      [0.7, 0.15, 0.5],
      [0.7, 0.15, -0.5],
      [-0.7, 0.15, 0.5],
      [-0.7, 0.15, -0.5]
    ];
    let wheels = [];
    for (let p of wheelPositions) {
      let wheel = new T.Mesh(wheelGeom, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      excavator.add(wheel);
      wheels.push(wheel);
    }

    // pedestal and cab
    let pedestal = new T.Mesh(new T.CylinderGeometry(0.4, 0.45, 0.2, 12), darkMat);
    pedestal.position.y = 0.55;
    excavator.add(pedestal);

    let cabGroup = new T.Group();
    cabGroup.position.y = 0.65;
    excavator.add(cabGroup);
    let cab = new T.Mesh(new T.BoxGeometry(0.9, 0.55, 0.9), bodyMat);
    cab.position.y = 0.3;
    cabGroup.add(cab);

    // headlights
    let headlightMat = new T.MeshStandardMaterial({
      color: "#fff0cc",
      emissive: "#fff0cc",
      emissiveIntensity: 0.8,
      roughness: 0.4
    });
    let hlL = new T.Mesh(new T.BoxGeometry(0.12, 0.08, 0.06), headlightMat);
    let hlR = new T.Mesh(new T.BoxGeometry(0.12, 0.08, 0.06), headlightMat);
    hlL.position.set(0.35, 0.35, 0.25);
    hlR.position.set(0.35, 0.35, -0.25);
    cabGroup.add(hlL);
    cabGroup.add(hlR);

    // label plate
    let label = new T.Mesh(
      new T.BoxGeometry(0.5, 0.18, 0.02),
      new T.MeshStandardMaterial({
        color: "#ffffff",
        metalness: 0.1,
        roughness: 0.6
      })
    );
    label.position.set(0.3, 0.2, 0.46);
    cabGroup.add(label);

    // boom
    let boomGroup = new T.Group();
    cabGroup.add(boomGroup);
    boomGroup.position.set(-0.45, 0.25, 0);
    let boom = new T.Mesh(new T.BoxGeometry(0.9, 0.15, 0.2), darkMat);
    boom.position.x = -0.45;
    boomGroup.add(boom);

    // stick
    let stickGroup = new T.Group();
    boomGroup.add(stickGroup);
    stickGroup.position.set(-0.9, 0, 0);
    let stick = new T.Mesh(new T.BoxGeometry(0.7, 0.12, 0.18), darkMat);
    stick.position.x = -0.35;
    stickGroup.add(stick);

    // bucket
    let bucketGroup = new T.Group();
    stickGroup.add(bucketGroup);
    bucketGroup.position.set(-0.7, 0, 0);
    let bucket = new T.Mesh(new T.BoxGeometry(0.35, 0.2, 0.25), darkMat);
    bucket.position.x = -0.18;
    bucket.position.y = -0.05;
    bucketGroup.add(bucket);

    super(`MiniExcavator-${miniExcavatorObCtr++}`, excavator, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["cab_spin", 0, 360, 0],
      ["boom", -30, 45, 10],
      ["stick", -60, 60, 10],
      ["bucket", -90, 45, 0],
      ["wheel_spin", 0, 360, 0]
    ]);

    this.whole_ob = excavator;
    this.cab = cabGroup;
    this.boom = boomGroup;
    this.stick = stickGroup;
    this.bucket = bucketGroup;
    this.wheels = wheels;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    excavator.scale.set(scale, scale, scale);
  }

  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.cab.rotation.y = degreesToRadians(paramValues[3]);
    this.boom.rotation.z = degreesToRadians(paramValues[4]);
    this.stick.rotation.z = degreesToRadians(paramValues[5]);
    this.bucket.rotation.z = degreesToRadians(paramValues[6]);
    for (let w of this.wheels) {
      w.rotation.z = degreesToRadians(paramValues[7]);
    }
  }
}

