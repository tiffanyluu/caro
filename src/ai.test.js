import { describe, it, expect, beforeEach } from "vitest";
import {
  evaluateBoard,
  fastPatternScore,
  getOpponent,
  generateMoves,
  makeSimulatedMove,
  copyBoard,
} from "./ai.js";

describe("AI Decision-Making", () => {
  let emptyBoard;

  beforeEach(() => {
    emptyBoard = Array(15)
      .fill()
      .map(() => Array(15).fill(""));
  });

  describe("Board Evaluation", () => {
    it("evaluates empty board as neutral", () => {
      const score = evaluateBoard(emptyBoard, "X");
      expect(score).toBe(0);
    });

    it("gives positive score for player patterns", () => {
      const board = copyBoard(emptyBoard);
      // Place 3 X's in a row with open ends
      board[7][5] = "X";
      board[7][6] = "X";
      board[7][7] = "X";

      const score = evaluateBoard(board, "X");
      expect(score).toBeGreaterThan(0);
    });

    it("gives negative score for opponent patterns", () => {
      const board = copyBoard(emptyBoard);
      // Place 4 O's in a row
      for (let i = 5; i <= 8; i++) {
        board[7][i] = "O";
      }

      const scoreForX = evaluateBoard(board, "X");
      expect(scoreForX).toBeLessThan(0);
    });
  });

  describe("Pattern Scoring", () => {
    it("scores 5 in a row with open end as winning", () => {
      const line = ["", "X", "X", "X", "X", "X", ""];
      const score = fastPatternScore(line, "X");
      expect(score).toBeGreaterThanOrEqual(100000);
    });

    it("scores 4 in a row with both ends open highly", () => {
      const line = ["", "X", "X", "X", "X", ""];
      const score = fastPatternScore(line, "X");
      expect(score).toBe(10000);
    });

    it("scores 4 in a row with one end open moderately", () => {
      const line = ["O", "X", "X", "X", "X", ""];
      const score = fastPatternScore(line, "X");
      expect(score).toBe(1000);
    });

    it("scores 3 in a row with both ends open", () => {
      const line = ["", "X", "X", "X", ""];
      const score = fastPatternScore(line, "X");
      expect(score).toBe(500);
    });

    it("scores blocked patterns lower", () => {
      const openLine = ["", "X", "X", ""];
      const blockedLine = ["O", "X", "X", "O"];

      const openScore = fastPatternScore(openLine, "X");
      const blockedScore = fastPatternScore(blockedLine, "X");

      expect(openScore).toBeGreaterThan(blockedScore);
    });

    it("handles empty or opponent-only lines", () => {
      const emptyLine = ["", "", "", ""];
      const opponentLine = ["O", "O", "O"];

      expect(fastPatternScore(emptyLine, "X")).toBe(0);
      expect(fastPatternScore(opponentLine, "X")).toBe(0);
    });
  });

  describe("Opponent Detection", () => {
    it("returns correct opponent for X", () => {
      expect(getOpponent("X")).toBe("O");
    });

    it("returns correct opponent for O", () => {
      expect(getOpponent("O")).toBe("X");
    });
  });

  describe("Move Generation", () => {
    it("generates center moves for empty board", () => {
      const moves = generateMoves(emptyBoard);
      expect(moves.length).toBeGreaterThan(0);

      // Check if [7,7] (center) is in the moves array
      const hasCenter = moves.some(([row, col]) => row === 7 && col === 7);
      expect(hasCenter).toBe(true);
    });

    it("generates moves near existing pieces", () => {
      const board = copyBoard(emptyBoard);
      board[7][7] = "X";

      const moves = generateMoves(board);
      // Should include positions near [7,7]
      const nearbyMoves = moves.filter(
        ([r, c]) => Math.abs(r - 7) <= 2 && Math.abs(c - 7) <= 2
      );
      expect(nearbyMoves.length).toBeGreaterThan(0);
    });

    it("does not generate moves on occupied cells", () => {
      const board = copyBoard(emptyBoard);
      board[7][7] = "X";
      board[7][8] = "O";

      const moves = generateMoves(board);
      // Check that occupied positions are not in moves
      const hasOccupiedX = moves.some(([row, col]) => row === 7 && col === 7);
      const hasOccupiedO = moves.some(([row, col]) => row === 7 && col === 8);

      expect(hasOccupiedX).toBe(false);
      expect(hasOccupiedO).toBe(false);
    });

    it("sorts moves by evaluation when player specified", () => {
      const board = copyBoard(emptyBoard);
      board[7][7] = "X";

      const moves = generateMoves(board, "X");
      expect(Array.isArray(moves)).toBe(true);
      expect(moves.length).toBeGreaterThan(1);
    });
  });

  describe("Board Copying", () => {
    it("creates independent copy of board", () => {
      const original = [
        ["X", "O"],
        ["", "X"],
      ];
      const copy = copyBoard(original);

      // Modify copy
      copy[0][0] = "O";

      // Original should be unchanged
      expect(original[0][0]).toBe("X");
      expect(copy[0][0]).toBe("O");
    });

    it("handles empty board copy", () => {
      const copy = copyBoard(emptyBoard);
      expect(copy).toHaveLength(15);
      expect(copy[0]).toHaveLength(15);
      expect(copy.flat().every((cell) => cell === "")).toBe(true);
    });
  });

  describe("AI Move Selection", () => {
    it("makes a move on empty board", () => {
      const move = makeSimulatedMove(emptyBoard, "O");
      expect(move).not.toBeNull();
      expect(Array.isArray(move)).toBe(true);
      expect(move).toHaveLength(2);

      const [row, col] = move;
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(15);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(15);
    });

    it("prioritizes winning moves", () => {
      const board = copyBoard(emptyBoard);
      // Create situation where AI can win
      board[7][7] = "O";
      board[7][8] = "O";
      board[7][9] = "O";
      board[7][10] = "O";
      // AI should play [7, 6] or [7, 11] to win

      const move = makeSimulatedMove(board, "O");
      const isWinningMove =
        (move[0] === 7 && move[1] === 6) || (move[0] === 7 && move[1] === 11);
      expect(isWinningMove).toBe(true);
    });

    it("blocks opponent winning moves", () => {
      const board = copyBoard(emptyBoard);
      // Create situation where opponent can win
      board[7][7] = "X";
      board[7][8] = "X";
      board[7][9] = "X";
      board[7][10] = "X";
      // AI should block at [7, 6] or [7, 11]

      const move = makeSimulatedMove(board, "O");
      const isBlockingMove =
        (move[0] === 7 && move[1] === 6) || (move[0] === 7 && move[1] === 11);
      expect(isBlockingMove).toBe(true);
    });

    it("makes reasonable moves in mid-game", () => {
      const board = copyBoard(emptyBoard);
      board[7][7] = "X";
      board[7][8] = "O";
      board[8][7] = "X";

      const move = makeSimulatedMove(board, "O");
      expect(move).not.toBeNull();

      const [row, col] = move;
      expect(board[row][col]).toBe(""); // Should be empty cell
    });
  });

  describe("Minimax Algorithm Properties", () => {
    it("handles terminal game states", () => {
      const board = copyBoard(emptyBoard);
      // Create winning position
      for (let i = 0; i < 5; i++) {
        board[7][i] = "X";
      }

      const move = makeSimulatedMove(board, "O");
      // Should still return a valid move even in losing position
      expect(move).not.toBeNull();
    });

    it("respects board boundaries", () => {
      const board = copyBoard(emptyBoard);
      board[0][0] = "X";

      const move = makeSimulatedMove(board, "O");
      const [row, col] = move;

      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(15);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(15);
    });
  });
});
