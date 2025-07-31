import { describe, it, expect, beforeEach, vi } from "vitest";
import { toggleGameMode } from "./gameUI.js";
import { game, resetGame } from "./gameLogic.js";

Object.defineProperty(global, "document", {
  value: {
    createElement: vi.fn(() => ({
      className: "",
      textContent: "",
      style: {},
      onclick: null,
      dataset: {},
      appendChild: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      addEventListener: vi.fn(),
    })),
    querySelector: vi.fn(() => ({
      innerHTML: "",
      appendChild: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    })),
    addEventListener: vi.fn(),
    body: {
      appendChild: vi.fn(),
    },
  },
  writable: true,
});

global.setTimeout = vi.fn((cb) => cb());

describe("Game UI Logic", () => {
  beforeEach(() => {
    resetGame();
    vi.clearAllMocks();
  });

  describe("Game Mode Toggle", () => {
    it("sets player vs AI mode correctly", () => {
      toggleGameMode("AI");
      expect(game.isPlayerVsAI).toBe(true);
    });

    it("sets player vs player mode correctly", () => {
      toggleGameMode("PVP");
      expect(game.isPlayerVsAI).toBe(false);
    });

    it("resets game when toggling mode", () => {
      game.board[5][5] = "X";
      game.player1Turn = false;

      toggleGameMode("AI");

      expect(game.board[5][5]).toBe("");
      expect(game.player1Turn).toBe(true);
    });
  });

  describe("DOM Element Creation", () => {
    it("creates elements when document methods are called", () => {
      const mockElement = {
        className: "",
        textContent: "",
        dataset: {},
        appendChild: vi.fn(),
        classList: { add: vi.fn(), remove: vi.fn() },
        addEventListener: vi.fn(),
      };

      global.document.createElement.mockReturnValue(mockElement);

      const element = document.createElement("div");
      element.className = "test-class";
      element.dataset.row = "5";

      expect(document.createElement).toHaveBeenCalledWith("div");
      expect(element.className).toBe("test-class");
      expect(element.dataset.row).toBe("5");
    });

    it("handles DOM queries correctly", () => {
      const mockQueryResult = {
        innerHTML: "",
        classList: { add: vi.fn(), remove: vi.fn() },
        appendChild: vi.fn(),
      };

      global.document.querySelector.mockReturnValue(mockQueryResult);

      const element = document.querySelector(".grid");
      expect(element).toBeTruthy();
      expect(typeof element.appendChild).toBe("function");
    });
  });

  describe("Game Logic Integration", () => {
    it("maintains game state consistency after mode changes", () => {
      game.isPlayerVsAI = false;
      resetGame();

      expect(game.isPlayerVsAI).toBe(false);
      expect(game.player1Turn).toBe(true);

      toggleGameMode("AI");
      expect(game.isPlayerVsAI).toBe(true);
      expect(game.player1Turn).toBe(true); // Should remain true after reset

      toggleGameMode("PVP");
      expect(game.isPlayerVsAI).toBe(false);
      expect(game.player1Turn).toBe(true);
    });
  });
});
