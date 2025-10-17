// DOM SELECT ELEMENTS
const holes = document.querySelectorAll('.hole');
const scoreDisplay = document.getElementById('score');
const moleCountDisplay = document.getElementById('moleCount');
const startButton = document.getElementById('startButton');

// Initialize game board
function initializeGame() {
  holes.forEach((hole) => {
    const mole = document.createElement('div');
    mole.className = 'mole';
    hole.appendChild(mole);
  });
}


initializeGame();
