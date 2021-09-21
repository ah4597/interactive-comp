let paddleX;
let paddleY;
let paddleWidth;
let paddleHeight;

let borderWidth;

let ballSpeedX;
let ballSpeedY;
let ballPosX;
let ballPosY;
let ballWidth;

let paddle_top;
let ball_top;
let paddle_left;
let ball_left;
let paddle_bottom;
let ball_bottom;
let paddle_right;
let ball_right;

let gameStart = false;

let coinWidth =  50;

let bounces = 0;
let coins = 0;

let coinArt;

let bounceSound;
let coinSound;
let gameOverSound;

let backgroundArt;
let p1 = 0;
let p2 = 1000;

function preload() {
    soundFormats('ogg', 'mp3');
    coinArt = loadImage("Gold-Coin.png");
    
    bounceSound = loadSound("ball_bounce2.mp3");
    coinSound = loadSound("got_coin.mp3");
    gameOverSound = loadSound("game_over.mp3");
    
    backgroundArt = loadImage("starfield.png");
}

function setup() {
    angleMode(DEGREES);

    createCanvas(500,800);

    paddleX = 100;
    paddleY = height - 25;
    paddleWidth = width/5;
    paddleHeight = 20;

    borderWidth = 20;

    ballPosX = width/2;
    ballPosY = height/2;
    ballSpeedX = 0
    ballSpeedY = 0
    ballWidth = 30;

    coinX = -(coinWidth * 2)
    coinY = -(coinWidth * 2);
}

function draw() {

    background(100);
    imageMode(CORNER);
    image(backgroundArt, 0, p1);
    image(backgroundArt, 0, p2);

    p1 += 2;
    p2 += 2;

    if(p1 >= height){
        p1 = p2 - backgroundArt.height;
    }
    if(p2 > height){
        p2 = p1 - backgroundArt.height;
    }

    // Target / Coin
    imageMode(CENTER);
    image(coinArt, coinX, coinY, coinWidth, coinWidth);
    // Target / Coin collision detection
    if(dist(coinX, coinY, ballPosX, ballPosY) < coinWidth/2 + ballWidth/2){
        coins++;
        coinX = random(borderWidth+coinWidth, width-borderWidth);
        coinY = random(borderWidth+coinWidth, height-200-coinWidth);
        coinSound.play();
    }

    //Borders
    fill(128);
    noStroke();
    rect(0,0,width, borderWidth);
    rect(0,0,borderWidth,height);
    rect(width-borderWidth,0,width,height);

    //Paddle
    fill(128);
    rect(paddleX,paddleY,paddleWidth,paddleHeight);
    //A - left
    if(keyIsDown(65) && !(paddleX <= 20)){
        paddleX -= 2;
    }
    //D - right
    if(keyIsDown(68) && !(paddleX >= width-paddleWidth-borderWidth)){
        paddleX += 2;
    }
    
    //Ball
    ellipse(ballPosX,ballPosY, ballWidth, ballWidth);
    ballPosX += ballSpeedX;
    ballPosY += ballSpeedY;
    
    //X axis collision detection
    if(ballPosX - ballWidth/2 < borderWidth || ballPosX + ballWidth/2 > width-borderWidth){
        bounces ++;
        ballSpeedX *= -1;
        bounceSound.play();
    }
    //Y axis collision detection
    if(ballPosY - ballWidth/2 < borderWidth){
        bounces ++;
        ballSpeedY *= -1;
        bounceSound.play();
    }
    //paddle collision detection
    if(!((ballPosY + ballWidth/2) < paddleY || 
        (ballPosY - ballWidth/2) > (paddleY + paddleHeight) || 
        (ballPosX + ballWidth/2) < paddleX ||
        (ballPosX - ballWidth/2) > (ballPosX + ballWidth/2))){
            bounces++;
            ballSpeedY *= -1;
            bounceSound.play();

            //scuffed way to avoid infinite bounces inside paddle
            ballPosY = paddleY - ballWidth/2 - 1;

            if(ballPosX < paddleX + paddleWidth/2){
                console.log('left');
                
            } else {
                console.log('right');
            }
        } 
        
    //Off screen detection - resets game.
    if(ballPosY > height){
        ballPosX = width/2;
        ballPosY = height/2;
        ballSpeedX = 0;
        ballSpeedY = 0;
        gameStart = false;
        gameOverSound.play();
    }

    //Display scores
    fill(255);
    text('Bounces: ' + bounces + '; Coins: ' + coins, 10, 15);
}

function mouseClicked() {
    if(!gameStart){
        gameStart = true;
        bounces = 0;
        coins = 0;
        let r1 = random(2) > .5 ? -1: 1;
        let r2 = random(2) > .5 ? -1: 1;
        ballSpeedX = random(1,5) * r1;
        ballSpeedY = random(1,5) * r2;
        
        coinX = random(borderWidth+coinWidth/2, width-borderWidth-coinWidth/2);
        coinY = random(borderWidth+coinWidth/2, height-200-coinWidth/2);
    
    }
}