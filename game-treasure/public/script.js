// ==================== Module 1: Trang chủ và âm thanh ====================
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const homeBtn = document.getElementById('home-btn');
  const saveProgressBtn = document.getElementById('save-progress-btn');
  const introBtn = document.getElementById('intro-btn');
  const closeIntroBtn = document.getElementById('close-intro-btn');
  const saveNameBtn = document.getElementById('save-name-btn');
  const skipNameBtn = document.getElementById('skip-name-btn');
  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
  const leaderboardOverlay = document.getElementById('leaderboard-overlay');
  const homeScreen = document.getElementById('home-screen');
  themeSong = document.getElementById('theme-song');
  ingameSong = document.getElementById('ingame-song');
  footstepsSound = document.getElementById('footsteps-sound');
  teleportSound = document.getElementById('teleport-sound');
  lavaBurnSound = document.getElementById('lava-burn-sound');
  mummyBiteSound = document.getElementById('mummy-bite-sound');
  let audioStarted = false;

  const stopAllMusic = () => {
    if (themeSong) {
      themeSong.pause();
      themeSong.currentTime = 0;
    }
    if (ingameSong) {
      ingameSong.pause();
      ingameSong.currentTime = 0;
    }
  };

  const attemptPlayThemeSong = async () => {
    if (!themeSong || audioStarted) return true;
    if (typeof suppressThemePlay !== 'undefined' && suppressThemePlay) return false;

    try {
      themeSong.load();
      themeSong.volume = 0.4;
      themeSong.loop = true;
      await themeSong.play();
      if (ingameSong) {
        ingameSong.pause();
        ingameSong.currentTime = 0;
      }
      audioStarted = true;
      return true;
    } catch (error) {
      audioStarted = false;
      console.log('Chưa thể phát nhạc ngay lúc này:', error);
      return false;
    }
  };

  const playIngameSong = async () => {
    if (!ingameSong) return;
    stopAllMusic();
    try {
      ingameSong.volume = 0.4;
      ingameSong.loop = true;
      await ingameSong.play();
    } catch (error) {
      console.log('Không thể phát nhạc trong game:', error);
    }
  };

  // Hiển thị leaderboard khi trang load
  displayLeaderboard();

  const saved = loadProgress();
  if (saved) {
    savedProgressToResume = saved;
  }

  if (themeSong) {
    attemptPlayThemeSong();
  }

  const retryThemeSong = () => {
    attemptPlayThemeSong();
  };

  window.addEventListener('pageshow', retryThemeSong);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      retryThemeSong();
    }
  });

  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(eventName => {
    document.addEventListener(eventName, () => {
      retryThemeSong();
      ensureAudioUnlocked();
    }, { once: true });
  });

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  });

  if (homeScreen) {
    homeScreen.addEventListener('click', retryThemeSong);
    homeScreen.addEventListener('touchstart', retryThemeSong, { passive: true });
  }


  if (startBtn) {
    startBtn.addEventListener('click', () => {
      suppressThemePlay = true;
      setTimeout(() => { suppressThemePlay = false; }, 1200);

      const saved = savedProgressToResume || loadProgress();
      if (saved) {
        const shouldResume = confirm('Bạn có muốn tiếp tục cuộc hành trình trước đó không?');
        if (shouldResume) {
          level = saved.level || initialLevel;
          score = saved.score || 0;
          levelScore = saved.levelScore || 0;
          playIngameSong();
          gameCompleted = false;
          gameOverFlag = false;
          resumeSavedProgress(saved);
          return;
        }

        clearProgress();
        savedProgressToResume = null;
      }

      level = initialLevel;
      playIngameSong();
      gameCompleted = false;
      gameOverFlag = false;
      resetGameState();
    });
  }

  if (saveProgressBtn) {
    saveProgressBtn.addEventListener('click', () => {
      saveProgress();
      showGameFeedback('✅ Tiến trình đã được lưu');
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      if (ingameSong) {
        ingameSong.pause();
        ingameSong.currentTime = 0;
      }
      attemptPlayThemeSong();
      location.reload(); // Reload trang để về màn hình chủ
    });
  }

  if (introBtn) {
    introBtn.addEventListener('click', () => {
      document.getElementById('intro-screen').classList.add('show');
    });
  }

  if (closeIntroBtn) {
    closeIntroBtn.addEventListener('click', () => {
      document.getElementById('intro-screen').classList.remove('show');
    });
  }

  if (saveNameBtn) {
    saveNameBtn.addEventListener('click', savePlayerName);
  }

  if (skipNameBtn) {
    skipNameBtn.addEventListener('click', skipPlayerName);
  }

  if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', () => {
      document.getElementById('leaderboard').classList.add('show');
      leaderboardOverlay.classList.add('show');
    });
  }

  if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener('click', closeLeaderboard);
  }

  if (leaderboardOverlay) {
    leaderboardOverlay.addEventListener('click', closeLeaderboard);
  }
});

// ==================== Module 2: Quản lý bảng xếp hạng ====================
function closeLeaderboard() {
  document.getElementById('leaderboard').classList.remove('show');
  document.getElementById('leaderboard-overlay').classList.remove('show');
}

// ==================== Module 3: Trạng thái trò chơi và biến toàn cục ====================
let startTime = 0;
let gameCompleted = false;
let playerCount = parseInt(localStorage.getItem('playerCount')) || 0;
let savedProgressToResume = null;
let lastPuzzleExplanation = '';

// Chuyển đổi thời gian từ chuỗi mm:ss sang mili giây để so sánh và lưu điểm.
function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':').map(part => parseInt(part, 10));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
  return parts[0] * 60000 + parts[1] * 1000;
}

// Chuẩn hóa một bản ghi leaderboard để đảm bảo dữ liệu luôn có định dạng nhất quán.
function normalizeLeaderboardEntry(entry) {
  const score = Number(entry.score) || 0;
  const timeMs = typeof entry.timeMs === 'number' ? entry.timeMs : parseTimeString(entry.time);
  const time = typeof entry.time === 'string' && entry.time ? entry.time : formatTime(timeMs);
  return { name: String(entry.name || ''), score, time, timeMs };
}

// So sánh hai mục leaderboard để giữ kết quả tốt nhất
function compareLeaderboardEntries(a, b) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  return a.timeMs - b.timeMs;
}

function dedupeLeaderboard(leaderboard) {
  const bestEntries = new Map();
  leaderboard.map(normalizeLeaderboardEntry).forEach(entry => {
    const existing = bestEntries.get(entry.name);
    if (!existing || compareLeaderboardEntries(entry, existing) < 0) {
      bestEntries.set(entry.name, entry);
    }
  });
  return Array.from(bestEntries.values()).sort(compareLeaderboardEntries);
}

// Hàm quản lý Leaderboard
// Đọc dữ liệu leaderboard từ localStorage và làm sạch các bản ghi trùng lặp.
function getLeaderboard() {
  const data = localStorage.getItem('leaderboard');
  const leaderboard = data ? JSON.parse(data) : [];
  const cleaned = dedupeLeaderboard(leaderboard);
  if (cleaned.length !== leaderboard.length) {
    localStorage.setItem('leaderboard', JSON.stringify(cleaned));
  }
  return cleaned;
}

// Lưu kết quả mới vào bảng xếp hạng nếu tên người chơi chưa tồn tại.
function saveScore(playerName, score, timeMs) {
  let leaderboard = getLeaderboard();

  // Kiểm tra xem tên này đã tồn tại chưa
  if (leaderboard.some(entry => entry.name === playerName)) {
    return false; // Tên trùng, không lưu
  }

  let timeStr = formatTime(timeMs);
  leaderboard.push({ name: playerName, score: score, time: timeStr, timeMs: timeMs });

  // Sắp xếp theo điểm giảm dần, nếu bằng thì theo thời gian tăng dần (nhanh nhất trước)
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Điểm cao hơn được top
    }
    return a.timeMs - b.timeMs; // Cùng điểm thì thời gian nhanh hơn được top
  });

  // Chỉ giữ top 20
  leaderboard = leaderboard.slice(0, 20);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  return true; // Lưu thành công
}

