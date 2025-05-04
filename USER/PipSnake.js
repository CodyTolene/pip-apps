// =============================================================================
//  Name: Pip-Snake
//  License: CC-BY-NC-4.0
//  Repository: https://github.com/CodyTolene/pip-apps
//  Description: A simple snake game for the Pip-Boy 3000 Mk V.
//  Version: 1.2.0
// =============================================================================

const SCREEN_WIDTH = g.getWidth();
const SCREEN_HEIGHT = g.getHeight();
const TILE_SIZE = 16;
const LEFT_WALL = 64;
const RIGHT_WALL = 416;
const TOP_WALL = 16;
const BOTTOM_WALL = SCREEN_HEIGHT - 44;

const GRID_WIDTH = Math.floor((RIGHT_WALL - LEFT_WALL) / TILE_SIZE);
const GRID_HEIGHT = Math.floor((BOTTOM_WALL - TOP_WALL) / TILE_SIZE);

const GAME_SPEED = 200;
const COLOR_GREEN = '#0F0';
const COLOR_BG = '#000';
const SCORE_HEIGHT = 28;

const DIRECTIONS = [
  { x: 1, y: 0 }, // Right
  { x: 0, y: 1 }, // Down
  { x: -1, y: 0 }, // Left
  { x: 0, y: -1 }, // Up
];

var snake = [];
var directionIndex = 0;
var food = {};
var gameOver = true;
var gameLoopInterval = null;
var score = 0;
var borderDrawn = false;

function drawBorders() {
  if (borderDrawn) return;
  borderDrawn = true;

  g.setColor(COLOR_GREEN);

  g.drawLine(LEFT_WALL, TOP_WALL, RIGHT_WALL, TOP_WALL); // Top
  g.drawLine(LEFT_WALL, BOTTOM_WALL, RIGHT_WALL, BOTTOM_WALL); // Bottom
  g.drawLine(LEFT_WALL, TOP_WALL, LEFT_WALL, BOTTOM_WALL); // Left
  g.drawLine(RIGHT_WALL, TOP_WALL, RIGHT_WALL, BOTTOM_WALL); // Right
}

function drawCell(gridX, gridY, mode) {
  const px = LEFT_WALL + gridX * TILE_SIZE;
  const py = TOP_WALL + gridY * TILE_SIZE;

  if (mode === 'clear') {
    g.setColor(COLOR_BG);
    g.fillRect(px, py, px + TILE_SIZE - 1, py + TILE_SIZE - 1);
  } else {
    g.setColor(COLOR_GREEN);
    if (mode === 'hollow') {
      g.drawCircle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 3);
    } else {
      g.fillRect(px, py, px + TILE_SIZE - 1, py + TILE_SIZE - 1);
    }
  }
}

function drawScore() {
  g.setColor(COLOR_BG);
  g.fillRect(0, SCREEN_HEIGHT - SCORE_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT);
  g.setColor(COLOR_GREEN);
  g.setFont('6x8', 2);
  g.drawString('Score: ' + score, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 20);
}

function spawnFood() {
  let newX, newY, collision;
  do {
    newX = Math.floor(Math.random() * GRID_WIDTH);
    newY = Math.floor(Math.random() * GRID_HEIGHT);
    collision =
      Array.isArray(snake) && snake.some((s) => s.x === newX && s.y === newY);
  } while (collision);
  return { x: newX, y: newY };
}

function updateSnake() {
  if (gameOver) return;

  const head = {
    x: snake[0].x + DIRECTIONS[directionIndex].x,
    y: snake[0].y + DIRECTIONS[directionIndex].y,
  };

  if (head.x < 0) head.x = GRID_WIDTH - 1;
  if (head.x >= GRID_WIDTH) head.x = 0;
  if (head.y < 0) head.y = GRID_HEIGHT - 1;
  if (head.y >= GRID_HEIGHT) head.y = 0;

  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    stopGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
  } else {
    const tail = snake.pop();
    drawCell(tail.x, tail.y, 'clear');
  }

  drawCell(food.x, food.y, 'hollow');
  snake.forEach((s) => drawCell(s.x, s.y));
  drawScore();
}

function handleInput() {
  if (BTN_TUNEDOWN.read()) directionIndex = (directionIndex + 3) % 4;
  else if (BTN_TUNEUP.read()) directionIndex = (directionIndex + 1) % 4;
  else if (BTN_TORCH.read()) exitGame();
  else if (BTN_PLAY.read()) resetGame();
}

function gameLoop() {
  handleInput();
  updateSnake();
}

function resetGame() {
  snake = [{ x: 2, y: 2 }];
  directionIndex = 0;
  food = spawnFood();
  gameOver = false;
  score = 0;
  borderDrawn = false;

  g.clear();
  drawBorders();
  drawScore();

  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(gameLoop, GAME_SPEED);
}

function stopGame() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = null;
  gameOver = true;

  g.clear();
  borderDrawn = false;

  g.setColor(COLOR_GREEN);
  g.setFont('6x8', 2);
  g.drawString('GAME OVER', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30);
  g.drawString('Score: ' + score, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 10);

  Pip.typeText('\n\nTuner = Restart\nTorch = Exit').then(() => {
    const waitLoop = setInterval(() => {
      if (BTN_PLAY.read()) {
        clearInterval(waitLoop);
        resetGame();
      }
      if (BTN_TORCH.read()) {
        clearInterval(waitLoop);
        exitGame();
      }
    }, 100);
  });
}

function exitGame() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameOver = true;
  g.clear();
  E.reboot();
}

function initializeGame() {
  g.clear();
  borderDrawn = false;

  Pip.typeText('Welcome to Pip-Snake!').then(() =>
    setTimeout(() => {
      Pip.typeText(
        'Right Tune UP/DOWN or Knob = Turn\nTuner-PUSH = Start\nTorch = Exit',
      ).then(() => {
        const waitLoop = setInterval(() => {
          if (BTN_PLAY.read()) {
            clearInterval(waitLoop);
            resetGame();
          }
          if (BTN_TORCH.read()) {
            clearInterval(waitLoop);
            exitGame();
          }
        }, 100);
      });
    }, 2000),
  );

  Pip.removeAllListeners('knob1');
  Pip.removeAllListeners('knob2');

  Pip.on('knob1', function (dir) {
    if (gameOver) return;
    if (dir < 0) directionIndex = (directionIndex + 3) % 4;
    else if (dir > 0) directionIndex = (directionIndex + 1) % 4;
  });

  Pip.on('knob2', function (dir) {
    if (gameOver) return;
    if (dir < 0) directionIndex = (directionIndex + 3) % 4;
    else if (dir > 0) directionIndex = (directionIndex + 1) % 4;
  });
}

initializeGame();
