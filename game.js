// Wait until the HTML is fully loaded
window.addEventListener("DOMContentLoaded", () => {

    // ----- PLAYER -----
    let player = {
        x: 250,
        y: 250,
        size: 20,
        speed: 5,
        oldX: 250,
        oldY: 250
    };

    // ----- ENEMY (AI) -----
    let enemy = {
        x: 100,
        y: 100,
        size: 20,
        speed: 2
    };

    // ----- KEYS -----
    let keys = {};

    document.addEventListener("keydown", function(e) { keys[e.key] = true; });
    document.addEventListener("keyup", function(e) { keys[e.key] = false; });

    // ----- UPDATE GAME STATE -----
    function update() {
        // Player movement
        if (keys["w"]) player.y -= player.speed;
        if (keys["ArrowUp"]) player.y -= player.speed;

        if (keys["s"]) player.y += player.speed;
        if (keys["ArrowDown"]) player.y += player.speed;

        if (keys["a"]) player.x -= player.speed;
        if (keys["ArrowLeft"]) player.x -= player.speed;

        if (keys["d"]) player.x += player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;

        // Predictive enemy AI
        let predictedX = player.x + (player.x - player.oldX);
        let predictedY = player.y + (player.y - player.oldY);

        if (predictedX > enemy.x) enemy.x += enemy.speed;
        if (predictedX < enemy.x) enemy.x -= enemy.speed;

        if (predictedY > enemy.y) enemy.y += enemy.speed;
        if (predictedY < enemy.y) enemy.y -= enemy.speed;

        // Save old player position for next frame
        player.oldX = player.x;
        player.oldY = player.y;

        // Enemy speed increases over time
        enemy.speed = 2 + Math.floor(performance.now() / 5000);
    }

    // ----- DRAW EVERYTHING -----
    function draw() {
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        // Clear screen
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