function displayLeaderboard() {
  const leaderboard = getLeaderboard();
  const tbody = document.getElementById('leaderboard-body');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (leaderboard.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Chưa có điểm nào</td></tr>';
    return;
  }

  leaderboard.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.score}</td>
      <td>${entry.time}</td>
    `;
    tbody.appendChild(row);
  });
}

// Lưu tên người chơi khi hoàn thành trò chơi và cập nhật bảng xếp hạng.
function savePlayerName() {
  const nameInput = document.getElementById('player-name-input');
  let playerName = nameInput.value.trim();

  if (!playerName) {
    playerCount++;
    playerName = 'Player' + playerCount;
    localStorage.setItem('playerCount', playerCount);
  }

  let elapsedTime = Date.now() - startTime;

  // Kiểm tra xem tên có trùng không
  if (!saveScore(playerName, score, elapsedTime)) {
    alert('❌ Tên "' + playerName + '" đã tồn tại! Vui lòng nhập tên khác.');
    nameInput.focus();
    nameInput.select();
    return; // Không lưu, yêu cầu nhập lại
  }

  document.getElementById('name-input-screen').classList.remove('show');

  // Hiển thị leaderboard sau khi lưu
  setTimeout(() => {
    location.reload();
  }, 500);
}

// Bỏ qua nhập tên thì vẫn lưu kết quả bằng tên tự động tạo.
function skipPlayerName() {
  playerCount++;
  let playerName = 'Player' + playerCount;
  localStorage.setItem('playerCount', playerCount);

  let elapsedTime = Date.now() - startTime;

  saveScore(playerName, score, elapsedTime);
  document.getElementById('name-input-screen').classList.remove('show');

  // Hiển thị leaderboard sau khi lưu
  setTimeout(() => {
    location.reload();
  }, 500);
}

let playerImage;
let mummyImage;
let wallImage;
let lavaImage;
let leverImage;
let stairImage;
let tpImage;
let treasureImage;
let themeSong;
let ingameSong;
let footstepsSound;
let teleportSound;
let lavaBurnSound;
let mummyBiteSound;
let player = { x: 50, y: 550, speed: 0, size: 20, gridX: 1, gridY: 11, prevGridX: 1, prevGridY: 11 };
let mummy = { x: 0, y: 0, gridX: 0, gridY: 0 };
let mummies = [];
let objectivePos = { x: 0, y: 0 };
let grid = [];
let gems = [];
let enemies = [];
let lava = [];
let teleports = [];
// Số level khởi đầu (map khởi đầu)
let initialLevel = 1;
let level = initialLevel;
// Lưu vị trí bắt đầu cho mỗi map để có thể reset ngay lập tức
let startPositions = {};
// Nếu true thì tạm thời chặn việc phát `themeSong` (tránh race khi bấm Start)
let suppressThemePlay = false;
let score = 0;
let levelScore = 0;
let currentPuzzles = [];
let currentPuzzle = {};
let pendingPuzzles = [];
let puzzles = [];
let rsaKey = {};
let gameOverFlag = false;
let gameOverReason = '';
let lostScreenTimeout = null;
let mummyPauseSteps = 0;
let puzzleRestorePosition = null;
let specialQuestionActive = false;
let audioContext = null;
let burnEffect = { active: false, x: 0, y: 0, particles: [] };
let headFallEffect = { active: false, x: 0, y: 0, vx: 0, vy: 0, alpha: 255, life: 0 };
const tileSize = 50;
const levelScores = [10, 20, 30, 40];
const puzzlePointsByLevel = [5, 10, 15, 20, 20];
const mapCompletionBonusByLevel = [10, 20, 30, 40];

function getAudioContext() {
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextCtor) {
      audioContext = new AudioContextCtor();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => { });
  }
  return audioContext;
}

function ensureAudioUnlocked() {
  getAudioContext();
}

function playMummyBiteSound() {
  ensureAudioUnlocked();
  if (!mummyBiteSound) return;
  mummyBiteSound.currentTime = 0;
  mummyBiteSound.volume = 0.5;
  mummyBiteSound.play().catch(() => { });
}

function playLavaBurnSound() {
  ensureAudioUnlocked();
  if (!lavaBurnSound) return;
  lavaBurnSound.currentTime = 0;
  lavaBurnSound.volume = 0.5;
  lavaBurnSound.play().catch(() => { });
}

// ==================== Module 4: Tải bản đồ, ảnh và dữ liệu câu đố ====================
function preload() {
  playerImage = loadImage('../data/picture/adventurer.png');
  mummyImage = loadImage('../data/picture/mummy.png');
  wallImage = loadImage('../data/picture/wall.png');
  lavaImage = loadImage('../data/picture/lava.jpg');
  leverImage = loadImage('../data/picture/lever.png');
  stairImage = loadImage('../data/picture/stair.png');
  tpImage = loadImage('../data/picture/tp.png');
  treasureImage = loadImage('../data/picture/treasure.png');
  loadJSON('../data/puzzles.json', (data) => {
    puzzles = data.levels;
    rsaKey = data.rsa_key || {};
  });
  loadJSON(`../data/map${level}.json`, (data) => {
    grid = data.grid;
    player.gridX = data.start.x;
    player.gridY = data.start.y;
    // Lưu vị trí bắt đầu cho level này
    startPositions[level] = { x: data.start.x, y: data.start.y };
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    initElements();
    resetPuzzles();
  });
}

function resizeCanvasToFit() {
  const canvasEl = document.querySelector('#game-canvas canvas');
  if (!canvasEl) return;

  const parent = document.getElementById('game-canvas');
  if (!parent) return;

  const baseWidth = 12 * tileSize;
  const baseHeight = 13 * tileSize;
  const availableWidth = parent.clientWidth || baseWidth;
  const availableHeight = parent.clientHeight || baseHeight;
  const scale = Math.min(1, availableWidth / baseWidth, availableHeight / baseHeight);
  const displayWidth = Math.max(1, Math.floor(baseWidth * scale));
  const displayHeight = Math.max(1, Math.floor(baseHeight * scale));
  canvasEl.style.width = `${displayWidth}px`;
  canvasEl.style.height = `${displayHeight}px`;
  canvasEl.style.maxWidth = '100%';
  canvasEl.style.maxHeight = '100%';
}

function setup() {
  let canvas = createCanvas(12 * tileSize, 13 * tileSize);
  canvas.parent('game-canvas');
  canvas.style('display', 'block');
  resizeCanvasToFit();
  updateUI();
}

function windowResized() {
  resizeCanvasToFit();
}

function draw() {
  if (gameCompleted) return;
  background(50);
  drawMap();
  drawMummy();

  if (burnEffect.active) {
    updateBurnEffect();
    drawBurnEffect();
    return;
  }

  if (headFallEffect.active) {
    updateHeadFallEffect();
    drawHeadFallEffect();
    return;
  }

  if (gameOverFlag) return;
  drawPlayer();
  checkCollisions();
  updateTimer();
}

function initMap(level, callback) {
  loadJSON(`../data/map${level}.json`, (data) => {
    grid = data.grid;
    player.gridX = data.start.x;
    player.gridY = data.start.y;
    // Lưu vị trí bắt đầu để có thể reset ngay lập tức
    startPositions[level] = { x: data.start.x, y: data.start.y };
    player.prevGridX = player.gridX;
    player.prevGridY = player.gridY;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    initElements();
    if (typeof callback === 'function') {
      callback();
    } else {
      resetPuzzles();
      updateUI();
    }
  });
}

function findObjectiveCell() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'O') {
        return { x, y };
      }
    }
  }
  return null;
}

function findSafePath(startX, startY, targetX, targetY) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue = [{ x: startX, y: startY }];
  visited[startY][startX] = true;

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.x === targetX && current.y === targetY) {
      const path = [];
      let node = current;
      while (node) {
        path.push({ x: node.x, y: node.y });
        node = parent[node.y][node.x];
      }
      return path;
    }

    for (let dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[ny][nx]) {
        const cellValue = grid[ny][nx];
        if (cellValue === 'P' || cellValue === 'G' || cellValue === 'O') {
          visited[ny][nx] = true;
          parent[ny][nx] = current;
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }

  return [];
}

function isWalkableCell(x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length && grid[y][x] !== 'W';
}

function placeMummiesForLevel(objectiveCell) {
  const spawnPositions = [];
  if (level === 5) {
    const primary = objectiveCell || { x: 10, y: 1 };
    const secondary = { x: 10, y: 10 };
    spawnPositions.push(primary, secondary);
  } else if (objectiveCell) {
    spawnPositions.push(objectiveCell);
  }

  const nextMummies = [];
  for (const position of spawnPositions) {
    if (!position || !isWalkableCell(position.x, position.y)) continue;
    const alreadyAdded = nextMummies.some(item => item.gridX === position.x && item.gridY === position.y);
    if (!alreadyAdded) {
      nextMummies.push({
        x: position.x * tileSize + tileSize / 2,
        y: position.y * tileSize + tileSize / 2,
        gridX: position.x,
        gridY: position.y
      });
    }
  }

  if (level === 5 && nextMummies.length < 2) {
    const fallback = { x: 10, y: 10 };
    if (isWalkableCell(fallback.x, fallback.y) && !nextMummies.some(item => item.gridX === fallback.x && item.gridY === fallback.y)) {
      nextMummies.push({
        x: fallback.x * tileSize + tileSize / 2,
        y: fallback.y * tileSize + tileSize / 2,
        gridX: fallback.x,
        gridY: fallback.y
      });
    }
  }

  if (nextMummies.length === 0 && objectiveCell) {
    nextMummies.push({
      x: objectiveCell.x * tileSize + tileSize / 2,
      y: objectiveCell.y * tileSize + tileSize / 2,
      gridX: objectiveCell.x,
      gridY: objectiveCell.y
    });
  }

  mummies = nextMummies;
  if (mummies.length > 0) {
    mummy = { ...mummies[0] };
  } else {
    mummy = { x: 0, y: 0, gridX: 0, gridY: 0 };
  }
}

// Khởi tạo các đối tượng trên bản đồ như gem, kẻ địch, lava và vị trí mục tiêu.
function initElements() {
  gems = [];
  enemies = [];
  lava = [];
  teleports = [];
  let objectiveCell = null;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'G') gems.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 });
      if (grid[y][x] === 'E' && level !== 5) enemies.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 });
      if (grid[y][x] === 'L') lava.push({ x: x * tileSize, y: y * tileSize, w: tileSize, h: tileSize });
      if (grid[y][x] === 'T') teleports.push({ x, y });
      if (grid[y][x] === 'O' || (grid[y][x] === 'E' && level === 5)) {
        objectivePos = { x, y };
        objectiveCell = { x, y };
      }
    }
  }
  placeMummiesForLevel(objectiveCell);
}

// Vẽ lại toàn bộ bản đồ và các đối tượng nền theo dữ liệu grid hiện tại.
function drawMap() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      let posX = x * tileSize;
      let posY = y * tileSize;
      if (grid[y][x] === 'W') {
        if (typeof wallImage !== 'undefined' && wallImage) {
          imageMode(CORNER);
          image(wallImage, posX, posY, tileSize, tileSize);
        } else {
          fill(139, 69, 19);
          rect(posX, posY, tileSize, tileSize);
        }
      } else if (grid[y][x] === 'P' || grid[y][x] === 'G') {
        // Sand color for platforms and items
        fill(237, 201, 175);
        rect(posX, posY, tileSize, tileSize);
      } else if (grid[y][x] === 'E' && level === 5) {
        if (typeof treasureImage !== 'undefined' && treasureImage) {
          imageMode(CORNER);
          image(treasureImage, posX, posY, tileSize, tileSize);
        } else {
          fill(255, 215, 0);
          rect(posX, posY, tileSize, tileSize);
        }
      } else if (grid[y][x] === 'E') {
        fill(237, 201, 175);
        rect(posX, posY, tileSize, tileSize);
      } else if (grid[y][x] === 'L') {
        if (typeof lavaImage !== 'undefined' && lavaImage) {
          imageMode(CORNER);
          image(lavaImage, posX, posY, tileSize, tileSize);
        } else {
          fill(255, 215, 0);
          rect(posX, posY, tileSize, tileSize);
        }
      } else if (grid[y][x] === 'T') {
        if (typeof tpImage !== 'undefined' && tpImage) {
          imageMode(CORNER);
          image(tpImage, posX, posY, tileSize, tileSize);
        } else {
          fill(135, 206, 250);
          rect(posX, posY, tileSize, tileSize);
        }
      } else if (grid[y][x] === 'O') {
        if (typeof stairImage !== 'undefined' && stairImage) {
          imageMode(CORNER);
          image(stairImage, posX, posY, tileSize, tileSize);
        } else {
          fill(105, 105, 105);
          rect(posX, posY, tileSize, tileSize);
        }
      }
    }
  }
  fill(0, 191, 255);
  for (let g of gems) {
    if (typeof leverImage !== 'undefined' && leverImage) {
      imageMode(CENTER);
      image(leverImage, g.x, g.y, 30, 30);
    } else {
      ellipse(g.x, g.y, 15, 15);
    }
  }
  fill(255, 69, 0);
  for (let e of enemies) ellipse(e.x, e.y, 20, 20);
}

// Vẽ nhân vật chính lên canvas bằng ảnh hoặc hình tròn dự phòng.
function drawPlayer() {
  if (playerImage) {
    const imgSize = player.size * 2;
    imageMode(CENTER);
    image(playerImage, player.x, player.y, imgSize, imgSize);
  } else {
    fill(0, 0, 255);
    ellipse(player.x, player.y, player.size, player.size);
  }
}

// Vẽ xác ướp lên canvas và giữ nó luôn ở đúng vị trí tính toán.
function drawMummy() {
  const activeMummies = mummies.length > 0 ? mummies : [mummy];
  activeMummies.forEach((mummyRef) => {
    if (mummyImage) {
      const imgSize = 35;
      imageMode(CENTER);
      image(mummyImage, mummyRef.x, mummyRef.y, imgSize, imgSize);
    } else {
      fill(200, 150, 100);
      ellipse(mummyRef.x, mummyRef.y, 30, 30);
    }
  });
}

// ==================== Module 5: Di chuyển nhân vật và xác ướp ====================
function startBurnEffect(x, y) {
  burnEffect.active = true;
  burnEffect.x = x;
  burnEffect.y = y;
  burnEffect.particles = Array.from({ length: 24 }, () => ({
    x,
    y,
    vx: random(-2.8, 2.8),
    vy: random(-2.8, 1.2),
    size: random(4, 9),
    alpha: 255,
    life: random(24, 40),
    rotation: random(0, TWO_PI)
  }));
}

function updateBurnEffect() {
  if (!burnEffect.active) return;

  burnEffect.particles = burnEffect.particles.map(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.07;
    particle.vx *= 0.97;
    particle.size *= 0.96;
    particle.alpha -= 10;
    particle.life -= 1;
    return particle;
  }).filter(particle => particle.alpha > 0 && particle.life > 0);

  if (burnEffect.particles.length === 0) {
    burnEffect.active = false;
  }
}

function drawBurnEffect() {
  if (!burnEffect.active) return;
  // Apply noStroke only within this block so global stroke state is preserved
  push();
  noStroke();
  burnEffect.particles.forEach(particle => {
    push();
    translate(particle.x, particle.y);
    rotate(particle.rotation);
    fill(20, 20, 20, particle.alpha);
    triangle(-particle.size, particle.size, particle.size, particle.size, 0, -particle.size * 0.9);
    pop();
  });

  push();
  translate(burnEffect.x, burnEffect.y - 5);
  rotate(-0.3);
  fill(255, 90, 40, 120);
  triangle(-10, 10, 10, 10, 0, -12);
  pop();
  pop();
}

function startHeadFallEffect(x, y) {
  headFallEffect.active = true;
  headFallEffect.x = x;
  headFallEffect.y = y;
  headFallEffect.vx = random(-1.5, 1.5);
  headFallEffect.vy = -3.5;
  headFallEffect.alpha = 255;
  headFallEffect.life = 90;
}

function updateHeadFallEffect() {
  if (!headFallEffect.active) return;
  headFallEffect.vy += 0.12;
  headFallEffect.x += headFallEffect.vx;
  headFallEffect.y += headFallEffect.vy;
  headFallEffect.alpha -= 3;
  headFallEffect.life -= 1;
  if (headFallEffect.life <= 0 || headFallEffect.alpha <= 0) {
    headFallEffect.active = false;
  }
}

function drawHeadFallEffect() {
  if (!headFallEffect.active) return;
  push();
  translate(headFallEffect.x, headFallEffect.y);
  noStroke();
  fill(104, 58, 20, headFallEffect.alpha);
  ellipse(0, 0, 26, 26);
  fill(60, 30, 10, headFallEffect.alpha);
  ellipse(-6, -4, 8, 8);
  ellipse(6, -4, 8, 8);
  fill(0, 0, 0, headFallEffect.alpha);
  arc(0, 4, 12, 8, 0, PI);
  pop();
}

function keyPressed() {
  ensureAudioUnlocked();
  if (gameOverFlag || gameCompleted) {
    return;
  }

  const decodeScreen = document.getElementById('decode-screen');
  const specialQuestionScreen = document.getElementById('special-question-screen');
  if ((decodeScreen && decodeScreen.style.display === 'block') || (specialQuestionScreen && specialQuestionScreen.style.display === 'flex')) {
    return;
  }

  let newGridX = player.gridX;
  let newGridY = player.gridY;
  let movedByPlayer = false;

  if (keyCode === LEFT_ARROW && player.gridX > 0) {
    newGridX--;
    movedByPlayer = true;
  }
  if (keyCode === RIGHT_ARROW && player.gridX < 11) {
    newGridX++;
    movedByPlayer = true;
  }
  if (keyCode === UP_ARROW && player.gridY > 0) {
    newGridY--;
    movedByPlayer = true;
  }
  if (keyCode === DOWN_ARROW && player.gridY < 11) {
    newGridY++;
    movedByPlayer = true;
  }

  if (movedByPlayer && grid[newGridY] && grid[newGridY][newGridX] !== 'W') {
    player.prevGridX = player.gridX;
    player.prevGridY = player.gridY;
    player.gridX = newGridX;
    player.gridY = newGridY;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;

    if (grid[player.gridY] && grid[player.gridY][player.gridX] === 'L') {
      playLavaBurnSound();
      startBurnEffect(player.x, player.y);
      gameOverFlag = true;
      gameOverReason = 'lava';
      if (lostScreenTimeout) {
        clearTimeout(lostScreenTimeout);
      }
      lostScreenTimeout = setTimeout(() => {
        showLostScreen();
      }, 1000);
      return;
    }

    if (grid[player.gridY] && grid[player.gridY][player.gridX] === 'T') {
      teleportPlayer();
    }

    const currentTile = grid[player.gridY] && grid[player.gridY][player.gridX];
    const map5SpecialRequirementsDone = gems.length === 0 && pendingPuzzles.length === 0;

    if (level === 5 && currentTile && currentTile === 'E') {
      if (!map5SpecialRequirementsDone) {
        showGameFeedback('Bạn chưa kích hoạt hết các công tắc');
      } else if (!specialQuestionActive) {
        showSpecialQuestionScreen();
        return;
      }
    }

    let decodeScreen = document.getElementById('decode-screen');
    if (decodeScreen && decodeScreen.style.display !== 'block') {
      if (footstepsSound) {
        try {
          footstepsSound.pause();
          footstepsSound.currentTime = 0;
          footstepsSound.volume = 0.4;
          const playPromise = footstepsSound.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { });
          }
        } catch (error) {
          // Ignore if browser blocks autoplay or audio is not ready.
        }
      }
      if (mummyPauseSteps > 0) {
        mummyPauseSteps -= 1;
      } else {
        moveMummy();
      }
    }
  }
}

// Di chuyển xác ướp theo đường đi hợp lệ tránh tường bằng BFS.
function moveMummy() {
  const activeMummies = mummies.length > 0 ? mummies : [mummy];
  if (activeMummies.length === 0) return;

  activeMummies.forEach((mummyRef) => {
    const start = { x: mummyRef.gridX, y: mummyRef.gridY };
    const target = { x: player.gridX, y: player.gridY };
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
    const queue = [start];
    visited[start.y][start.x] = true;

    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    let found = false;
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.x === target.x && current.y === target.y) {
        found = true;
        break;
      }

      for (let dir of directions) {
        const nextX = current.x + dir.x;
        const nextY = current.y + dir.y;
        const isBlockedByOtherMummy = activeMummies.some(other => other !== mummyRef && other.gridX === nextX && other.gridY === nextY);
        if (
          nextY >= 0 && nextY < rows &&
          nextX >= 0 && nextX < cols &&
          !visited[nextY][nextX] &&
          grid[nextY][nextX] !== 'W' &&
          !isBlockedByOtherMummy
        ) {
          visited[nextY][nextX] = true;
          parent[nextY][nextX] = current;
          queue.push({ x: nextX, y: nextY });
        }
      }
    }

    if (!found) {
      return;
    }

    let step = target;
    while (parent[step.y][step.x] && !(parent[step.y][step.x].x === start.x && parent[step.y][step.x].y === start.y)) {
      step = parent[step.y][step.x];
    }

    if (step.x !== start.x || step.y !== start.y) {
      mummyRef.gridX = step.x;
      mummyRef.gridY = step.y;
      mummyRef.x = mummyRef.gridX * tileSize + tileSize / 2;
      mummyRef.y = mummyRef.gridY * tileSize + tileSize / 2;
    }
  });
}

function teleportPlayer() {
  if (teleports.length < 2) {
    return;
  }

  const currentGate = teleports.find(t => t.x === player.gridX && t.y === player.gridY);
  if (!currentGate) {
    return;
  }

  const otherGate = teleports.find(t => t.x !== currentGate.x || t.y !== currentGate.y);
  if (!otherGate) {
    return;
  }

  grid[currentGate.y][currentGate.x] = 'P';
  grid[otherGate.y][otherGate.x] = 'P';
  teleports = [];

  if (teleportSound) {
    try {
      teleportSound.pause();
      teleportSound.currentTime = 0;
      teleportSound.volume = 0.5;
      const playPromise = teleportSound.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => { });
      }
    } catch (error) {
      // Ignore autoplay restrictions or playback errors.
    }
  }

  player.gridX = otherGate.x;
  player.gridY = otherGate.y;
  player.x = player.gridX * tileSize + tileSize / 2;
  player.y = player.gridY * tileSize + tileSize / 2;
}

// Xử lý va chạm giữa người chơi với gem, xác ướp và đích đến.
function checkCollisions() {
  const decodeScreen = document.getElementById('decode-screen');
  if (decodeScreen && decodeScreen.style.display === 'block') {
    return;
  }

  // Kiểm tra va chạm với gem
  for (let g of gems) {
    if (dist(player.x, player.y, g.x, g.y) < 20) {
      const existingPendingPuzzle = pendingPuzzles.find(entry => entry.gem === g);
      if (existingPendingPuzzle) {
        currentPuzzle = existingPendingPuzzle.puzzle;
        currentPuzzle.pending = true;
        currentPuzzle.gem = g;
        puzzleRestorePosition = existingPendingPuzzle.restorePosition;
        updateUI();
        showDecodeScreen();
      } else if (currentPuzzles.length > 0) {
        const randomIndex = Math.floor(Math.random() * currentPuzzles.length);
        const nextPuzzle = currentPuzzles.splice(randomIndex, 1)[0];
        nextPuzzle.pending = true;
        nextPuzzle.gem = g;
        const newEntry = {
          puzzle: nextPuzzle,
          gem: g,
          restorePosition: { gridX: player.prevGridX, gridY: player.prevGridY }
        };
        pendingPuzzles.push(newEntry);
        currentPuzzle = nextPuzzle;
        puzzleRestorePosition = newEntry.restorePosition;
        updateUI();
        showDecodeScreen();
      }
      break;
    }
  }
  // Kiểm tra va chạm với các xác ướp
  const activeMummies = mummies.length > 0 ? mummies : [mummy];
  for (const mummyRef of activeMummies) {
    if (dist(player.x, player.y, mummyRef.x, mummyRef.y) < 25) {
      playMummyBiteSound();
      startHeadFallEffect(player.x, player.y);
      gameOverFlag = true;
      gameOverReason = 'mummy';
      if (lostScreenTimeout) {
        clearTimeout(lostScreenTimeout);
      }
      lostScreenTimeout = setTimeout(() => {
        showLostScreen();
      }, 1000);
      return;
    }
  }
  // Kiểm tra đến đích
  if (grid[player.gridY][player.gridX] === 'O' && levelScore >= levelScores[level - 1]) {
    score += mapCompletionBonusByLevel[level - 1];
    updateUI();
    if (level < 5) {
      level++;
      levelScore = 0;
      currentPuzzles = [];
      pendingPuzzles = [];
      currentPuzzle = {};
      initMap(level);
      updateUI();
      saveProgress();
    } else {
      // Hoàn thành game - hiển thị màn hình hoàn thành
      gameCompleted = true;
      showCompleteScreen();
    }
  }
}

// Cập nhật các thông tin hiển thị trên giao diện như level, điểm và câu đố hiện tại.
function updateUI() {
  document.getElementById('level').innerText = level;
  document.getElementById('score').innerText = score;
  document.getElementById('current-puzzle').innerText = currentPuzzle.question || "Thu thập gem để nhận câu đố";
}

function updateTimer() {
  if (startTime > 0) {
    let elapsedTime = Date.now() - startTime;
    let timeStr = formatTime(elapsedTime);
    document.getElementById('timer').innerText = timeStr;
  }
}

function showGameFeedback(message) {
  let feedback = document.getElementById('feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'feedback';
    document.body.appendChild(feedback);
  }
  feedback.innerText = message;
  feedback.style.display = 'block';
  feedback.style.zIndex = '2500';
  clearTimeout(showGameFeedback.timeoutId);
  showGameFeedback.timeoutId = setTimeout(() => {
    feedback.style.display = 'none';
  }, 1800);
}

function showPuzzleExplanation(puzzle, answer) {
  const panel = document.getElementById('explanation-panel');
  const text = document.getElementById('explanation-text');
  if (!panel || !text || !puzzle) return;

  const cipherType = (puzzle.cipher_type || '').toLowerCase();
  const treasure = (puzzle.treasure || '').toString();
  const normalizedAnswer = (answer || treasure).toString().trim();
  const keyText = (puzzle.key || '').toString().trim();
  let explanation = `Đáp án đúng là <strong>${treasure}</strong>.`;

  if (cipherType === 'caesar') {
    explanation = `Đây là câu đố Caesar và cách giải diễn ra theo từng bước. Bước 1: xác định rằng thông điệp được mã hóa bằng phép dịch chữ cái, mỗi ký tự đều bị dịch cùng một số vị trí. Bước 2: xem xét chuỗi mã hóa để tìm khoảng dịch dùng cho toàn bộ đoạn văn. Bước 3: dịch ngược từng ký tự lùi lại đúng số bước đó để phục hồi bản rõ. Kết quả cuối cùng là <strong>${treasure}</strong>, vì đây là từ đúng được che giấu bằng thuật toán Caesar.`;
  } else if (cipherType === 'vigenere') {
    explanation = `Đây là câu đố Vigenère, nên cách giải cần theo từng bước. Bước 1: nhận ra rằng mật mã không dùng một khoảng dịch cố định mà dùng một khóa lặp lại. Khóa đang dùng là <strong>${keyText || 'không xác định'}</strong>. Bước 2: xác định khóa rồi áp dụng nó theo thứ tự: ký tự đầu dùng khóa đầu, ký tự thứ hai dùng khóa thứ hai, rồi lặp lại chu kỳ đó. Bước 3: để giải ngược, ta dịch từng ký tự lùi lại đúng bằng số lần được quy định bởi khóa tương ứng, tức là trừ đi giá trị của mỗi chữ cái khóa để tìm bản rõ. Vì vậy đáp án đúng là <strong>${treasure}</strong>.`;
  } else if (cipherType === 'rsa') {
    explanation = `Đây là câu đố RSA, và cách giải cần đi theo từng bước rõ ràng. Bước 1: nhận ra đây là bài toán mã hóa bất đối xứng, nơi dữ liệu được mã hóa bằng khóa công khai và chỉ mở được bằng khóa riêng. Bước 2: hiểu rằng tất cả câu đố RSA trong game dùng chung một khóa, không phải mỗi câu một khóa riêng. Khóa chung này được lưu trong data, cụ thể là file data/puzzles.json. Bước 3: lấy ciphertext và áp dụng giải mã RSA với khóa riêng tương ứng sẽ phục hồi bản rõ ban đầu. Như vậy đáp án đúng là <strong>${treasure}</strong>.`;
  } else if (cipherType === 'aes') {
    explanation = `Đây là câu đố AES, một thuật toán mã hóa khối hiện đại. Bước 1: nhận diện rằng dữ liệu đã được mã hóa theo một khối AES và chỉ khóa đúng mới giải được. Bước 2: để truy ngược, ta lấy ciphertext hiện có và đưa vào quy trình giải mã AES cùng khóa tương ứng. Bước 3: quá trình giải mã AES được thực hiện qua nhiều vòng (round) của thuật toán. Mỗi round gồm các bước nội bộ như thay thế byte, dịch hàng, trộn cột và thêm khóa con. Khi giải mã, quá trình này chạy ngược lại: bắt đầu từ ciphertext, mỗi round giải mã đưa dữ liệu gần hơn về cấu trúc ban đầu, loại bỏ lớp trộn và lùi lại phép thay thế để phục hồi dữ liệu gốc. Sau round cuối cùng, AES sẽ trả về bản rõ ban đầu và từ đó ta biết được đáp án. Nói rõ hơn: ciphertext + khóa AES → giải mã AES qua các round → kết quả là plaintext phục hồi → plaintext đó chính là đáp án. Vì vậy đáp án đúng là <strong>${treasure}</strong>.`;
  } else if (cipherType === 'hash') {
    explanation = `Đây là câu đố kiểm tra toàn vẹn bằng hàm băm SHA-256, nên giải thích cũng cần rõ những bước xác minh. Bước 1: hiểu rằng hàm băm tạo ra một giá trị rút gọn từ dữ liệu đầu vào và không thể đảo ngược thành dữ liệu gốc. Bước 2: so sánh giá trị băm đã cho với giá trị băm bạn tính được từ dữ liệu gốc hoặc chuỗi mô tả. Bước 3: nếu hai giá trị trùng nhau, dữ liệu nguyên vẹn và đáp án là <strong>OK</strong>; nếu khác nhau, dữ liệu đã bị chỉnh sửa và đáp án là <strong>TAMPERED</strong>.`;
  } else if (cipherType === 'vuln') {
    const answers = (puzzle.vuln_answers || []).map(item => item.toString()).join(', ');
    explanation = `Đây là câu đố phát hiện lỗ hổng bảo mật và cách hiểu cần được trình bày từng bước. Bước 1: đọc kỹ mô tả để xác định hành vi bất thường hoặc mô tả về dữ liệu. Bước 2: chọn loại lỗ hổng phù hợp với hành vi đó, ví dụ replay attack, nonce reuse hoặc hash không có salt. Bước 3: đối chiếu với các cách khai thác tương ứng và chọn tên lỗ hổng chính xác. Đáp án đúng là <strong>${answers}</strong>.`;
  } else if (cipherType === 'theory') {
    const questionLower = (puzzle.question || '').toLowerCase();
    if (questionLower.includes('aes')) {
      explanation = `<strong>Giải thích:</strong> Câu hỏi này thuộc về kiến thức nền tảng về AES.<br><br>`;
      if (questionLower.includes('viết tắt')) {
        explanation += `AES là viết tắt của <strong>Advanced Encryption Standard</strong> (Chuẩn mã hóa tiên tiến). Đây là thuật toán mã hóa đối xứng được NIST (Viện Tiêu chuẩn và Công nghệ Quốc gia Hoa Kỳ) công bố vào năm 2001. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('tên gọi khác')) {
        explanation += `AES còn được biết đến với tên gọi <strong>Rijndael</strong>, là tên của hai nhà mật mã học người Bỉ đã phát minh ra nó: Joan Daemen và Vincent Rijmen. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('kích thước khối') || questionLower.includes('block size')) {
        explanation += `AES là mã hóa khối (block cipher) với kích thước khối cố định là <strong>128 bit</strong> (tương đương 16 byte). Dữ liệu được chia thành từng khối 128 bit để xử lý. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('kích thước khóa')) {
        explanation += `AES hỗ trợ ba kích thước khóa khác nhau: <strong>128 bit</strong>, <strong>192 bit</strong> và <strong>256 bit</strong>. Kích thước khóa càng lớn thì độ an toàn càng cao nhưng tốc độ xử lý càng chậm. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('vòng') || questionLower.includes('round')) {
        if (questionLower.includes('128')) {
          explanation += `AES-128 sử dụng <strong>10 vòng (round)</strong> mã hóa. Mỗi vòng thực hiện các bước: SubBytes, ShiftRows, MixColumns và AddRoundKey. Đáp án đúng: <strong>${treasure}</strong>.`;
        } else if (questionLower.includes('192')) {
          explanation += `AES-192 sử dụng <strong>12 vòng (round)</strong> mã hóa. Số vòng nhiều hơn AES-128 giúp tăng độ an toàn. Đáp án đúng: <strong>${treasure}</strong>.`;
        } else if (questionLower.includes('256')) {
          explanation += `AES-256 sử dụng <strong>14 vòng (round)</strong> mã hóa. Đây là phiên bản an toàn nhất của AES với số vòng mã hóa nhiều nhất. Đáp án đúng: <strong>${treasure}</strong>.`;
        } else {
          explanation += `Số vòng (round) của AES phụ thuộc vào kích thước khóa: AES-128 dùng 10 vòng, AES-192 dùng 12 vòng, AES-256 dùng 14 vòng. Đáp án đúng: <strong>${treasure}</strong>.`;
        }
      } else if (questionLower.includes('đối xứng') || questionLower.includes('bất đối xứng')) {
        explanation += `AES là thuật toán mã hóa <strong>đối xứng</strong>, nghĩa là cùng một khóa được dùng cho cả mã hóa và giải mã. Điều này khác với RSA là mã hóa bất đối xứng. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('khối') || questionLower.includes('dòng') || questionLower.includes('block cipher') || questionLower.includes('stream cipher')) {
        explanation += `AES thuộc loại mã hóa <strong>khối (block cipher)</strong>, xử lý dữ liệu theo từng khối 128 bit. Ngược lại, mã hóa dòng (stream cipher) xử lý từng bit hoặc byte một. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('cấu trúc') || questionLower.includes('mạng') || questionLower.includes('feistel') || questionLower.includes('spn')) {
        explanation += `AES sử dụng cấu trúc mạng <strong>SPN (Substitution-Permutation Network)</strong>, khác với cấu trúc Feistel của DES. SPN giúp AES đạt được sự khuếch tán (diffusion) và gây nhầm lẫn (confusion) tốt hơn. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('subbytes')) {
        explanation += `<strong>SubBytes</strong> là bước thay thế các byte trong ma trận trạng thái dựa trên bảng S-box (Substitution box). Mỗi byte được thay bằng một byte khác theo một bảng tra cứu cố định, tạo ra tính phi tuyến (non-linearity) cho thuật toán. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('shiftrows')) {
        explanation += `<strong>ShiftRows</strong> là bước dịch chuyển các hàng của ma trận trạng thái. Hàng thứ nhất giữ nguyên, hàng thứ hai dịch trái 1 byte, hàng thứ ba dịch trái 2 byte, hàng thứ tư dịch trái 3 byte. Bước này tạo ra sự khuếch tán giữa các cột. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('mixcolumns')) {
        explanation += `<strong>MixColumns</strong> là bước trộn các cột của ma trận trạng thái bằng cách nhân mỗi cột với một ma trận cố định trong trường GF(2⁸). Bước này kết hợp các byte trong cùng một cột để tăng tính khuếch tán. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('addroundkey')) {
        explanation += `<strong>AddRoundKey</strong> là bước thực hiện phép XOR giữa ma trận trạng thái với khóa con (round key) tương ứng. Đây là bước duy nhất sử dụng khóa trong mỗi vòng AES. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('thay thế') || questionLower.includes('des')) {
        explanation += `AES được NIST công bố năm 2001 để thay thế cho <strong>DES (Data Encryption Standard)</strong>, vốn đã trở nên không an toàn do kích thước khóa quá nhỏ (56 bit). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('ma trận trạng thái') || questionLower.includes('state')) {
        explanation += `AES hoạt động trên ma trận trạng thái (state) kích thước <strong>4×4 byte</strong> (tổng cộng 16 byte). Mỗi ô trong ma trận chứa 1 byte dữ liệu. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('công khai') || questionLower.includes('public key')) {
        explanation += `AES là mã hóa đối xứng, do đó <strong>không</strong> sử dụng khóa công khai (public key). Khóa trong AES là khóa bí mật được chia sẻ giữa bên gửi và bên nhận. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('mở rộng khóa') || questionLower.includes('key expansion')) {
        explanation += `Quá trình mở rộng khóa (key expansion) trong AES dùng để tạo ra các <strong>khóa con (round keys)</strong> từ khóa chính ban đầu. Mỗi vòng AES cần một khóa con riêng, và các khóa con này được tạo ra bằng thuật toán mở rộng khóa. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('an toàn nhất')) {
        explanation += `Trong ba lựa chọn kích thước khóa của AES, <strong>AES-256</strong> (256 bit) được coi là an toàn nhất vì có không gian khóa lớn nhất (2²⁵⁶), khiến việc tấn công vét cạn (brute-force) trở nên bất khả thi với công nghệ hiện tại. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('ecb') || questionLower.includes('cbc') || questionLower.includes('cfb') || questionLower.includes('chế độ')) {
        if (questionLower.includes('ecb') && questionLower.includes('an toàn')) {
          explanation += `Chế độ <strong>ECB (Electronic Codebook)</strong> trong AES <strong>không</strong> được đánh giá là an toàn vì các khối dữ liệu giống nhau sẽ cho ra bản mã giống nhau, dễ bị phân tích mẫu. Các chế độ an toàn hơn như CBC, CFB, GCM được khuyến nghị sử dụng. Đáp án đúng: <strong>${treasure}</strong>.`;
        } else {
          explanation += `AES <strong>có</strong> hỗ trợ nhiều chế độ mã hóa khác nhau như ECB (Electronic Codebook), CBC (Cipher Block Chaining), CFB (Cipher Feedback), OFB (Output Feedback) và GCM (Galois/Counter Mode). Mỗi chế độ có ưu nhược điểm riêng. Đáp án đúng: <strong>${treasure}</strong>.`;
        }
      } else if (questionLower.includes('phần mềm') || questionLower.includes('phần cứng')) {
        explanation += `AES <strong>có</strong> thể được thực thi hiệu quả trên cả phần mềm lẫn phần cứng. Trên phần cứng, AES có thể được tăng tốc bằng các lệnh chuyên dụng như AES-NI (AES New Instructions) trên CPU hiện đại. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('bỉ') || questionLower.includes('nguồn gốc')) {
        explanation += `AES <strong>đúng</strong> là có nguồn gốc từ hai nhà mật mã học người Bỉ: Joan Daemen và Vincent Rijmen. Thuật toán của họ được đặt tên là Rijndael và đã chiến thắng trong cuộc thi chọn AES của NIST. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('năm') || questionLower.includes('2001') || questionLower.includes('công bố')) {
        explanation += `AES được NIST chính thức công bố vào năm <strong>2001</strong> với tên gọi FIPS PUB 197 (Federal Information Processing Standards Publication 197). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('xor')) {
        explanation += `Bước AddRoundKey trong AES thực hiện phép toán <strong>XOR</strong> (eXclusive OR) giữa ma trận trạng thái và khóa con. XOR là phép toán bit cơ bản: 1 XOR 1 = 0, 0 XOR 0 = 0, 1 XOR 0 = 1, 0 XOR 1 = 1. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('16 byte') || questionLower.includes('byte')) {
        explanation += `Một khối dữ liệu AES sau khi mã hóa có kích thước <strong>16 byte</strong> (128 bit), bằng đúng kích thước khối đầu vào. AES là mã hóa khối nên đầu ra luôn có cùng kích thước với đầu vào. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('brute-force') || questionLower.includes('vét cạn') || questionLower.includes('tấn công')) {
        explanation += `AES <strong>có thể</strong> bị tấn công bằng phương pháp vét cạn (brute-force) về mặt lý thuyết, nhưng với AES-256, không gian khóa là 2²⁵⁶, quá lớn để có thể thực hiện trong thực tế với công nghệ hiện tại. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else {
        explanation += `Đây là câu hỏi lý thuyết về AES. Câu trả lời đúng là <strong>${treasure}</strong>. Hãy ôn lại kiến thức về các thuật toán mã hóa (AES, RSA) cũng như các khái niệm bảo mật thông tin cơ bản để hiểu rõ hơn về đáp án này.`;
      }
    } else if (questionLower.includes('rsa')) {
      explanation = `<strong>Giải thích:</strong> Câu hỏi này thuộc về kiến thức nền tảng về RSA.<br><br>`;
      if (questionLower.includes('viết tắt')) {
        explanation += `RSA là viết tắt của tên ba nhà khoa học: <strong>Rivest</strong> (Ron Rivest), <strong>Shamir</strong> (Adi Shamir) và <strong>Adleman</strong> (Leonard Adleman). Họ đã công bố thuật toán này vào năm 1977. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('đối xứng') || questionLower.includes('bất đối xứng')) {
        explanation += `RSA là thuật toán mã hóa <strong>bất đối xứng</strong> (asymmetric), sử dụng một cặp khóa: khóa công khai (public key) để mã hóa và khóa bí mật (private key) để giải mã. Điều này khác với AES là mã hóa đối xứng. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('bài toán khó') || questionLower.includes('an toàn')) {
        explanation += `RSA dựa trên bài toán <strong>phân tích số nguyên tố</strong> (integer factorization). Cụ thể, an toàn của RSA dựa trên độ khó của việc phân tích tích n = p × q thành hai số nguyên tố p và q khi n đủ lớn. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('khóa công khai') || (questionLower.includes('public key') && questionLower.includes('n e'))) {
        explanation += `Trong RSA, khóa công khai (public key) gồm hai thành phần: <strong>n</strong> (modulus, tích của hai số nguyên tố p và q) và <strong>e</strong> (số mũ công khai, thường chọn là 65537). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('khóa bí mật') || (questionLower.includes('private key') && questionLower.includes('n d'))) {
        explanation += `Trong RSA, khóa bí mật (private key) gồm hai thành phần: <strong>n</strong> (modulus, giống với khóa công khai) và <strong>d</strong> (số mũ bí mật, là nghịch đảo modulo của e theo φ(n)). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('kích thước khóa') || questionLower.includes('bit')) {
        explanation += `Kích thước khóa RSA tối thiểu được khuyến nghị hiện nay là <strong>2048 bit</strong>. Khóa 1024 bit từng được dùng phổ biến nhưng hiện đã không còn an toàn. Một số tổ chức yêu cầu khóa 4096 bit cho các ứng dụng nhạy cảm. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('ký số') || questionLower.includes('ngoài mã hóa')) {
        explanation += `Ngoài mã hóa, RSA còn được dùng để tạo <strong>chữ ký số (digital signature)</strong>. Chữ ký số RSA dùng khóa bí mật để ký (sign) và khóa công khai để xác thực (verify). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('euler') || questionLower.includes('φ')) {
        explanation += `Hàm Euler φ(n) trong RSA được tính bằng công thức <strong>φ(n) = (p-1)(q-1)</strong>, với p và q là hai số nguyên tố tạo nên n. Hàm này đóng vai trò quan trọng trong việc tính khóa bí mật d. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('giá trị n') || questionLower.includes('tích')) {
        explanation += `Trong RSA, giá trị <strong>n</strong> (modulus) được tính bằng tích của hai số nguyên tố lớn <strong>p</strong> và <strong>q</strong>: n = p × q. Độ dài của n quyết định kích thước khóa RSA. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('tốc độ') || questionLower.includes('nhanh hơn')) {
        explanation += `RSA <strong>không</strong> có tốc độ mã hóa nhanh hơn AES. Trên thực tế, RSA chậm hơn rất nhiều so với AES. Đây là lý do RSA thường chỉ dùng để mã hóa khóa phiên (session key), còn dữ liệu lớn được mã hóa bằng AES. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('khóa phiên') || questionLower.includes('loại dữ liệu')) {
        explanation += `Trong thực tế, RSA thường được dùng để mã hóa <strong>khóa phiên (session key)</strong>. Khóa phiên là một khóa đối xứng (như AES) được tạo ngẫu nhiên, được RSA mã hóa và gửi đến bên nhận. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('điểm yếu')) {
        explanation += `Điểm yếu chính của RSA so với AES là <strong>tốc độ chậm</strong>. RSA chậm hơn AES hàng trăm đến hàng nghìn lần do phải thực hiện các phép tính lũy thừa modulo với số lớn. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('phân tích thừa số') || questionLower.includes('tấn công')) {
        explanation += `RSA có thể bị tấn công bằng phương pháp <strong>phân tích thừa số (factoring)</strong> nếu khóa không đủ lớn. Kẻ tấn công có thể phân tích n thành p × q để tính khóa bí mật d. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('giá trị gần nhau') || questionLower.includes('p và q')) {
        explanation += `Hai số nguyên tố p và q trong RSA <strong>không</strong> nên được chọn có giá trị gần nhau. Nếu p và q gần nhau, kẻ tấn công có thể dùng phương pháp Fermat factorization để phân tích n dễ dàng hơn. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('cùng một khóa')) {
        explanation += `RSA <strong>không</strong> sử dụng cùng một khóa cho cả mã hóa và giải mã. Đây là mã hóa bất đối xứng, dùng khóa công khai (public key) để mã hóa và khóa bí mật (private key) để giải mã. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('giá trị e') || questionLower.includes('số nguyên tố nào') || questionLower.includes('65537')) {
        explanation += `Giá trị <strong>e</strong> (số mũ công khai) trong RSA thường được chọn là <strong>65537</strong> (hay 2¹⁶ + 1). Đây là số nguyên tố nhỏ có trọng số Hamming thấp, giúp tối ưu tốc độ mã hóa. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('lượng tử') || questionLower.includes('quantum')) {
        explanation += `RSA <strong>không</strong> an toàn trước các cuộc tấn công bằng máy tính lượng tử. Thuật toán Shor có thể phân tích n thành p × q một cách hiệu quả trên máy tính lượng tử, phá vỡ hoàn toàn RSA. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('ứng dụng') || questionLower.includes('giao thức') || questionLower.includes('internet')) {
        explanation += `RSA thường được ứng dụng trong các giao thức bảo mật trên Internet như <strong>SSL/TLS</strong> (để thiết lập kết nối HTTPS an toàn), cũng như trong SSH, PGP, và chữ ký số. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('kích thước tối đa') || questionLower.includes('chỉ có thể')) {
        explanation += `RSA chỉ có thể mã hóa dữ liệu có kích thước tối đa bằng <strong>độ dài khóa</strong> (key length). Ví dụ, với khóa RSA 2048 bit, dữ liệu tối đa là ≈ 2048 bit (256 byte). Dữ liệu lớn hơn cần được mã hóa bằng AES kết hợp với RSA. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('bắt đầu') || questionLower.includes('quy trình tạo')) {
        explanation += `Quy trình tạo khóa RSA bắt đầu bằng việc chọn hai <strong>số nguyên tố</strong> lớn p và q. Sau đó tính n = p × q và φ(n) = (p-1)(q-1). Cuối cùng chọn e và tính d sao cho e × d ≡ 1 (mod φ(n)). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('giá trị d') || questionLower.includes('nghịch đảo modulo')) {
        explanation += `Giá trị <strong>d</strong> trong RSA được tính bằng phép toán <strong>nghịch đảo modulo</strong> (modular inverse): d = e⁻¹ mod φ(n), nghĩa là d là số thỏa mãn e × d ≡ 1 (mod φ(n)). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('man-in-the-middle') || questionLower.includes('mitm')) {
        explanation += `RSA <strong>có thể</strong> chống lại tấn công man-in-the-middle (MITM) nếu được triển khai đúng với hạ tầng khóa công khai (PKI) và chứng thực số (digital certificate). Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('ký') && questionLower.includes('sign')) {
        explanation += `Chữ ký số RSA dùng <strong>khóa bí mật (private key)</strong> để ký (sign). Người gửi dùng khóa bí mật của mình để ký lên dữ liệu, tạo ra chữ ký số. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('xác thực') || (questionLower.includes('verify'))) {
        explanation += `Chữ ký số RSA dùng <strong>khóa công khai (public key)</strong> để xác thực (verify). Bất kỳ ai cũng có thể dùng khóa công khai của người ký để kiểm tra tính hợp lệ của chữ ký. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('trao đổi khóa')) {
        explanation += `RSA <strong>không</strong> cần phải trao đổi khóa trước khi truyền tin. Trong mã hóa bất đối xứng, khóa công khai có thể được công bố công khai, và bất kỳ ai cũng có thể dùng nó để mã hóa dữ liệu gửi cho người sở hữu khóa bí mật. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('kết hợp')) {
        explanation += `RSA thường được kết hợp với <strong>AES</strong> để mã hóa dữ liệu có kích thước lớn. RSA dùng để mã hóa khóa phiên (session key), và AES dùng để mã hóa dữ liệu thực tế với khóa phiên đó. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('năm') || questionLower.includes('1977') || questionLower.includes('công bố')) {
        explanation += `Thuật toán RSA được công bố lần đầu vào năm <strong>1977</strong> bởi Rivest, Shamir và Adleman. Tuy nhiên, trước đó vào năm 1973, Clifford Cocks tại GCHQ đã phát minh ra một thuật toán tương tự nhưng không được công bố. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('biết') || questionLower.includes('tính được') || questionLower.includes('p và q')) {
        explanation += `Nếu biết được hai số nguyên tố p và q, <strong>chắc chắn có thể</strong> tính được khóa bí mật RSA. Khi biết p và q, ta tính được φ(n) = (p-1)(q-1), và từ đó tính d = e⁻¹ mod φ(n). Đây là lý do RSA yêu cầu giữ bí mật p và q. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else if (questionLower.includes('công khai') || questionLower.includes('public-key')) {
        explanation += `RSA <strong>đúng</strong> là thuộc loại mã hóa khóa công khai (public-key cryptography) hay còn gọi là mã hóa bất đối xứng. Đây là một trong những hệ thống mã hóa khóa công khai đầu tiên và phổ biến nhất. Đáp án đúng: <strong>${treasure}</strong>.`;
      } else {
        explanation += `Đây là câu hỏi lý thuyết về RSA. Câu trả lời đúng là <strong>${treasure}</strong>. Hãy ôn lại kiến thức về các thuật toán mã hóa (AES, RSA) cũng như các khái niệm bảo mật thông tin cơ bản để hiểu rõ hơn về đáp án này.`;
      }
    } else {
      explanation = `Đây là câu hỏi lý thuyết về mật mã học. Câu trả lời đúng là <strong>${treasure}</strong>. Hãy ôn lại kiến thức về các thuật toán mã hóa (AES, RSA) cũng như các khái niệm bảo mật thông tin cơ bản để hiểu rõ hơn về đáp án này.`;
    }
  }

  lastPuzzleExplanation = explanation;
  text.innerHTML = explanation;
  panel.style.display = 'block';
  panel.style.visibility = 'visible';
  panel.hidden = false;
}

// ==================== Module 6: Giao diện và logic giải câu đố ====================
let decodeScreen = document.createElement('div');
decodeScreen.id = 'decode-screen';
decodeScreen.innerHTML = `
  <h3>Giải mã câu đố</h3>
  <p>Câu hỏi: <span id="puzzle-question"></span></p>
  <p id="puzzle-msg-row"><span id="puzzle-msg-label">Chuỗi mã hóa:</span> <span id="puzzle-msg"></span></p>
  <p id="puzzle-help" style="color:#333; font-size:0.95em; margin-top:6px;"></p>
  <p id="puzzle-key" style="white-space: pre-wrap; color:#222; font-size:0.95em; margin-top:8px;"></p>
  <select id="cipher-type">
    <option value="caesar">Caesar Cipher</option>
    <option value="vigenere">Vigenère Cipher</option>
    <option value="rsa">RSA</option>
    <option value="aes">AES</option>
    <option value="hash">Hash / Integrity</option>
    <option value="vuln">Vulnerability Detection</option>
    <option value="theory">Lý thuyết</option>
  </select>
  <input type="text" id="decode-input" placeholder="Nhập chuỗi giải mã">
  <button onclick="submitDecode()">Xác nhận</button>
  <button onclick="cancelDecodeScreen()">Hủy</button>
`;
document.body.appendChild(decodeScreen);
decodeScreen.style.display = 'none';

// ==================== Module 6.1: Tạo và hiển thị popup giải mã ====================
// Hiển thị popup câu đố và tạo chuỗi mã hóa tương ứng với loại cipher đang dùng.
function showDecodeScreen() {
  if (decodeScreen.style.display === 'block') return;
  decodeScreen.style.display = 'block';
  decodeScreen.style.zIndex = '4000';
  decodeScreen.style.pointerEvents = 'auto';
  const cipherType = (currentPuzzle.cipher_type || '').toLowerCase();
  const cleanedQuestion = cleanTechnicalHint(currentPuzzle.question || '');
  (async () => {
    if (cipherType === 'caesar') {
      let shift = Math.floor(Math.random() * 25) + 1;
      currentPuzzle.msg = caesarEncode(currentPuzzle.treasure, shift);
    } else if (cipherType === 'vigenere') {
      const key = Math.random().toString(36).slice(2, 7);
      currentPuzzle.key = key;
      currentPuzzle.msg = vigenereEncode(currentPuzzle.treasure, key);
    } else if (cipherType === 'rsa') {
      currentPuzzle.msg = rsaEncode(currentPuzzle.treasure);
    } else if (cipherType === 'aes') {
      const key = Math.random().toString(36).slice(2, 10);
      currentPuzzle.aesKey = key;
      currentPuzzle.msg = aesEncode(currentPuzzle.treasure, key);
    } else if (cipherType === 'hash') {
      const msgToShow = currentPuzzle.note && currentPuzzle.note.includes('message=') ? currentPuzzle.note.split('message=')[1].split(',')[0].replace(/\"/g, '') : currentPuzzle.treasure;
      const hex = await sha256Hex(msgToShow);
      currentPuzzle.msg = `${msgToShow} | SHA256: ${hex}`;
    } else if (cipherType === 'vuln') {
      currentPuzzle.msg = currentPuzzle.note || getVulnHint(currentPuzzle.vuln_type);
    } else if (cipherType === 'theory') {
      currentPuzzle.msg = "Đây là câu hỏi lý thuyết. Hãy nhập câu trả lời của bạn vào ô bên dưới.";
    } else {
      currentPuzzle.msg = "[Không xác định cipher]";
    }
    document.getElementById('puzzle-question').innerText = cleanedQuestion;
    document.getElementById('puzzle-msg').innerText = currentPuzzle.msg || '';
    const msgLabel = document.getElementById('puzzle-msg-label');
    if (msgLabel) {
      if (cipherType === 'hash') {
        msgLabel.innerText = 'Dữ liệu kiểm tra:';
      } else if (cipherType === 'vuln') {
        msgLabel.innerText = 'Manh mối / dữ liệu:';
      } else {
        msgLabel.innerText = 'Chuỗi mã hóa:';
      }
    }
    const helpEl = document.getElementById('puzzle-help');
    if (helpEl) {
      if (cipherType === 'vuln') {
        helpEl.innerText = currentPuzzle.note ? '' : 'Nhập tên lỗ hổng hoặc mô tả ngắn (ví dụ: "nonce reuse", "replay attack").';
      } else if (cipherType === 'hash') {
        helpEl.innerText = 'Hướng dẫn: kiểm tra chuỗi dữ liệu và trả "OK" nếu hợp lệ hoặc "TAMPERED" nếu bị thay đổi.';
      } else if (cipherType === 'rsa') {
        helpEl.innerHTML = rsaKey.description ? `Khóa RSA chung đang được lưu ở: ${rsaKey.description}. <a href="#" id="reveal-rsa-key-link">Xem khóa RSA</a>` : 'Khóa RSA chung đang được lưu trong thư mục data/keys. <a href="#" id="reveal-rsa-key-link">Xem khóa RSA</a>';
        const rsaLink = document.getElementById('reveal-rsa-key-link');
        if (rsaLink) {
          rsaLink.addEventListener('click', (event) => {
            event.preventDefault();
            revealRsaKey();
          });
        }
      } else if (cipherType === 'aes') {
        if (currentPuzzle.aesKey) {
          helpEl.innerHTML = `Khóa AES hiện được tạo ngẫu nhiên. <a href="#" id="reveal-aes-key-link">Xem khóa AES</a>`;
          const aesLink = document.getElementById('reveal-aes-key-link');
          if (aesLink) {
            aesLink.addEventListener('click', (event) => {
              event.preventDefault();
              revealAesKey();
            });
          }
        } else {
          helpEl.innerText = 'Hướng dẫn: đây là AES Cipher, khóa sẽ được tạo tự động và ẩn để người chơi xem khi cần.';
        }
      } else if (cipherType === 'vigenere') {
        if (currentPuzzle.key) {
          helpEl.innerHTML = `Hướng dẫn: khóa đang dùng được ẩn. <a href="#" id="reveal-vigenere-key-link">Xem khóa</a>`;
          const vigenereLink = document.getElementById('reveal-vigenere-key-link');
          if (vigenereLink) {
            vigenereLink.addEventListener('click', (event) => {
              event.preventDefault();
              revealVigenereKey();
            });
          }
        } else {
          helpEl.innerText = 'Hướng dẫn: đây là Vigenère Cipher, hãy chú ý đến khóa lặp lại.';
        }
      } else {
        helpEl.innerText = '';
      }
    }
    // Set cipher selector to the puzzle's type for clarity
    const sel = document.getElementById('cipher-type');
    if (sel) sel.value = currentPuzzle.cipher_type || '';
  })();
}

// ==================== Module 6.2: Ẩn và làm mới popup giải mã ====================
// Ẩn popup câu đố và reset ô nhập để người chơi có thể tiếp tục di chuyển.
function hideDecodeScreen() {
  decodeScreen.style.display = 'none';
  // Blur input field để phím mũi tên hoạt động bình thường
  document.getElementById('decode-input').blur();
  document.getElementById('decode-input').value = '';
  const helpEl = document.getElementById('puzzle-help');
  if (helpEl) helpEl.innerText = '';
  const keyEl = document.getElementById('puzzle-key');
  if (keyEl) keyEl.innerHTML = '';
  window.focus();
}

// ==================== Module 6.3: Hỗ trợ hiển thị khóa và xử lý giải thích ====================
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function revealVigenereKey() {
  const keyEl = document.getElementById('puzzle-key');
  if (!keyEl) return;
  keyEl.innerText = `Khóa Vigenère hiện tại: ${currentPuzzle.key}`;
}

function revealAesKey() {
  const keyEl = document.getElementById('puzzle-key');
  if (!keyEl) return;
  keyEl.innerText = `Khóa AES hiện tại: ${currentPuzzle.aesKey}`;
}

function revealRsaKey() {
  const keyEl = document.getElementById('puzzle-key');
  if (!keyEl) return;
  const publicPath = rsaKey.public_key_path ? `../data/${rsaKey.public_key_path}` : '../data/keys/public.pem';
  const privatePath = rsaKey.private_key_path ? `../data/${rsaKey.private_key_path}` : '../data/keys/private.pem';
  keyEl.innerText = 'Đang tải khóa RSA...';

  const fetchText = (path) => fetch(path).then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.text();
  });

  Promise.all([fetchText(publicPath), fetchText(privatePath)])
    .then(([publicKey, privateKey]) => {
      keyEl.innerHTML = `<strong>Public key RSA:</strong><pre>${escapeHtml(publicKey)}</pre><strong>Private key RSA:</strong><pre>${escapeHtml(privateKey)}</pre>`;
    })
    .catch(() => {
      keyEl.innerText = 'Không thể tải khóa RSA. Vui lòng kiểm tra lại đường dẫn hoặc server.';
    });
}

function cleanTechnicalHint(text) {
  return text.replace(/\s*\(câu hỏi kĩ thuật:[^)]*\)\s*/gi, '').trim();
}

function getVulnHint(vulnType) {
  if (!vulnType) {
    return 'Nhập tên lỗ hổng hoặc mô tả ngắn phù hợp với câu hỏi.';
  }
  const hints = {
    replay: 'Đặc điểm: cùng một giao dịch, tin nhắn hoặc dữ liệu bị gửi lại nhiều lần; hệ thống dùng lại thông tin cũ thay vì tạo thông điệp mới.',
    nonce_reuse: 'Đặc điểm: một giá trị chỉ dùng một lần như nonce hoặc IV bị tái sử dụng, làm mất tính ngẫu nhiên và cho phép kẻ tấn công so sánh các bản mã.',
    unsalted_hash: 'Đặc điểm: hàm băm được tính mà không có salt, khiến cùng dữ liệu luôn cho cùng một hash và dễ bị dò tìm qua bảng tra cứu.'
  };
  return hints[vulnType] || 'Nhập tên lỗ hổng phù hợp với nội dung câu hỏi.';
}

// ==================== Module 6.4: Câu hỏi đặc biệt map 5 ====================
// Tạo và hiển thị màn hình câu hỏi đặc biệt cho map 5.
function showSpecialQuestionScreen() {
  specialQuestionActive = true;
  let screen = document.getElementById('special-question-screen');
  if (!screen) {
    screen = document.createElement('div');
    screen.id = 'special-question-screen';
    screen.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 4000;
      pointer-events: auto;
    `;
    screen.innerHTML = `
      <div style="background: white; padding: 24px 28px; border-radius: 10px; width: min(92vw, 420px); text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.35);">
        <h3 style="margin-top: 0; color: #333;">Câu hỏi cuối cùng</h3>
        <p style="margin: 12px 0; font-size: 1.05em; color: #444;">Bản chất của thế giới là gì?</p>
        <input id="special-question-input" type="text" placeholder="Nhập câu trả lời" style="width: 100%; padding: 8px; box-sizing: border-box; margin-bottom: 12px;">
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="submitSpecialQuestion()" style="padding: 8px 16px; border: none; border-radius: 5px; background: #667eea; color: white; cursor: pointer;">Xác nhận</button>
          <button onclick="skipSpecialQuestion()" style="padding: 8px 16px; border: none; border-radius: 5px; background: #ff6b6b; color: white; cursor: pointer;">Bỏ qua</button>
        </div>
      </div>
    `;
    document.body.appendChild(screen);
  }
  screen.style.display = 'flex';
  const input = document.getElementById('special-question-input');
  if (input) {
    input.value = '';
    input.focus();
  }
}

