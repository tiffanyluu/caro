const game = {
  board: Array(15)
    .fill()
    .map(() => Array(15).fill("")),
  player1Turn: true,
  players: { player1Choice: "X", player2Choice: "O" },
  row: undefined,
  col: undefined,
  isGameOver: false,
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

function makeMove() {
  if (game.isGameOver) {
    return { success: false, error: "Game is over." };
  }
  if (game.row === undefined || game.col === undefined) {
    return { success: false, error: "Invalid cell" };
  }

  const currentCell = boardValue(game.row, game.col);
  if (currentCell !== "") {
    return { success: false, error: "Pick an unoccupied cell." };
  }

  const marker = game.player1Turn
    ? game.players.player1Choice
    : game.players.player2Choice;
  game.board[game.row][game.col] = marker;
  game.player1Turn = !game.player1Turn;

  const isWinner = checkState(game.row, game.col, marker);
  const isDraw = checkDraw();
  game.isGameOver = isDraw || isWinner;

  return {
    success: true,
    marker,
    position: { row: game.row, col: game.col },
    isGameOver: isWinner || isDraw,
    winner: isWinner
      ? marker === game.players.player1Choice
        ? "Player 1"
        : "Player 2"
      : null,
    isDraw,
  };
}

function checkState(row, col, marker) {
  let horizontalLeft = checkLine(row, col, marker, -1, 0);
  let horizontalRight = checkLine(row, col, marker, 1, 0);
  let totalHorizontal = horizontalLeft.count + horizontalRight.count - 1;
  let horizontalBlockedEnds =
    horizontalLeft.blockedEnds + horizontalRight.blockedEnds;
  if (totalHorizontal >= 5 && horizontalBlockedEnds < 2) return true;

  let verticalDown = checkLine(row, col, marker, 0, 1);
  let verticalUp = checkLine(row, col, marker, 0, -1);
  let totalVertical = verticalDown.count + verticalUp.count - 1;
  let verticalBlockedEnds = verticalDown.blockedEnds + verticalUp.blockedEnds;
  if (totalVertical >= 5 && verticalBlockedEnds < 2) return true;

  let diagonalDownRight = checkLine(row, col, marker, 1, 1);
  let diagonalUpLeft = checkLine(row, col, marker, -1, -1);
  let totalDiagonal = diagonalDownRight.count + diagonalUpLeft.count - 1;
  let diagonalBlockedEnds =
    diagonalDownRight.blockedEnds + diagonalUpLeft.blockedEnds;
  if (totalDiagonal >= 5 && diagonalBlockedEnds < 2) return true;

  let diagonalDownLeft = checkLine(row, col, marker, 1, -1);
  let diagonalUpRight = checkLine(row, col, marker, -1, 1);
  let totalAntiDiagonal = diagonalDownLeft.count + diagonalUpRight.count - 1;
  let antiDiagonalBlockedEnds =
    diagonalDownLeft.blockedEnds + diagonalUpRight.blockedEnds;
  if (totalAntiDiagonal >= 5 && antiDiagonalBlockedEnds < 2) return true;

  return false;
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

export { setCoords, resetGame, makeMove };
