let platformOn, platformOff;

//Board positioning variables
let xOffset = 32;
let yOffset = 22;
let boardxOffset = 200;

let placeholderAttack, placeholderBlock, placeholderBuff;

//Used to track where units are on the grid
let positions = [null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null];

let p;

let dummies = [];

let buffer = 0;
let cardData = [];
let deck;
let displayedCards = [];
let returnPile = [];
let cardBuffer = 0;

let projectiles = [];

let playerShield = [];

let prevPlayerGridTile;

let round = 0;
let paused = false;
//0 = Game not started
//1 = Game has started, can be paused with the above bool
//2 = Game Over via HP depleted -- Lose
//3 = Game Over via defeating Boss -- Win
let gameState = 0;

async function preload() {

    loadJSON('./cards.json', (obj) => {
        cardData = Object.values(obj);
    });
    
    platformOn = loadImage("assets/Platform_on.png");
    platformOff = loadImage("assets/Platform_off.png");

    placeholderAttack = loadImage("assets/cardart/placeholder_attack.png");
    placeholderBlock = loadImage("assets/cardart/placeholder_block.png");
    placeholderBuff = loadImage("assets/cardart/placeholder_buff.png");
    
}

function setup() {
    angleMode(DEGREES);
    createCanvas(800, 800);
    imageMode(CENTER);
    p = new Player(19);
    
    deck = new Deck(cardData);
    displayedCards.push(deck.cards.pop(), deck.cards.pop());
    for(let i = 4; i < 17; i+=9){
        if(i > 8){
            dummies.push(new Drone(i, 1));
        } else {
            dummies.push(new Drone(i));
        }
        
    }

    let test = positions.map((el, ind) => {
        if(el === null) {
            return ind;
        }
    }).filter(x => x !== undefined && x%8 > 3);
    console.log(test);
}

function draw() {
    if(gameState == 0) {
        background(100);
        fill(0);
        textSize(36);
        text("Game Menu", 285, 200);
        fill(255);

        /* for (let i = 1; i <= 3; i++) {

            rect(300, 175 + (i * 75), 150, 50);

        } */
        if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700) {
                fill(150);
            } else {
                fill(255);  
            }
        
        rect(325, 650, 100, 50);

        textSize(24);
        fill(0);
        text("Start", 350, 685);

        /* if (mouseX >= 300 && mouseX <= 450 &&
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
        } */

        

        if (mouseX >= 325 && mouseX <= 425 &&
        mouseY >= 650 && mouseY <= 700 &&
        mouseIsPressed) {
            frameCount = 0;
            gameState = 1;
        }
    } 
    //Core Game Loop 
    else if(gameState == 1 && !paused) {
        background(255);

        //Pause Button
        if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700) {
                fill(150);
            } else {
                fill(255);  
            }
        
        rect(325, 650, 100, 50);

        textSize(24);
        fill(0);
        text("Pause", 350, 685);
        
        if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700 &&
            mouseIsPressed) {
                paused = true;
            }

        //Check player health
        if(p.currentHealth <=  0){
            gameState = 2;
        }

        for(let i = 0; i < positions.length; i++){
            if(positions[i] != null){
                image(platformOn,boardxOffset+(i%8*xOffset), 100+(Math.floor(i/8)*yOffset));
            } else {
                image(platformOff,boardxOffset+(i%8*xOffset), 100+(Math.floor(i/8)*yOffset));
            }
            
        }
        p.display(); 
        p.move();
        p.useCard();
        if(prevPlayerGridTile != p.currentGridTile && frameCount%120 == 0){
            prevPlayerGridTile = p.currentGridTile;
        }

        for(const modifier of p.modifiers){
            if(!modifier.modified){
                modifier.modify(p);
                modifier.modified = true;
            } else {
                if(frameCount%60 == 0){
                    modifier.time--;
                }
                if(modifier.time <= 0){
                    modifier.unmodify(p);
                    console.log("unbuffed");
                    p.modifiers.splice(p.modifiers.indexOf(modifier), 1);
                }
            }
            
        }

        for(const proj of projectiles){
            proj.display();
            proj.checkCollision();
        }

        for(const dummy of dummies){
            dummy.display();
            if(frameCount%160 == 0){
                dummy.move();
            }
            if(frameCount%140 == 0){
                dummy.attack();
            }
        }

        if(buffer > 0){
            buffer--;
        }

        if(cardBuffer > 0){
            cardBuffer--;
        }

        //draw Cards
        textSize(12);
        deck.display();

        //Draw Health Bar
        rectMode(CORNER);
        fill(255);
        rect(0,465, 500, 25);
        fill(255, 0, 0);
        rect(0, 465, p.currentHealth*.5, 25);
        fill(0);
        textAlign(RIGHT);
        textFont("Times New Roman");
        textSize(16);
        text(Math.floor(p.currentHealth) + "/" +p.maxHealth,250,483);
        
        //Draw mana bar
        if(p.currentMana < p.maxMana/*  && frameCount%60 == 0 */){
            p.currentMana += p.manaRegen;
            if(p.currentMana > p.maxMana){
                p.currentMana = p.maxMana;
            }
        }
        rectMode(CORNER);
        fill(255);
        rect(0,500, 250, 25);
        fill(115, 169, 255);
        rect(0,500, p.currentMana*50 ,25);
        fill(0);
        textAlign(RIGHT);
        textFont("Times New Roman");
        textSize(16);
        text(Math.floor(p.currentMana) + "/" + p.maxMana,125,518);
    } 
    //Game Over -- Lose
    else if(gameState == 2){
        background(100);
        fill(0);
        textSize(36);
        text("Game Over", 285, 200);
        fill(255);

        /* for (let i = 1; i <= 3; i++) {

            rect(300, 175 + (i * 75), 150, 50);

        } */
       /*  if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700) {
                fill(150);
            } else {
                fill(255);  
            }
        
        rect(325, 650, 100, 50);

        textSize(24);
        fill(0);
        text("Start", 350, 685); */
    }
    //Game Over -- Win 
    else if(gameState == 3){
        background(100);
        fill(0);
        textSize(36);
        text("Game Over", 285, 200);
        fill(255);
    } 
    //gameState == 1 && paused
    else if(paused){
        rectMode(CORNER);
        fill(50);
        //Cover Screen with an opaque gray rect
        rect(0, 0, width, height, 100);

        textAlign(CENTER);
        textSize(72);
        text("PAUSED", width/2, height/2);

        //Unpause Button
        if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700) {
                fill(150);
            } else {
                fill(255);  
            }
        
        rect(325, 650, 100, 50);

        textSize(24);
        fill(0);
        text("Unpause", 350, 685);
        
        if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700 &&
            mouseIsPressed) {
                paused = false;
            }
    }
}
  
    

