// ==================== Module 1: Trang chủ và âm thanh ====================
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const homeBtn = document.getElementById('home-btn');
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

  if (homeScreen) {
    homeScreen.addEventListener('click', retryThemeSong);
    homeScreen.addEventListener('touchstart', retryThemeSong, { passive: true });
  }

  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      playIngameSong();
      gameCompleted = false;
      gameOverFlag = false;
      document.getElementById('home-screen').style.display = 'none';
      document.getElementById('game-container').style.display = 'flex';
      document.getElementById('info-container').style.display = 'none';
      startTime = Date.now(); // Bắt đầu đếm thời gian
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
let objectivePos = { x: 0, y: 0 };
let grid = [];
let gems = [];
let enemies = [];
let lava = [];
let teleports = [];
let level = 4;
let score = 0;
let levelScore = 0;
let currentPuzzles = []; 
let currentPuzzle = {};
let pendingPuzzles = [];
let puzzles = [];
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
const puzzlePointsByLevel = [5, 10, 15, 20];
const mapCompletionBonusByLevel = [10, 20, 30, 40];

function getAudioContext() {
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextCtor) {
      audioContext = new AudioContextCtor();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
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
  mummyBiteSound.play().catch(() => {});
}

function playLavaBurnSound() {
  ensureAudioUnlocked();
  if (!lavaBurnSound) return;
  lavaBurnSound.currentTime = 0;
  lavaBurnSound.volume = 0.5;
  lavaBurnSound.play().catch(() => {});
}

// ==================== Module 4: Tải bản đồ, ảnh và dữ liệu câu đố ====================
function preload() {
  playerImage = loadImage('data/picture/adventurer.png');
  mummyImage = loadImage('data/picture/mummy.png');
  wallImage = loadImage('data/picture/wall.png');
  lavaImage = loadImage('data/picture/lava.jpg');
  leverImage = loadImage('data/picture/lever.png');
  stairImage = loadImage('data/picture/stair.png');
  tpImage = loadImage('data/picture/tp.png');
  treasureImage = loadImage('data/picture/treasure.png');
  loadJSON('data/puzzles.json', (data) => {
    puzzles = data.levels;
  });
  loadJSON(`data/map${level}.json`, (data) => {
    grid = data.grid;
    player.gridX = data.start.x;
    player.gridY = data.start.y;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    initElements();
    resetPuzzles();
  });
}

