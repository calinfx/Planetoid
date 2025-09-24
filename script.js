// https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
/*
    Table of Contents:
    1.00 - Initialization and Scene Setup
    2.00 - Planetoid Class Definition and Generation
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
const GAME_VERSION = 'v0.01';
const scene = new THREE.Scene();

// 1.00.01
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.rotation.order = "YXZ";

// 1.00.02
const renderer = new THREE.WebGLRenderer({ antialias: true });

// 1.00.03
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// 1.00.04
scene.background = new THREE.Color(0x0a001a);

// 1.00.05
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// - - - >> 2.00 - Planetoid Class Definition and Generation
// 2.00.00 - A simple Perlin noise function for height variation
function perlinNoise(x, y, z) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 5.768) * 43758.5453;
    return n - Math.floor(n);
}
// 2.00.01 - Planetoid Class
class Planetoid {
    constructor(radius, subdivisionLevel, position) {
        this.radius = radius;
        this.subdivisionLevel = subdivisionLevel;
        this.group = new THREE.Group();
        this.group.position.copy(position);
        scene.add(this.group);
        this.blocks = [];
        this.generate();
    }
// 2.00.02
    generate() {
        try {
            logDebug('Generating planetoid...');
            const icosahedron = new THREE.IcosahedronGeometry(this.radius, this.subdivisionLevel);
            const vertices = icosahedron.vertices;
            const blockRadius = this.radius * 0.05;
            const blockHeight = this.radius * 0.05;
            const hexGeometry = new THREE.CylinderGeometry(blockRadius, blockRadius * 0.9, blockHeight, 6, 1, false);
            const blockPositions = new Set();
            const colors = [0x8A2BE2, 0x4B0082, 0x4169E1, 0x40E0D0, 0x00FFFF, 0x32CD32, 0xFFA500, 0xFF00FF];
// 2.00.03
            vertices.forEach(vertex => {
                const blockPos = vertex.clone().normalize().multiplyScalar(this.radius);
                const key = `${blockPos.x.toFixed(2)},${blockPos.y.toFixed(2)},${blockPos.z.toFixed(2)}`;
                if (!blockPositions.has(key)) {
                    blockPositions.add(key);
                    const blockColor = colors[Math.floor(perlinNoise(vertex.x, vertex.y, vertex.z) * colors.length)];
                    const blockMaterial = new THREE.MeshPhongMaterial({ color: blockColor, flatShading: true });
                    const blockMesh = new THREE.Mesh(hexGeometry, blockMaterial);
                    blockMesh.position.copy(blockPos);
                    blockMesh.lookAt(this.group.position);
                    blockMesh.rotateX(Math.PI / 2);
                    this.group.add(blockMesh);
                    this.blocks.push(blockMesh);
                }
            });
            logDebug('Planetoid generated successfully.');
        } catch (e) {
            logDebug(`Error generating planetoid: ${e.message}`);
        }
    }
}
// 2.00.04 - Create a single planetoid for testing
logDebug('Creating planetoid instance...');
const testPlanet = new Planetoid(100, 2, new THREE.Vector3(0, 0, 0));

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
    inventoryUI.appendChild(slot);
    inventorySlots.push(slot);
    slot.addEventListener('click', () => {
        selectSlot(parseInt(slot.dataset.slotIndex));
    });
}
// 4.00.03
inventoryToggleButton.addEventListener('click', () => {
    const isVisible = inventoryUI.style.display === 'grid';
    inventoryUI.style.display = isVisible ? 'none' : 'grid';
});
// 4.00.04
function updateInventoryUI() {
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
    position: new THREE.Vector3(0, testPlanet.radius + 5, 0),
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
// 6.00.01 - Jump listener
jumpButton.addEventListener('click', () => {
    if (player.isGrounded) {
        logDebug('Player jump initiated.');
        const up = player.position.clone().sub(testPlanet.group.position).normalize();
        player.velocity.add(up.multiplyScalar(player.jumpVelocity));
        player.isGrounded = false;
    }
});
// 6.00.02 - Jetpack listeners
jetpackButton.addEventListener('touchstart', (event) => {
    event.preventDefault();
    jetpackActive = true;
    logDebug('Jetpack active.');
});
// 6.00.03
jetpackButton.addEventListener('touchend', () => {
    jetpackActive = false;
    logDebug('Jetpack inactive.');
});

// - - - >> 7.00 - Game Loop and Rendering
// 7.00.00
const gravityForce = 0.05;
let lastTime = 0;
// 7.00.01
function checkCollisions() {
    const playerRadialPosition = player.position.clone().sub(testPlanet.group.position);
    const playerDistanceToCenter = playerRadialPosition.length();
    const surfaceRadius = testPlanet.radius;
    
    // 7.00.02
    if (playerDistanceToCenter - player.height / 2 <= surfaceRadius) {
        player.position.copy(playerRadialPosition.normalize().multiplyScalar(surfaceRadius + player.height / 2).add(testPlanet.group.position));
        player.velocity.set(0, 0, 0);
        player.isGrounded = true;
    }
}
// 7.00.03
function animate(time) {
    requestAnimationFrame(animate);
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    // 7.00.04
    const up = player.position.clone().sub(testPlanet.group.position).normalize();
    const forward = camera.getWorldDirection(new THREE.Vector3());
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    // 7.00.05
    const moveDirection = new THREE.Vector3();
    if (moveJoystickActive) {
        const joystickVector = new THREE.Vector2().subVectors(moveTouch, moveJoystickCenter).normalize();
        moveDirection.add(right.clone().multiplyScalar(joystickVector.x));
        moveDirection.add(forward.clone().multiplyScalar(joystickVector.y));
        moveDirection.normalize().multiplyScalar(player.speed);
    }
    // 7.00.06
    player.position.add(moveDirection);
    // 7.00.07
    if (lookJoystickActive) {
        const dx = lookTouch.x - lookJoystickCenter.x;
        const dy = lookTouch.y - lookJoystickCenter.y;
        camera.rotateOnAxis(up, -dx * player.rotationSpeed);
        camera.rotateOnAxis(right, -dy * player.rotationSpeed);
        const tempQuaternion = new THREE.Quaternion().setFromUnitVectors(up, camera.up);
        camera.quaternion.multiplyQuaternions(tempQuaternion, camera.quaternion);
    }
    // 7.00.08
    if (jetpackActive) {
        player.velocity.add(up.clone().multiplyScalar(player.jetpackAcceleration));
        if (player.velocity.length() > player.jetpackSpeed) {
            player.velocity.normalize().multiplyScalar(player.jetpackSpeed);
        }
    } else {
        const gravity = up.clone().negate().multiplyScalar(gravityForce);
        player.velocity.add(gravity);
    }
    // 7.00.09
    player.position.add(player.velocity);
    checkCollisions();
    // 7.00.10
    camera.position.copy(player.position);
    renderer.render(scene, camera);
}
animate();

// - - - >> 8.00 - Debugging and Loader
// 8.00.00
const loaderScreen = document.getElementById('loading-screen');
const debugOutput = document.getElementById('debug-output');
const versionDisplay = document.getElementById('version-display');
versionDisplay.textContent = `Version: ${GAME_VERSION}`;
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
    loaderScreen.style.display = 'none';
}, 5000); // 5-second timeout to ensure loader hides.

// https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
