const FLOOR = 575;


const playerWidth = 30;
const playerHeight = 60;

let gamePlay = false;
let gameOver = false;
//1 - easy
//2 - medium
//3 - hard
let difficulty;

let grav = .5;
let playerX, playerY, playerJumped, jumpPower;
let bgP1 = 0;
let bgP2 = 800;
let scrollSpeed;

let obstacles;
let obstacleWidth = 20;

let coin;
let coins = 0;
let coinSize = 10;

let lives = 3;
let iframes = 90;
let hitState = false;
let scores = JSON.parse(window.localStorage.getItem('scores'));

let godMode = false;


let backgroundArt;
let coinNoise;
let playerArt;
let gameOverNoise;
let hitNoise;

function preload() {
  soundFormats('ogg', 'mp3');
  hitNoise = loadSound("assets/hit.mp3")
  gameOverNoise = loadSound("assets/game_over.mp3");
  playerArt = loadImage("assets/DUCK.png");
  coinNoise = loadSound("assets/got_coin.mp3");
  backgroundArt = loadImage("assets/asg3_background.jpg");
}

function setup() {
  console.log("setup scores: ");
  console.log(scores);
  angleMode(DEGREES);

  let canvas = createCanvas(800, 800);
  canvas.id("my_p5_canvas_element");
  canvas.parent("#center");

  backgroundArt.resize(800, 800);
  difficulty = JSON.parse(window.localStorage.getItem('difficulty'));
  if(difficulty == null){
    difficulty = 2;
  }
  scrollSpeed = difficulty;

  obstacles = [];

  playerX = 50;
  playerY = FLOOR - playerHeight;
  playerJumped = false;

  coin = new Coin(Math.floor(random(100, 700)), Math.floor(random(250, FLOOR - 100)));

  if (scores == null) {
    window.localStorage.setItem('scores', "[]");
    scores = [];
  }
}

