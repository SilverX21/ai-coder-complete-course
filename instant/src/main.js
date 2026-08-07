import * as THREE from "three";
import "./style.css";

const root = document.querySelector("#game-root");
const startScreen = document.querySelector("#start-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const healthValue = document.querySelector("#health-value");
const enemyValue = document.querySelector("#enemy-value");
const healthBar = document.querySelector("#health-bar");
const enemyBar = document.querySelector("#enemy-bar");
const playerScoreEl = document.querySelector("#player-score");
const enemyScoreEl = document.querySelector("#enemy-score");
const roundNumberEl = document.querySelector("#round-number");
const statusMessage = document.querySelector("#status-message");
const difficultyHud = document.querySelector("#difficulty-hud");
const enemyStatus = document.querySelector("#enemy-status");
const difficultyButtons = document.querySelectorAll("[data-difficulty]");
const resultKicker = document.querySelector("#result-kicker");
const resultTitle = document.querySelector("#result-title");
const resultDetail = document.querySelector("#result-detail");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02080b);
scene.fog = new THREE.FogExp2(0x02080b, 0.038);

const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.05, 160);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const keys = new Set();
const arenaRadius = 22;
const player = { position: new THREE.Vector3(0, 1.65, 12), heading: 0, health: 100, score: 0, cooldown: 0, recoil: 0 };
const enemy = { position: new THREE.Vector3(0, 0, -11), health: 100, score: 0, cooldown: 1.6, strafe: 1, evade: 0, alive: true };
const projectiles = [];
const sparks = [];
const difficultySettings = {
  easy: {
    label: "EASY",
    health: 60,
    chaseDistance: 7,
    moveSpeed: 2.15,
    strafeSpeed: 0.55,
    fireDelay: [2.35, 3],
    damage: 7,
    dodgeOnShot: false,
  },
  medium: {
    label: "MEDIUM",
    health: 100,
    chaseDistance: 8,
    moveSpeed: 3.05,
    strafeSpeed: 1.1,
    fireDelay: [1.7, 2.35],
    damage: 10,
    dodgeOnShot: false,
  },
  hard: {
    label: "HARD",
    health: 110,
    chaseDistance: 8.5,
    moveSpeed: 3.65,
    strafeSpeed: 1.55,
    fireDelay: [1.2, 1.75],
    damage: 11,
    dodgeOnShot: true,
  },
};
let selectedDifficulty = "medium";
let active = false;
let gameOver = false;
let round = 1;
let elapsed = 0;

const cyan = 0x5ce9ff;
const orange = 0xff674f;
const material = (color, emissive = 0x000000, intensity = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.62, emissive, emissiveIntensity: intensity });

scene.add(new THREE.HemisphereLight(0x92eaff, 0x091011, 1.25));
const keyLight = new THREE.DirectionalLight(0xb3f7ff, 2.7);
keyLight.position.set(7, 14, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const ground = new THREE.Mesh(new THREE.CircleGeometry(38, 64), material(0x071217, 0x071d23, 0.3));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(44, 44, 0x207784, 0x0d2d34);
grid.position.y = 0.01;
scene.add(grid);

const floorRings = new THREE.Group();
for (let radius = 5; radius <= 21; radius += 4) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.025, 4, 64),
    new THREE.MeshBasicMaterial({ color: radius % 8 ? 0x0d6474 : 0x2da6b6, transparent: true, opacity: 0.62 }),
  );
  ring.rotation.x = Math.PI / 2;
  floorRings.add(ring);
}
scene.add(floorRings);

function addWall(angle) {
  const group = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(8, 3.8, 0.5), material(0x0c1c21, 0x071f26, 0.4));
  wall.position.y = 1.9;
  wall.castShadow = wall.receiveShadow = true;
  group.add(wall);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(7.55, 0.06, 0.03), new THREE.MeshBasicMaterial({ color: cyan }));
  strip.position.set(0, 3.25, -0.27);
  group.add(strip);
  group.position.set(Math.sin(angle) * arenaRadius, 0, Math.cos(angle) * arenaRadius);
  group.rotation.y = angle;
  scene.add(group);
}
for (let i = 0; i < 8; i += 1) addWall((i / 8) * Math.PI * 2);

