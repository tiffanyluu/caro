import { setCoords, resetGame, makeMove } from "./gameLogic.js";
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

function showWinningScreen(winner) {
  let message = `${winner} is the winner!`;
  createEndingContent(message);
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
  const result = makeMove();

  if (!result.success) {
    alert(result.error);
    return;
  }

  updateCell(result.position.row, result.position.col, result.marker);

  if (result.isGameOver) {
    if (result.isDraw) {
      showDrawScreen();
    } else {
      showWinningScreen(result.winner);
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
}

function initializeBoard() {
  const grid = document.querySelector(".grid");
  grid.innerHTML = "";

  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      const cell = document.createElement("div");
      cell.className = `cell-${i}${j}`;
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
  document.addEventListener("DOMContentLoaded", initializeBoard);
}

export { initializeBoard, setUpEventListeners };
