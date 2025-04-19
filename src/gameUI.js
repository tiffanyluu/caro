import { setCoords, resetGame, makeMove, game } from "./gameLogic.js";
import { makeSimulatedMove } from "./ai.js";

function toggleGameMode(mode) {
  game.isPlayerVsAI = mode === "AI";
  resetGame();
  initializeBoard();
}

function showModeSelector() {
  const selector = createGameModeUI((mode) => {
    toggleGameMode(mode);
  });
  document.body.appendChild(selector);
  setTimeout(() => selector.classList.add("show"), 50);
}

function createGameModeUI(onSelect) {
  const modeContainer = document.createElement("div");
  modeContainer.className = "mode-container";

  const modeSelector = document.createElement("div");
  modeSelector.className = "mode-selector";

  const pvpButton = document.createElement("button");
  pvpButton.className = "pvpButton";
  pvpButton.textContent = "Player vs Player";
  pvpButton.onclick = () => {
    onSelect("PVP");
    modeContainer.classList.remove("show");
    modeContainer.remove();
  };

  const pvaiButton = document.createElement("button");
  pvaiButton.className = "pvaiButton";
  pvaiButton.textContent = "Player vs AI";
  pvaiButton.onclick = () => {
    onSelect("AI");
    modeContainer.classList.remove("show");
    modeContainer.remove();
  };

  modeSelector.appendChild(pvpButton);
  modeSelector.appendChild(pvaiButton);
  modeContainer.appendChild(modeSelector);

  return modeContainer;
}

function createEndingContent(message) {
  let endingContainer = document.querySelector(".ending-container");
  endingContainer.innerHTML = "";

  let content = document.createElement("div");
  content.className = "ending-content";

  let text1 = document.createElement("p");
  text1.textContent = "Game Over";
  text1.style.marginBottom = "10px";
  let text2 = document.createElement("p");
  text2.textContent = message;
  content.appendChild(text1);
  content.appendChild(text2);

  let restartButton = document.createElement("button");
  restartButton.className = "restart-button";
  restartButton.type = "button";
  restartButton.textContent = "Restart";
  restartButton.onclick = restart;
  content.appendChild(restartButton);

  endingContainer.appendChild(content);
  endingContainer.classList.add("show");
}

function highlightWinningLine(line) {
  line.forEach(([row, col]) => {
    const cell = document.querySelector(`.cell-${row}${col}`);
    cell.classList.add("winning-glow");
  });
}

function showWinningScreen(winner) {
  setTimeout(() => {
    let message = `${winner} is the winner!`;
    createEndingContent(message);
  }, 2000);
}

function showDrawScreen() {
  let message = `It was a tie!`;
  createEndingContent(message);
}

function updateCell(row, col, marker) {
  let cell = document.querySelector(`.cell-${row}${col}`);
  cell.textContent = marker;
  cell.classList.add(marker);
}

function handleCellClick() {
  const marker = game.isPlayerVsAI ? "X" : undefined;
  const result = makeMove(undefined, undefined, marker);

  if (!result.success) {
    alert(result.error);
    return;
  }

  updateCell(result.position.row, result.position.col, result.marker);

  if (result.isGameOver) {
    if (result.isDraw) {
      showDrawScreen();
    } else {
      highlightWinningLine(result.winningLine);
      setTimeout(() => showWinningScreen(result.winner), 1000);
    }
  } else {
    if (game.isPlayerVsAI) {
      setTimeout(() => aiMove(result.currentBoard), 500);
    }
  }
}

function aiMove(currentBoard) {
  let simulatedMove = makeSimulatedMove(currentBoard, "O");

  if (simulatedMove) {
    const [row, col] = simulatedMove;
    setCoords(row, col);
    const result = makeMove(row, col, "O");

    if (result.success) {
      updateCell(row, col, "O");

      if (result.isGameOver) {
        if (result.isDraw) {
          showDrawScreen();
        } else {
          highlightWinningLine(result.winningLine);
          setTimeout(() => showWinningScreen(result.winner), 1000);
        }
      }
    }
  }
}

function restart() {
  let endingContainer = document.querySelector(".ending-container");
  endingContainer.innerHTML = "";

  let grid = document.querySelector(".grid");
  grid.innerHTML = "";

  endingContainer.classList.remove("show");

  resetGame();
  initializeBoard();
  showModeSelector();
}

function initializeBoard() {
  const grid = document.querySelector(".grid");
  grid.innerHTML = "";

  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      const cell = document.createElement("div");
      cell.className = `cell cell-${i}${j}`;
      cell.dataset.row = i;
      cell.dataset.col = j;

      cell.addEventListener("mousedown", () => setCoords(i, j));
      cell.addEventListener("mouseup", handleCellClick);

      grid.appendChild(cell);
    }
  }
  grid.classList.add("show");
}

function setUpEventListeners() {
  document.addEventListener("DOMContentLoaded", () => {
    initializeBoard();
    createGameModeUI();
    showModeSelector();
  });
}

export { initializeBoard, setUpEventListeners, toggleGameMode };
