import * as THREE from 'three';

const container = document.getElementById('container');

// Define materials
const materialList = [
//    { name: 'Basic', mat: new THREE.MeshBasicMaterial({ color: 0x00ffcc }) },
//    { name: 'Lambert', mat: new THREE.MeshLambertMaterial({ color: 0x00ffcc }) },
//    { name: 'Phong', mat: new THREE.MeshPhongMaterial({ color: 0x00ffcc, shininess: 80 }) },
    { name: 'Phong', mat: new THREE.MeshPhongMaterial({ color: 0x00ffcc, shininess: 80, specular: 0xcccccc, flatShading:false }) },
    { name: 'Standard', mat: new THREE.MeshStandardMaterial({ color: 0x00ffcc, roughness: 0.4, metalness: 0.3 }) },
    { name: 'Physical', mat: new THREE.MeshPhysicalMaterial({ color: 0x00ffcc, clearcoat: 1.0, roughness: 0.1 }) }
];

const scenes = [];
const geometry = new THREE.TorusKnotGeometry(0.5, 0.18, 128, 16);

materialList.forEach(item => {
    // Create DOM elements
    const slot = document.createElement('div');
    slot.className = 'material-slot';
    
    const canvas = document.createElement('canvas');
    slot.appendChild(canvas);
    
    const label = document.createElement('div');
    label.className = 'label';
    label.innerText = item.name;
    slot.appendChild(label);
    
    container.appendChild(slot);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(200, 200);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 2.2;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const light = new THREE.PointLight(0xffffff, 15);
    light.position.set(3, 3, 3);
    scene.add(light);

    const mesh = new THREE.Mesh(geometry, item.mat);
    scene.add(mesh);

    scenes.push({ renderer, scene, camera, mesh, name: item.name });
});

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    scenes.forEach(s => {
        s.mesh.rotation.x += 0.01;
        s.mesh.rotation.y += 0.015;

        // Animate depth/distance visualization
        if (s.name === 'Depth' || s.name === 'Distance') {
            s.mesh.position.z = Math.sin(time) * 0.4;
        }

        s.renderer.render(s.scene, s.camera);
    });
}

animate();