function hideSpecialQuestionScreen() {
  const screen = document.getElementById('special-question-screen');
  if (screen) {
    screen.style.display = 'none';
  }
  specialQuestionActive = false;
}

function submitSpecialQuestion() {
  const input = document.getElementById('special-question-input').value.trim().toLowerCase();
  const answeredCorrectly = input === 'code' || input === 'code!';
  if (answeredCorrectly) {
    score += 100;
    levelScore += 100;
    updateUI();
    showGameFeedback('🎉 Bạn đã phá đảo trò chơi!');
  }
  hideSpecialQuestionScreen();
  finishSpecialMap5();
}

function skipSpecialQuestion() {
  hideSpecialQuestionScreen();
  finishSpecialMap5();
}

function finishSpecialMap5() {
  gameCompleted = true;
  updateUI();
  showCompleteScreen();
}

// ==================== Module 6.5: Hủy và reset trạng thái giải mã ====================
// Hủy lời giải câu đố: đưa người chơi quay lại vị trí cũ và trả câu đố về hàng chờ.
function cancelDecodeScreen() {
  if (currentPuzzle && currentPuzzle.pending) {
    currentPuzzles.push(currentPuzzle);
    pendingPuzzles = pendingPuzzles.filter(entry => entry.puzzle !== currentPuzzle);
    currentPuzzle.pending = false;
    currentPuzzle.gem = null;
  }

  if (puzzleRestorePosition) {
    player.gridX = puzzleRestorePosition.gridX;
    player.gridY = puzzleRestorePosition.gridY;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    moveMummy();
  }
  currentPuzzle = {};
  puzzleRestorePosition = null;
  hideDecodeScreen();
}

