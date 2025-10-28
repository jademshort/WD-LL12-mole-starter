// DOM SELECT ELEMENTS
const holes = document.querySelectorAll('.hole');
const scoreDisplay = document.getElementById('score');
const moleCountDisplay = document.getElementById('moleCount');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');

// Game score (declared here so provided.js can set it in startGame)
let score = 0;

// Optional whack sound
const popSound = new Audio('sounds/pop.mp3');

// Initialize game board
function initializeGame() {
  holes.forEach((hole, index) => {
    const mole = document.createElement('div');
    mole.className = 'mole';
    hole.appendChild(mole);

    // Attach click listener to the hole so we can detect whacks
    hole.addEventListener('click', wack);

    // Make each hole keyboard-focusable and operable
    hole.tabIndex = 0;
    hole.setAttribute('role', 'button');
    // Use the visible hole-number span if present, otherwise use index
    const numberSpan = hole.querySelector('.hole-number');
    const holeNumber = numberSpan ? numberSpan.textContent.trim() : String(index + 1);
    hole.setAttribute('aria-label', `Hole ${holeNumber} - whack the mole`);

    // Allow Enter or Space to whack the mole when focused
    hole.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        // pass the keyboard event to the same handler; it's a trusted event
        wack(e);
      }
    });
  });
}

function wack(event) {
  // Delegate to the shared hit handler
  const hole = event.currentTarget;
  hitHole(hole, event.isTrusted);
}

// Shared logic for scoring a hole. Call this from trusted events only.
function hitHole(hole, trusted) {
  if (!trusted) return;

  // Only count if the mole is actually up
  if (!hole || !hole.classList.contains('up')) return;

  // Increment score, update UI, hide the mole and play sound
  score++;
  scoreDisplay.textContent = score;

  // remove the mole immediately so the user can't double-score
  hole.classList.remove('up');

  // play optional sound (fail silently if not available)
  try {
    popSound.currentTime = 0;
    popSound.play();
  } catch (e) {
    // ignore play errors (e.g., autoplay restrictions)
  }
}

// Global keyboard controls:
// - 'a' to start the game (when not running)
// - '1'..'9' to focus and whack a corresponding hole
document.addEventListener('keydown', function (e) {
  // Ignore events when typing into form controls if any (defensive)
  const activeTag = document.activeElement && document.activeElement.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

  const key = e.key.toLowerCase();

  if (key === 'a') {
    // Start game with 'a' if not already running
    if (typeof gameRunning !== 'undefined' && !gameRunning) {
      // move focus to the start button for clarity then start
      startButton.focus();
      startGame();
      startTimer();
    }
    return;
  }

  // Numeric shortcuts 1-9
  if (key >= '1' && key <= '9') {
    const idx = parseInt(key, 10) - 1;
    const hole = holes[idx];
    if (hole) {
      // focus the hole so keyboard users get visual feedback
      hole.focus();
      // Use the trustedness of the keyboard event when calling hitHole
      hitHole(hole, e.isTrusted);
    }
  }
});
// Event Listeners
startButton.addEventListener('click', function () {
  startGame();
  startTimer();
});

// Timer handling
let timerInterval = null;
function startTimer() {
  // clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Use GAME_DURATION from provided.js when available (ms)
  const duration = (typeof GAME_DURATION !== 'undefined') ? GAME_DURATION : 15000;
  const endTime = Date.now() + duration;

  function update() {
    const msLeft = Math.max(0, endTime - Date.now());
    const seconds = Math.ceil(msLeft / 1000);
    if (timerDisplay) timerDisplay.textContent = String(seconds);
    if (msLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  update();
  timerInterval = setInterval(update, 100);
  // safety clear when game duration ends
  setTimeout(function () {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerDisplay) timerDisplay.textContent = '0';
  }, duration + 50);
}

initializeGame();
