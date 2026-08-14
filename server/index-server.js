const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the client from ../public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- In-memory game state ----------
// games: Map<gameId, { id, name, createdAt, players: Map<socketId, playerState>, messages: [] }>
const games = new Map();

const COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f1c40f',
  '#9b59b6', '#e67e22', '#1abc9c', '#fd79a8'
];
let colorIndex = 0;
function nextColor() {
  const c = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return c;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function gameSummary(g) {
  return { id: g.id, name: g.name, playerCount: g.players.size, createdAt: g.createdAt };
}

function listGames() {
  return Array.from(games.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(gameSummary);
}

function broadcastLobby() {
  io.emit('lobby:update', listGames());
}

function leaveCurrentGame(socket) {
  const gameId = socket.data.gameId;
  if (!gameId) return;
  const g = games.get(gameId);
  if (g) {
    g.players.delete(socket.id);
    socket.to(gameId).emit('player:left', socket.id);
    socket.leave(gameId);
  }
  socket.data.gameId = null;
  broadcastLobby();
}

io.on('connection', (socket) => {
  socket.data.gameId = null;

  socket.on('lobby:list', () => {
    socket.emit('lobby:update', listGames());
  });

  socket.on('game:create', (name, cb) => {
    const id = makeId();
    const g = {
      id,
      name: String(name || 'Untitled Game').slice(0, 40) || 'Untitled Game',
      createdAt: Date.now(),
      players: new Map(),
      messages: []
    };
    games.set(id, g);
    broadcastLobby();
    if (typeof cb === 'function') cb({ gameId: id });
  });

  socket.on('game:delete', (gameId) => {
    const g = games.get(gameId);
    if (!g) return;
    io.to(gameId).emit('game:deleted');
    for (const sockId of g.players.keys()) {
      const s = io.sockets.sockets.get(sockId);
      if (s) {
        s.leave(gameId);
        s.data.gameId = null;
      }
    }
    games.delete(gameId);
    broadcastLobby();
  });

  socket.on('game:join', ({ gameId, playerName } = {}, cb) => {
    const g = games.get(gameId);
    if (!g) {
      if (typeof cb === 'function') cb({ error: 'Game not found' });
      return;
    }

    leaveCurrentGame(socket);

    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.playerName = String(playerName || 'Player').slice(0, 20) || 'Player';
    socket.data.color = nextColor();

    const playerState = {
      id: socket.id,
      name: socket.data.playerName,
      color: socket.data.color,
      position: { x: (Math.random() - 0.5) * 10, y: 1, z: (Math.random() - 0.5) * 10 },
      rotationY: 0
    };
    g.players.set(socket.id, playerState);

    if (typeof cb === 'function') {
      cb({
        self: playerState,
        players: Array.from(g.players.values()),
        messages: g.messages.slice(-50),
        gameName: g.name
      });
    }

    socket.to(gameId).emit('player:joined', playerState);
    broadcastLobby();
  });

  socket.on('game:leave', () => leaveCurrentGame(socket));

  socket.on('player:update', (state) => {
    const gameId = socket.data.gameId;
    if (!gameId || !state) return;
    const g = games.get(gameId);
    if (!g) return;
    const p = g.players.get(socket.id);
    if (!p) return;
    p.position = state.position;
    p.rotationY = state.rotationY;
    socket.to(gameId).emit('player:update', {
      id: socket.id,
      position: p.position,
      rotationY: p.rotationY
    });
  });

  socket.on('chat:send', (text) => {
    const gameId = socket.data.gameId;
    if (!gameId) return;
    const g = games.get(gameId);
    if (!g) return;
    const clean = String(text || '').slice(0, 200);
    if (!clean.trim()) return;
    const msg = { name: socket.data.playerName, text: clean, ts: Date.now() };
    g.messages.push(msg);
    if (g.messages.length > 200) g.messages.shift();
    io.to(gameId).emit('chat:message', msg);
  });

  socket.on('disconnect', () => {
    leaveCurrentGame(socket);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
