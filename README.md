# Caro

**Caro** is a digital version of a traditional Vietnamese strategy game.

An important feature of **Caro** states that the winning line must not be blocked at both ends. If both ends of a player's line are blocked by the opponent, the line is not considered a valid win.

<p align="center">
  <img src="./src/assets/caro.png"/>
</p>

Background Image Credit: [Lukas Blazek](https://unsplash.com/@goumbik)

## Live Demo: [Caro](https://tiffanyluu.github.io/caro/)

Features

- **Responsive grid**
- **Two-player mode**
- **AI opponent**: Challenge an AI using the **Minimax** algorithm with **Alpha-Beta Pruning**.

How to Play

1. The game starts with an empty grid.
2. Players take turns placing their marks (`X` or `O`) on the grid.
3. The first player to align five (or more) marks in a row, horizontally, vertically, or diagonally, wins the game.
4. If both ends of a line are blocked by the opponent, the line is not considered a valid win.