// Xác nhận câu trả lời của người chơi và cộng điểm nếu đáp án đúng.
function submitDecode() {
  let input = document.getElementById('decode-input').value.toLowerCase().trim();
  let cipherType = document.getElementById('cipher-type').value;
  let feedback = document.createElement('div');
  feedback.id = 'feedback';
  document.body.appendChild(feedback);
  feedback.style.display = 'none';

  const normalizedTreasure = (currentPuzzle.treasure || '').toString().toLowerCase().trim();

  // Vulnerability detection
  if (cipherType === 'vuln' || currentPuzzle.cipher_type === 'vuln') {
    const answers = (currentPuzzle.vuln_answers || []).map(a => a.toLowerCase());
    if (answers.includes(input)) {
      feedback.innerText = "Phát hiện lỗi bảo mật đúng!";
      const puzzlePoints = puzzlePointsByLevel[level - 1] || 0;
      score += puzzlePoints;
      levelScore += puzzlePoints;
      updateUI();
      showPuzzleExplanation(currentPuzzle, input);
      if (currentPuzzle.gem) gems = gems.filter(item => item !== currentPuzzle.gem);
      pendingPuzzles = pendingPuzzles.filter(entry => entry.puzzle !== currentPuzzle);
      currentPuzzle.pending = false;
      currentPuzzle.gem = null;
      currentPuzzle = {};
      puzzleRestorePosition = null;
      hideDecodeScreen();
      mummyPauseSteps = 2;
      saveProgress();
    } else {
      feedback.innerText = "Chưa đúng. Hãy thử lại.";
      moveMummy();
    }
    feedback.style.display = 'block';
    setTimeout(() => feedback.style.display = 'none', 2000);
    return;
  }

  if (cipherType === currentPuzzle.cipher_type && input === normalizedTreasure) {
    feedback.innerText = "Thông điệp đã được giải mã thành công! Tiếp tục.";
    const puzzlePoints = puzzlePointsByLevel[level - 1] || 0;
    score += puzzlePoints;
    levelScore += puzzlePoints;
    updateUI();
    showPuzzleExplanation(currentPuzzle, input);
    if (currentPuzzle.gem) {
      gems = gems.filter(item => item !== currentPuzzle.gem);
    }
    pendingPuzzles = pendingPuzzles.filter(entry => entry.puzzle !== currentPuzzle);
    currentPuzzle.pending = false;
    currentPuzzle.gem = null;
    currentPuzzle = {};
    puzzleRestorePosition = null;
    hideDecodeScreen();
    mummyPauseSteps = 2; // Xác ướp đứng im 2 bước của người chơi sau khi giải xong
    saveProgress();
  } else {
    feedback.innerText = "Giải mã thất bại. Xác ướp đã đến gần bạn hơn.";
    moveMummy();
  }
  feedback.style.display = 'block';
  setTimeout(() => feedback.style.display = 'none', 2000);
}

