import * as THREE from 'three';

const socket = io();

// ---------- DOM refs ----------
const lobbyEl = document.getElementById('lobby');
const gameEl = document.getElementById('game');
const gamesListEl = document.getElementById('games-list');
const createForm = document.getElementById('create-form');
const createNameInput = document.getElementById('create-name');
const playerNameInput = document.getElementById('player-name');
const leaveBtn = document.getElementById('leave-btn');
const gameNameLabel = document.getElementById('game-name-label');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

let currentGameId = null;

// ---------- Lobby ----------
function initLobby() {
  socket.emit('lobby:list');
}

socket.on('lobby:update', (games) => renderGamesList(games));

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function renderGamesList(games) {
  gamesListEl.innerHTML = '';
  if (!games.length) {
    gamesListEl.innerHTML = '<div class="empty">No games yet. Create one!</div>';
    return;
  }
  games.forEach((g) => {
    const row = document.createElement('div');
    row.className = 'game-row';
    row.innerHTML = `
      <span class="game-name">${escapeHtml(g.name)}</span>
      <span class="game-count">${g.playerCount} player${g.playerCount === 1 ? '' : 's'}</span>
      <button class="btn-primary join-btn" data-id="${g.id}">Join</button>
      <button class="btn-danger delete-btn" data-id="${g.id}">Delete</button>
    `;
    gamesListEl.appendChild(row);
  });
}

gamesListEl.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains('join-btn')) joinGame(id);
  if (e.target.classList.contains('delete-btn')) socket.emit('game:delete', id);
});

createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = createNameInput.value.trim() || 'Untitled Game';
  socket.emit('game:create', name, ({ gameId }) => joinGame(gameId));
  createNameInput.value = '';
});

function joinGame(gameId) {
  const playerName = playerNameInput.value.trim() || `Player${Math.floor(Math.random() * 1000)}`;
  socket.emit('game:join', { gameId, playerName }, (res) => {
    if (res && res.error) {
      alert(res.error);
      return;
    }
    currentGameId = gameId;
    enterGame(res);
  });
}

// ---------- Game entry/exit ----------
function enterGame(state) {
  lobbyEl.style.display = 'none';
  gameEl.style.display = 'block';
  gameNameLabel.textContent = state.gameName;
  chatLog.innerHTML = '';
  state.messages.forEach(addChatMessage);

  setupScene();
  state.players.forEach((p) => {
    if (p.id === state.self.id) setLocalPlayer(p);
    else addRemotePlayer(p);
  });
  animate();
}

function exitGame() {
  cleanupScene();
  gameEl.style.display = 'none';
  lobbyEl.style.display = 'flex';
  currentGameId = null;
  socket.emit('lobby:list');
}

leaveBtn.addEventListener('click', () => {
  socket.emit('game:leave');
  exitGame();
});

socket.on('game:deleted', () => {
  if (currentGameId) {
    alert('This game was deleted.');
    exitGame();
  }
});

socket.on('player:joined', (p) => {
  if (currentGameId) addRemotePlayer(p);
});

socket.on('player:left', (id) => removeRemotePlayer(id));

socket.on('player:update', ({ id, position, rotationY }) => {
  const rp = remotePlayers.get(id);
  if (rp) {
    rp.targetPosition.set(position.x, position.y, position.z);
    rp.targetRotationY = rotationY;
  }
});

// ---------- Chat ----------
socket.on('chat:message', (msg) => addChatMessage(msg));

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('chat:send', text);
  chatInput.value = '';
});

function addChatMessage(msg) {
  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `<strong>${escapeHtml(msg.name)}:</strong> ${escapeHtml(msg.text)}`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// ---------- Three.js scene ----------
let scene, camera, renderer, clock;
let animId = null;
let lastSent = 0;
const keys = {};
const localPlayer = { mesh: null, position: new THREE.Vector3(), rotationY: 0 };
const remotePlayers = new Map();

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 20, 90);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 1.1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(15, 25, 10);
  scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x3d9140 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const grid = new THREE.GridHelper(200, 40, 0x225522, 0x225522);
  scene.add(grid);

  for (let i = 0; i < 14; i++) {
    const size = 1 + Math.random() * 2.2;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshStandardMaterial({ color: 0x8899aa })
    );
    box.position.set((Math.random() - 0.5) * 70, size / 2, (Math.random() - 0.5) * 70);
    scene.add(box);
  }

  clock = new THREE.Clock();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

