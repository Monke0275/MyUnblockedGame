window.addEventListener("DOMContentLoaded", () => {

    // ------------------ CANVAS SETUP ------------------
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ------------------ GAME VARIABLES ------------------
    let dashCooldown = 0;
    let dashDuration = 0;
    const DASH_SPEED = 20;
    const DASH_TIME = 10;
    const DASH_COOLDOWN = 60;
    const FRICTION = 0.85; // smooth momentum

    let player = {
        x: 0,
        y: 0,
        size: 40,
        speed: 1.2,
        vx: 0,
        vy: 0,
        oldX: 0,
        oldY: 0
    };

    let enemy = { x: 100, y: 100, size: 40, speed: 3 };
    let keys = {};
    let gameState = "home"; // "home", "playing", "gameover"
    let startTime = 0;
    let elapsed = 0;
    let secondsAlive = 0;

    // ------------------ KEYBOARD INPUT ------------------
    document.addEventListener("keydown", e => keys[e.key] = true);
    document.addEventListener("keyup", e => keys[e.key] = false);

    // ------------------ GAME FUNCTIONS ------------------
    function startGame() {
        player.x = canvas.width / 2 - player.size / 2;
        player.y = canvas.height / 2 - player.size / 2;
        player.oldX = player.x;
        player.oldY = player.y;
        player.vx = 0;
        player.vy = 0;

        enemy.x = Math.random() * (canvas.width - enemy.size);
        enemy.y = Math.random() * (canvas.height - enemy.size);
        enemy.speed = 3;

        startTime = performance.now();
        secondsAlive = 0;
        dashCooldown = 0;
        dashDuration = 0;

        gameState = "playing";
    }

    function restartGame() {
        startGame();
    }

    function update() {
        if (gameState !== "playing") return;

        // ---- TIMER ----
        secondsAlive = (performance.now() - startTime) / 1000;

        // ---- DASH ----
        let currentSpeed = player.speed;
        if (dashDuration > 0) {
            currentSpeed = DASH_SPEED;
            dashDuration--;
        }
        if (dashCooldown > 0) dashCooldown--;

        // ---- PLAYER MOVEMENT ----
        // Apply acceleration
        if (keys["w"] || keys["ArrowUp"]) player.vy -= currentSpeed;
        if (keys["s"] || keys["ArrowDown"]) player.vy += currentSpeed;
        if (keys["a"] || keys["ArrowLeft"]) player.vx -= currentSpeed;
        if (keys["d"] || keys["ArrowRight"]) player.vx += currentSpeed;

        // Apply friction for momentum
        player.vx *= FRICTION;
        player.vy *= FRICTION;

        // Update position
        player.x += player.vx;
        player.y += player.vy;

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

        player.oldX = player.x;
        player.oldY = player.y;

        // ---- ENEMY SPEED RAMP ----
        enemy.speed = 3 + secondsAlive * 0.15;
        if (enemy.speed > 15) enemy.speed = 15;

        // ---- COLLISION ----
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            gameState = "gameover";
            elapsed = Math.floor(secondsAlive);
        }
    }

    // ------------------ DRAW FUNCTIONS ------------------
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === "home") drawHomeScreen();
        else if (gameState === "playing") drawGameplay();
        else if (gameState === "gameover") drawGameOver();
    }

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

    function drawGameplay() {
        // Player with glow
        ctx.save();
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#00aaff";
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.restore();

        // Enemy with glow
        ctx.save();
        ctx.shadowColor = "red";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.restore();

        // Timer
        ctx.fillStyle = "white";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Time: " + Math.floor(secondsAlive) + "s", 20, 45);
    }

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

    // ------------------ MOUSE INPUT ------------------
    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (gameState === "home") {
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

    // ------------------ DASH INPUT ------------------
    document.addEventListener("keydown", (e) => {
        if (e.key === " " && dashCooldown === 0 && gameState === "playing") {
            dashDuration = DASH_TIME;
            dashCooldown = DASH_COOLDOWN;
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