function setup() {
  let canvas = createCanvas(12 * tileSize, 13 * tileSize);
  canvas.parent('game-canvas');
  updateUI();
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

function initMap(level) {
  loadJSON(`data/map${level}.json`, (data) => {
    grid = data.grid;
    player.gridX = data.start.x;
    player.gridY = data.start.y;
    player.prevGridX = player.gridX;
    player.prevGridY = player.gridY;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    initElements();
    resetPuzzles();
    updateUI();
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

// Khởi tạo các đối tượng trên bản đồ như gem, kẻ địch, lava và vị trí mục tiêu.
function initElements() {
  gems = [];
  enemies = [];
  lava = [];
  teleports = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'G') gems.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 });
      if (grid[y][x] === 'E' && level !== 4) enemies.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 });
      if (grid[y][x] === 'L') lava.push({ x: x * tileSize, y: y * tileSize, w: tileSize, h: tileSize });
      if (grid[y][x] === 'T') teleports.push({ x, y });
      if (grid[y][x] === 'O' || (grid[y][x] === 'E' && level === 4)) {
        objectivePos = { x, y };
        mummy.gridX = x;
        mummy.gridY = y;
        mummy.x = x * tileSize + tileSize / 2;
        mummy.y = y * tileSize + tileSize / 2;
      }
    }
  }
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
      } else if (grid[y][x] === 'E' && level === 4) {
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
  if (mummyImage) {
    const imgSize = 35;
    imageMode(CENTER);
    image(mummyImage, mummy.x, mummy.y, imgSize, imgSize);
  } else {
    fill(200, 150, 100);
    ellipse(mummy.x, mummy.y, 30, 30);
  }
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
    const map4SwitchesDone = gems.length === 0 && pendingPuzzles.length === 0 && currentPuzzles.length === 0;

    if (level === 4 && currentTile && (currentTile === 'O' || currentTile === 'E')) {
      if (!map4SwitchesDone) {
        showGameFeedback('Bạn chưa kích hoạt hết các công tắc');
      } else if (currentTile === 'E' && !specialQuestionActive) {
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
            playPromise.catch(() => {});
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
  const start = { x: mummy.gridX, y: mummy.gridY };
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
      if (
        nextY >= 0 && nextY < rows &&
        nextX >= 0 && nextX < cols &&
        !visited[nextY][nextX] &&
        grid[nextY][nextX] !== 'W'
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
    mummy.gridX = step.x;
    mummy.gridY = step.y;
    mummy.x = mummy.gridX * tileSize + tileSize / 2;
    mummy.y = mummy.gridY * tileSize + tileSize / 2;
  }
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
        playPromise.catch(() => {});
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
  // Kiểm tra va chạm với xác ướp
  if (dist(player.x, player.y, mummy.x, mummy.y) < 25) {
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
  // Kiểm tra đến đích
  if (grid[player.gridY][player.gridX] === 'O' && levelScore >= levelScores[level - 1]) {
    score += mapCompletionBonusByLevel[level - 1];
    updateUI();
    if (level < 4) {
      level++;
      levelScore = 0;
      currentPuzzles = []; 
      pendingPuzzles = [];
      currentPuzzle = {};
      initMap(level);
      updateUI();
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

// ==================== Module 6: Giao diện và logic giải câu đố ====================
let decodeScreen = document.createElement('div');
decodeScreen.id = 'decode-screen';
decodeScreen.innerHTML = `
  <h3>Giải mã câu đố</h3>
  <p>Câu hỏi: <span id="puzzle-question"></span></p>
  <p>Chuỗi mã hóa: <span id="puzzle-msg"></span></p>
  <select id="cipher-type">
    <option value="caesar">Caesar Cipher</option>
    <option value="vigenere">Vigenère Cipher</option>
    <option value="rsa">RSA</option>
    <option value="aes">AES</option>
  </select>
  <input type="text" id="decode-input" placeholder="Nhập chuỗi giải mã">
  <button onclick="submitDecode()">Xác nhận</button>
  <button onclick="cancelDecodeScreen()">Hủy</button>
`;
document.body.appendChild(decodeScreen);
decodeScreen.style.display = 'none';

// Hiển thị popup câu đố và tạo chuỗi mã hóa tương ứng với loại cipher đang dùng.
function showDecodeScreen() {
  if (decodeScreen.style.display === 'block') {
    return;
  }

  decodeScreen.style.display = 'block';
  const cipherType = (currentPuzzle.cipher_type || '').toLowerCase();
  let shift = cipherType === 'caesar' ? floor(random(1, 26)) : null;
  if (cipherType === 'caesar') {
    currentPuzzle.msg = caesarEncode(currentPuzzle.treasure, shift);
  } else if (cipherType === 'rsa') {
    currentPuzzle.msg = rsaEncode(currentPuzzle.treasure);
  } else if (cipherType === 'aes') {
    currentPuzzle.msg = aesEncode(currentPuzzle.treasure);
  } else {
    currentPuzzle.msg = "[Không xác định cipher]";
  }
  document.getElementById('puzzle-question').innerText = currentPuzzle.question || '';
  document.getElementById('puzzle-msg').innerText = currentPuzzle.msg || '';
}

// Ẩn popup câu đố và reset ô nhập để người chơi có thể tiếp tục di chuyển.
function hideDecodeScreen() {
  decodeScreen.style.display = 'none';
  // Blur input field để phím mũi tên hoạt động bình thường
  document.getElementById('decode-input').blur();
  document.getElementById('decode-input').value = '';
  window.focus();
}

// Tạo và hiển thị màn hình câu hỏi đặc biệt cho map 4.
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
      z-index: 2000;
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
  if (input === 'code') {
    score += 50;
    levelScore += 50;
    updateUI();
  }
  hideSpecialQuestionScreen();
  finishSpecialMap4();
}

function skipSpecialQuestion() {
  hideSpecialQuestionScreen();
  finishSpecialMap4();
}

function finishSpecialMap4() {
  gameCompleted = true;
  updateUI();
  showCompleteScreen();
}

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
  let input = document.getElementById('decode-input').value.toLowerCase();
  let cipherType = document.getElementById('cipher-type').value;
  let feedback = document.createElement('div');
  feedback.id = 'feedback';
  document.body.appendChild(feedback);
  feedback.style.display = 'none';

  if (cipherType === currentPuzzle.cipher_type && input === currentPuzzle.treasure.toLowerCase()) {
    feedback.innerText = "Thông điệp đã được giải mã thành công! Tiếp tục.";
    const puzzlePoints = puzzlePointsByLevel[level - 1] || 0;
    score += puzzlePoints;
    levelScore += puzzlePoints;
    updateUI();
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
  } else {
    feedback.innerText = "Giải mã thất bại. Xác ướp đã đến gần bạn hơn.";
    moveMummy();
  }
  feedback.style.display = 'block';
  setTimeout(() => feedback.style.display = 'none', 2000);
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

function aesEncode(text) {
  try {
    return btoa(text.toLowerCase());
  } catch (error) {
    return text.toLowerCase().split('').map(char => char.charCodeAt(0).toString(16)).join('');
  }
}

// ==================== Module 7: Tiện ích và màn hình kết thúc ====================
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
    infoContainer.style.display = 'none';
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
    ingameSong.play().catch(() => {});
  }
  resetGameState();
}

// Hiển thị màn hình hoàn thành trò chơi và cho phép người chơi nhập tên.
function showCompleteScreen() {
  let elapsedTime = Date.now() - startTime;
  let timeStr = formatTime(elapsedTime);
  
  // Hiển thị thông tin trong dialog nhập tên
  document.getElementById('completion-stats').innerText = `Thời gian: ${timeStr} | Tổng điểm: ${score}`;
  
  // Hiển thị dialog nhập tên người chơi
  document.getElementById('name-input-screen').classList.add('show');
  document.getElementById('player-name-input').value = '';
  document.getElementById('player-name-input').focus();
}

// Hiển thị màn hình thua và báo lại thời gian cũng như điểm số đạt được.
function showLostScreen() {
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