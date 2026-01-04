// Wait until the page loads
window.addEventListener("DOMContentLoaded", () => {

    // ----- CANVAS -----
    const canvas = document.getElementById("gameCanvas");
    canvas.width = window.innerWidth;   // full width of the browser window
    canvas.height = window.innerHeight; // full height of the browser window
    const ctx = canvas.getContext("2d");

    // ----- PLAYER -----
    let player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 40,   // bigger player for full-screen
        speed: 7,
        oldX: canvas.width / 2,
        oldY: canvas.height / 2
    };

    // ----- ENEMY -----
    let enemy = {
        x: 100,
        y: 100,
        size: 40,
        speed: 3
    };

    // ----- KEYS -----
    let keys = {};
    document.addEventListener("keydown", e => { keys[e.key] = true; });
    document.addEventListener("keyup", e => { keys[e.key] = false; });

    // ----- UPDATE GAME STATE -----
    function update() {
        // Player movement
        if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
        if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
        if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
        if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;

        // Keep player inside canvas
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
        if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

        // Predictive enemy AI
        let predictedX = player.x + (player.x - player.oldX);
        let predictedY = player.y + (player.y - player.oldY);

        if (predictedX > enemy.x) enemy.x += enemy.speed;
        if (predictedX < enemy.x) enemy.x -= enemy.speed;
        if (predictedY > enemy.y) enemy.y += enemy.speed;
        if (predictedY < enemy.y) enemy.y -= enemy.speed;

        // Save old player position
        player.oldX = player.x;
        player.oldY = player.y;

        // Enemy speed increases over time
        enemy.speed = 3 + Math.floor(performance.now() / 10000); // slightly slower speed ramp
    }

    // ----- DRAW EVERYTHING -----
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw player
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x, player.y, player.size, player.size);

        // Draw enemy
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    }

    // ----- GAME LOOP -----
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    gameLoop();
});
