// https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js
// https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js
// https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js

// - - - >> 1.00 - Table of Contents
// 1.00 Scene Setup
// 2.00 Physics World
// 3.00 Materials and Lighting
// 4.00 Game Objects
// 5.00 Player
// 6.00 Controls
// 7.00 Animation Loop
// 8.00 Debugging Panel

// - - - >> 1.00 - Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const container = document.createElement('div');
container.id = 'game-container';
document.body.appendChild(container);

container.appendChild(renderer.domElement);
// 1.00.00
// - - - >> 2.00 - Physics World
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, 0, 0),
});

// - - - >> 3.00 - Materials and Lighting
const desertWarmth = new THREE.Color(0xd2b48c);

const sandMaterial = new THREE.MeshBasicMaterial({ color: desertWarmth });
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513, flatShading: true });


const light = new THREE.AmbientLight(0x404040, 3);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffd700, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
renderer.setClearColor(0x36454F); // Dark slate gray for night sky

// 3.00.00
// - - - >> 4.00 - Game Objects
const sphereRadius = 50;
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

const sphere1Mesh = new THREE.Mesh(sphereGeometry, sandMaterial);
sphere1Mesh.position.set(0, 0, 0);
scene.add(sphere1Mesh);

const sphere2Mesh = new THREE.Mesh(sphereGeometry, sandMaterial);
sphere2Mesh.position.set(150, 0, 0);
scene.add(sphere2Mesh);

const sphere1Body = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Sphere(sphereRadius),
});
sphere1Body.position.copy(sphere1Mesh.position);
world.addBody(sphere1Body);

const sphere2Body = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Sphere(sphereRadius),
});
sphere2Body.position.copy(sphere2Mesh.position);
world.addBody(sphere2Body);

// 4.00.00
// - - - >> 5.00 - Player
const playerRadius = 1;
const playerMesh = new THREE.Mesh(new THREE.SphereGeometry(playerRadius, 16, 16), playerMaterial);
scene.add(playerMesh);

const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Sphere(playerRadius),
  angularDamping: 0.9,
});
playerBody.position.set(0, sphereRadius + playerRadius, 0);
world.addBody(playerBody);

camera.position.set(0, sphereRadius + playerRadius + 5, 10);
camera.lookAt(playerMesh.position);

// 5.00.00
// - - - >> 6.00 - Controls
const leftJoystick = document.createElement('div');
leftJoystick.id = 'joystick-left';
leftJoystick.innerHTML = '<div class="stick"></div>';
container.appendChild(leftJoystick);

const rightJoystick = document.createElement('div');
rightJoystick.id = 'joystick-right';
rightJoystick.innerHTML = '<div class="stick"></div>';
container.appendChild(rightJoystick);

let leftStick = leftJoystick.querySelector('.stick');
let rightStick = rightJoystick.querySelector('.stick');
let moveVector = new THREE.Vector2();
let lookVector = new THREE.Vector2();

function setupJoystick(joystick, stick, onMove) {
  let isMoving = false;
  let origin = { x: 0, y: 0 };
  joystick.addEventListener('touchstart', (e) => {
    isMoving = true;
    origin.x = e.touches[0].clientX;
    origin.y = e.touches[0].clientY;
  });

  joystick.addEventListener('touchmove', (e) => {
    if (isMoving) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - origin.x;
      const deltaY = touch.clientY - origin.y;
      const distance = Math.min(joystick.offsetWidth / 2, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
      const angle = Math.atan2(deltaY, deltaX);
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      stick.style.transform = `translate(${moveX}px, ${moveY}px)`;
      onMove(moveX / (joystick.offsetWidth / 2), -moveY / (joystick.offsetHeight / 2));
    }
  });

  joystick.addEventListener('touchend', () => {
    isMoving = false;
    stick.style.transform = `translate(-50%, -50%)`;
    onMove(0, 0);
  });
}

setupJoystick(leftJoystick, leftStick, (x, y) => {
  moveVector.set(x, y);
});

setupJoystick(rightJoystick, rightStick, (x, y) => {
  lookVector.set(x, y);
});
// 6.00.00
// - - - >> 7.00 - Animation Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  world.step(delta);

  // Update Three.js meshes with Cannon.js body positions
  playerMesh.position.copy(playerBody.position);
  playerMesh.quaternion.copy(playerBody.quaternion);

  // Gravity simulation
  const targetSpherePosition = sphere1Mesh.position;
  const direction = new CANNON.Vec3();
  targetSpherePosition.vsub(playerBody.position, direction);
  const dist = direction.length();
  direction.normalize();
  const gravityForce = direction.scale(9.82 * playerBody.mass / (dist * dist));
  playerBody.applyForce(gravityForce, playerBody.position);

  // Player movement
  const speed = 10;
  let forwardVector = new THREE.Vector3();
  let rightVector = new THREE.Vector3();

  camera.getWorldDirection(forwardVector);
  forwardVector.y = 0;
  forwardVector.normalize();
  rightVector.crossVectors(forwardVector, new THREE.Vector3(0, 1, 0));
  
  const moveDirection = new THREE.Vector3().addScaledVector(forwardVector, moveVector.y).addScaledVector(rightVector, moveVector.x);
  playerBody.velocity.x = moveDirection.x * speed;
  playerBody.velocity.z = moveDirection.z * speed;

  // Camera controls
  const cameraDistance = 15;
  const playerPos = playerMesh.position;
  const upVector = playerPos.clone().normalize();
  camera.position.copy(playerPos).add(upVector.multiplyScalar(cameraDistance));
  camera.lookAt(playerPos);

  renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// - - - >> 8.00 - Debugging Panel
const debugPanel = document.createElement('div');
debugPanel.id = 'debug-panel';
debugPanel.style.cssText = `
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: red;
  padding: 10px;
  font-family: monospace;
  font-size: 10px;
  max-width: 90%;
  max-height: 50%;
  overflow: auto;
  z-index: 100;
`;
document.body.appendChild(debugPanel);

window.addEventListener('error', (e) => {
  debugPanel.textContent = `Error: ${e.message}`;
});

function logToDebugPanel(message) {
  const p = document.createElement('p');
  p.textContent = message;
  debugPanel.appendChild(p);
}

// Check for libraries and log their status
if (typeof THREE === 'undefined') {
  logToDebugPanel('THREE.js is not loaded.');
}
if (typeof CANNON === 'undefined') {
  logToDebugPanel('CANNON-es is not loaded.');
}
if (typeof Howler === 'undefined') {
  logToDebugPanel('Howler.js is not loaded.');
}

logToDebugPanel('Script loaded and running.');

// https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js
// https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js
// https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js