// ==================== Module 6.6: Xác nhận và kiểm tra giải mã ====================
// Save/load progress
function serializePuzzle(puzzle) {
  if (!puzzle) return null;
  return {
    question: puzzle.question,
    treasure: puzzle.treasure,
    cipher_type: puzzle.cipher_type,
    note: puzzle.note,
    vuln_answers: puzzle.vuln_answers,
    vuln_type: puzzle.vuln_type,
    pending: puzzle.pending,
    gem: puzzle.gem ? { x: puzzle.gem.x, y: puzzle.gem.y } : null
  };
}

function saveProgress() {
  try {
    const elapsedTime = startTime > 0 ? Date.now() - startTime : 0;
    const data = {
      level,
      score,
      levelScore,
      player: {
        gridX: player.gridX,
        gridY: player.gridY,
        prevGridX: player.prevGridX,
        prevGridY: player.prevGridY,
        x: player.x,
        y: player.y
      },
      mummies: (mummies.length > 0 ? mummies : [mummy]).map(m => ({
        gridX: m.gridX,
        gridY: m.gridY,
        x: m.x,
        y: m.y
      })),
      mummyPauseSteps,
      elapsedTime,
      gems: gems.map(g => ({ x: g.x, y: g.y })),
      currentPuzzles: currentPuzzles.map(serializePuzzle),
      pendingPuzzles: pendingPuzzles.map(entry => ({
        puzzle: serializePuzzle(entry.puzzle),
        gem: { x: entry.gem.x, y: entry.gem.y },
        restorePosition: entry.restorePosition
      })),
      currentPuzzle: serializePuzzle(currentPuzzle),
      updated: Date.now()
    };
    localStorage.setItem('gameProgress', JSON.stringify(data));
  } catch (e) {
    console.warn('Không thể lưu tiến độ', e);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('gameProgress');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearProgress() {
  try {
    localStorage.removeItem('gameProgress');
  } catch (e) {
    console.warn('Không thể xóa tiến độ', e);
  }
}

// ==================== Module 6.7: Lưu và tải tiến độ trò chơi ====================
function applySavedProgress(saved) {
  if (!saved) return;
  level = saved.level || initialLevel;
  score = saved.score || 0;
  levelScore = saved.levelScore || 0;
  startTime = Date.now() - (saved.elapsedTime || 0);
  const homeScreen = document.getElementById('home-screen');
  const gameContainer = document.getElementById('game-container');
  const infoContainer = document.getElementById('info-container');
  if (homeScreen) homeScreen.style.display = 'none';
  if (gameContainer) gameContainer.style.display = 'flex';
  if (infoContainer) infoContainer.style.display = 'flex';

  initMap(level, () => {
    player.gridX = saved.player.gridX;
    player.gridY = saved.player.gridY;
    player.prevGridX = saved.player.prevGridX;
    player.prevGridY = saved.player.prevGridY;
    player.x = saved.player.x;
    player.y = saved.player.y;

    if (Array.isArray(saved.mummies) && saved.mummies.length > 0) {
      mummies = saved.mummies.map(m => ({ x: m.x, y: m.y, gridX: m.gridX, gridY: m.gridY }));
      mummy = { ...mummies[0] };
    } else if (saved.mummy) {
      mummy = { x: saved.mummy.x, y: saved.mummy.y, gridX: saved.mummy.gridX, gridY: saved.mummy.gridY };
      mummies = [mummy];
    }
    mummyPauseSteps = typeof saved.mummyPauseSteps === 'number' ? saved.mummyPauseSteps : 0;

    if (saved.gems && Array.isArray(saved.gems)) {
      gems = saved.gems.map(g => ({ x: g.x, y: g.y }));
    }

    currentPuzzles = Array.isArray(saved.currentPuzzles) ? saved.currentPuzzles.map(p => ({ ...p })) : [];
    pendingPuzzles = Array.isArray(saved.pendingPuzzles) ? saved.pendingPuzzles.map(entry => ({
      puzzle: { ...entry.puzzle },
      gem: { ...entry.gem },
      restorePosition: entry.restorePosition
    })) : [];
    currentPuzzle = saved.currentPuzzle ? { ...saved.currentPuzzle } : {};
    updateUI();
  });
}

function resumeSavedProgress(saved) {
  savedProgressToResume = null;
  applySavedProgress(saved);
}

// Mã hóa chuỗi bằng Caesar Cipher để tạo câu đố cho người chơi giải.
function caesarEncode(text, shift) {
  return text.toLowerCase().split('').map(char => {
    if (char.match(/[a-z]/)) {
      return String.fromCharCode((char.charCodeAt(0) - 97 + shift) % 26 + 97);
    }
    return char;
  }).join('');
}

function vigenereEncode(text, key) {
  text = text.toLowerCase();
  key = key.toLowerCase();
  let out = '';
  let ki = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c >= 'a' && c <= 'z') {
      const k = key[ki % key.length].charCodeAt(0) - 97;
      out += String.fromCharCode((c.charCodeAt(0) - 97 + k) % 26 + 97);
      ki++;
    } else {
      out += c;
    }
  }
  return out;
}

