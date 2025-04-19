import {
  game,
  boardValue,
  setCoords,
  resetGame,
  makeMove,
  checkState,
  checkLine,
  isValidPosition,
  checkDraw,
} from "./gameLogic.js";

const boardCache = new Map();

function evaluateBoard(board, player) {
  let totalScore = 0;
  const opponent = getOpponent(player);
  const directions = [
    [1, 0], // vertical
    [0, 1], // horizontal
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ];

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      for (let [dx, dy] of directions) {
        let maxSteps = 6;
        let line = [];
        for (let i = 0; i < maxSteps; i++) {
          let r = row + i * dy;
          let c = col + i * dx;
          if (!isValidPosition(r, c)) break;
          line.push(board[r][c]);
        }
        if (line.length > 0) {
          totalScore += fastPatternScore(line, player);
          totalScore -= fastPatternScore(line, opponent);
        }
      }
    }
  }

  return totalScore;
}

function fastPatternScore(line, player) {
  let score = 0;
  let i = 0;

  while (i < line.length) {
    if (line[i] !== player) {
      i++;
      continue;
    }

    let start = i;
    while (i < line.length && line[i] === player) i++;
    let end = i - 1;

    let length = end - start + 1;
    let leftOpen = start > 0 && line[start - 1] === "";
    let rightOpen = end < line.length - 1 && line[end + 1] === "";
    let openEnds = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);

    if (length >= 5 && openEnds >= 1) score += 100000;
    else if (length === 4 && openEnds === 2) score += 10000;
    else if (length === 4 && openEnds === 1) score += 1000;
    else if (length === 3 && openEnds === 2) score += 500;
    else if (length === 3 && openEnds === 1) score += 100;
    else if (length === 2 && openEnds === 2) score += 50;
    else if (length === 2 && openEnds === 1) score += 25;
    else if (length === 1 && openEnds === 2) score += 10;
    else if (length === 1 && openEnds === 1) score += 5;
    else score += 1;
  }

  return score;
}

function extractLine(board, startRow, startCol, dx, dy, length) {
  let line = [];
  for (let i = 0; i < length; i++) {
    let row = startRow + i * dy;
    let col = startCol + i * dx;
    if (isValidPosition(row, col)) {
      line.push(board[row][col]);
    } else {
      line.push("");
    }
  }
  return line;
}

function getOpponent(player) {
  return player === "X" ? "O" : "X";
}

function generateMoves(board, player = null) {
  let validMoves = new Set();

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === "") {
        // Check 8 neighbors
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            if (dx === 0 && dy === 0) continue;
            let newRow = row + dx;
            let newCol = col + dy;
            if (
              isValidPosition(newRow, newCol) &&
              board[newRow][newCol] !== ""
            ) {
              validMoves.add(`${row},${col}`);
            }
          }
        }
      }
    }
  }

  let moves = Array.from(validMoves).map((s) =>
    s.split(",").map((v) => parseInt(v))
  );

  // If no nearby moves (i.e. game just started), add center and nearby cells
  if (moves.length === 0) {
    moves = [
      [7, 7],
      [6, 6],
      [8, 8],
      [7, 8],
      [8, 7],
      [6, 7],
      [7, 6],
    ];
  }

  if (player) {
    moves.sort((a, b) => {
      const boardA = copyBoard(board);
      const boardB = copyBoard(board);
      boardA[a[0]][a[1]] = player;
      boardB[b[0]][b[1]] = player;
      return evaluateBoard(boardB, player) - evaluateBoard(boardA, player);
    });
  }

  return moves;
}

function checkWinnerForMinimax(board, player, opponent) {
  // Check for each player
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const current = board[row][col];
      if (current === "") continue;

      // Check horizontally (→)
      if (col <= 10) {
        let count = 1;
        for (let i = 1; i <= 4; i++) {
          if (board[row][col + i] === current) count++;
          else break;
        }
        if (count >= 5) return current;
      }

      // Check vertically (↓)
      if (row <= 10) {
        let count = 1;
        for (let i = 1; i <= 4; i++) {
          if (board[row + i][col] === current) count++;
          else break;
        }
        if (count >= 5) return current;
      }

      // Check diagonally (↘)
      if (row <= 10 && col <= 10) {
        let count = 1;
        for (let i = 1; i <= 4; i++) {
          if (board[row + i][col + i] === current) count++;
          else break;
        }
        if (count >= 5) return current;
      }

      // Check diagonally (↙)
      if (row <= 10 && col >= 4) {
        let count = 1;
        for (let i = 1; i <= 4; i++) {
          if (board[row + i][col - i] === current) count++;
          else break;
        }
        if (count >= 5) return current;
      }
    }
  }
  return null; // No winner
}

function minimax(board, depth, alpha, beta, isMaximizing, player) {
  const opponent = getOpponent(player);
  const winner = checkWinnerForMinimax(board, player, opponent);
  const key = board.flat().join("") + isMaximizing;

  if (boardCache.has(key)) {
    return boardCache.get(key);
  }

  if (winner === player) return 1000000;
  if (winner === opponent) return -1000000;
  if (depth === 0) return evaluateBoard(board, player);
  if (generateMoves(board).length === 0) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const [row, col] of generateMoves(
    board,
    isMaximizing ? player : opponent
  )) {
    const boardCopy = copyBoard(board);
    boardCopy[row][col] = isMaximizing ? player : opponent;

    const score = minimax(
      boardCopy,
      depth - 1,
      alpha,
      beta,
      !isMaximizing,
      player
    );
    if (isMaximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) break; // Prune
  }
  boardCache.set(key, bestScore);
  return bestScore;
}

function makeSimulatedMove(board, aiMarker) {
  boardCache.clear();

  let bestScore = -Infinity;
  let bestMove = null;

  const isMaximizing = true;

  for (const [row, col] of generateMoves(board, aiMarker)) {
    let boardCopy = copyBoard(board);
    boardCopy[row][col] = aiMarker;

    let score = minimax(
      boardCopy,
      2,
      -Infinity,
      Infinity,
      !isMaximizing,
      aiMarker
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = [row, col];
    }
  }
  return bestMove;
}

function copyBoard(board) {
  return board.map((row) => row.slice());
}

export {
  evaluateBoard,
  fastPatternScore,
  extractLine,
  getOpponent,
  generateMoves,
  minimax,
  makeSimulatedMove,
  copyBoard,
};
