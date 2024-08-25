// Game state
let gameState = {
    currentPlayer: 'A',
    grid: [
        ['A-P1', 'A-H1', 'A-H2', 'A-P2', 'A-P3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['B-P1', 'B-H1', 'B-H2', 'B-P2', 'B-P3']
    ],
    characters: {
        'P': { range: 1, directions: ['L', 'R', 'F', 'B'] },
        'H1': { range: 2, directions: ['L', 'R', 'F', 'B'] },
        'H2': { range: 2, directions: ['FL', 'FR', 'BL', 'BR'] }
    }
};

let selectedCharacter = null;
let validMoves = [];
let socket;
let myPlayer;

// DOM elements
const gameGrid = document.getElementById('gameGrid');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const moveHistoryList = document.getElementById('moveHistory');
const gameStatusDisplay = document.getElementById('gameStatus');
const newGameButton = document.getElementById('newGameButton');

function initWebSocket() {
    socket = new WebSocket(`ws://${window.location.host}`);

    socket.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);  // Debug log
        switch (data.type) {
            case 'player':
                myPlayer = data.player;
                updateGameStatus();
                break;
            case 'start':
                gameState.currentPlayer = data.currentPlayer;
                renderGrid();
                updateGameStatus();
                break;
            case 'move':
                console.log('Applying move:', data.move);  // Debug log
                applyMove(data.move);
                gameState = data.gameState;
                renderGrid();
                updateGameStatus();
                break;
            case 'gameState':
                gameState = data.gameState;
                renderGrid();
                updateGameStatus();
                break;
            case 'playerDisconnected':
                alert('The other player has disconnected. Please refresh to start a new game.');
                break;
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
}
function applyMove(move) {
    const { fromRow, fromCol, toRow, toCol } = move;
    const piece = gameState.grid[fromRow][fromCol];
    gameState.grid[toRow][toCol] = piece;
    gameState.grid[fromRow][fromCol] = null;
    addMoveToHistory(piece, fromRow, fromCol, toRow, toCol);
}
// Render the game grid
function renderGrid() {
    gameGrid.innerHTML = '';
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            const piece = gameState.grid[row][col];
            if (piece) {
                cell.textContent = piece;
                cell.classList.add(piece.startsWith('A') ? 'player-a' : 'player-b');
            }
            cell.addEventListener('click', () => handleCellClick(row, col));
            gameGrid.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(row, col) {
    console.log('Cell clicked:', row, col);
    console.log('Current player:', gameState.currentPlayer);
    console.log('My player:', myPlayer);

    if (gameState.currentPlayer !== myPlayer) {
        console.log('Not your turn');
        return;
    }

    const piece = gameState.grid[row][col];
    
    if (selectedCharacter) {
        if (isValidMove(row, col)) {
            movePiece(selectedCharacter.row, selectedCharacter.col, row, col);
            clearSelection();
        } else {
            clearSelection();
            if (piece && piece.startsWith(gameState.currentPlayer)) {
                selectCharacter(row, col);
            }
        }
    } else if (piece && piece.startsWith(gameState.currentPlayer)) {
        selectCharacter(row, col);
    }
}


// Select a character
function selectCharacter(row, col) {
    selectedCharacter = { row, col, piece: gameState.grid[row][col] };
    const [player, type] = selectedCharacter.piece.split('-');
    const charType = type.charAt(0) === 'P' ? 'P' : type;
    const moveDetails = gameState.characters[charType];
    
    validMoves = calculateValidMoves(row, col, charType, moveDetails.range, moveDetails.directions);
    highlightValidMoves();
}

// Calculate valid moves
function calculateValidMoves(row, col, charType, range, directions) {
    const moves = [];
    directions.forEach(direction => {
        const [newRow, newCol] = calculateNewPosition(row, col, direction, range);
        if (isWithinBounds(newRow, newCol) && !isFriendlyPiece(newRow, newCol)) {
            moves.push({ row: newRow, col: newCol });
        }
    });
    return moves;
}

// Calculate new position based on direction and range
function calculateNewPosition(row, col, direction, range) {
    const directionMap = {
        'L': [0, -1], 'R': [0, 1], 'F': [-1, 0], 'B': [1, 0],
        'FL': [-1, -1], 'FR': [-1, 1], 'BL': [1, -1], 'BR': [1, 1]
    };
    const [dRow, dCol] = directionMap[direction];
    return [row + dRow * range, col + dCol * range];
}

// Check if position is within bounds
function isWithinBounds(row, col) {
    return row >= 0 && row < 5 && col >= 0 && col < 5;
}

// Check if the piece at the given position is friendly
function isFriendlyPiece(row, col) {
    const piece = gameState.grid[row][col];
    return piece && piece.startsWith(gameState.currentPlayer);
}

// Highlight valid moves
function highlightValidMoves() {
    clearHighlights();
    validMoves.forEach(move => {
        const cell = document.querySelector(`.cell[data-row="${move.row}"][data-col="${move.col}"]`);
        if (cell) cell.classList.add('valid-move');
    });
}

// Clear highlights
function clearHighlights() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('valid-move');
    });
}

