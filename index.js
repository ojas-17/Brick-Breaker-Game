//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context; 

//players
let playerWidth = 80; //500 for testing, 80 normal
let playerHeight = 10;
let playerVelocityX = 40; //move 10 pixels each time

let player = {
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX : playerVelocityX
}

//ball
let ballWidth = 15;
let ballHeight = 15;
let ballVelocityX = 3; //15 for testing, 3 normal
let ballVelocityY = 2; //10 for testing, 2 normal

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8; 
let blockRows = 3; //add more as game goes on
let blockMaxRows = 10; //limit how many rows
let blockCount = 0;

//starting block corners top left 
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial player
    context.fillStyle="skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);

    // Focus on the document to ensure event listeners work
    document.body.focus();

    // Add event listener for player movement
    document.addEventListener("keydown", movePlayer);

    //create blocks
    createBlocks();
}


function update() {
    setTimeout(function() {
        //stop drawing
        if (gameOver) {
            return;
        }
        context.clearRect(0, 0, board.width, board.height);

        // player
        context.fillStyle = "gray";
        context.fillRect(player.x, player.y, player.width, player.height);

        // ball
        context.fillStyle = "white";
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        // context.fillRect(ball.x, ball.y, ball.width, ball.height);
        context.beginPath();
        context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2);
        context.fill();

        //bounce the ball off player paddle
        if (topCollision(ball, player) || bottomCollision(ball, player)) {
            ball.velocityY *= -1;   // flip y direction up or down
        }
        else if (leftCollision(ball, player) || rightCollision(ball, player)) {
            ball.velocityX *= -1;   // flip x direction left or right
        }

        if (ball.y <= 0) { 
            // if ball touches top of canvas
            ball.velocityY *= -1; //reverse direction
        }
        else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
            // if ball touches left or right of canvas
            ball.velocityX *= -1; //reverse direction
        }
        else if (ball.y + ball.height >= boardHeight) {
            // if ball touches bottom of canvas
            context.font = "20px sans-serif";
            context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
            gameOver = true;
        }

        //blocks
        context.fillStyle = "skyblue";
        for (let i = 0; i < blockArray.length; i++) {
            let block = blockArray[i];
            if (!block.break) {
                context.fillStyle = block.color; // Set the fill color
                context.fillRect(block.x, block.y, block.width, block.height);
                if (topCollision(ball, block) || bottomCollision(ball, block)) {
                    block.break = true;     // block is broken
                    ball.velocityY *= -1;   // flip y direction up or down
                    score += 10;
                    blockCount -= 1;
                }
                else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                    block.break = true;     // block is broken
                    ball.velocityX *= -1;   // flip x direction left or right
                    score += 10;
                    blockCount -= 1;
                }
                context.fillRect(block.x, block.y, block.width, block.height);
            }
        }

        //next level
        if (blockCount == 0) {
            score += 5*blockRows*blockColumns; //bonus points :)
            blockRows = Math.min(blockRows + 1, blockMaxRows);
            createBlocks();
        }

        //score
        context.font = "20px sans-serif";
        context.fillText(score, 10, 25);

        // Call update again after a timeout
        update();
    }, 1000 / 60); // 60 frames per second
}


function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    console.log("Key pressed:", e.code); // Log the key code pressed
    if (gameOver) {
        if (e.code == "Space") {
            console.log("Space bar pressed - Resetting game."); // Log when space bar is pressed
            resetGame();
            console.log("Game reset."); // Log when game is reset
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        // player.x -= player.velocityX;
        let nextplayerX = player.x - player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (e.code == "ArrowRight") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
        // player.x += player.velocityX;    
    }
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function topCollision(ball, block) { //a is above b (ball is above block)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { //a is above b (ball is below block)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { //a is left of b (ball is left of block)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { //a is right of b (ball is right of block)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = []; //clear blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            /*if(c==0)
            {
                let color = "red";
            }
            else if(c==1)
            {
                let color = "green";
            }
            else
            {
                color = "blue";
            }*/
            let colors = ["#EE4B2B","#7CFC00","#00FFFF"];
            let color = colors[(Math.abs(c-r))%3]; // Get color based on row index
            let block = {
                x : blockX + c*blockWidth + c*10, //c*10 space 10 pixels apart columns
                y : blockY + r*blockHeight + r*10, //r*10 space 10 pixels apart rows
                width : blockWidth,
                height : blockHeight,
                break : false,
                color: color
                
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    requestAnimationFrame(update);
    createBlocks();
}
