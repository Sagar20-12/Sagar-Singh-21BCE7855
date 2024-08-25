const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let players = [];
let currentPlayer = 'A';
let gameState = {
  grid: [
    ['A-P1', 'A-H1', 'A-H2', 'A-P2', 'A-P3'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['B-P1', 'B-H1', 'B-H2', 'B-P2', 'B-P3']
  ],
  currentPlayer: 'A',
  winner: null
};

wss.on('connection', (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
    ws.close();
    return;
  }

  const player = players.length === 0 ? 'A' : 'B';
  players.push({ ws, player });

  ws.send(JSON.stringify({ type: 'player', player }));

  if (players.length === 2) {
    broadcastToAll({ type: 'start', currentPlayer });
    if (gameState) {
      broadcastToAll({ type: 'gameState', gameState });
    }
  }

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Received message:', data);
    if (data.type === 'move' && data.player === currentPlayer) {
      gameState = data.gameState;
      currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
      gameState.currentPlayer = currentPlayer; // Update the game state's current player
      broadcastToAll({ type: 'move', move: data.move, gameState, currentPlayer });
    }
  });

  ws.on('close', () => {
    players = players.filter(p => p.ws !== ws);
    if (players.length < 2) {
      broadcastToAll({ type: 'playerDisconnected' });
    }
  });
});

function broadcastToAll(message) {
  console.log('Broadcasting:', message);
  players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