function addPillar(x, z, color) {
  const pillar = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.1, 0.38, 8), material(0x15272c));
  base.position.y = 0.19;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 3.7, 8), material(0x14373e, color, 0.8));
  core.position.y = 2;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.82, 8), material(0x1c363d));
  cap.position.y = 4.25;
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.035, 8), new THREE.MeshBasicMaterial({ color }));
  glow.position.y = 0.42;
  pillar.add(base, core, cap, glow);
  pillar.position.set(x, 0, z);
  pillar.traverse((node) => { if (node.isMesh) node.castShadow = node.receiveShadow = true; });
  scene.add(pillar);
}
addPillar(-9, -4, cyan);
addPillar(9, 5, orange);
addPillar(-10, 9, orange);
addPillar(10, -9, cyan);

const enemyModel = new THREE.Group();
const enemyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.78, 1.5, 6), material(0x29363b, orange, 0.25));
enemyBody.position.y = 1.28;
const enemyChest = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.72, 0.18), material(0x202d31, orange, 0.35));
enemyChest.position.set(0, 1.4, 0.58);
enemyChest.rotation.x = -0.14;
const enemyCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: orange }));
enemyCore.position.set(0, 1.42, 0.71);
const enemyHead = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.58, 0.78), material(0x304348));
enemyHead.position.y = 2.25;
const eye = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: orange }));
eye.position.set(0, 2.27, 0.42);
const eyeNotch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.07), material(0x172226));
eyeNotch.position.set(0, 2.27, 0.43);
const enemyCrest = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 4), material(0x3b4c50, orange, 0.3));
enemyCrest.position.set(0, 2.75, 0);
const antennaLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 5), material(0x43565b, orange, 0.4));
antennaLeft.position.set(-0.33, 2.78, 0);
antennaLeft.rotation.z = 0.45;
const antennaRight = antennaLeft.clone();
antennaRight.position.x = 0.33;
antennaRight.rotation.z = -0.45;
const enemyBackpack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.25), material(0x1e292d, orange, 0.22));
enemyBackpack.position.set(0, 1.48, -0.58);
const leftThruster = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.38, 6), material(0x35474b, orange, 0.7));
leftThruster.position.set(-0.26, 1.23, -0.76);
leftThruster.rotation.x = Math.PI / 2;
const rightThruster = leftThruster.clone();
rightThruster.position.x = 0.26;
const enemyLeftArm = new THREE.Group();
const enemyRightArm = new THREE.Group();
const armGeometry = new THREE.BoxGeometry(0.27, 0.87, 0.27);
const enemyShoulder = new THREE.SphereGeometry(0.32, 8, 6);
const leftShoulder = new THREE.Mesh(enemyShoulder, material(0x35464a, orange, 0.15));
leftShoulder.position.y = 1.78;
const leftArm = new THREE.Mesh(armGeometry, material(0x26363a));
leftArm.position.y = 1.35;
enemyLeftArm.add(leftShoulder, leftArm);
enemyLeftArm.position.x = -0.73;
const rightShoulder = leftShoulder.clone();
const rightArm = leftArm.clone();
enemyRightArm.add(rightShoulder, rightArm);
enemyRightArm.position.x = 0.73;
const enemyGun = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 1.32), material(0x404d50, orange, 0.42));
enemyGun.position.set(0.12, -0.35, 0.61);
enemyGun.rotation.x = -0.12;
enemyRightArm.add(enemyGun);
const enemyLeftLeg = new THREE.Group();
const enemyRightLeg = new THREE.Group();
const legGeometry = new THREE.BoxGeometry(0.34, 0.82, 0.36);
const footGeometry = new THREE.BoxGeometry(0.42, 0.18, 0.7);
const leftLeg = new THREE.Mesh(legGeometry, material(0x26373b));
leftLeg.position.y = 0.65;
const leftFoot = new THREE.Mesh(footGeometry, material(0x1b2a2e, orange, 0.16));
leftFoot.position.set(0, 0.16, 0.13);
enemyLeftLeg.add(leftLeg, leftFoot);
enemyLeftLeg.position.x = -0.34;
const rightLeg = leftLeg.clone();
const rightFoot = leftFoot.clone();
enemyRightLeg.add(rightLeg, rightFoot);
enemyRightLeg.position.x = 0.34;
const halo = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.03, 4, 24), new THREE.MeshBasicMaterial({ color: orange, transparent: true, opacity: 0.7 }));
halo.rotation.x = Math.PI / 2;
halo.position.y = 0.08;
enemyModel.add(
  enemyBody, enemyChest, enemyCore, enemyHead, eye, eyeNotch, enemyCrest,
  antennaLeft, antennaRight, enemyBackpack, leftThruster, rightThruster,
  enemyLeftArm, enemyRightArm, enemyLeftLeg, enemyRightLeg, halo,
);
enemyModel.traverse((node) => { if (node.isMesh) node.castShadow = node.receiveShadow = true; });
scene.add(enemyModel);

