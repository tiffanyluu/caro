const game = {
  board: Array(15)
    .fill()
    .map(() => Array(15).fill("")),
  player1Turn: true,
  players: { player1Choice: "X", player2Choice: "O" },
  row: undefined,
  col: undefined,
  isGameOver: false,
  isPlayerVsAI: false,
};

function boardValue(row, col) {
  return game.board[row][col];
}

function setCoords(i, j) {
  game.row = i;
  game.col = j;
}

function resetGame() {
  game.board = Array(15)
    .fill()
    .map(() => Array(15).fill(""));
  game.player1Turn = true;
  game.row = undefined;
  game.col = undefined;
  game.isGameOver = false;
}

function makeMove(row, col, playerMarker) {
  if (game.isGameOver) {
    return { success: false, error: "Game is over." };
  }

  const moveRow = row !== undefined ? row : game.row;
  const moveCol = col !== undefined ? col : game.col;

  if (moveRow === undefined || moveCol === undefined) {
    return { success: false, error: "Invalid cell" };
  }

  const currentCell = boardValue(moveRow, moveCol);
  if (currentCell !== "") {
    return { success: false, error: "Pick an unoccupied cell." };
  }

  const marker =
    playerMarker ||
    (game.player1Turn
      ? game.players.player1Choice
      : game.players.player2Choice);

  game.board[moveRow][moveCol] = marker;

  if (!playerMarker) {
    game.player1Turn = !game.player1Turn;
  }

  const winningLine = checkState(moveRow, moveCol, marker);
  const isWinner = winningLine !== null;
  const isDraw = checkDraw();
  game.isGameOver = isDraw || isWinner;

  return {
    currentBoard: game.board,
    success: true,
    marker,
    position: { row: moveRow, col: moveCol },
    isGameOver: isWinner || isDraw,
    winner: isWinner
      ? marker === game.players.player1Choice
        ? "Player 1"
        : game.isPlayerVsAI
        ? "AI"
        : "Player 2"
      : null,
    isDraw,
    winningLine: isWinner ? winningLine : [],
  };
}

function checkState(row, col, marker) {
  const directions = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: -1 }, // up-left
    { dx: 1, dy: 1 }, // down-right
    { dx: 1, dy: -1 }, // down-left
    { dx: -1, dy: 1 }, // up-right
  ];

  for (let i = 0; i < directions.length; i += 2) {
    const d1 = directions[i];
    const d2 = directions[i + 1];
    const line1 = getLine(row, col, marker, d1.dx, d1.dy);
    const line2 = getLine(row, col, marker, d2.dx, d2.dy);
    const combined = [...line1.reverse(), [row, col], ...line2];

    const blockedEnds = line1.blocked + line2.blocked;
    if (combined.length >= 5 && blockedEnds < 2) {
      return combined; // return winning line
    }
  }

  return null;
}

function getLine(row, col, marker, dx, dy) {
  const positions = [];
  let blocked = 0;
  const oppositeMarker =
    marker === game.players.player1Choice
      ? game.players.player2Choice
      : game.players.player1Choice;

  while (true) {
    row += dx;
    col += dy;
    if (!isValidPosition(row, col)) break;
    if (game.board[row][col] === marker) {
      positions.push([row, col]);
    } else {
      if (game.board[row][col] === oppositeMarker) blocked++;
      break;
    }
  }

  positions.blocked = blocked;
  return positions;
}

function checkLine(row, col, marker, dx, dy) {
  let count = 0;
  let originalRow = row;
  let originalCol = col;
  let blockedEnds = 0;
  const oppositeMarker =
    marker === game.players.player1Choice
      ? game.players.player2Choice
      : game.players.player1Choice;

  while (
    row >= 0 &&
    row < 15 &&
    col >= 0 &&
    col < 15 &&
    game.board[row][col] == marker
  ) {
    count++;
    row = row + dx;
    col = col + dy;
  }

  if (isValidPosition(originalRow - dx, originalCol - dy)) {
    if (game.board[originalRow - dx][originalCol - dy] === oppositeMarker) {
      blockedEnds++;
    }
  }

  if (isValidPosition(row, col) && game.board[row][col] === oppositeMarker) {
    blockedEnds++;
  }

  return { count, blockedEnds };
}

function isValidPosition(row, col) {
  return row >= 0 && row < 15 && col >= 0 && col < 15;
}

function checkDraw() {
  return game.board.flat().every((cell) => cell !== "");
}

export {
  game,
  boardValue,
  setCoords,
  resetGame,
  makeMove,
  checkState,
  checkLine,
  isValidPosition,
  checkDraw,
};
