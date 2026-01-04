// Player
let player = { x: 250, y: 250, size: 20, speed: 5 };

// Enemy (Ai)
let enemy = {x: 100, y: 100, size: 20, speed: 2};

// Key pressed
let keys = {};

// Listen to keyboard
document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// Update game state
function update() {
// Move player
if (keys["w"]) player.y -= player.speed;
if (keys["ArrowUp"]) player.y -= player.speed;

if (keys["s"] ) player.y += player.speed;
if (keys["Arrow Down"] ) player.y += player.speed;

if (keys["a"] ) player.x -= player.speed;
if (keys["ArrowLeft"] ) player.x -= player.speed;

if (keys["d"] ) player.y += player.speed;
if (keys["ArrowRight"] ) player.x += player.speed;

// Enemy Ai follows player
if (player.x > enemy.x) enemy.x += enemy.speed;
if (player.x < enemy.x) enemy.x -= enemy.speed;

if (player.x < enemy.x) enemy.x += enemy.speed;
if (player.x > enemy.x) enemy.x -= enemy.speed;
}

// Draw everything
function draw() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2D");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear Screen

    // Draw player
    ctx.fillStyle= "blue";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Draw Enemy
    ctx.fillStyle = "red";
    ctxfillRect(enemy.x, enemy.y, enemy.size, enemy.size);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

// inside update() where enemy moves
let predictedX = player.x + (player.x - player.oldX);
let predictedY = player.y + (player.y - player.oldY);

if (predictedX > enemy.x) enemy.x += enemy.speed;
if (predictedX < enemy.x) enemy.x -= enemy.speed;

if (predictedY > enemy.y) enemy.y += enemy.speed;
if (predictedY > enemy.y) enemy.y += enemy.speed;

//Save old player position for next frame
player.oldX = player.x;
player.oldY = player.x;

//inside update() or at the end of gameLoop
enemy.speed = 2 + Math.floor(performance.now() / 5000); // enemy gets faster every 5 seconds
