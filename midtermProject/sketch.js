let tileArt;

let xOffset = 32;
let yOffset = 22;

let grid = [[ 0,  1,  2,  3,  4,  5,  6,  7],
            [ 8,  9, 10, 11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20, 21, 22, 23], 
            [24, 25, 26, 27, 28, 29, 30, 31]]

let p;

let buffer = 0;

function preload() {
    tileArt = loadImage("assets/Platform_off.png");
}

function setup() {
    angleMode(DEGREES);
    createCanvas(800, 800);

    imageMode(CENTER);

    

    p = new Player(19);
}

function draw() {
    
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            image(tileArt, 100+(j*xOffset), 100+(i*yOffset));
        }
    }

    p.display(); 
    p.move();

    if(buffer > 0){
        buffer--;
    }
}
  
    

class Player {
    constructor(currentGridTile) {
        this.currentGridTile = currentGridTile;
    }

    display() {
        fill(0);
        ellipse(100+((this.currentGridTile%4)*xOffset), 95+((Math.floor(this.currentGridTile/8)*yOffset)), 15,15);
    }

    move() {
        //Left
        if(keyIsPressed && keyCode === 65 && buffer === 0 &&
            this.currentGridTile%8 != 0){
            this.currentGridTile--;
            buffer = 15;
        }
        //Right
        if(keyIsPressed && keyCode === 68 && buffer === 0 &&
            this.currentGridTile%8 < 3){
            this.currentGridTile++;
            buffer = 15;
        }
        //Up
        if(keyIsPressed && keyCode === 87 && buffer === 0 &&
            this.currentGridTile/8 > 1){
            this.currentGridTile -= 8;
            buffer = 15;
        }
        //Down
        if(keyIsPressed && keyCode === 83 && buffer === 0 &&
            this.currentGridTile/8 < 3){
            this.currentGridTile += 8;
            buffer = 15;
        }
    }
}