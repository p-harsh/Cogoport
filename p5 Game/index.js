let ball_x, ball_y, ball_dx, ball_dy, ball_radius;
let paddle_x, paddle_y, paddle_width, paddle_height, paddle_dx;
let isPaused = false;
let isInstructionsVisible = true;

let brickRows = 4,
    brickColumns = 5,
    brickWidth = 75,
    brickHeight = 20,
    brickPadding = 10,
    brickOffsetLeft = 5,
    brickOffsetTop = 10;

let changeDimension = [
    {
        r: 3,
        c: 2,
        paddleWidth: 8,
        ballRadius: -3,
        ballDy: 2,
        ballDx: 2,
        time: 5000,
        color: "rgb(100, 100, 0)",
    },
    {
        r: 0,
        c: 3,
        paddleWidth: 0,
        ballRadius: 2,
        ballDy: -1.5,
        ballDx: -1.5,
        time: 5000,
        color: "rgb(120, 120, 0)",
    },
];

let score, bottom_wall_touch, lives;

let bricks = [];

// let originalDimension = {
//     paddleWidth: null,
//     ballRadius: null,
//     ballDx: null,
//     ballDy: null,
// };

for (let c = 0; c < brickColumns; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRows; r++) {
        bricks[c][r] = { x: 0, y: 0, hidden: 0 };
    }
}

function setup() {
    createCanvas(600, 550);

    score = 0;
    bottom_wall_touch = 0;
    lives = 3;

    ball_x = width / 2;
    ball_y = height / 2;
    ball_dx = 3.5;
    ball_dy = -3.5;
    ball_radius = 12.5;

    paddle_width = 90;
    paddle_height = 15;
    paddle_x = width / 2 - paddle_width / 2;
    paddle_y = height - 70;
    paddle_dx = 5;

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

                changeDimension.forEach((change) => {
                    // change colour only for powered bricks
                    if (r === change?.r && c === change?.c) {
                        fill(change?.color);
                    }
                });

                rect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
                fill("black");
            }
        }
    }
}

function handleChangingDimension(change) {
    if (paddle_width + change?.paddleWidth > 0)
        paddle_width += change?.paddleWidth | 0;
    if (ball_radius + change?.ballRadius > 0)
        ball_radius += change?.ballRadius | 0;

    let ball_dx_abs = Math.abs(ball_dx);
    let ball_dy_abs = Math.abs(ball_dy);
    ball_dx_abs += change?.ballDx | 0;
    // increase or decrease from the absolute value, so that subtraction from negative speed does not lead to increae in speed
    ball_dy_abs += change?.ballDy | 0;
    if (ball_dx_abs < 0) ball_dx_abs = 0;
    // decrease in speed so much that it becomes less than 0, it causes a sudden change in ball direction which is not desirable
    if (ball_dy_abs < 0) ball_dy_abs = 0;
    ball_dx = (ball_dx < 0 ? -1 : 1) * ball_dx_abs;
    ball_dy = (ball_dy < 0 ? -1 : 1) * ball_dy_abs;
}

function resetDimension(change) {
    if (paddle_width - change?.paddleWidth > 0)
        paddle_width -= change?.paddleWidth | 0;
    if (ball_radius - change?.ballRadius > 0)
        ball_radius -= change?.ballRadius | 0;

    let ball_dx_abs = Math.abs(ball_dx);
    let ball_dy_abs = Math.abs(ball_dy);
    ball_dx_abs -= change?.ballDx | 0;
    ball_dy_abs -= change?.ballDy | 0;
    if (ball_dx_abs < 0) ball_dx_abs = 0; // do not change its direction while decreasing speed just make it 0
    if (ball_dy_abs < 0) ball_dy_abs = 0;
    ball_dx = (ball_dx < 0 ? -1 : 1) * ball_dx_abs;
    ball_dy = (ball_dy < 0 ? -1 : 1) * ball_dy_abs;
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
        //       All lives ended
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

                    changeDimension.forEach((change) => {
                        if (r == change.r && c == change.c) {
                            handleChangingDimension(change);
                            setTimeout(
                                () => resetDimension(change),
                                change?.time
                            );
                        }
                    });
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
    text("PAUSED\nPRESS SPACE TO CONTINUE!", 0, 0, width, height);
    textSize(16);
    fill("black");
}

function displayInstructions() {
    let instructionText = `•  Break as many bricks as possible
        •  Colored Bricks have powers to change speed/width/radius of ball or paddle
        •  Each effect remains for a duration of 5s
        •  The effects are stacked upon the previous, thus one effect may nullify the others
•  Press SPACE to pause the game
        •  Press ENTER to start`;
    textSize(20);
    background("rgba(225,220,220,0.9)");
    textAlign(CENTER, TOP);
    text("INSTRUCTIONS", 24, 24, width - 24, height);
    textSize(18);
    textAlign(LEFT, TOP);
    textLeading(24);
    text(instructionText, 24, 56, width - 24, height);
    fill("black");
}

function draw() {
    clear(); // clear the canvas
    background("rgb(130, 180, 180)");
    createBricks();
    circle(ball_x, ball_y, ball_radius * 2);
    fill("grey");
    rect(paddle_x, paddle_y, paddle_width, paddle_height);
    fill("black");

    bounceFromWall();

    bounceFromPaddle();

    bounceFromBricks();

    if (keyIsDown(LEFT_ARROW)) {
        // not cross left wall
        if (paddle_x - paddle_dx >= 0) paddle_x = paddle_x - paddle_dx;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        // not cross right wall
        if (paddle_x + paddle_dx <= width - paddle_width)
            paddle_x = paddle_x + paddle_dx;
    }

    ball_x = ball_x + ball_dx;
    ball_y = ball_y + ball_dy;

    displayLiveStats();

    if (isPaused) displayPausedScreen();
    if (isInstructionsVisible) {
        displayInstructions();
        noLoop();
    }
}

function keyPressed(event) {
    if (keyCode === 32 && !isInstructionsVisible) {
        // space key is pressed
        isPaused = !isPaused;
        if (isPaused) noLoop();
        else loop();
    }
    if (keyCode === ENTER && isInstructionsVisible) {
        isInstructionsVisible = false;
        loop();
    }
}
