const robots = [];
const arrows = [];
const arrowSize = 50;

let thrusterOpacity, thrusterChange;
let upArrow, downArrow, rightArrow, leftArrow;

let d;

let score = 0;
let deaths = 0;
let lost = 0;
function preload() {
    upArrow = loadImage("assets/arrow_up.png");
    downArrow = loadImage("assets/arrow_down.png");
    rightArrow = loadImage("assets/arrow_right.png");
    leftArrow = loadImage("assets/arrow_left.png");

    upArrowLocked = loadImage("assets/arrow_up_locked.png");
    downArrowLocked = loadImage("assets/arrow_down_locked.png");
    rightArrowLocked = loadImage("assets/arrow_right_locked.png");
    leftArrowLocked = loadImage("assets/arrow_left_locked.png");
}

function setup() {
    angleMode(DEGREES);
    let canvas = createCanvas(800, 800);
    canvas.parent("#center");

    noStroke();
    /* let r1 = new Robot(0, height/2, 2);
    let r2 = new Robot(width,height/2,4);
    let r3 = new Robot(width/2, 0, 3);
    let r4 = new Robot(width/2, height, 1); */
    /* robots.push(r1,r2,r3,r4); */
    thrusterOpacity = 255;
    thrusterChange = -3;

    //First robot, frame 0
    //60 is smallest possible size of a robot
    robots.push(new Robot(0, height / 2 - 60, 2));

    /* let a1 = new Arrow(width/2, height/2);
    arrows.push(a1); */

    for (let i = width / 8; i < width; i += width / 8) {
        for (let j = height / 8; j < height; j += height / 8) {
            arrows.push(new Arrow(i, j));
        }

    }

    d = new Door();
}

function draw() {
    /* if (frameCount % 15 == 0) {
        console.log(1);
    } */
    if (robots.length < 40 && frameCount % 120 == 0) {
        robots.push(new Robot(0, height / 2 - 60, 2));
    }

    background(128);
    fill(0);
    textSize(20);
    textFont('Times New Roman');
    text("Robots Saved: " + score + "!", 5, 20);
    text("Robots lost: " + lost, 5, 40);
    if (deaths > 0) {
        text("Deaths: " + deaths + " :(", 5, 60);
    }
    if (thrusterOpacity >= 255) {
        thrusterChange = -3;
    }
    if (thrusterOpacity <= 0) {
        thrusterChange = 3;
    }
    thrusterOpacity += thrusterChange;
    for (const r of robots) {
        r.display();
        r.move();
        r.checkOffScreen();
    }

    for (const a of arrows) {
        a.display();
        a.checkClick();
    }

    d.display();
    d.checkRobots();
}

class Robot {
    constructor(xPos, yPos, direction) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.direction = direction;
        this.speed = 1;

        this.headColor = color(random(255), random(255), random(255));
        this.headSize = Math.floor(random(25, 50));
        this.bodyColor = color(random(255), random(255), random(255));
        this.bodySize = this.headSize + Math.floor(random(10, 20));
        this.eyeType = random() > .5 ? 1 : 2;

        this.mood = 0;
        this.state = 0; //0 = normal; 1 = rogue
    }

    display() {
        if (frameCount % 15 == 0 && this.mood < 255) {
            this.mood += (1 + (deaths/4));

        }
        if (this.mood >= 255) {
            if (this.eyeType == 1) {
                this.state = 1;
            } else {
                robots.splice(robots.indexOf(this), 1);
                deaths++;
            }
        }
        fill(252, 219, 3, thrusterOpacity);
        switch (this.direction) {
            case (1):
                ellipse(this.xPos - ((this.bodySize - this.headSize) / 2) + this.bodySize / 2, this.yPos + this.headSize + this.bodySize, this.bodySize / 2);
                break;
            case (2):
                ellipse(this.xPos - ((this.bodySize - this.headSize) / 2), this.yPos + this.headSize + (this.bodySize / 2), this.bodySize / 2);
                break;
            case (3):
                ellipse(this.xPos + (this.headSize / 2), this.yPos, this.bodySize / 2);
                break;
            case (4):
                ellipse(this.xPos - ((this.bodySize - this.headSize) / 2) + this.bodySize, this.yPos + this.headSize + (this.bodySize / 2), this.bodySize / 2);
                break;


        }

        fill(this.headColor);
        rect(this.xPos, this.yPos, this.headSize);
        fill(this.bodyColor);
        rect(this.xPos - ((this.bodySize - this.headSize) / 2), this.yPos + this.headSize, this.bodySize);

        //Visor eyes
        if (this.eyeType == 1) {
            fill(255, 255 - this.mood, 255 - this.mood);
            rect(this.xPos + this.headSize / 5, this.yPos + this.headSize / 8, this.headSize * .6, this.headSize / 3);

        //Double eyes
        } else {
            fill(255 - this.mood, 255 - this.mood, 255);
            rect(this.xPos + this.headSize / 5, this.yPos + this.headSize / 8, this.headSize / 5, this.headSize / 3);
            rect(this.xPos + (this.headSize * .6), this.yPos + this.headSize / 8, this.headSize / 5, this.headSize / 3);
        }


    }

    move() {
        switch (this.direction) {
            case (1):
                if(this.eyeType == 1){
                    this.yPos -= (this.speed + (this.mood/255));
                } else {
                    this.yPos -= (this.speed - (this.mood/510));
                }
                break;
            case (2):
                if(this.eyeType == 1){
                    this.xPos += (this.speed + (this.mood/255));
                } else {
                    this.xPos += (this.speed - (this.mood/510));
                }
                break;
            case (3):
                if(this.eyeType == 1){
                    this.yPos += (this.speed + (this.mood/255));
                } else {
                    this.yPos += (this.speed - (this.mood/510));
                }
                break;
            case (4):
                if(this.eyeType == 1){
                    this.xPos -= (this.speed + (this.mood/255));
                } else {
                    this.xPos -= (this.speed - (this.mood/510));
                }
                break;

        }

        for (const a of arrows) {
            if (this.xPos + this.headSize / 2 >= a.xPos - arrowSize / 2 && this.xPos + this.headSize / 2 <= a.xPos + arrowSize / 2 &&
                this.yPos + this.headSize + this.bodySize / 2 >= a.yPos - arrowSize / 2 && this.yPos + this.headSize + this.bodySize / 2 <= a.yPos + arrowSize / 2) {
                if (this.state != 1) {
                    this.direction = a.direction;
                } else {
                    a.direction = this.direction;
                }

            }
        }
    }

    checkOffScreen() {
        switch (this.direction) {
            case (1):
                if (this.yPos + this.headSize + this.bodySize + this.bodySize / 2 <= 0) {
                    robots.splice(robots.indexOf(this), 1);
                    lost++;
                }
                break;
            case (2):
                if (this.xPos - ((this.bodySize - this.headSize) / 2) - this.bodySize / 2 >= width) {
                    robots.splice(robots.indexOf(this), 1);
                    lost++;
                }
                break;
            case (3):
                if (this.yPos - this.bodySize / 2 >= height) {
                    robots.splice(robots.indexOf(this), 1);
                    lost++;
                }
                break;
            case (4):
                if (this.xPos - ((this.bodySize - this.headSize) / 2) + this.bodySize + this.bodySize / 2 <= 0) {
                    robots.splice(robots.indexOf(this), 1);
                    lost++;
                }
                break;
        }
    }

}