class Player {
    constructor(currentGridTile) {
        this.currentGridTile = currentGridTile;
        this.currentMana = 10;
        this.maxMana = 5;
        this.manaRegen = .5/60;
        positions[this.currentGridTile] = this;
        this.team = 1;
        this.maxHealth = 1000;
        this.currentHealth = 1000;
        this.damageModifier = 1;
        this.modifiers = [];
    }

    display() {
        fill(0);
        ellipse(boardxOffset+((this.currentGridTile%4)*xOffset), 95+((Math.floor(this.currentGridTile/8)*yOffset)), 15,15);
    }

    move() {
        //Left
        if(keyIsPressed && keyCode === 65 && buffer === 0 &&
            this.currentGridTile%8 != 0){
            positions[this.currentGridTile] = null;
            prevPlayerGridTile = this.currentGridTile;
            this.currentGridTile--;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
        //Right
        if(keyIsPressed && keyCode === 68 && buffer === 0 &&
            this.currentGridTile%8 < 3){
            positions[this.currentGridTile] = null;
            prevPlayerGridTile = this.currentGridTile;
            this.currentGridTile++;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
        //Up
        if(keyIsPressed && keyCode === 87 && buffer === 0 &&
            this.currentGridTile >= 8){
            positions[this.currentGridTile] = null;
            prevPlayerGridTile = this.currentGridTile;
            this.currentGridTile -= 8;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
        //Down
        if(keyIsPressed && keyCode === 83 && buffer === 0 &&
            this.currentGridTile/8 < 3){
            positions[this.currentGridTile] = null;
            prevPlayerGridTile = this.currentGridTile;
            this.currentGridTile += 8;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
    }

    useCard() {
        //Q
        if(keyIsPressed && keyCode === 81 && cardBuffer == 0 && p.currentMana >= displayedCards[0].cost && displayedCards[0].type != "empty"){
            returnPile.push(displayedCards[0]);
            cardBuffer = 15;
            p.currentMana -= displayedCards[0].cost;
            deck.play(displayedCards[0], this);
            if(deck.cards.length > 0){
                displayedCards[0] = deck.cards.pop();
                //deck.play();
            } else {
                displayedCards[0] = {
                    "name": "Empty",
                    "type": "empty",
                    "cost": 0,
                    "description": "No more cards in deck, use other card to reshuffle!",
                }
            }

            if(displayedCards[0].type == "empty" && displayedCards[1].type == "empty"){
                //shuffle deck
                deck.cards = returnPile
                    .map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
                console.log(deck.cards);
                returnPile = [];
                displayedCards[0] = deck.cards.pop();
                displayedCards[1] = deck.cards.pop();
            }
        }

        //E
        if(keyIsPressed && keyCode === 69 && cardBuffer == 0 && p.currentMana >= displayedCards[1].cost && displayedCards[1].type != "empty"){
            returnPile.push(displayedCards[1]);
            cardBuffer = 15;
            p.currentMana -= displayedCards[1].cost;
            deck.play(displayedCards[1], this);
            if(deck.cards.length > 0){
                displayedCards[1] = deck.cards.pop();
                //deck.play();
            } else {
                displayedCards[1] = {
                    "name": "Empty",
                    "type": "empty",
                    "cost": 0,
                    "description": "No more cards in deck, use other card to reshuffle!",
                }
            }

            if(displayedCards[0].type == "empty" && displayedCards[1].type == "empty"){
                //shuffle deck
                deck.cards = returnPile
                    .map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
                console.log(deck.cards);
                returnPile = [];
                displayedCards[0] = deck.cards.pop();
                displayedCards[1] = deck.cards.pop();
            }
        }
    }
}

class Drone {
    constructor(currentGridTile, type) {
        this.type = type || 0;
        this.currentGridTile = currentGridTile;
        positions[this.currentGridTile] = this;
        this.maxHealth = 20;
        this.currentHealth = 20;
        this.team = -1;
        this.damageModifier = 1;
    }

    display() {
        if(this.type == 1){
            fill(0);
        } else {
            fill(255);
        }
        ellipse(boardxOffset+(((this.currentGridTile%4)*xOffset)+(4*xOffset)), 95+((Math.floor(this.currentGridTile/8)*yOffset)), 15,15);
    }
    
    attack(){
        switch(this.type){
            default:
                projectiles.push(new Projectile(0, this.currentGridTile, this.team, this.damageModifier));
                break;
        }
    }

    move() {
        let newTile;
        switch(this.type){
            //Tries to chase player
            case 2:
                switch(prevPlayerGridTile){
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        newTile = random([4, 5, 6, 7]);
                        if(positions[newTile] == null){
                            positions[this.currentGridTile] = null;
                            this.currentGridTile = newTile;
                            positions[this.currentGridTile] = this;
                        }
                        break;
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        newTile = random([12, 13, 14, 15]);
                        if(positions[newTile] == null){
                            positions[this.currentGridTile] = null;
                            this.currentGridTile = newTile;
                            positions[this.currentGridTile] = this;
                        }
                        break;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                        newTile = random([20, 21, 22, 23]);
                        if(positions[newTile] == null){
                            positions[this.currentGridTile] = null;
                            this.currentGridTile = newTile;
                            positions[this.currentGridTile] = this;
                        }
                        break;
                    case 24:
                    case 25:
                    case 26:
                    case 27:
                        newTile = random([28, 29, 30, 31]);
                        if(positions[newTile] == null){
                            positions[this.currentGridTile] = null;
                            this.currentGridTile = newTile;
                            positions[this.currentGridTile] = this;
                        }
                        break;
                }
                break;
            //Randomly moves somewhere on the grid thats unoccupied
            case 1:
                newTile = random(positions.map((el, ind) => {
                        if(el === null) {
                            return ind;
                        }
                    }).filter(x => x !== undefined && x%8 > 3)
                );
                positions[this.currentGridTile] = null;
                this.currentGridTile = newTile;
                positions[this.currentGridTile] = this;
                break;
            //Randomly moves up, down, left or right, from it's current position
            case 0:
                const newTiles = [];
                if(this.currentGridTile < 22) {
                    newTiles.push(this.currentGridTile + 8);
                }

                if(this.currentGridTile > 8) {
                    newTiles.push(this.currentGridTile - 8);
                }

                if(this.currentGridTile%8 > 4){
                    newTiles.push(this.currentGridTile - 1);
                }

                if(this.currentGridTile%8 < 7){
                    newTiles.push(this.currentGridTile + 1);
                }

                newTile = random(newTiles);
                if(positions[newTile] == null){
                    positions[this.currentGridTile] = null;
                    this.currentGridTile = newTile;
                    positions[this.currentGridTile] = this;
                }
                break;
        }
        
        
        
    }
}

class Deck {
    constructor(cardData){
        this.cards = cardData;
    }

    display(){
        let cardxOffset = 150;
        rectMode(CENTER);

        //Deck
        fill(255);
        rect(50, 300, 50, 75);
        fill(0);
        textSize(24);
        textAlign(CENTER);
        text(this.cards.length, 50, 300);

        //Playable Cards
        for(let i = 0; i < displayedCards.length; i++){
            rect(cardxOffset + (105*i), 300, 101,151);
            switch(displayedCards[i].type){
                case "attack":
                    image(placeholderAttack, cardxOffset + (105 * i), 300, 100, 150);
                    break;
                case "block": 
                    image(placeholderBlock, cardxOffset + (105 * i), 300, 100, 150);
                    break;
                case "buff":
                    image(placeholderBuff, cardxOffset + (105 * i), 300, 100, 150);
                    break;
                default:
                    image(placeholderBuff, cardxOffset + (105 * i), 300, 100, 150);
                    break;
            }
            textAlign(LEFT);
            textSize(12);
            text(displayedCards[i].cost, cardxOffset + (105*i) + 40, 240);
            textAlign(CENTER);
            textSize(12);
            text(displayedCards[i].name, cardxOffset + (105*i), 310);
            textWrap(WORD);
            text(displayedCards[i].description, cardxOffset + (105*i), 320, 100);
            textSize(16);
            textStyle(BOLD);
            text("Q", 150, 395);
            text("E", 250, 395);
            textStyle(NORMAL);
            //textSize(12);
        }

        //Discard pile
        fill(255);
        rect(550,300, 50, 75);
        fill(0);
        textSize(24);
        text(returnPile.length, 550, 300);

    }

    play(card, unit) {
        switch(card.type){
            case "attack":
                projectiles.push(new Projectile(0, unit.currentGridTile, unit.team, unit.damageModifier));
                break;
            case "heal":
                unit.currentHealth += 50;
                if(unit.currentHealth > unit.maxHealth){
                    unit.currentHealth = unit.maxHealth;
                }
                break;
            case "buff":
                console.log("buffed");
                unit.modifiers.push({
                    modify: (unit) => {
                        unit.damageModifier *= 1.5;
                    },
                    time: 5,
                    modified: false,
                    unmodify: (unit) => {
                        unit.damageModifier /= 1.5;
                    }
                });
                break;
        }   
        
    }
}

class Projectile {
    constructor(type, summonGridTile, team, damageModifier) {
        this.type = type;
        this.team = team;
        this.xPos = team == 1 ? boardxOffset+(((summonGridTile)%4)*(xOffset+1)) : boardxOffset+((summonGridTile%4)*xOffset)*3;
        this.yPos = team == 1 ? 95+((Math.floor((summonGridTile + 1)/8)*yOffset)) : 95+((Math.floor(summonGridTile/8)*yOffset));
        this.speed = 1*team;
        this.damage = 10;
        this.currentGridTile = summonGridTile;
        this.damageModifer = damageModifier;
    }

    display() {
        if(this.xPos >= 450 || this.xPos < 200){
            projectiles.splice(projectiles.indexOf(this), 1);
        }
        switch(this.type){
            case 0:
                //console.log("0");
                fill(255, 0, 0);
                ellipse(this.xPos, this.yPos, 10, 10);
                this.xPos += this.speed;
                break;
            default: 
                //console.log("1");
                fill(255, 0, 0);
                ellipse(this.xPos, this.yPos, 10, 10);
                this.xPos += this.speed;
                break;
        }
        switch(this.team){
            case 1:
                if(this.xPos%32 == 0){
                this.currentGridTile++;
                }
                break;
            case -1:
                if(this.xPos%32 == 0){
                    this.currentGridTile--;
                }
                break;
        }
        
    }

    checkCollision() {
        for(let unit of positions){
            if(unit != null && this.currentGridTile == unit.currentGridTile && this.team != unit.team){
                unit.currentHealth -= this.damage * this.damageModifer;
                //console.log("HIT, UNITS HEALTH IS NOW: " + unit.currentHealth);
                projectiles.splice(projectiles.indexOf(this), 1);
                if(unit.currentHealth <= 0){
                    dummies.splice(dummies.indexOf(unit), 1);
                    positions[positions.indexOf(unit)] = null;
                }
            }
        }
    }
}