async function sha256Hex(message) {
  if (window.crypto && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(message));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex;
  }
  // Fallback: simple non-cryptographic hash (for offline/dev)
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) - hash) + message.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}

// ==================== Module 6.8: Mã hóa và băm hỗ trợ câu đố ====================
function rsaEncode(text) {
  return text.toLowerCase().split('').map(char => {
    if (char.match(/[a-z]/)) {
      return char.charCodeAt(0).toString(16);
    }
    if (char === ' ') {
      return '20';
    }
    return char;
  }).join(' ');
}

function aesEncode(text, key) {
  if (!key) {
    return btoa(text.toLowerCase());
  }

  const normalized = text.toLowerCase();
  let transformed = '';
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    transformed += String.fromCharCode(charCode ^ keyCode);
  }

  try {
    return btoa(transformed);
  } catch (error) {
    return transformed.split('').map(char => char.charCodeAt(0).toString(16)).join('');
  }
}

// ==================== Module 7: Tiện ích và màn hình kết thúc ====================
// ==================== Module 7.1: Tiện ích chung ====================
function resetPuzzles() {
  levelScore = 0;
  currentPuzzles = puzzles[level - 1].puzzles.map(p => ({ ...p }));
  pendingPuzzles = [];
  currentPuzzle = {};
}