const weapon = new THREE.Group();
const weaponBody = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 1.25), material(0x23363b, cyan, 0.28));
weaponBody.position.set(0.42, -0.33, -0.8);
weaponBody.rotation.x = -0.13;
const weaponBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.75, 6), material(0x4e6a70, cyan, 0.7));
weaponBarrel.position.set(0.42, -0.29, -1.5);
weaponBarrel.rotation.x = Math.PI / 2;
const weaponGlow = new THREE.PointLight(cyan, 1.5, 4);
weaponGlow.position.set(0.42, -0.24, -1.8);
weapon.add(weaponBody, weaponBarrel, weaponGlow);
camera.add(weapon);
scene.add(camera);

function addArenaLight(x, z, color) {
  const light = new THREE.PointLight(color, 14, 15, 2);
  light.position.set(x, 4.8, z);
  scene.add(light);
}
addArenaLight(-13, -13, cyan);
addArenaLight(13, 13, orange);
addArenaLight(-14, 14, cyan);
addArenaLight(14, -14, orange);

function clampArena(position) {
  const flat = new THREE.Vector2(position.x, position.z);
  if (flat.length() > arenaRadius - 1.4) {
    flat.setLength(arenaRadius - 1.4);
    position.x = flat.x;
    position.z = flat.y;
  }
}

function makeProjectile(origin, direction, color, owner) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 8, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }),
  );
  mesh.position.copy(origin);
  const light = new THREE.PointLight(color, 2.5, 3);
  mesh.add(light);
  scene.add(mesh);
  projectiles.push({ mesh, direction: direction.normalize(), owner, life: 1.55, velocity: owner === "player" ? 36 : 22 });
}

function burst(position, color, size = 1) {
  const geometry = new THREE.BufferGeometry();
  const count = 26;
  const data = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i += 1) {
    data.set([position.x, position.y, position.z], i * 3);
    velocities.push(new THREE.Vector3((Math.random() - 0.5) * size * 4, Math.random() * size * 3, (Math.random() - 0.5) * size * 4));
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(data, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: 0.09 * size, transparent: true, opacity: 1, depthWrite: false }));
  scene.add(points);
  sparks.push({ points, velocities, life: 0.68 });
}

function setStatus(text, warning = false) {
  statusMessage.textContent = text;
  statusMessage.style.color = warning ? "#ff725a" : "#5de8ff";
}

function getDifficulty() {
  return difficultySettings[selectedDifficulty];
}

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  const settings = getDifficulty();
  difficultyButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.difficulty === difficulty);
  });
  if (!active && !gameOver) enemy.health = settings.health;
  difficultyHud.textContent = settings.label;
  updateHud();
  setStatus(`THREAT LEVEL SET // ${settings.label}`);
}

function updateHud() {
  const settings = getDifficulty();
  healthValue.textContent = Math.max(0, Math.ceil(player.health));
  enemyValue.textContent = Math.max(0, Math.ceil(enemy.health));
  healthBar.style.width = `${Math.max(0, player.health)}%`;
  enemyBar.style.width = `${Math.max(0, (enemy.health / settings.health) * 100)}%`;
  playerScoreEl.textContent = player.score;
  enemyScoreEl.textContent = enemy.score;
  roundNumberEl.textContent = String(round).padStart(2, "0");
  difficultyHud.textContent = settings.label;
  enemyStatus.textContent = enemy.alive ? (enemy.evade > 0 ? "EVASIVE" : "TRACKING") : "OFFLINE";
}

function firePlayer() {
  if (!active || player.cooldown > 0) return;
  player.cooldown = 0.31;
  player.recoil = 0.16;
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  const origin = camera.getWorldPosition(new THREE.Vector3()).add(direction.clone().multiplyScalar(0.75));
  makeProjectile(origin, direction, cyan, "player");
  burst(origin, cyan, 0.35);
  if (getDifficulty().dodgeOnShot && enemy.alive && Math.random() < 0.55) {
    enemy.evade = 0.48;
    enemy.strafe *= -1;
  }
  setStatus("PLASMA DISCHARGED");
}

