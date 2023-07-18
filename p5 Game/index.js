let ball_x, ball_y, ball_dx, ball_dy, ball_radius;
let paddle_x, paddle_y, paddle_width, paddle_height, paddle_dx;
let isPaused = false;

let brickRows = 4,
    brickColumns = 4,
    brickWidth = 75,
    brickHeight = 20,
    brickPadding = 10,
    brickOffsetLeft = 5,
    brickOffsetTop = 10;

let score, bottom_wall_touch, lives;

let bricks = [];

for (let c = 0; c < brickColumns; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRows; r++) {
        bricks[c][r] = { x: 0, y: 0, hidden: 0 };
    }
}

function setup() {
    createCanvas(600, 400);

    score = 0;
    bottom_wall_touch = 0;
    lives = 3;

    ball_x = width / 2;
    ball_y = height / 2;
    ball_dx = 3;
    ball_dy = 3;
    ball_radius = 12.5;

    paddle_width = 90;
    paddle_height = 15;
    paddle_x = width / 2 - paddle_width / 2;
    paddle_y = height - 30;
    paddle_dx = 4;

    fill("black");
}

function createBricks() {
    for (var c = 0; c < brickColumns; c++) {
        for (var r = 0; r < brickRows; r++) {
            if (!bricks[c][r].hidden) {
                const brickX =
                    brickOffsetLeft + c * (brickWidth + brickPadding);
                const brickY =
                    brickOffsetTop + r * (brickHeight + brickPadding);

                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                fill("black");
                rect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
            }
        }
    }
}

function bounceFromWall() {
//   wall hit
    //   right wall
    if (ball_x + ball_radius >= width) ball_dx = -ball_dx;
    //   left wall
    else if (ball_x <= ball_radius) ball_dx = -ball_dx;
    //   bottom wall
    else if (ball_y + ball_radius >= height) {
        ball_dy = -ball_dy;
        bottom_wall_touch++;
        if (bottom_wall_touch == lives) {
            displayLosingScreen();
            noLoop();
        }
    }
    //   top wall
    else if (ball_y <= ball_radius) ball_dy = -ball_dy;
}

function bounceFromPaddle() {
    if (
        ball_x + ball_radius >= paddle_x &&
        ball_x - ball_radius <= paddle_x + paddle_width &&
        ball_y + ball_radius >= paddle_y &&
        ball_y - ball_radius <= paddle_y + paddle_height
    )
        ball_dy = -ball_dy;
}

function bounceFromBricks() {
    //   paddle hit
    for (let c = 0; c < brickColumns; c++) {
        for (let r = 0; r < brickRows; r++) {
            if (bricks[c][r].hidden == 0) {
                let brick_x = bricks[c][r].x;
                let brick_y = bricks[c][r].y;
                // bricks hit
                if (
                    ball_x + ball_radius >= brick_x &&
                    ball_x - ball_radius <= brick_x + brickWidth &&
                    ball_y - ball_radius <= brick_y + brickHeight &&
                    ball_y + ball_radius >= brick_y
                ) {
                    ball_dy = -ball_dy;
                    bricks[c][r].hidden = 1;
                    score++;
                    if (score == brickRows * brickColumns) {
                        displayWinningScreen();
                        noLoop();
                    }
                }
            }
        }
    }
}

function displayLosingScreen() {
    background("red");
    textSize(20);
    fill("white");  
    textAlign(CENTER, CENTER);
    text(`GAME OVER, YOU LOST \n YOUR SCORE - ${score}`, 0, 0, width, height);
}

function displayWinningScreen() {
    background("green");
    fill("white");
    textAlign(CENTER, CENTER);
    text(`HURRAY, YOU WON \n YOUR SCORE - ${score}`, 0, 0, width, height);
}

function displayLiveStats() {
    textSize(20);
    text(`score - ${score}`, width - 130, 40);
    fill("white");
    text(`Lives - ${lives - bottom_wall_touch}`, width - 130, 80);
    fill("black");
}

function displayPausedScreen() {
    textSize(20);
    background("rgba(200,200,200,0.9)");
    textAlign(CENTER, CENTER);
    text("PAUSED", 0, 0, width, height);
    fill("black");
}

function draw() {
    clear(); // clear canvas
    background("rgb(130, 180, 180)");
    createBricks();
    circle(ball_x, ball_y, ball_radius * 2);
    rect(paddle_x, paddle_y, paddle_width, paddle_height);

    bounceFromWall();

    bounceFromPaddle();

    bounceFromBricks();

    if (keyIsDown(LEFT_ARROW)) {
        if (paddle_x - paddle_dx >= 0) paddle_x = paddle_x - paddle_dx;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        if (paddle_x + paddle_dx <= width) paddle_x = paddle_x + paddle_dx;
    }
    
    ball_x = ball_x + ball_dx;
    ball_y = ball_y + ball_dy;

    displayLiveStats();
    
    if(isPaused)
        displayPausedScreen();
}

function keyPressed(event) {
    if (keyCode === 32) {
        // space key is pressed
        isPaused = !isPaused;
        if(isPaused){
            noLoop();
        }
        else
            loop();
    }
}