function formatTime(milliseconds) {
  let totalSeconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

// ==================== Module 7.2: Reset trạng thái và chơi lại ====================
function resetGameState() {
  score = 0;
  levelScore = 0;
  currentPuzzles = [];
  currentPuzzle = {};
  pendingPuzzles = [];
  gameOverFlag = false;
  gameCompleted = false;
  gameOverReason = '';
  mummyPauseSteps = 0;
  puzzleRestorePosition = null;
  specialQuestionActive = false;
  burnEffect.active = false;
  headFallEffect.active = false;
  // Đặt vị trí player và mummy ngay lập tức nếu ta đã biết vị trí bắt đầu của map
  if (startPositions[level]) {
    player.gridX = startPositions[level].x;
    player.gridY = startPositions[level].y;
    player.prevGridX = player.gridX;
    player.prevGridY = player.gridY;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    mummies = [];
    mummy = { x: 0, y: 0, gridX: 0, gridY: 0 };
  }
  const lostScreen = document.getElementById('lost-screen');
  if (lostScreen) {
    lostScreen.style.display = 'none';
  }
  const decodeScreen = document.getElementById('decode-screen');
  if (decodeScreen) {
    decodeScreen.style.display = 'none';
  }
  const nameInputScreen = document.getElementById('name-input-screen');
  if (nameInputScreen) {
    nameInputScreen.classList.remove('show');
  }
  const completeScreen = document.getElementById('complete-screen');
  if (completeScreen) {
    completeScreen.classList.remove('show');
  }
  const homeScreen = document.getElementById('home-screen');
  if (homeScreen) {
    homeScreen.style.display = 'none';
  }
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.style.display = 'flex';
  }
  const infoContainer = document.getElementById('info-container');
  if (infoContainer) {
    infoContainer.style.display = 'flex';
  }
  if (lostScreenTimeout) {
    clearTimeout(lostScreenTimeout);
    lostScreenTimeout = null;
  }
  startTime = Date.now();
  initMap(level);
}

