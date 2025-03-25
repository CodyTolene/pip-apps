// =============================================================================
//  Name: Custom Radio
//  License: CC-BY-NC-4.0
//  Repository: https://github.com/CodyTolene/pip-apps
//  Description: A custom music player that allows you to choose the music you
//               want to play from the `/RADIO` directory without restriction.
//  Version: 1.0.0
// =============================================================================

const fs = require('fs');

const LIST_X = 0;
const LIST_Y = 0;
const LIST_WIDTH = 200;
const LIST_HEIGHT = 200;
const PADDING = 30;
const LIST_LINE_HEIGHT = 20;
const LIST_MAX_VISIBLE = Math.floor(LIST_HEIGHT / LIST_LINE_HEIGHT);

const musicDir = '/RADIO';
const audioExts = /\.(wav|mp3|ogg)$/i;

let currentAudio = null;
let currentIndex = 0;
let files = [];
let isPlaying = false;
let scrollOffset = 0;

try {
  files = fs
    .readdir(musicDir)
    .filter((f) => f.match(audioExts))
    .map((f) => ({
      name: f,
      path: musicDir + '/' + f,
    }));
} catch (e) {
  g.clear(1);
  bC.setFontMonofonto18();
  bC.setColor(1);
  bC.drawString('NO MUSIC FOUND', bC.getWidth() / 2, bC.getHeight() / 2);
  bC.flip();
  return;
}

function drawMusicOverlay() {
  // Draw a black background behind list
  bC.setColor(0);
  bC.fillRect(
    LIST_X - 5,
    LIST_Y - 5,
    LIST_X + LIST_WIDTH + 5,
    LIST_Y + LIST_HEIGHT + 5,
  );

  const visible = files.slice(scrollOffset, scrollOffset + LIST_MAX_VISIBLE);

  bC.setFontMonofonto18();
  visible.forEach((file, i) => {
    const y = LIST_Y + i * LIST_LINE_HEIGHT;
    const isSelected = scrollOffset + i === currentIndex;

    bC.setColor(isSelected ? 3 : 1);
    const x = LIST_X + PADDING;

    const label = file.name;
    const labelWidth = bC.stringWidth(label);

    bC.drawString(label, x, y);

    if (isPlaying && file.path === currentAudio) {
      bC.drawString(' (PLAYING)', x + labelWidth + 4, y);
    }
  });

  // Clear without removing other elements
  bC.flip();
}

function exit() {
  clearInterval(modeCheck);
  Pip.audioStop();

  Pip.removeAllListeners('knob1');
  Pip.removeAllListeners('knob2');
  Pip.removeAllListeners('torch');

  currentAudio = null;
  files = [];
  isPlaying = false;
  showMainMenu();
}

function handleInput() {
  if (BTN_TUNEUP.read()) {
    scrollUp();
  }

  if (BTN_TUNEDOWN.read()) {
    scrollDown();
  }

  if (BTN_PLAY.read()) {
    playSelected();
  }

  if (BTN_TORCH.read()) {
    exit();
  }
}

function handleKnob1(dir) {
  if (dir < 0) scrollDown();
  else if (dir > 0) scrollUp();
  else playSelected();
}

function handleKnob2(dir) {
  if (dir < 0) scrollUp();
  else if (dir > 0) scrollDown();
}

function playSelected() {
  const file = files[currentIndex];
  if (!file) return;

  Pip.audioStop();

  if (currentAudio === file.path) {
    currentAudio = null;
    isPlaying = false;
    drawMusicOverlay();
    return;
  }

  try {
    if (file.path.includes('MX')) {
      radioPlayClip('MX', file.path);
    } else if (file.path.includes('DX')) {
      radioPlayClip('DX', file.path);
    } else {
      Pip.audioStart(file.path);
    }
  } catch {
    Pip.audioStart(file.path);
  }

  currentAudio = file.path;
  isPlaying = true;
  drawMusicOverlay();
}

function scrollDown() {
  if (currentIndex < files.length - 1) currentIndex++;
  if (currentIndex >= scrollOffset + LIST_MAX_VISIBLE) scrollOffset++;
  if (!isPlaying) Pip.knob1Click(1);
  drawMusicOverlay();
}

function scrollUp() {
  if (currentIndex > 0) currentIndex--;
  if (currentIndex < scrollOffset) scrollOffset--;
  if (!isPlaying) Pip.knob1Click(0);
  drawMusicOverlay();
}

function startCustomRadio() {
  drawHeader(MODE.RADIO);
  submenuRadio();
  drawFooter();
  drawMusicOverlay();

  setTimeout(function () {
    setInterval(handleInput, 150);
  }, 50);

  Pip.removeAllListeners('knob1');
  Pip.on('knob1', handleKnob1);

  Pip.removeAllListeners('knob2');
  Pip.on('knob2', handleKnob2);
}

startCustomRadio();