class Arrow {
    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;

        this.direction = Math.floor(random(1, 5));
        this.clickBuffer = 0;
        this.locked = false;
        this.numTurns = Math.floor(random(5));
    }

    display() {
        imageMode(CENTER);
        switch (this.locked) {
            case (true):
                switch (this.direction) {
                    case (1):
                        image(upArrowLocked, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                    case (2):
                        image(rightArrowLocked, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                    case (3):
                        image(downArrowLocked, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                    case (4):
                        image(leftArrowLocked, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                }
                break;
            case (false):
                switch (this.direction) {
                    case (1):
                        image(upArrow, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                    case (2):
                        image(rightArrow, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                    case (3):
                        image(downArrow, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                    case (4):
                        image(leftArrow, this.xPos, this.yPos, arrowSize, arrowSize);
                        break;
                }
                break;

        }

    }

    checkClick() {
        if (mouseX >= this.xPos - arrowSize / 2 && mouseX <= this.xPos + arrowSize / 2 &&
            mouseY >= this.yPos - arrowSize / 2 && mouseY <= this.yPos + arrowSize / 2 &&
            mouseIsPressed &&
            this.clickBuffer == 0 &&
            !this.locked) {
            
            if(keyIsPressed && keyCode == 17){
                this.direction--;
                if(this.direction <= 0 ){
                    this.direction = 4;
                }
            } else {
                this.direction++;
                if (this.direction > 4) {
                    this.direction = 1;
                }
            }
            

            this.clickBuffer = 10;
            this.numTurns++;
            if (this.numTurns >= 5) {
                this.locked = true;
            }
            console.log(this.direction);
        }

        if (this.clickBuffer > 0) {
            this.clickBuffer--;
        }
        
    }
}

class Door {
    constructor() {
        this.xPos = random([width * 2 / 8, width * 3 / 8, width * 4 / 8, width * 5 / 8, width * 6 / 8, width * 7 / 8, width]);
        this.yPos = this.xPos < width ? random([0, height]) : random([height / 8, height * 2 / 8, height * 3 / 8, height * 4 / 8, height * 5 / 8, height * 6 / 8, height * 7 / 8]);
        this.width = this.xPos < width ? 50 : 25;
        this.height = this.xPos < width ? 25 : 50;
    }

    display() {
        fill(255, 0, 0);
        rectMode(RADIUS);
        rect(this.xPos, this.yPos, this.width, this.height);
        rectMode(CORNER);
    }

    checkRobots() {
        for (const r of robots) {
            if (r.xPos + r.headSize / 2 >= this.xPos - this.width && r.xPos + r.headSize / 2 <= this.xPos + this.width &&
                r.yPos + r.headSize + r.bodySize / 2 >= this.yPos - this.height && r.yPos + r.headSize + r.bodySize / 2 <= this.yPos + this.height) {
                robots.splice(robots.indexOf(r), 1);
                score++;
                if (score % 10 == 0) {
                    this.xPos = random([width * 4 / 8, width * 5 / 8, width * 6 / 8, width * 7 / 8, width]);
                    this.yPos = this.xPos < width ? random([0, height]) : random([height / 8, height * 2 / 8, height * 3 / 8, height * 4 / 8, height * 5 / 8, height * 6 / 8, height * 7 / 8]);
                    this.width = this.xPos < width ? 50 : 25;
                    this.height = this.xPos < width ? 25 : 50;
                }

            }
        }
    }
}