function restartGame() {
  if (ingameSong) {
    ingameSong.currentTime = 0;
    ingameSong.play().catch(() => { });
  }
  // Quay về map khởi đầu khi chơi lại
  level = initialLevel;
  resetGameState();
}

// ==================== Module 7.3: Màn hình hoàn thành ====================
// Hiển thị màn hình hoàn thành trò chơi và cho phép người chơi nhập tên.
function showCompleteScreen() {
  savedProgressToResume = null;
  clearProgress();

  let elapsedTime = Date.now() - startTime;
  let timeStr = formatTime(elapsedTime);

  // Hiển thị thông tin trong dialog nhập tên
  document.getElementById('completion-stats').innerText = `Thời gian: ${timeStr} | Tổng điểm: ${score}`;

  // Hiển thị dialog nhập tên người chơi
  document.getElementById('name-input-screen').classList.add('show');
  document.getElementById('player-name-input').value = '';
  document.getElementById('player-name-input').focus();
}

// ==================== Module 7.4: Màn hình thua cuộc ====================
// Hiển thị màn hình thua và báo lại thời gian cũng như điểm số đạt được.
function showLostScreen() {
  clearProgress();
  let lostScreen = document.getElementById('lost-screen');

  // Tạo element nếu chưa tồn tại
  if (!lostScreen) {
    lostScreen = document.createElement('div');
    lostScreen.id = 'lost-screen';
    lostScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1001;
    `;
    lostScreen.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
      ">
        <h2 style="font-size: 2em; color: #ff6b6b; margin-bottom: 20px;">💀 Bạn đã thua cuộc!</h2>
        <p id="lost-reason" style="font-size: 1.2em; margin: 15px 0; color: #333;"></p>
        <p id="lost-stats" style="font-size: 1em; color: #666; margin: 15px 0;"></p>
        <div style="display:flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
          <button id="retry-btn-lost" style="
            padding: 12px 30px;
            font-size: 1em;
            background-color: #38b2ac;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          ">Chơi lại</button>
          <button id="home-btn-lost" style="
            padding: 12px 30px;
            font-size: 1em;
            background-color: #ff6b6b;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          ">Về trang chủ</button>
        </div>
      </div>
    `;
    document.body.appendChild(lostScreen);

    // Thêm event listener cho nút chơi lại và về trang chủ
    document.getElementById('retry-btn-lost').addEventListener('click', () => {
      restartGame();
    });
    document.getElementById('home-btn-lost').addEventListener('click', () => {
      location.reload();
    });
  }

  const lostReason = document.getElementById('lost-reason');
  if (lostReason) {
    lostReason.innerText = gameOverReason === 'lava'
      ? 'Bạn đã bị dung nham nuốt chửng!'
      : 'Bạn đã bị xác ướp bắt được!';
  }

  // Hiển thị thông tin trò chơi
  let elapsedTime = Date.now() - startTime;
  let timeStr = formatTime(elapsedTime);
  document.getElementById('lost-stats').innerText = `Thời gian chơi: ${timeStr} | Điểm số: ${score}`;

  lostScreen.style.display = 'flex';
}