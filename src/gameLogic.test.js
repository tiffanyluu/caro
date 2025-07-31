import { describe, it, expect, beforeEach } from "vitest";
import {
  game,
  boardValue,
  setCoords,
  resetGame,
  makeMove,
  checkState,
  isValidPosition,
  checkDraw,
} from "./gameLogic.js";

describe("Game Logic - Board Updates & Turn Logic", () => {
  beforeEach(() => {
    resetGame();
  });

  describe("Board Management", () => {
    it("initializes with empty 15x15 board", () => {
      expect(game.board).toHaveLength(15);
      expect(game.board[0]).toHaveLength(15);
      expect(game.board.flat().every((cell) => cell === "")).toBe(true);
    });

    it("resets board to empty state", () => {
      game.board[5][5] = "X";
      game.player1Turn = false;
      game.isGameOver = true;

      resetGame();

      expect(game.board[5][5]).toBe("");
      expect(game.player1Turn).toBe(true);
      expect(game.isGameOver).toBe(false);
    });

    it("gets correct board value at position", () => {
      game.board[3][7] = "O";
      expect(boardValue(3, 7)).toBe("O");
      expect(boardValue(0, 0)).toBe("");
    });

    it("sets coordinates correctly", () => {
      setCoords(8, 12);
      expect(game.row).toBe(8);
      expect(game.col).toBe(12);
    });
  });

  describe("Turn Logic", () => {
    it("alternates between players in PvP mode", () => {
      game.isPlayerVsAI = false;

      // Player 1 move
      const move1 = makeMove(7, 7);
      expect(move1.success).toBe(true);
      expect(move1.marker).toBe("X");
      expect(game.player1Turn).toBe(false);

      // Player 2 move
      const move2 = makeMove(7, 8);
      expect(move2.success).toBe(true);
      expect(move2.marker).toBe("O");
      expect(game.player1Turn).toBe(true);
    });

    it("handles player vs AI mode correctly", () => {
      game.isPlayerVsAI = true;

      // Human player move (always X)
      const humanMove = makeMove(7, 7, "X");
      expect(humanMove.success).toBe(true);
      expect(humanMove.marker).toBe("X");

      // AI move (always O)
      const aiMove = makeMove(8, 8, "O");
      expect(aiMove.success).toBe(true);
      expect(aiMove.marker).toBe("O");
    });

    it("prevents moves on occupied cells", () => {
      makeMove(5, 5);
      const result = makeMove(5, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Pick an unoccupied cell.");
    });

    it("prevents moves when game is over", () => {
      game.isGameOver = true;
      const result = makeMove(7, 7);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Game is over.");
    });

    it("requires valid coordinates", () => {
      const result = makeMove();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid cell");
    });
  });

  describe("Win Detection", () => {
    it("detects horizontal win", () => {
      // Place 5 X's horizontally
      for (let i = 0; i < 5; i++) {
        game.board[7][i] = "X";
      }

      const winningLine = checkState(7, 2, "X");
      expect(winningLine).not.toBeNull();
      expect(winningLine).toHaveLength(5);
    });

    it("detects vertical win", () => {
      // Place 5 O's vertically
      for (let i = 0; i < 5; i++) {
        game.board[i][7] = "O";
      }

      const winningLine = checkState(2, 7, "O");
      expect(winningLine).not.toBeNull();
      expect(winningLine).toHaveLength(5);
    });

    it("detects diagonal win (top-left to bottom-right)", () => {
      // Place 5 X's diagonally
      for (let i = 0; i < 5; i++) {
        game.board[i][i] = "X";
      }

      const winningLine = checkState(2, 2, "X");
      expect(winningLine).not.toBeNull();
      expect(winningLine).toHaveLength(5);
    });

    it("detects diagonal win (top-right to bottom-left)", () => {
      // Place 5 O's diagonally
      for (let i = 0; i < 5; i++) {
        game.board[i][4 - i] = "O";
      }

      const winningLine = checkState(2, 2, "O");
      expect(winningLine).not.toBeNull();
      expect(winningLine).toHaveLength(5);
    });

    it("respects blocked line rule - both ends blocked", () => {
      // Create line: O X X X X X O (both ends blocked)
      game.board[7][0] = "O"; // left blocker
      game.board[7][6] = "O"; // right blocker
      for (let i = 1; i <= 5; i++) {
        game.board[7][i] = "X"; // 5 X's in a row
      }

      const winningLine = checkState(7, 3, "X");
      expect(winningLine).toBeNull(); // Should not win due to blocked ends
    });

    it("allows win with one open end", () => {
      // Create line: _ X X X X X O (one end open)
      game.board[7][5] = "O"; // right blocker
      for (let i = 0; i < 5; i++) {
        game.board[7][i] = "X"; // 5 X's in a row
      }

      const winningLine = checkState(7, 2, "X");
      expect(winningLine).not.toBeNull(); // Should win with one open end
    });

    it("allows win with both ends open", () => {
      // Create line: _ X X X X X _ (both ends open)
      for (let i = 1; i <= 5; i++) {
        game.board[7][i] = "X"; // 5 X's in a row
      }

      const winningLine = checkState(7, 3, "X");
      expect(winningLine).not.toBeNull(); // Should win with both ends open
    });
  });

  describe("Draw Detection", () => {
    it("detects draw when board is full", () => {
      // Fill entire board
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          game.board[i][j] = (i + j) % 2 === 0 ? "X" : "O";
        }
      }

      expect(checkDraw()).toBe(true);
    });

    it("returns false when board has empty cells", () => {
      game.board[5][5] = "X";
      game.board[5][6] = "O";
      // Rest of board is empty

      expect(checkDraw()).toBe(false);
    });
  });

  describe("Position Validation", () => {
    it("validates positions within board bounds", () => {
      expect(isValidPosition(0, 0)).toBe(true);
      expect(isValidPosition(14, 14)).toBe(true);
      expect(isValidPosition(7, 7)).toBe(true);
    });

    it("rejects positions outside board bounds", () => {
      expect(isValidPosition(-1, 0)).toBe(false);
      expect(isValidPosition(0, -1)).toBe(false);
      expect(isValidPosition(15, 14)).toBe(false);
      expect(isValidPosition(14, 15)).toBe(false);
      expect(isValidPosition(20, 20)).toBe(false);
    });
  });

  describe("Complete Game Flow", () => {
    it("handles complete winning game", () => {
      setCoords(7, 7);
      const move1 = makeMove();
      expect(move1.success).toBe(true);
      expect(move1.marker).toBe("X");
      expect(move1.isGameOver).toBe(false);

      setCoords(8, 8);
      const move2 = makeMove();
      expect(move2.success).toBe(true);
      expect(move2.marker).toBe("O");

      // Place X's horizontally in positions [7,7], [7,8], [7,9], [7,10], [7,11]
      // We already have X at [7,7], need 4 more
      setCoords(7, 8);
      makeMove(); // X
      setCoords(6, 6);
      makeMove(); // O

      setCoords(7, 9);
      makeMove(); // X
      setCoords(6, 7);
      makeMove(); // O

      setCoords(7, 10);
      makeMove(); // X
      setCoords(6, 8);
      makeMove(); // O

      // This should be the winning move
      setCoords(7, 11);
      const winningMove = makeMove(); // X

      expect(winningMove.isGameOver).toBe(true);
      expect(winningMove.winner).toBe("Player 1");
      expect(winningMove.winningLine).toHaveLength(5);
    });

    it("handles AI vs Player winner detection", () => {
      game.isPlayerVsAI = true;

      // Set up AI winning position - 4 O's in a row
      for (let i = 0; i < 4; i++) {
        game.board[0][i] = "O";
      }

      // AI makes the winning move at [0,4]
      const result = makeMove(0, 4, "O");
      expect(result.success).toBe(true);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe("AI");
    });
  });
});
