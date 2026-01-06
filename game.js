window.addEventListener("DOMContentLoaded", () => {

    // ------------------ CANVAS SETUP ------------------
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Function to resize canvas to full window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ------------------ GAME VARIABLES ------------------
    let dashCooldown = 0;      // time before you can dash again
    let dashDuration = 0;     // how long the dash lasts
    let DASH_SPEED = 20;      // how fast the dash is
    let DASH_TIME = 10;       // frames dash lasts
    let DASH_COOLDOWN = 60;   // frames before next dash

    let player = {
    x: 0,
    y: 0,
    size: 40,
    speed: 1.2,   // acceleration, not raw speed
    vx: 0,        // velocity X
    vy: 0,        // velocity Y
    oldX: 0,
    oldY: 0
};

    let enemy = { x: 100, y: 100, size: 40, speed: 3 };
    let keys = {};

    let gameState = "home"; // can be "home", "playing", "gameover"
    let startTime = 0;      // for timer
    let elapsed = 0;

    // ------------------ KEYBOARD INPUT ------------------
    document.addEventListener("keydown", e => { keys[e.key] = true; });
    document.addEventListener("keyup", e => { keys[e.key] = false; });

    // ------------------ GAME FUNCTIONS ------------------

    // Start the game
    function startGame() {
        // Set player in center
        player.x = canvas.width / 2 - player.size / 2;
        player.y = canvas.height / 2 - player.size / 2;
        player.oldX = player.x;
        player.oldY = player.y;

        // Reset enemy position
        enemy.x = Math.random() * (canvas.width - enemy.size);
        enemy.y = Math.random() * (canvas.height - enemy.size);
        enemy.speed = 3;

        startTime = performance.now();
        gameState = "playing";
    }

    // Restart game after Game Over
    function restartGame() {
        startGame();
    }

    // Update game state
    function update() {
        if (gameState !== "playing") return;

        // ---- PLAYER MOVEMENT ----
        let currentSpeed = player.speed;

// Dash active?
if (dashDuration > 0) {
    currentSpeed = DASH_SPEED;
    dashDuration--;
}

// Dash cooldown
if (dashCooldown > 0) {
    dashCooldown--;
}

// Movement
if (keys["w"] || keys["ArrowUp"]) player.y -= currentSpeed;
if (keys["s"] || keys["ArrowDown"]) player.y += currentSpeed;
if (keys["a"] || keys["ArrowLeft"]) player.x -= currentSpeed;
if (keys["d"] || keys["ArrowRight"]) player.x += currentSpeed;

        // Keep player inside canvas
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
        if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

        // ---- PREDICTIVE ENEMY AI ----
        let predictedX = player.x + (player.x - player.oldX);
        let predictedY = player.y + (player.y - player.oldY);

        if (predictedX > enemy.x) enemy.x += enemy.speed;
        if (predictedX < enemy.x) enemy.x -= enemy.speed;
        if (predictedY > enemy.y) enemy.y += enemy.speed;
        if (predictedY < enemy.y) enemy.y -= enemy.speed;

        // Save old player position
        player.oldX = player.x;
        player.oldY = player.y;

        let secondsAlive = (performance.now() - startTime) / 1000;

// Speed ramps up faster over time
enemy.speed = 3 + secondsAlive * 0.15;

// HARD CAP so it doesn’t break the game
if (enemy.speed > 15) enemy.speed = 15;

        // ---- COLLISION CHECK ----
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            gameState = "gameover";
            elapsed = Math.floor((performance.now() - startTime) / 1000);
        }
    }

    // Draw everything
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === "home") {
            drawHomeScreen();
        } else if (gameState === "playing") {
            drawGameplay();
        } else if (gameState === "gameover") {
            drawGameOver();
        }
    }

    // ------------------ DRAW SCREENS ------------------

    // Home Screen
    function drawHomeScreen() {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "cyan";
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText("UNBEATABLE GAME", canvas.width / 2, canvas.height / 2 - 100);

        // Start button
        ctx.fillStyle = "lime";
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2, 300, 100);
        ctx.fillStyle = "#000";
        ctx.font = "50px Arial";
        ctx.fillText("START", canvas.width / 2, canvas.height / 2 + 65);
    }

    // Gameplay
    function drawGameplay() {
        // Player (glowing)
ctx.save();
ctx.shadowColor = "cyan";
ctx.shadowBlur = 20;
ctx.fillStyle = "#00aaff";
ctx.fillRect(player.x, player.y, player.size, player.size);
ctx.restore();

        // Enemy (danger glow)
ctx.save();
ctx.shadowColor = "red";
ctx.shadowBlur = 30;
ctx.fillStyle = "#ff3333";
ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
ctx.restore();

        let currentTime = Math.floor(secondsAlive);

if (enemy.speed > 10) {
    ctx.fillStyle = "red";   // danger!
} else {
    ctx.fillStyle = "black";
}

ctx.font = "bold 32px Arial";
ctx.textAlign = "left";
ctx.fillText("Time: " + currentTime + "s", 20, 45);

    }

    // Game Over Screen
    function drawGameOver() {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "yellow";
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 100);

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText("Time Survived: " + elapsed + "s", canvas.width / 2, canvas.height / 2);

        // Restart button
        ctx.fillStyle = "lime";
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 + 80, 300, 100);
        ctx.fillStyle = "#000";
        ctx.font = "50px Arial";
        ctx.fillText("RESTART", canvas.width / 2, canvas.height / 2 + 145);
    }

    // ------------------ MOUSE CLICK FOR BUTTONS ------------------
    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (gameState === "home") {
            // Check if start button clicked
            if (
                mouseX >= canvas.width / 2 - 150 &&
                mouseX <= canvas.width / 2 + 150 &&
                mouseY >= canvas.height / 2 &&
                mouseY <= canvas.height / 2 + 100
            ) {
                startGame();
            }
        }

        if (gameState === "gameover") {
            // Check if restart button clicked
            if (
                mouseX >= canvas.width / 2 - 150 &&
                mouseX <= canvas.width / 2 + 150 &&
                mouseY >= canvas.height / 2 + 80 &&
                mouseY <= canvas.height / 2 + 180
            ) {
                restartGame();
            }
        }
    });

    // ------------------ GAME LOOP ------------------
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});