function fireEnemy() {
  const origin = enemy.position.clone().add(new THREE.Vector3(0, 1.55, 0));
  const target = player.position.clone().add(new THREE.Vector3(0, -0.25, 0));
  const direction = target.sub(origin).normalize();
  makeProjectile(origin, direction, orange, "enemy");
  burst(origin, orange, 0.28);
}

function finishCombat(playerWon) {
  active = false;
  gameOver = true;
  if (playerWon) {
    player.score += 1;
    resultKicker.textContent = "COMBAT RECORD // VICTORY";
    resultTitle.innerHTML = "TARGET<br />ELIMINATED";
    resultDetail.textContent = "Unit K-8 went dark. The breach belongs to you.";
    setStatus("HOSTILE SIGNAL TERMINATED");
  } else {
    enemy.score += 1;
    resultKicker.textContent = "COMBAT RECORD // FAILURE";
    resultTitle.innerHTML = "SYSTEM<br />BREACHED";
    resultDetail.textContent = "Your signal was erased. Re-enter the arena and take it back.";
    setStatus("VITALS CRITICAL", true);
  }
  updateHud();
  setTimeout(() => resultScreen.classList.remove("hidden"), 700);
}

function damage(target, amount, position, color) {
  target.health = Math.max(0, target.health - amount);
  burst(position, color, 1.1);
  updateHud();
  if (target === enemy) {
    setStatus(`DIRECT HIT // UNIT K-8 ${Math.ceil(enemy.health)}%`);
    if (enemy.health <= 0) {
      enemy.alive = false;
      enemyModel.visible = false;
      finishCombat(true);
    }
  } else {
    setStatus(`IMPACT DETECTED // VITALS ${Math.ceil(player.health)}%`, true);
    if (player.health <= 0) finishCombat(false);
  }
}

function resetRound() {
  const settings = getDifficulty();
  round += gameOver ? 1 : 0;
  player.position.set(0, 1.65, 12);
  player.heading = 0;
  player.health = 100;
  player.cooldown = 0.5;
  enemy.position.set((Math.random() - 0.5) * 8, 0, -11);
  enemy.health = settings.health;
  enemy.cooldown = settings.fireDelay[0] + Math.random() * (settings.fireDelay[1] - settings.fireDelay[0]);
  enemy.strafe = Math.random() > 0.5 ? 1 : -1;
  enemy.evade = 0;
  enemy.alive = true;
  enemyModel.visible = true;
  projectiles.splice(0).forEach((shot) => scene.remove(shot.mesh));
  gameOver = false;
  active = true;
  resultScreen.classList.add("hidden");
  updateHud();
  setStatus(`ROUND LIVE // ${settings.label} THREAT`);
}

function updatePlayer(delta) {
  const turn = (keys.has("ArrowLeft") ? 1 : 0) - (keys.has("ArrowRight") ? 1 : 0);
  player.heading += turn * delta * 2.1;
  const movement = (keys.has("ArrowUp") ? 1 : 0) - (keys.has("ArrowDown") ? 1 : 0);
  const forward = new THREE.Vector3(-Math.sin(player.heading), 0, -Math.cos(player.heading));
  if (movement !== 0) {
    player.position.addScaledVector(forward, movement * delta * 7.5);
    clampArena(player.position);
  }
  player.cooldown -= delta;
  player.recoil = Math.max(0, player.recoil - delta * 1.2);
  const bob = movement ? Math.sin(elapsed * 11) * 0.035 : 0;
  camera.position.copy(player.position);
  camera.position.y += bob - player.recoil * 0.36;
  camera.rotation.set(0, player.heading, 0);
  weapon.position.y = Math.sin(elapsed * 11) * (movement ? 0.02 : 0) - player.recoil * 0.17;
}

