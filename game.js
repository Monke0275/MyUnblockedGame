window.addEventListener("DOMContentLoaded", () => {

    // ------------------ VARIABLES ------------------
    let leaderboard = [];
    let isNewRecord = false;
    let confetti = [];

    // ------------------ CANVAS ------------------
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ------------------ LEADERBOARD ------------------
    function loadLeaderboard() {
        const saved = localStorage.getItem("leaderboard");
        leaderboard = saved ? JSON.parse(saved) : [];
    }

    function saveLeaderboard() {
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    }

    function updateLeaderboard(score) {
        loadLeaderboard();
        if (leaderboard.length === 0 || score > leaderboard[0]) {
            isNewRecord = true; // trigger confetti
        }
        leaderboard.push(score);
        leaderboard.sort((a,b)=>b-a);
        leaderboard = leaderboard.slice(0,5);
        saveLeaderboard();
    }

    // ------------------ CONFETTI ------------------
    function spawnConfetti() {
        for(let i=0;i<200;i++){
            confetti.push({
                x:canvas.width/2,
                y:canvas.height/2,
                vx:(Math.random()-0.5)*10,
                vy:Math.random()*-10,
                size:Math.random()*6+4,
                color:`hsl(${Math.random()*360},100%,50%)`,
                life:100
            });
        }
    }

    function drawConfetti() {
        for(let i=confetti.length-1;i>=0;i--){
            let p = confetti[i];
            p.vy += 0.3;
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x,p.y,p.size,p.size);
            if(p.life<=0) confetti.splice(i,1);
        }
    }

    // ------------------ GAME VARIABLES ------------------
    const FRICTION = 0.85;
    const DASH_SPEED = 20;
    const DASH_TIME = 10;
    const DASH_COOLDOWN = 60;

    let dashDuration = 0;
    let dashCooldown = 0;

    let player = {x:0,y:0,size:40,speed:1.2,vx:0,vy:0,oldX:0,oldY:0};
    let enemy = {x:100,y:100,size:40,speed:3};
    let keys = {};
    let gameState="home";
    let startTime=0;
    let secondsAlive=0;
    let elapsed=0;

    // ------------------ INPUT ------------------
    document.addEventListener("keydown", e=> keys[e.key]=true);
    document.addEventListener("keyup", e=> keys[e.key]=false);

    document.addEventListener("keydown", e=>{
        if(e.key===" " && dashCooldown===0 && gameState==="playing"){
            dashDuration = DASH_TIME;
            dashCooldown = DASH_COOLDOWN;
        }
    });

    // ------------------ GAME FUNCTIONS ------------------
    function startGame(){
        player.x = canvas.width/2 - player.size/2;
        player.y = canvas.height/2 - player.size/2;
        player.vx=0; player.vy=0;
        player.oldX = player.x; player.oldY = player.y;

        enemy.x = Math.random()*(canvas.width-enemy.size);
        enemy.y = Math.random()*(canvas.height-enemy.size);
        enemy.speed = 3;

        dashDuration = 0; dashCooldown = 0;
        startTime = performance.now();
        secondsAlive = 0;

        gameState="playing";
    }

    function restartGame(){ startGame(); }

    function update(){
        if(gameState!=="playing") return;

        // TIMER
        secondsAlive = (performance.now()-startTime)/1000;

        // DASH
        let currentSpeed = player.speed;
        if(dashDuration>0){ currentSpeed=DASH_SPEED; dashDuration--; }
        if(dashCooldown>0) dashCooldown--;

        // MOVEMENT
        if(keys["w"] || keys["ArrowUp"]) player.vy-=currentSpeed;
        if(keys["s"] || keys["ArrowDown"]) player.vy+=currentSpeed;
        if(keys["a"] || keys["ArrowLeft"]) player.vx-=currentSpeed;
        if(keys["d"] || keys["ArrowRight"]) player.vx+=currentSpeed;

        player.vx*=FRICTION;
        player.vy*=FRICTION;

        player.x+=player.vx;
        player.y+=player.vy;

        // BOUNDS
        if(player.x<0) player.x=0;
        if(player.y<0) player.y=0;
        if(player.x+player.size>canvas.width) player.x=canvas.width-player.size;
        if(player.y+player.size>canvas.height) player.y=canvas.height-player.size;

        // ENEMY AI
        let predictedX = player.x+(player.x-player.oldX);
        let predictedY = player.y+(player.y-player.oldY);

        if(predictedX>enemy.x) enemy.x+=enemy.speed;
        if(predictedX<enemy.x) enemy.x-=enemy.speed;
        if(predictedY>enemy.y) enemy.y+=enemy.speed;
        if(predictedY<enemy.y) enemy.y-=enemy.speed;

        player.oldX=player.x;
        player.oldY=player.y;

        // ENEMY SPEED RAMP
        enemy.speed = 3+secondsAlive*0.15;
        if(enemy.speed>15) enemy.speed=15;

        // COLLISION
        if(player.x<enemy.x+enemy.size &&
           player.x+player.size>enemy.x &&
           player.y<enemy.y+enemy.size &&
           player.y+player.size>enemy.y){
            gameState="gameover";
            elapsed = Math.floor(secondsAlive);
            updateLeaderboard(elapsed);
        }
    }

    // ------------------ DRAW FUNCTIONS ------------------
    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        if(gameState==="home") drawHomeScreen();
        else if(gameState==="playing") drawGameplay();
        else if(gameState==="gameover") drawGameOver();

        drawConfetti();
    }

    function drawHomeScreen(){
        ctx.fillStyle="#111";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle="cyan";
        ctx.font="80px Arial";
        ctx.textAlign="center";
        ctx.fillText("UNBEATABLE GAME", canvas.width/2, canvas.height/2-100);

        ctx.fillStyle="lime";
        ctx.fillRect(canvas.width/2-150,canvas.height/2,300,100);
        ctx.fillStyle="#000";
        ctx.font="50px Arial";
        ctx.fillText("START", canvas.width/2, canvas.height/2+65);
    }

    function drawGameplay(){
        // Player
        ctx.save();
        ctx.shadowColor="cyan";
        ctx.shadowBlur=20;
        ctx.fillStyle="#00aaff";
        ctx.fillRect(player.x,player.y,player.size,player.size);
        ctx.restore();

        // Enemy
        ctx.save();
        ctx.shadowColor="red";
        ctx.shadowBlur=30;
        ctx.fillStyle="#ff3333";
        ctx.fillRect(enemy.x,enemy.y,enemy.size,enemy.size);
        ctx.restore();

        // Timer color based on danger
        ctx.fillStyle = (enemy.speed>10)?"red":"white";
        ctx.font="bold 32px Arial";
        ctx.textAlign="left";
        ctx.fillText("Time: "+Math.floor(secondsAlive)+"s",20,45);
    }

    function drawGameOver(){
        ctx.fillStyle="#111";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle="yellow";
        ctx.font="80px Arial";
        ctx.textAlign="center";
        ctx.fillText("GAME OVER",canvas.width/2,canvas.height/2-100);

        ctx.fillStyle="white";
        ctx.font="50px Arial";
        ctx.fillText("Time Survived: "+elapsed+"s",canvas.width/2,canvas.height/2);

        // Leaderboard
        ctx.fillStyle="cyan";
        ctx.font="40px Arial";
        for(let i=0;i<leaderboard.length;i++){
            ctx.fillText(`${i+1}. ${leaderboard[i]}s`,canvas.width/2,canvas.height/2+60+i*40);
        }

        // Restart button
        ctx.fillStyle="lime";
        ctx.fillRect(canvas.width/2-150,canvas.height/2+80+leaderboard.length*0,300,100);
        ctx.fillStyle="#000";
        ctx.font="50px Arial";
        ctx.fillText("RESTART",canvas.width/2,canvas.height/2+145+leaderboard.length*0);
    }

    // ------------------ MOUSE ------------------
    canvas.addEventListener("click",(e)=>{
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if(gameState==="home"){
            if(mouseX>=canvas.width/2-150 && mouseX<=canvas.width/2+150 &&
               mouseY>=canvas.height/2 && mouseY<=canvas.height/2+100){
                startGame();
            }
        }

        if(gameState==="gameover"){
            if(mouseX>=canvas.width/2-150 && mouseX<=canvas.width/2+150 &&
               mouseY>=canvas.height/2+80 && mouseY<=canvas.height/2+180){
                restartGame();
                isNewRecord=false;
            }
        }
    });

    // ------------------ GAME LOOP ------------------
    function gameLoop(){
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();

});
