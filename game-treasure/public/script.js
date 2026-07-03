// Xử lý trang chủ
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
  
  // Hiển thị leaderboard khi trang load
  displayLeaderboard();
  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
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

function closeLeaderboard() {
  document.getElementById('leaderboard').classList.remove('show');
  document.getElementById('leaderboard-overlay').classList.remove('show');
}

let startTime = 0;
let gameCompleted = false;
let playerCount = parseInt(localStorage.getItem('playerCount')) || 0;

function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':').map(part => parseInt(part, 10));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
  return parts[0] * 60000 + parts[1] * 1000;
}

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
function getLeaderboard() {
  const data = localStorage.getItem('leaderboard');
  const leaderboard = data ? JSON.parse(data) : [];
  const cleaned = dedupeLeaderboard(leaderboard);
  if (cleaned.length !== leaderboard.length) {
    localStorage.setItem('leaderboard', JSON.stringify(cleaned));
  }
  return cleaned;
}

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
let player = { x: 50, y: 550, speed: 0, size: 20, gridX: 1, gridY: 11 };
let mummy = { x: 0, y: 0, gridX: 0, gridY: 0 };
let objectivePos = { x: 0, y: 0 };
let grid = [];
let gems = [];
let enemies = [];
let lava = [];
let level = 4;
let score = 0;
let currentPuzzles = []; 
let currentPuzzle = {};
let puzzles = [];
let gameOverFlag = false;
const tileSize = 50;
const levelScores = [10, 20, 30, 40]; 

function preload() {
  playerImage = loadImage('data/picture/adventurer.png');
  mummyImage = loadImage('data/picture/mummy.png');
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

function drawMap() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      let posX = x * tileSize;
      let posY = y * tileSize;
      if (grid[y][x] === 'W') {
        fill(139, 69, 19); 
        rect(posX, posY, tileSize, tileSize);
      } else if (grid[y][x] === 'P') {
        fill(34, 139, 34); 
        rect(posX, posY, tileSize, tileSize);
      } else if (grid[y][x] === 'L') {
        fill(255, 215, 0); 
        rect(posX, posY, tileSize, tileSize);
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

function keyPressed() {
  let newGridX = player.gridX;
  let newGridY = player.gridY;

  if (keyCode === LEFT_ARROW && player.gridX > 0) newGridX--;
  if (keyCode === RIGHT_ARROW && player.gridX < 11) newGridX++;
  if (keyCode === UP_ARROW && player.gridY > 0) newGridY--;
  if (keyCode === DOWN_ARROW && player.gridY < 11) newGridY++;

  if (grid[newGridY][newGridX] !== 'W') {
    player.gridX = newGridX;
    player.gridY = newGridY;
    player.x = player.gridX * tileSize + tileSize / 2;
    player.y = player.gridY * tileSize + tileSize / 2;
    
    // Xác ướp chỉ di chuyển nếu màn hình giải đố KHÔNG hiển thị
    let decodeScreen = document.getElementById('decode-screen');
    if (decodeScreen && decodeScreen.style.display !== 'block') {
      moveMummy();
    }
  }
}

function moveMummy() {
  // Xác ướp đi theo nhân vật sử dụng tiến cận ngây ngô lộp
  let newGridX = mummy.gridX;
  let newGridY = mummy.gridY;
  
  // Tiến cận ngây ngô (simple greedy pathfinding)
  if (player.gridX < mummy.gridX) newGridX--;
  else if (player.gridX > mummy.gridX) newGridX++;
  else if (player.gridY < mummy.gridY) newGridY--;
  else if (player.gridY > mummy.gridY) newGridY++;
  
  // Kiểm tra có thể đi hay không
  if (grid[newGridY] && grid[newGridY][newGridX] !== 'W') {
    mummy.gridX = newGridX;
    mummy.gridY = newGridY;
    mummy.x = mummy.gridX * tileSize + tileSize / 2;
    mummy.y = mummy.gridY * tileSize + tileSize / 2;
  }
}

function checkCollisions() {
  // Kiểm tra va chạm với gem
  for (let g of gems) {
    if (dist(player.x, player.y, g.x, g.y) < 20) {
      gems = gems.filter(item => item !== g);
      if (currentPuzzles.length > 0) {
        currentPuzzle = currentPuzzles.shift(); 
        updateUI();
        showDecodeScreen();
      }
      break;
    }
  }
  // Kiểm tra va chạm với xác ườbp
  if (dist(player.x, player.y, mummy.x, mummy.y) < 25) {
    gameOverFlag = true;
    showLostScreen();
    return;
  }
  // Kiểm tra đến đích
  if (grid[player.gridY][player.gridX] === 'O' && score >= levelScores[level - 1]) {
    if (level < 4) {
      level++;
      score = 0; 
      currentPuzzles = []; 
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
  <button onclick="hideDecodeScreen()">Hủy</button>
`;
document.body.appendChild(decodeScreen);
decodeScreen.style.display = 'none';

function showDecodeScreen() {
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

function hideDecodeScreen() {
  decodeScreen.style.display = 'none';
  // Blur input field để phím mũi tên hoạt động bình thường
  document.getElementById('decode-input').blur();
  document.getElementById('decode-input').value = '';
}

function submitDecode() {
  let input = document.getElementById('decode-input').value.toLowerCase();
  let cipherType = document.getElementById('cipher-type').value;
  let feedback = document.createElement('div');
  feedback.id = 'feedback';
  document.body.appendChild(feedback);
  feedback.style.display = 'none';

  if (cipherType === currentPuzzle.cipher_type && input === currentPuzzle.treasure.toLowerCase()) {
    feedback.innerText = "Thông điệp đã được giải mã thành công! Tiếp tục.";
    score += 10; 
    hideDecodeScreen();
    moveMummy(); // Xác ướp bắt đầu di chuyển lại sau khi giải xong
  } else {
    feedback.innerText = "Giải mã thất bại. Hãy chọn thuật toán đúng và nhập chuỗi phù hợp.";
  }
  feedback.style.display = 'block';
  setTimeout(() => feedback.style.display = 'none', 2000);
}

function caesarEncode(text, shift) {
  return text.toLowerCase().split('').map(char => {
    if (char.match(/[a-z]/)) {
      return String.fromCharCode((char.charCodeAt(0) - 97 + shift) % 26 + 97);
    }
    return char;
  }).join('');
}

function resetPuzzles() {
  currentPuzzles = [...puzzles[level - 1].puzzles]; 
  currentPuzzle = {}; 
}

function formatTime(milliseconds) {
  let totalSeconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

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
        <p style="font-size: 1.2em; margin: 15px 0; color: #333;">Xác ướp đã bắt được bạn!</p>
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
  
  // Hiển thị thông tin trò chơi
  let elapsedTime = Date.now() - startTime;
  let timeStr = formatTime(elapsedTime);
  document.getElementById('lost-stats').innerText = `Thời gian chơi: ${timeStr} | Điểm số: ${score}`;
  
  lostScreen.style.display = 'flex';
}