function draw() {
  
  if (gamePlay && !gameOver) {
    //Background images
    image(backgroundArt, bgP1, 0);
    image(backgroundArt, bgP2, 0);
    //Background scroll speed
    bgP1 -= scrollSpeed;
    bgP2 -= scrollSpeed;
    //Background looping
    if (bgP1 <= 0 - width) {
      bgP1 = bgP2 + width;
    }
    if (bgP2 <= 0 - width) {
      bgP2 = bgP1 + width;
    }
    fill(0);
    text("Lives: " + lives, 20, 20);
    text("Coins: " + coins, 20, 50);

    fill(255);
    //rect(playerX, playerY, playerWidth, playerHeight);
    image(playerArt, playerX, playerY, playerWidth, playerHeight);
    //Movement

    //A - left
    if (keyIsDown(65) && !(playerX <= 0)) {
      playerX -= 3;
    }
    //D - right
    if (keyIsDown(68) && !(playerX >= width - playerWidth)) {
      playerX += 3;
    }
    //W - up
    if (keyIsDown(87) && !(playerJumped)) {
      playerJumped = true;
      jumpPower = -12;
    }
    //Handle Jump
    if (playerJumped) {
      playerY += jumpPower;
      jumpPower += grav;
      if (keyIsDown(83)) {
        grav = 1.5;
      } else if (keyIsDown(87)) {
        grav = .25;
      } else {
        grav = .5;
      }
      if (playerY + playerHeight >= FLOOR) {
        playerJumped = false;
        jumpPower = 0;
        playerY = FLOOR - playerHeight;
      }
    }

    for (let obstacle of obstacles) {
      //draw Obstacle
      obstacle.xPos -= scrollSpeed;
      rect(obstacle.xPos, obstacle.yPos, obstacleWidth, obstacle.size);

      obstacle.checkOffScreen(obstacles);

    }
    //console.log(obstacles);
    if (!hitState && !godMode) {
      for (let obstacle of obstacles) {
        obstacle.checkCollision(playerX, playerY);
      }
    } else {
      iframes--;
      if (iframes < 0) {
        iframes = 90;
        hitState = false;
      }
    }

    //Draw coin
    fill('yellow');
    ellipse(coin.xPos, coin.yPos, coinSize, coinSize);
    coin.checkCollision(playerX, playerY);

    if (lives <= 0) {
      gamePlay = false;
      gameOver = true;
      gameOverNoise.play();
    }
    //GAME OVER 
  } else if (!gamePlay && gameOver) {
    window.localStorage.setItem('difficulty', difficulty);
    if (scores.length < 5 && coins != 0) {
      scores.push(coins);
      scores.sort(function (a, b) { return b - a });
      window.localStorage.setItem('scores', JSON.stringify(scores));
      coins = 0;
    } else {
      if(coins != 0) {
        if(scores[4] < coins){
          scores[4] = coins;
          scores.sort(function(a, b) { return b- a });
          coins = 0;
        }
      }
      
    }

    background(100);
    fill(0);
    textSize(36);
    text("Game Over", 285, 200);
    fill(255);

    textSize(24);
    text("Top 5 Scores: ", 305, 255);
    for (let i in scores) {
      text(scores[i], 350, 330 + (75 * i));
    }
  } else {
    background(100);
    fill(0);
    textSize(36);
    text("Game Menu", 285, 200);
    fill(255);

    for (let i = 1; i <= 3; i++) {
      if (i === difficulty) {
        fill(150);
      } else {
        fill(255);
      }

      rect(300, 175 + (i * 75), 150, 50);

    }

    fill(255);
    rect(325, 650, 100, 50);

    textSize(24);
    fill(0);
    text("Start", 350, 685);
    text("Easy", 350, 285);
    text("Medium", 340, 360);
    text("Hard", 350, 435);

    if (mouseX >= 300 && mouseX <= 450 &&
      mouseY >= 250 && mouseY <= 300 &&
      mouseIsPressed) {
      difficulty = 1;
    }
    if (mouseX >= 300 && mouseX <= 450 &&
      mouseY >= 325 && mouseY <= 375 &&
      mouseIsPressed) {
      difficulty = 2;
    }
    if (mouseX >= 300 && mouseX <= 450 &&
      mouseY >= 400 && mouseY <= 450 &&
      mouseIsPressed) {
      difficulty = 3;
    }

    if (mouseX >= 325 && mouseX <= 425 &&
      mouseY >= 650 && mouseY <= 700 &&
      mouseIsPressed) {
      for (let i = 0; i < 5 + difficulty; i++) {
        obstacles.push(new Obstacle(800 + ((250 - (50 * difficulty)) * obstacles.length), random([100, 200])));
      }
      gamePlay = true;
    }

    //if(mouseX)

  }


}

function toggleGodMode(){
  godMode = !godMode;
  console.log(godMode);
}

class Obstacle {
  constructor(xPos, size) {
    this.xPos = xPos;
    this.yPos = FLOOR - size;
    this.size = size;
  }

  checkCollision(playerX, playerY) {
    //Left side check
    if (playerX <= this.xPos + obstacleWidth && playerX >= this.xPos &&
      playerY >= this.yPos && playerY <= this.yPos + this.size &&
      hitState === false) {
      lives--;
      hitState = true;
      hitNoise.play();
    }

    //Right side check
    if (playerX + playerWidth <= this.xPos + obstacleWidth && playerX + playerWidth >= this.xPos &&
      playerY >= this.yPos && playerY <= this.yPos + this.size &&
      hitState === false) {
      lives--;
      hitState = true;
      hitNoise.play();
    }
  }

  checkOffScreen(obstacles) {
    if (this.xPos + obstacleWidth < 0) {
      //console.log(obstacles);
      obstacles.shift();
      this.xPos = obstacles[obstacles.length - 1].xPos + (250 - (50 * difficulty));
      this.size = random([100, 200]);
      this.yPos = FLOOR - this.size;
      obstacles.push(this);
    }
  }
}

class Coin {
  constructor(xPos, yPos) {
    this.xPos = xPos;
    this.yPos = yPos;
  }

  checkCollision(playerX, playerY) {
    if (!((this.yPos + coinSize / 2) < playerY ||
      (this.yPos - coinSize / 2) > (playerY + playerHeight) ||
      (this.xPos + coinSize / 2) < playerX ||
      (this.xPos - coinSize / 2) > (playerX + playerWidth))) {
      coins++;
      coinNoise.play();
      this.xPos = Math.floor(random(100, 700));
      this.yPos = Math.floor(random(250, FLOOR - 100));
    }

  }
}