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
  const themeSong = document.getElementById('theme-song');
  const ingameSong = document.getElementById('ingame-song');
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
    document.addEventListener(eventName, retryThemeSong, { once: true });
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
let lavaImage;
let player = { x: 50, y: 550, speed: 0, size: 20, gridX: 1, gridY: 11, prevGridX: 1, prevGridY: 11 };
let mummy = { x: 0, y: 0, gridX: 0, gridY: 0 };
let objectivePos = { x: 0, y: 0 };
let grid = [];
let gems = [];
let enemies = [];
let lava = [];
let level = 4;
let score = 0;
let levelScore = 0;
let currentPuzzles = []; 
let currentPuzzle = {};
let pendingPuzzles = [];
let puzzles = [];
let gameOverFlag = false;
let gameOverReason = '';
let mummyPauseSteps = 0;
let puzzleRestorePosition = null;
const tileSize = 50;
const levelScores = [10, 20, 30, 40];
const puzzlePointsByLevel = [5, 10, 15, 20];
const mapCompletionBonusByLevel = [10, 20, 30, 40];

// ==================== Module 4: Tải bản đồ, ảnh và dữ liệu câu đố ====================
function preload() {
  playerImage = loadImage('data/picture/adventurer.png');
  mummyImage = loadImage('data/picture/mummy.png');
  wallImage = loadImage('data/picture/wall.png');
  lavaImage = loadImage('data/picture/lava.jpg');
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
  if (gameCompleted || gameOverFlag) return; // Dừng vẽ khi game hoàn thành hoặc thua
  background(50);
  drawMap();
  drawMummy();
  drawPlayer();
  checkCollisions();
  updateTimer();
}

function initMap(level) {
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

// Khởi tạo các đối tượng trên bản đồ như gem, kẻ địch, lava và vị trí mục tiêu.
function initElements() {
  gems = [];
  enemies = [];
  lava = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'G') gems.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 });
      if (grid[y][x] === 'E') enemies.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 });
      if (grid[y][x] === 'L') lava.push({ x: x * tileSize, y: y * tileSize, w: tileSize, h: tileSize });
      if (grid[y][x] === 'O') {
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
      } else if (grid[y][x] === 'P') {
        // Sand color for platforms
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
      } else if (grid[y][x] === 'O') {
        fill(105, 105, 105); 
        rect(posX, posY, tileSize, tileSize);
      }
    }
  }
  fill(0, 191, 255);
  for (let g of gems) ellipse(g.x, g.y, 15, 15);
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
function keyPressed() {
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
      gameOverFlag = true;
      gameOverReason = 'lava';
      showLostScreen();
      return;
    }

    let decodeScreen = document.getElementById('decode-screen');
    if (decodeScreen && decodeScreen.style.display !== 'block') {
      if (mummyPauseSteps > 0) {
        mummyPauseSteps -= 1;
      } else {
        moveMummy();
      }
    }
  }
}

// Di chuyển xác ướp theo hướng gần người chơi nhất, ưu tiên đường thẳng trước.
function moveMummy() {
  let dx = player.gridX - mummy.gridX;
  let dy = player.gridY - mummy.gridY;
  let tryMoves = [];

  // Ưu tiên hướng gần hơn
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx < 0) tryMoves.push({ x: -1, y: 0 });
    else if (dx > 0) tryMoves.push({ x: 1, y: 0 });
    if (dy < 0) tryMoves.push({ x: 0, y: -1 });
    else if (dy > 0) tryMoves.push({ x: 0, y: 1 });
  } else {
    if (dy < 0) tryMoves.push({ x: 0, y: -1 });
    else if (dy > 0) tryMoves.push({ x: 0, y: 1 });
    if (dx < 0) tryMoves.push({ x: -1, y: 0 });
    else if (dx > 0) tryMoves.push({ x: 1, y: 0 });
  }

  // Nếu hướng chính bị chặn, thử hướng phụ
  for (let move of tryMoves) {
    let newGridX = mummy.gridX + move.x;
    let newGridY = mummy.gridY + move.y;
    if (grid[newGridY] && grid[newGridY][newGridX] !== 'W') {
      mummy.gridX = newGridX;
      mummy.gridY = newGridY;
      mummy.x = mummy.gridX * tileSize + tileSize / 2;
      mummy.y = mummy.gridY * tileSize + tileSize / 2;
      return;
    }
  }
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
  // Kiểm tra va chạm với xác ườbp
  if (dist(player.x, player.y, mummy.x, mummy.y) < 25) {
    gameOverFlag = true;
    gameOverReason = 'mummy';
    showLostScreen();
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
  let shift = currentPuzzle.cipher_type === 'caesar' ? floor(random(1, 26)) : null;
  if (currentPuzzle.cipher_type === 'caesar') {
    currentPuzzle.msg = caesarEncode(currentPuzzle.treasure, shift);
  } else if (currentPuzzle.cipher_type === 'rsa') {
    currentPuzzle.msg = "Encrypted RSA " + floor(random(1, 100));
  } else if (currentPuzzle.cipher_type === 'aes') {
    currentPuzzle.msg = "Encrypted AES " + floor(random(1, 100));
  }
  document.getElementById('puzzle-question').innerText = currentPuzzle.question;
  document.getElementById('puzzle-msg').innerText = currentPuzzle.msg;
}

// Ẩn popup câu đố và reset ô nhập để người chơi có thể tiếp tục di chuyển.
function hideDecodeScreen() {
  decodeScreen.style.display = 'none';
  // Blur input field để phím mũi tên hoạt động bình thường
  document.getElementById('decode-input').blur();
  document.getElementById('decode-input').value = '';
  window.focus();
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
    feedback.innerText = "Giải mã thất bại. Hãy chọn thuật toán đúng và nhập chuỗi phù hợp.";
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
        <button id="home-btn-lost" style="
          margin-top: 20px;
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
    `;
    document.body.appendChild(lostScreen);
    
    // Thêm event listener cho nút về trang chủ
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