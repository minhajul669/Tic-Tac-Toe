const gameBoard = document.getElementById("gameBoard");
const statusText = document.getElementById("statusText");
const backBtn = document.getElementById("backBtn");
const gameContainer = document.getElementById("gameContainer");
const modeScreen = document.getElementById("modeScreen");
const modeButtons = document.getElementById("modeButtons");
const nameForm = document.getElementById("nameForm");
const backFromNameForm = document.getElementById("backFromNameForm");

let player1Name = "Player 1";
let player2Name = "Player 2";
let board, currentPlayer, gameActive, mode;

let backButtonState = "modeScreen";

const difficulty = 0.9; // Lower this to make AI easier (e.g. 0.6 = 60% chance of playing well)

function showTwoPlayerForm() {
  nameForm.style.display = "flex";
  modeButtons.style.display = "none";
  document.getElementById("modeTitle").style.display = "none";
  backFromNameForm.style.display = "block";
  backButtonState = "nameForm";
}

function selectMode(selectedMode) {
  mode = selectedMode;

  if (mode === "multi") {
    player1Name = document.getElementById("player1").value.trim();
    player2Name = document.getElementById("player2").value.trim();

    if (!player1Name || !player2Name) {
      alert("Please enter both player names.");
      return;
    }
  } else {
    player1Name = "You";
    player2Name = "Simanto";
  }

  modeScreen.style.display = "none";
  nameForm.style.display = "none";
  gameContainer.style.display = "block";
  backBtn.style.display = "block";
  backFromNameForm.style.display = "none";
  initializeGame();
  backButtonState = "game";
}

function initializeGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;

  statusText.textContent = mode === "single"
    ? "Your Turn (X)"
    : `${player1Name}'s Turn (X)`;

  gameBoard.innerHTML = "";
  board.forEach((_, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.addEventListener("click", handleCellClick);
    gameBoard.appendChild(cell);
  });
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner(board, currentPlayer)) {
    gameActive = false;
    if (mode === "single") {
      if (currentPlayer === "X") showPopup("Congratulations! You Win");
      else showPopup("Oho! Simanto Wins");
    } else {
      const winnerName = currentPlayer === "X" ? player1Name : player2Name;
      showPopup(`Congratulations! The winner is ${winnerName}`);
    }
    return;
  }

  if (board.every(cell => cell !== "")) {
    gameActive = false;
    showPopup("It's a Draw!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (mode === "single" && currentPlayer === "O") {
    statusText.textContent = "Simanto's Turn (O)";
    setTimeout(() => {
      const bestMoveIndex = findBestMove(board);
      board[bestMoveIndex] = "O";
      const cell = document.querySelector(`.cell[data-index='${bestMoveIndex}']`);
      if (cell) cell.textContent = "O";

      if (checkWinner(board, "O")) {
        gameActive = false;
        showPopup("Oho! Simanto Wins");
        return;
      }

      if (board.every(cell => cell !== "")) {
        gameActive = false;
        showPopup("It's a Draw!");
        return;
      }

      currentPlayer = "X";
      statusText.textContent = "Your Turn (X)";
    }, 500);
  } else {
    statusText.textContent =
      currentPlayer === "X"
        ? `${player1Name}'s Turn (X)`
        : `${player2Name}'s Turn (O)`;
  }
}

function checkWinner(board, player) {
  const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winningCombos.some(([a,b,c]) => board[a] === player && board[b] === player && board[c] === player);
}

function findBestMove(newBoard) {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < newBoard.length; i++) {
    if (newBoard[i] === "") {
      newBoard[i] = "O";

      let score;
      if (Math.random() > difficulty) {
        // Make a random bad move
        score = Math.floor(Math.random() * 5) - 2;
      } else {
        // Use minimax for strong move
        score = minimax(newBoard, 0, false);
      }

      newBoard[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWinner(newBoard, "O")) return 10 - depth;
  if (checkWinner(newBoard, "X")) return depth - 10;
  if (newBoard.every(cell => cell !== "")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function showPopup(message) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");
  popupMessage.textContent = message;
  popup.style.display = "block";
}

function restartFromPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
  initializeGame();
  backButtonState = "game";
}

function goBack() {
  if (backButtonState === "nameForm") {
    nameForm.style.display = "none";
    backFromNameForm.style.display = "none";
    modeButtons.style.display = "flex";
    document.getElementById("modeTitle").style.display = "block";
    backButtonState = "modeScreen";
  } else if (backButtonState === "game") {
    gameContainer.style.display = "none";
    modeScreen.style.display = "block";
    backBtn.style.display = "none";
    backFromNameForm.style.display = "none";
    modeButtons.style.display = "flex";
    document.getElementById("modeTitle").style.display = "block";
    nameForm.style.display = "none";
    backButtonState = "modeScreen";
  }
}
