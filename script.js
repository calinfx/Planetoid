// Planetoid v.06 Alpha
/*
    Table of Contents:
    1.00 - Initialization and Scene Setup
    2.00 - Placeholder Geometry and Scene Objects
    3.00 - Lighting, Materials, and Post-Processing
    4.00 - Inventory System UI and Logic
    5.00 - Phone Controls and Input
    6.00 - Jump and Jetpack Controls
    7.00 - Game Loop and Rendering
    8.00 - Debugging and Loader
*/

// - - - >> 1.00 - Initialization and Scene Setup
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// 1.00.00
const scene = new THREE.Scene();
let camera, renderer;

// 1.00.01
function init() {
    try {
        logDebug('Planetoid v.06 Alpha loading...');
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
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
const material = new THREE.MeshPhongMaterial({ color: 0x8A2BE2 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, -50);
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

// - - - >> 4.00 - Inventory System UI and Logic
// 4.00.00
const inventory = Array(12).fill(null);
let activeSlot = 0;
// 4.00.01
const inventoryUI = document.getElementById('inventory-ui');
const inventoryToggleButton = document.getElementById('inventory-toggle');
// 4.00.02
const inventorySlots = [];
for (let i = 0; i < 12; i++) {
    const slot = document.createElement('div');
    slot.textContent = i + 1;
    slot.dataset.slotIndex = i;
    if (inventoryUI) {
      inventoryUI.appendChild(slot);
    }
    inventorySlots.push(slot);
    slot.addEventListener('click', () => {
        selectSlot(parseInt(slot.dataset.slotIndex));
    });
}
// 4.00.03
if (inventoryToggleButton) {
  inventoryToggleButton.addEventListener('click', () => {
      const isVisible = inventoryUI.style.display === 'grid';
      inventoryUI.style.display = isVisible ? 'none' : 'grid';
  });
}
// 4.00.04
function updateInventoryUI() {
  if (!inventorySlots) return;
    inventorySlots.forEach((slotElement, index) => {
        if (index === activeSlot) {
            slotElement.style.borderColor = '#00FFFF';
            slotElement.style.boxShadow = '0 0 8px #00FFFF';
        } else {
            slotElement.style.borderColor = '#8A2BE2';
            slotElement.style.boxShadow = 'none';
        }
    });
}
// 4.00.05
function selectSlot(index) {
    activeSlot = index;
    updateInventoryUI();
}
updateInventoryUI();

// - - - >> 5.00 - Phone Controls and Input
// 5.00.00
const player = {
    height: 5,
    speed: 0.5,
    rotationSpeed: 0.005,
    jetpackSpeed: 1.0,
    jetpackAcceleration: 0.05,
    jumpVelocity: 1.5,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(),
    isGrounded: false
};
// 5.00.01
camera.position.copy(player.position);
const moveJoystick = document.getElementById('move-joystick');
const lookJoystick = document.getElementById('look-joystick');
let moveJoystickActive = false;
let lookJoystickActive = false;
let moveTouch = new THREE.Vector2(0, 0);
let lookTouch = new THREE.Vector2(0, 0);
let threeFingerSwipeStart = null;
const moveJoystickCenter = new THREE.Vector2(0, 0);
const lookJoystickCenter = new THREE.Vector2(0, 0);
let zoomEnabled = true;

// 5.00.02
window.addEventListener('touchstart', (event) => {
    if (event.touches.length === 3) {
        threeFingerSwipeStart = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    if (!zoomEnabled) {
        event.preventDefault();
    }
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        const target = touch.target;
        const rect = target.getBoundingClientRect();
        if (target === moveJoystick) {
            moveJoystickActive = true;
            moveJoystickCenter.set(rect.left + rect.width / 2, rect.top + rect.height / 2);
            moveTouch.set(touch.clientX, touch.clientY);
        } else if (target === lookJoystick) {
            lookJoystickActive = true;
            lookJoystickCenter.set(rect.left + rect.width / 2, rect.top + rect.height / 2);
            lookTouch.set(touch.clientX, touch.clientY);
        }
    }
}, { passive: false });
// 5.00.03
window.addEventListener('touchend', (event) => {
    moveJoystickActive = false;
    lookJoystickActive = false;
    moveTouch.set(0, 0);
    lookTouch.set(0, 0);
    if (threeFingerSwipeStart && event.touches.length === 0) {
        const swipeEnd = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY
        };
        const distanceX = Math.abs(swipeEnd.x - threeFingerSwipeStart.x);
        const distanceY = Math.abs(swipeEnd.y - threeFingerSwipeStart.y);
        if (distanceX > 50 || distanceY > 50) {
            toggleZoom();
        }
        threeFingerSwipeStart = null;
    }
});
// 5.00.04
window.addEventListener('touchmove', (event) => {
    if (threeFingerSwipeStart) {
        event.preventDefault();
    }
    if (!zoomEnabled) {
        event.preventDefault();
    }
    if (moveJoystickActive) {
        const touch = event.touches[0];
        moveTouch.set(touch.clientX, touch.clientY);
    } else if (lookJoystickActive) {
        const touch = event.touches[0];
        lookTouch.set(touch.clientX, touch.clientY);
    }
}, { passive: false });

// - - - >> 6.00 - Jump and Jetpack Controls
// 6.00.00
const jumpButton = document.getElementById('jump-button');
const jetpackButton = document.getElementById('jetpack-button');
let jetpackActive = false;
// 6.00.01
if (jumpButton) {
  jumpButton.addEventListener('click', () => {
      logDebug('Jump not functional with placeholder.');
  });
}
// 6.00.02
if (jetpackButton) {
  jetpackButton.addEventListener('touchstart', (event) => {
      event.preventDefault();
      logDebug('Jetpack not functional with placeholder.');
  });
}
// 6.00.03
if (jetpackButton) {
  jetpackButton.addEventListener('touchend', () => {
      logDebug('Jetpack not functional with placeholder.');
  });
}

// - - - >> 7.00 - Game Loop and Rendering
// 7.00.00
let lastTime = 0;
// 7.00.01
function animate(time) {
    requestAnimationFrame(animate);
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    // 7.00.02
    if (!renderer || !camera) {
        logDebug('Renderer or camera not initialized. Skipping frame.');
        return;
    }

    // 7.00.03
    renderer.render(scene, camera);
}
animate();

// - - - >> 8.00 - Debugging and Loader
// 8.00.00
const loaderScreen = document.getElementById('loading-screen');
const debugOutput = document.getElementById('debug-output');
const versionDisplay = document.getElementById('version-display');
if (versionDisplay) {
    versionDisplay.textContent = 'Planetoid v.06 Alpha';
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
// Planetoid v.06 Alpha
