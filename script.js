// Planetoid v.07 Alpha
/*
    Table of Contents:
    1.00 - Initialization and Scene Setup
    2.00 - Placeholder Geometry and Scene Objects
    3.00 - Lighting, Materials, and Post-Processing
    7.00 - Game Loop and Rendering
    8.00 - Debugging and Loader
*/

// - - - >> 1.00 - Initialization and Scene Setup
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// 1.00.00
const scene = new THREE.Scene();
let camera, renderer;

// 1.00.01 - New init function
function init() {
    try {
        logDebug('Planetoid v.07 Alpha loading...');

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 100; // Move camera back to see the cube
        camera.rotation.order = "YXZ";

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        logDebug('Renderer created successfully.');

        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';

        scene.background = new THREE.Color(0x0a001a);
        logDebug('Scene background set.');

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

    } catch (e) {
        logDebug(`Initialization failed: ${e.message}`);
        console.error('Initialization failed:', e);
    }
}
// 1.00.02
init();

// - - - >> 2.00 - Placeholder Geometry and Scene Objects
// 2.00.00
const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshPhongMaterial({ color: 0x00FFFF });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0); // Center the cube
scene.add(cube);
logDebug('Placeholder cube added to scene.');

// - - - >> 3.00 - Lighting, Materials, and Post-Processing
// 3.00.00
const ambientLight = new THREE.AmbientLight(0x4a008a, 0.5);
scene.add(ambientLight);
// 3.00.01
const directionalLight = new THREE.DirectionalLight(0x8A2BE2, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);
// 3.00.02
const neonGlowLight = new THREE.PointLight(0x00FFFF, 1, 50);
neonGlowLight.position.set(0, 20, 0);
scene.add(neonGlowLight);
// 3.00.03
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// - - - >> 7.00 - Game Loop and Rendering
// 7.00.00
function animate() {
    requestAnimationFrame(animate);

    // 7.00.01
    if (!renderer || !camera) {
        logDebug('Renderer or camera not initialized. Skipping frame.');
        return;
    }

    // 7.00.02
    renderer.render(scene, camera);
}
animate();

// - - - >> 8.00 - Debugging and Loader
// 8.00.00
const loaderScreen = document.getElementById('loading-screen');
const debugOutput = document.getElementById('debug-output');
const versionDisplay = document.getElementById('version-display');
if (versionDisplay) {
    versionDisplay.textContent = 'Planetoid v.07 Alpha';
}
// 8.00.01
function logDebug(message) {
    if (debugOutput) {
        const p = document.createElement('p');
        p.textContent = message;
        debugOutput.appendChild(p);
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
    console.log(message);
}
// 8.00.02
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function (item, loaded, total) {
    logDebug(`Loading: ${item} (${loaded}/${total})`);
};
loadingManager.onLoad = function () {
    logDebug('All assets loaded. Starting game.');
    loaderScreen.style.display = 'none';
};
logDebug('Initializing game...');
setTimeout(() => {
    logDebug('Forcing loader hide. Game should be running.');
    if (loaderScreen) {
        loaderScreen.style.display = 'none';
    }
}, 5000);

// https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
// Planetoid v.07 Alpha