// Check if a move is valid
function isValidMove(row, col) {
    return validMoves.some(move => move.row === row && move.col === col);
}

// Move a piece
function movePiece(fromRow, fromCol, toRow, toCol) {
    console.log('Moving piece:', fromRow, fromCol, toRow, toCol);
    const piece = gameState.grid[fromRow][fromCol];
    gameState.grid[toRow][toCol] = piece;
    gameState.grid[fromRow][fromCol] = null;
    
    addMoveToHistory(piece, fromRow, fromCol, toRow, toCol);
    
    socket.send(JSON.stringify({
        type: 'move',
        player: myPlayer,
        move: { fromRow, fromCol, toRow, toCol },
        gameState: gameState
    }));
}

// Get the path for Hero1 and Hero2 moves
function getPath(fromRow, fromCol, toRow, toCol) {
    const path = [];
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    
    while (row !== toRow || col !== toCol) {
        path.push({ row, col });
        row += rowStep;
        col += colStep;
    }
    
    return path;
}

// Add move to history
function addMoveToHistory(piece, fromRow, fromCol, toRow, toCol) {
    const moveText = `${piece}: (${fromRow},${fromCol}) -> (${toRow},${toCol})`;
    const listItem = document.createElement('li');
    listItem.textContent = moveText;
    moveHistoryList.appendChild(listItem);
}

// Clear selection
function clearSelection() {
    selectedCharacter = null;
    validMoves = [];
    clearHighlights();
}

// Check for win condition
function checkForWin() {
    const opponentPieces = gameState.grid.flat().filter(piece => 
        piece && piece.startsWith(gameState.currentPlayer === 'A' ? 'B' : 'A')
    );
    
    if (opponentPieces.length === 0) {
        gameState.winner = gameState.currentPlayer;
    }
}

// Update game status display
function updateGameStatus() {
    if (!myPlayer) {
        gameStatusDisplay.textContent = 'Waiting for opponent...';
    } else if (gameState.currentPlayer === myPlayer) {
        gameStatusDisplay.textContent = 'Your turn';
    } else {
        gameStatusDisplay.textContent = 'Opponent\'s turn';
    }
    currentPlayerDisplay.textContent = `Current Player: ${gameState.currentPlayer}`;
}
function addMoveToHistory(piece, fromRow, fromCol, toRow, toCol) {
    const direction = getMoveDirection(fromRow, fromCol, toRow, toCol);
    const moveText = `${piece} moved ${direction}`;
    const listItem = document.createElement('li');
    listItem.textContent = moveText;
    moveHistoryList.appendChild(listItem);
}

// Get move direction
function getMoveDirection(fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    if (rowDiff === 0 && colDiff === -1) return "Left";
    if (rowDiff === 0 && colDiff === 1) return "Right";
    if (rowDiff === -1 && colDiff === 0) return "Forward";
    if (rowDiff === 1 && colDiff === 0) return "Backward";
    if (rowDiff === -1 && colDiff === -1) return "Forward Left";
    if (rowDiff === -1 && colDiff === 1) return "Forward Right";
    if (rowDiff === 1 && colDiff === -1) return "Backward Left";
    if (rowDiff === 1 && colDiff === 1) return "Backward Right";
    
    // For moves of distance 2 (Hero1 and Hero2)
    if (rowDiff === -2 && colDiff === 0) return "Forward (2 spaces)";
    if (rowDiff === 2 && colDiff === 0) return "Backward (2 spaces)";
    if (rowDiff === 0 && colDiff === -2) return "Left (2 spaces)";
    if (rowDiff === 0 && colDiff === 2) return "Right (2 spaces)";
    if (rowDiff === -2 && colDiff === -2) return "Forward Left (2 spaces)";
    if (rowDiff === -2 && colDiff === 2) return "Forward Right (2 spaces)";
    if (rowDiff === 2 && colDiff === -2) return "Backward Left (2 spaces)";
    if (rowDiff === 2 && colDiff === 2) return "Backward Right (2 spaces)";
    
    return "Unknown direction";
}

// Start a new game
function startNewGame() {
    gameState = {
        currentPlayer: 'A',
        grid: [
            ['A-P1', 'A-H1', 'A-H2', 'A-P2', 'A-P3'],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            ['B-P1', 'B-H1', 'B-H2', 'B-P2', 'B-P3']
        ],
        characters: {
            'P': { range: 1, directions: ['L', 'R', 'F', 'B'] },
            'H1': { range: 2, directions: ['L', 'R', 'F', 'B'] },
            'H2': { range: 2, directions: ['FL', 'FR', 'BL', 'BR'] }
        },
        winner: null
    };
    
    selectedCharacter = null;
    validMoves = [];
    moveHistoryList.innerHTML = '';
    restartGame.style.display = 'none';
    renderGrid();
    updateGameStatus();
}

// Initialize the game
renderGrid();
updateGameStatus();
restartGame.addEventListener('click', startNewGame);
initWebSocket();