function updateEnemy(delta) {
  if (!enemy.alive) return;
  const settings = getDifficulty();
  const toPlayer = player.position.clone().sub(enemy.position);
  const distance = toPlayer.length();
  const flatDirection = toPlayer.setY(0).normalize();
  const strafe = new THREE.Vector3(-flatDirection.z, 0, flatDirection.x).multiplyScalar(enemy.strafe);
  const movementMultiplier = enemy.evade > 0 ? 1.45 : 1;
  if (distance > settings.chaseDistance) enemy.position.addScaledVector(flatDirection, delta * settings.moveSpeed);
  if (distance < 5.5) enemy.position.addScaledVector(flatDirection, -delta * 2.1);
  enemy.position.addScaledVector(strafe, delta * settings.strafeSpeed * movementMultiplier);
  clampArena(enemy.position);
  enemyModel.position.copy(enemy.position);
  enemyModel.rotation.y = Math.atan2(flatDirection.x, flatDirection.z);
  enemyModel.position.y = Math.sin(elapsed * 2.1) * 0.08;
  const stride = Math.sin(elapsed * 5.5) * 0.16;
  enemyLeftLeg.rotation.x = stride;
  enemyRightLeg.rotation.x = -stride;
  enemyLeftArm.rotation.x = -stride * 0.65;
  enemyRightArm.rotation.x = stride * 0.65;
  enemyCore.rotation.y += delta * 4.5;
  halo.rotation.z += delta * 0.8;
  enemy.evade = Math.max(0, enemy.evade - delta);
  enemyStatus.textContent = enemy.evade > 0 ? "EVASIVE" : "TRACKING";
  enemy.cooldown -= delta;
  if (enemy.cooldown <= 0 && distance < 18) {
    fireEnemy();
    enemy.cooldown = settings.fireDelay[0] + Math.random() * (settings.fireDelay[1] - settings.fireDelay[0]);
    enemy.strafe *= -1;
  }
}

function updateProjectiles(delta) {
  for (let index = projectiles.length - 1; index >= 0; index -= 1) {
    const shot = projectiles[index];
    shot.mesh.position.addScaledVector(shot.direction, shot.velocity * delta);
    shot.life -= delta;
    const targetPosition = shot.owner === "player"
      ? enemy.position.clone().add(new THREE.Vector3(0, 1.25, 0))
      : player.position.clone().add(new THREE.Vector3(0, -0.25, 0));
    const hitRadius = shot.owner === "player" ? 0.95 : 0.7;
    const target = shot.owner === "player" ? enemy : player;
    if (shot.life <= 0 || shot.mesh.position.length() > 45) {
      scene.remove(shot.mesh);
      projectiles.splice(index, 1);
    } else if (target.alive !== false && shot.mesh.position.distanceTo(targetPosition) < hitRadius) {
      const color = shot.owner === "player" ? cyan : orange;
      damage(target, shot.owner === "player" ? 20 : getDifficulty().damage, targetPosition, color);
      scene.remove(shot.mesh);
      projectiles.splice(index, 1);
    }
  }
}

function updateSparks(delta) {
  for (let index = sparks.length - 1; index >= 0; index -= 1) {
    const spark = sparks[index];
    const points = spark.points.geometry.attributes.position;
    for (let point = 0; point < points.count; point += 1) {
      spark.velocities[point].y -= delta * 3.8;
      points.setXYZ(
        point,
        points.getX(point) + spark.velocities[point].x * delta,
        points.getY(point) + spark.velocities[point].y * delta,
        points.getZ(point) + spark.velocities[point].z * delta,
      );
    }
    points.needsUpdate = true;
    spark.life -= delta;
    spark.points.material.opacity = Math.max(0, spark.life / 0.68);
    if (spark.life <= 0) {
      spark.points.geometry.dispose();
      spark.points.material.dispose();
      scene.remove(spark.points);
      sparks.splice(index, 1);
    }
  }
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;
  floorRings.rotation.z -= delta * 0.04;
  if (active) {
    updatePlayer(delta);
    updateEnemy(delta);
    updateProjectiles(delta);
  } else if (!gameOver) {
    camera.position.set(0, 4.8, 18);
    camera.lookAt(0, 1.1, -3);
  }
  updateSparks(delta);
  renderer.render(scene, camera);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  keys.add(event.key);
  if (event.key === " ") firePlayer();
});
window.addEventListener("keyup", (event) => keys.delete(event.key));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

startButton.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  resetRound();
});
restartButton.addEventListener("click", resetRound);
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => selectDifficulty(button.dataset.difficulty));
});

selectDifficulty(selectedDifficulty);
updateHud();
setStatus("SYSTEMS READY");
renderer.setAnimationLoop(animate);