function onKeyDown(e) {
  // avoid capturing keys while typing in chat
  if (document.activeElement === chatInput) return;
  keys[e.code] = true;
}
function onKeyUp(e) { keys[e.code] = false; }

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function makePlayerMesh(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 0.8, 4, 8),
    new THREE.MeshStandardMaterial({ color })
  );
  body.position.y = 0.9;
  group.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshStandardMaterial({ color })
  );
  head.position.y = 1.55;
  group.add(head);
  return group;
}

function setLocalPlayer(p) {
  localPlayer.position.set(p.position.x, p.position.y, p.position.z);
  localPlayer.rotationY = p.rotationY;
  localPlayer.mesh = makePlayerMesh(p.color);
  localPlayer.mesh.position.copy(localPlayer.position);
  scene.add(localPlayer.mesh);
}

function addRemotePlayer(p) {
  if (remotePlayers.has(p.id)) return;
  const mesh = makePlayerMesh(p.color);
  mesh.position.set(p.position.x, p.position.y, p.position.z);
  scene.add(mesh);
  remotePlayers.set(p.id, {
    mesh,
    targetPosition: new THREE.Vector3(p.position.x, p.position.y, p.position.z),
    targetRotationY: p.rotationY
  });
}

function removeRemotePlayer(id) {
  const rp = remotePlayers.get(id);
  if (rp) {
    scene.remove(rp.mesh);
    remotePlayers.delete(id);
  }
}

function cleanupScene() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
  remotePlayers.forEach((rp) => scene.remove(rp.mesh));
  remotePlayers.clear();
  if (localPlayer.mesh) scene.remove(localPlayer.mesh);
  localPlayer.mesh = null;
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
}

const SPEED = 5;
const TURN_SPEED = 2.5;

function animate() {
  animId = requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  updateLocalPlayer(dt);
  updateRemoteInterpolation(dt);
  updateCamera();
  renderer.render(scene, camera);
}

function updateLocalPlayer(dt) {
  if (!localPlayer.mesh) return;
  let moved = false;

  if (keys['KeyA'] || keys['ArrowLeft']) { localPlayer.rotationY += TURN_SPEED * dt; moved = true; }
  if (keys['KeyD'] || keys['ArrowRight']) { localPlayer.rotationY -= TURN_SPEED * dt; moved = true; }

  const forward = new THREE.Vector3(Math.sin(localPlayer.rotationY), 0, Math.cos(localPlayer.rotationY));
  if (keys['KeyW'] || keys['ArrowUp']) { localPlayer.position.addScaledVector(forward, SPEED * dt); moved = true; }
  if (keys['KeyS'] || keys['ArrowDown']) { localPlayer.position.addScaledVector(forward, -SPEED * dt); moved = true; }

  localPlayer.position.x = THREE.MathUtils.clamp(localPlayer.position.x, -95, 95);
  localPlayer.position.z = THREE.MathUtils.clamp(localPlayer.position.z, -95, 95);

  localPlayer.mesh.position.copy(localPlayer.position);
  localPlayer.mesh.rotation.y = localPlayer.rotationY;

  const now = performance.now();
  if (moved && now - lastSent > 50) {
    lastSent = now;
    socket.emit('player:update', {
      position: { x: localPlayer.position.x, y: localPlayer.position.y, z: localPlayer.position.z },
      rotationY: localPlayer.rotationY
    });
  }
}

function updateRemoteInterpolation(dt) {
  const t = Math.min(1, dt * 10);
  remotePlayers.forEach((rp) => {
    rp.mesh.position.lerp(rp.targetPosition, t);
    rp.mesh.rotation.y += (rp.targetRotationY - rp.mesh.rotation.y) * t;
  });
}

function updateCamera() {
  if (!localPlayer.mesh) return;
  const offset = new THREE.Vector3(
    -Math.sin(localPlayer.rotationY) * 6,
    3.5,
    -Math.cos(localPlayer.rotationY) * 6
  );
  const desired = localPlayer.position.clone().add(offset);
  camera.position.lerp(desired, 0.1);
  const lookTarget = localPlayer.position.clone();
  lookTarget.y += 1;
  camera.lookAt(lookTarget);
}

// ---------- Boot ----------
initLobby();
