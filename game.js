const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

let player = {
    x: 100,
    y: canvas.height / 2,
    w: 30,
    h: 30,
    vy: 0,
    gravity: 0.5,
    flap: -8
};

const baseScrollSpeed = 2;
let scrollSpeed = baseScrollSpeed;

let clouds = [];
for (let i = 0; i < 30; i++) {
    clouds.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height / 2, r: 20 + Math.random() * 30 });
}

let trees = [];
let treeGap = 120;
let treeInterval = 200;
let frameCount = 0;

let score = 0;
let highScore = 0;
let gameRunning = false;

// 🎨 Draw clouds
function drawClouds() {
    ctx.fillStyle = "white";
    clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 🌳 Draw trees
function drawTrees() {
    ctx.fillStyle = "#228B22"; // green tree
    trees.forEach(t => {
        // Top tree
        ctx.fillRect(t.x, 0, 50, t.top);
        // Bottom tree
        ctx.fillRect(t.x, t.top + treeGap, 50, canvas.height - (t.top + treeGap));
    });
}

// 🐦 Draw player (bird)
function drawPlayer() {
    ctx.fillStyle = "#FFD700"; // golden bird
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

// 📝 Draw score
function drawScore() {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.font = "30px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${score}`, canvas.width - 20, 40);
    ctx.font = "16px Arial";
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 20, 65);
    ctx.restore();
}

// 🎮 Draw start/replay button
function drawButton(text) {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 30;
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
    ctx.restore();
}

// 🌌 Draw background
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#87CEEB"; // sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds();
    drawTrees();
    drawPlayer();
    drawScore();

    if (!gameRunning) drawButton(score === 0 ? "Start" : "Replay");
}

// 🚀 Update game logic
function update() {
    frameCount++;

    // Bird physics
    player.vy += player.gravity;
    player.y += player.vy;

    if (keys["Space"]) {
        player.vy = player.flap;
    }

    // Spawn trees
    if (frameCount % treeInterval === 0) {
        let topHeight = 50 + Math.random() * (canvas.height - treeGap - 100);
        trees.push({ x: canvas.width, top: topHeight });
    }

    // Move trees
    trees.forEach(t => t.x -= scrollSpeed);

    // Remove off-screen trees
    trees = trees.filter(t => t.x + 50 > 0);

    // Collision detection
    for (let t of trees) {
        if (
            player.x < t.x + 50 &&
            player.x + player.w > t.x &&
            (player.y < t.top || player.y + player.h > t.top + treeGap)
        ) {
            gameRunning = false;
        }
    }

    // Score update
    trees.forEach(t => {
        if (!t.passed && t.x + 50 < player.x) {
            score++;
            t.passed = true;
            if (score > highScore) highScore = score;
        }
    });

    // Out of bounds
    if (player.y < 0 || player.y + player.h > canvas.height) {
        gameRunning = false;
    }
}

// 🔄 Game loop
function loop() {
    draw();
    if (gameRunning) update();
    requestAnimationFrame(loop);
}

// ▶️ Start game
function startGame() {
    trees = [];
    score = 0;
    player.y = canvas.height / 2;
    player.vy = 0;
    gameRunning = true;
    frameCount = 0;
}

canvas.addEventListener("click", e => {
    if (!gameRunning) startGame();
});

document.addEventListener("keydown", e => {
    if (!gameRunning && e.code === "Enter") startGame();
});

loop();
