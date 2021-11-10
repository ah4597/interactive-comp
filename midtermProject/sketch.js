let platformOn, platformOff;

//Board positioning variables
let xOffset = 100;
let yOffset = xOffset * .6875;
let boardxOffset = 50;
let boardyOffset = 200;

let placeholderAttack, placeholderBlock, placeholderBuff;

//Used to track where units are on the grid
let positions = [null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null];

let p;

let bots = [];

let cardData = [];
let deck;
let displayedCards = [];
let returnPile = [];

let projectiles = [];

let playerShield = [];

let prevPlayerGridTile;

let countdown = 0;

let round = 0;
let play = false;
let paused = false;
//0 = Game not started
//1 = Game has started, can be paused with the above bool
//2 = Game Over via HP depleted -- Lose
//3 = Game Over via defeating Boss -- Win
let gameState = 0;
let spawned = false;

let timer = 0;

let recorded = false;
let waiting = false;

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
}

function draw() {
    if (gameState == 0) {
        background(163, 229, 240);
        fill(0);
        textSize(36);
        text("Game Menu", 285, 200);
        fill(255);

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

        if (mouseX >= 325 && mouseX <= 425 &&
            mouseY >= 650 && mouseY <= 700 &&
            mouseIsPressed) {
            frameCount = 0;
            gameState = 1;
            round = 1;
            play = true;
            waiting = false;
        }
    }
    //Core Game Loop 
    else if (gameState == 1 && !paused) {
        background(255);

        //Map / Progress bar
        fill(40,115,40);
        rectMode(CORNER);
        //noStroke();
        
        if(round <= 1){
            fill(100)
        }
        rect(width/5, 20, 200, 10);
        ellipse(width/5, 25, 25, 25);
        if(round <= 2){
            fill(100);
        }
        rect(width/5+200, 20, 200, 10);
        ellipse(width/5 + 200, 25, 25, 25);
        
        if(round <= 3){
            fill(100);
        }
        ellipse(width/5 + 400, 25, 25, 25);

        textAlign(LEFT);
        textSize(16);
        fill(0);
        text(timer, 0, 25);
        if(frameCount%60 == 0) {
            timer++;
        }

        //Pause Button
        if (mouseX >= width - 100 && mouseX <= width &&
            mouseY >= 0 && mouseY <= 25) {
            fill(150);
        } else {
            fill(255);
        }

        rect(width - 100, 0, 100, 25);
        textAlign(CENTER);
        textSize(24);
        fill(0);
        text("(P)ause", 750, 20);

        if (mouseX >= width - 100 && mouseX <= width &&
            mouseY >= 0 && mouseY <= 25 &&
            mouseIsPressed) {
            paused = true;
        }

        if(bots.length <= 0 && round != 3){
            if(countdown > 0){
                fill(0);
                textSize(24);
                textAlign(CENTER);
                text(Math.floor(countdown), width/2, 100);
                if(frameCount%60 == 0){
                    countdown--;
                    if(countdown <= 0){
                        round++;
                        spawned = false;
                    }
                }
            } else {
                fill(0);
                textSize(24);
                textAlign(CENTER);
                text("Round Over! Press Spacebar, or the button above to continue to the next round!\nYou cannot use cards in between rounds!", width/2, 115);
                waiting = true;
                //Continue button
                if (mouseX >= width/2 - 50 && mouseX <= width/2 + 50 &&
                    mouseY >= 25 && mouseY <= 50) {
                    fill(150);
                } else {
                    fill(255);
                }
                rectMode(CORNER);
                rect(width/2-50, 55, 100, 25);
                fill(0);
                textSize(16);
                text("CONTINUE", width/2, 75);
                if (mouseX >= width/2 - 50 && mouseX <= width/2 + 50 &&
                mouseY >= 25 && mouseY <= 50 &&
                mouseIsPressed) {
                    countdown = 5;
                }
            }
        } else if (bots.length <= 0 && round == 3){
            gameState = 3;
        }   

        //Spawn enemies based on round
        if (round == 1 && !spawned) {
            //Spawn 3 random enemies, either turrets or type 1 movement
            for (let i = 0; i < 3; i++) {
                bots.push(new Bot(random(positions.map((el, ind) => {
                    if (el === null) {
                        return ind;
                    }
                }).filter(x => x !== undefined && x % 8 > 3)
                ), random([0, 1])
                ));
            }
            spawned = true;
            waiting = false;
        } else if (round == 2 && !spawned) {
            //Spawn 5 random enemies that move via type 1 or type 2
            for (let i = 0; i < 5; i++) {
                bots.push(new Bot(random(positions.map((el, ind) => {
                    if (el === null) {
                        return ind;
                    }
                }).filter(x => x !== undefined && x % 8 > 3)
                ), random([1, 2]), 30)
                );
            }
            spawned = true;
            waiting = false;
        } else if (round == 3 && !spawned) {
            //Spawn 2 sentries in the corners
            bots.push(new Bot(7, 0, 50));
            bots.push(new Bot(31, 0, 50));
            //Spawn 2 random enemies that move via type 1 or type 2
            for (let i = 0; i < 2; i++) {
                bots.push(new Bot(random(positions.map((el, ind) => {
                    if (el === null) {
                        return ind;
                    }
                }).filter(x => x !== undefined && x % 8 > 3)
                ), random([1, 2]), 30)
                );
            }
            //Spawn the boss
            bots.push(new Bot(random(positions.map((el, ind) => {
                if (el === null) {
                    return ind;
                }
            }).filter(x => x !== undefined && x % 8 > 3)
            ), 3, 500)
            );
            spawned = true;
            waiting = false;
        }

        //Check player health
        if (p.currentHealth <= 0) {
            gameState = 2;
        }

        for (let i = 0; i < positions.length; i++) {
            if (positions[i] != null) {
                image(platformOn, boardxOffset + (i % 8 * xOffset), boardyOffset + (Math.floor(i / 8) * yOffset), xOffset, xOffset);
            } else {
                image(platformOff, boardxOffset + (i % 8 * xOffset), boardyOffset + (Math.floor(i / 8) * yOffset), xOffset, xOffset);
            }

        }

        p.display();
        if(p.iframes > 0) {
            p.iframes--;
        }
        p.move();
        p.useCard();

        if (prevPlayerGridTile != p.currentGridTile && frameCount % 120 == 0) {
            prevPlayerGridTile = p.currentGridTile;
        }

        for (const modifier of p.modifiers) {
            if (!modifier.modified) {
                modifier.modify(p);
                modifier.modified = true;
            } else {
                if (frameCount % 60 == 0) {
                    modifier.time--;
                }
                if (modifier.time <= 0) {
                    modifier.unmodify(p);
                    console.log("unbuffed");
                    p.modifiers.splice(p.modifiers.indexOf(modifier), 1);
                }
            }

        }

        for (const proj of projectiles) {
            proj.display();
            proj.checkCollision();
            if(proj.type == 1 && frameCount%60 == 0){
                proj.lifetime--;
                if(proj.lifetime <= 0){
                    projectiles.splice(projectiles.indexOf(proj), 1);
                }
            }
        }

        for (const bot of bots) {
            bot.display();
            switch(bot.type){
                case 0:
                    if(frameCount % 250 == 0) {
                        bot.attack();
                    }
                    break;
                case 1:
                    if(frameCount%200 == 0) {
                        bot.move();
                    }
                    if(frameCount%100 == 0) {
                        bot.attack();
                    }
                    break;
                case 2:
                    if(frameCount%150 == 0) {
                        bot.move();
                        bot.attack();
                    }
                    break;
                case 3:
                    if(frameCount%100 == 0) {
                        bot.move();
                        bot.attack();
                    }
            }
        }

        //draw Cards
        textSize(12);
        deck.display();

        //Draw Health Bar
        rectMode(CORNER);
        fill(255);
        rect(0, height - 100, 500, 25);
        fill(255, 0, 0);
        rect(0, height - 100, p.currentHealth * .5, 25);
        fill(0);
        textAlign(RIGHT);
        textFont("Times New Roman");
        textSize(16);


        //Draw shield if any
        if (p.shields.length > 0) {
            let totalShield = p.shields.reduce((prev, curr) => prev + curr);
            fill(250, 190, 50);
            rect(p.currentHealth * .5, height - 100, totalShield * .5, 25);
            fill(0);
            text(Math.floor(p.currentHealth) + "(" + totalShield + ")/" + p.maxHealth, 250, height - 80);
        } else {
            fill(0);
            text(Math.floor(p.currentHealth) + "/" + p.maxHealth, 250, height - 80);
        }

        //Draw mana bar
        if (p.currentMana < p.maxMana/*  && frameCount%60 == 0 */) {
            p.currentMana += p.manaRegen;
            if (p.currentMana > p.maxMana) {
                p.currentMana = p.maxMana;
            }
        }
        rectMode(CORNER);
        fill(255);
        rect(0, height - 60, 250, 25);
        fill(115, 169, 255);
        rect(0, height - 60, p.currentMana * 50, 25);
        fill(0);
        textAlign(RIGHT);
        textFont("Times New Roman");
        textSize(16);
        text(Math.floor(p.currentMana) + "/" + p.maxMana, 125, height - 40);
    }
    //Game Over -- Lose
    else if (gameState == 2) {
        background(100);
        fill(0);
        textSize(36);
        textAlign(CENTER);
        text("Game over.", width/2, 200);
        textSize(24);
        let times = JSON.parse(window.localStorage.getItem('times'));
        //console.log(times);
        if(times == null || times.length <= 0){
            window.localStorage.setItem('times', '[]');
            times = [];
            text("No times recorded locally yet! Good luck!", width/2, 230);
        } else {
            text("Here are the fastest times locally: ", width/2, 230);
            fill(255);
            for(let i in times){
                textAlign(CENTER);
                textSize(20);
                fill(0);
                text((int(i) + 1) + ".     " + times[i], width/2, 275 + (75 * i));
            }
        }
        
    }
    //Game Over -- Win 
    else if (gameState == 3) {
        let times = JSON.parse(window.localStorage.getItem('times'));
        //console.log(times);
        if(times == null){
            window.localStorage.setItem('times', '[]');
            times = [];
        }
        
        if(times.length < 5 && !recorded){
            times.push(timer);
            times.sort(function (a, b) { return a - b });
            window.localStorage.setItem('times', JSON.stringify(times));
            recorded = true;
        } else if(times[4] > timer && !recorded){
            times[4] = timer;
            times.sort(function (a, b) { return a - b });
            window.localStorage.setItem('times', JSON.stringify(times));
            recorded = true;
        }

        background(200);
        fill(0);
        textSize(36);
        textAlign(CENTER);
        text("Great job, you won!", width/2, 200);
        textSize(24);
        text("Here are the fastest times locally: ", width/2, 230);
        fill(255);
        for(let i in times){
            textAlign(CENTER);
            textSize(20);
            if(times.indexOf(timer) == i){
                fill(0);
                let placement = int(i) + 1;
                text("Congratulations, you are #" + placement + " on the leaderboard!", width/2, height-100);
                fill(255, 244, 84);
            } else {
                fill(0);
            }

            text((int(i) + 1) + ".     " + times[i], width/2, 275 + (75 * i));
        }
    }
    //gameState == 1 && paused
    else if (paused) {
        rectMode(CORNER);
        fill(201, 201, 201, 10);
        //Cover Screen with an opaque gray rect
        rect(0, 0, width, height);
        textAlign(CENTER);
        fill(0);
        textSize(72);
        text("PAUSED", width / 2, height / 2);
        textSize(16);
        text("'p' to unpause, or press button below.", width / 2, height / 2 + 50);
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
        text("Unpause", 375, 685);

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
        this.maxMana = 10;
        this.manaRegen = 60 / 60;
        positions[this.currentGridTile] = this;
        this.team = 1;
        this.maxHealth = 1000;
        this.currentHealth = 10;
        this.damageModifier = 1;
        this.shields = [];
        this.modifiers = [];
        this.iframes = 0;
    }

    display() {
        fill(0);
        ellipse(boardxOffset + ((this.currentGridTile % 4) * xOffset), boardyOffset - 5 + ((Math.floor(this.currentGridTile / 8) * yOffset)), 15, 15);
    }

    move(direction) {
        switch (direction) {
            case "left":
                if (this.currentGridTile % 8 != 0) {
                    positions[this.currentGridTile] = null;
                    prevPlayerGridTile = this.currentGridTile;
                    this.currentGridTile--;
                    positions[this.currentGridTile] = this;
                }
                break;
            case "right":
                if (this.currentGridTile % 8 < 3) {
                    positions[this.currentGridTile] = null;
                    prevPlayerGridTile = this.currentGridTile;
                    this.currentGridTile++;
                    positions[this.currentGridTile] = this;
                }
                break;
            case "up":
                if (this.currentGridTile >= 8) {
                    positions[this.currentGridTile] = null;
                    prevPlayerGridTile = this.currentGridTile;
                    this.currentGridTile -= 8;
                    positions[this.currentGridTile] = this;
                }
                break;
            case "down":
                if (this.currentGridTile / 8 < 3) {
                    positions[this.currentGridTile] = null;
                    prevPlayerGridTile = this.currentGridTile;
                    this.currentGridTile += 8;
                    positions[this.currentGridTile] = this;
                }
                break;
        }
    }

    useCard(key) {
        //Q
        switch (key) {
            case 'q':
                if (p.currentMana >= displayedCards[0].cost && displayedCards[0].type != "empty") {
                    returnPile.push(displayedCards[0]);
                    p.currentMana -= displayedCards[0].cost;
                    deck.play(displayedCards[0], this);
                    if (deck.cards.length > 0) {
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

                    if (displayedCards[0].type == "empty" && displayedCards[1].type == "empty") {
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
                break;
            case 'e':
                if (p.currentMana >= displayedCards[1].cost && displayedCards[1].type != "empty") {
                    returnPile.push(displayedCards[1]);
                    p.currentMana -= displayedCards[1].cost;
                    deck.play(displayedCards[1], this);
                    if (deck.cards.length > 0) {
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

                    if (displayedCards[0].type == "empty" && displayedCards[1].type == "empty") {
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
}

class Bot {
    constructor(currentGridTile, type, maxHealth, team) {
        //type 0 = stationary
        //type 1 = teleports randomly
        //type 2 = moves randomly up, down, left, or right
        //type 3 = attempts to chase player by teleporting to a random tile in the row the player was recently on
        this.type = type || 0;
        this.currentGridTile = currentGridTile;
        positions[this.currentGridTile] = this;
        this.maxHealth = maxHealth || 20;
        this.currentHealth = maxHealth || 20;
        this.team = team || -1;
        this.damageModifier = 1;
        this.shields = [];
        this.size = 15;
    }

    display() {
        if (this.type == 1) {
            fill(0);
        } else {
            fill(255);
        }
        ellipse(boardxOffset + (((this.currentGridTile % 4) * xOffset) + (4 * xOffset)), boardyOffset - 5 + ((Math.floor(this.currentGridTile / 8) * yOffset)), this.size, this.size);
        rectMode(CORNER);
        fill(255);
        rect(boardxOffset + (((this.currentGridTile % 4) * xOffset) + (4 * xOffset)) - this.size * 2, boardyOffset - 5 + ((Math.floor(this.currentGridTile / 8) * yOffset)) + 20, 70 + 1, 11);
        fill(255, 0, 0);
        rect(boardxOffset + (((this.currentGridTile % 4) * xOffset) + (4 * xOffset)) - this.size * 2, boardyOffset - 5 + ((Math.floor(this.currentGridTile / 8) * yOffset)) + 20, this.currentHealth/this.maxHealth*70, 10);

    }

    attack() {
        switch (this.type) {
            case 0:
                projectiles.push(new Projectile(1, this.currentGridTile, this.team, this.damageModifier));
            default:
                projectiles.push(new Projectile(0, this.currentGridTile, this.team, this.damageModifier));
                break;
        }
    }

    move() {
        let newTile;
        switch (this.type) {
            //Tries to chase player
            case 3:
                switch (prevPlayerGridTile) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        newTile = random([4, 5, 6, 7]);
                        if (positions[newTile] == null) {
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
                        if (positions[newTile] == null) {
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
                        if (positions[newTile] == null) {
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
                        if (positions[newTile] == null) {
                            positions[this.currentGridTile] = null;
                            this.currentGridTile = newTile;
                            positions[this.currentGridTile] = this;
                        }
                        break;
                }
                break;
            //Randomly moves somewhere on the grid thats unoccupied
            case 2:
                newTile = random(positions.map((el, ind) => {
                    if (el === null) {
                        return ind;
                    }
                }).filter(x => x !== undefined && x % 8 > 3)
                );
                positions[this.currentGridTile] = null;
                this.currentGridTile = newTile;
                positions[this.currentGridTile] = this;
                break;
            //Randomly moves up, down, left or right, from it's current position
            case 1:
                const newTiles = [];
                if (this.currentGridTile < 22) {
                    newTiles.push(this.currentGridTile + 8);
                }

                if (this.currentGridTile > 8) {
                    newTiles.push(this.currentGridTile - 8);
                }

                if (this.currentGridTile % 8 > 4) {
                    newTiles.push(this.currentGridTile - 1);
                }

                if (this.currentGridTile % 8 < 7) {
                    newTiles.push(this.currentGridTile + 1);
                }

                newTile = random(newTiles);
                if (positions[newTile] == null) {
                    positions[this.currentGridTile] = null;
                    this.currentGridTile = newTile;
                    positions[this.currentGridTile] = this;
                }
                break;
            //Stationary
            default:
                break;
        }



    }
}

class Deck {
    constructor(cardData) {
        this.cards = cardData;
    }

    display() {
        let cardxOffset = 200;
        rectMode(CENTER);

        //Deck
        fill(255);
        rect(50, height - 250, 50, 75);
        fill(0);
        textSize(24);
        textAlign(CENTER);
        text(this.cards.length, 50, height - 250);

        //Playable Cards
        for (let i = 0; i < displayedCards.length; i++) {
            rect(cardxOffset + (205 * i), height - 250, 101, 151);
            switch (displayedCards[i].type) {
                case "attack":
                    image(placeholderAttack, cardxOffset + (205 * i), height - 250, 100, 150);
                    break;
                case "block":
                    image(placeholderBlock, cardxOffset + (205 * i), height - 250, 100, 150);
                    break;
                case "buff":
                    image(placeholderBuff, cardxOffset + (205 * i), height - 250, 100, 150);
                    break;
                default:
                    image(placeholderBuff, cardxOffset + (205 * i), height - 250, 100, 150);
                    break;
            }
            textAlign(LEFT);
            textSize(12);
            text(displayedCards[i].cost, cardxOffset + (205 * i) + 40, height - 310);
            textAlign(CENTER);
            textSize(12);
            text(displayedCards[i].name, cardxOffset + (205 * i), height - 240);
            textWrap(WORD);
            text(displayedCards[i].description, cardxOffset + (205 * i), height - 230, 100);
            textSize(16);
            textStyle(BOLD);
            text("Q", cardxOffset, height - 155);
            text("E", cardxOffset + 205, height - 155);
            textStyle(NORMAL);
            //textSize(12);
        }

        //Discard pile
        fill(255);
        rect(550, height - 250, 50, 75);
        fill(0);
        textSize(24);
        text(returnPile.length, 550, height - 250);

    }

    play(card, unit) {
        switch (card.type) {
            case "attack":
                projectiles.push(new Projectile(0, unit.currentGridTile, unit.team, unit.damageModifier));
                break;
            case "heal":
                unit.currentHealth += 50;
                if (unit.currentHealth > unit.maxHealth) {
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
            case "block":
                console.log("shielding");
                unit.modifiers.push({
                    modify: (unit) => {
                        unit.shields.push(50);
                    },
                    time: 5,
                    modified: false,
                    unmodify: (unit) => {
                        unit.shields.splice(0, 1);
                    }
                });
                break;

        }

    }
}

class Projectile {
    constructor(type, summonGridTile, team, damageModifier) {
        this.size = 10;
        this.type = type;
        this.team = team;
        this.xPos = team == 1 ? boardxOffset + (((summonGridTile) % 4) * (xOffset + 1)) : boardxOffset + (((summonGridTile % 4) * xOffset) + (4 * xOffset));
        this.yPos = team == 1 ? boardyOffset - (this.size / 2) + ((Math.floor((summonGridTile + 1) / 8) * yOffset)) : boardyOffset - (this.size / 2) + ((Math.floor(summonGridTile / 8) * yOffset));
        this.speed = 1 * team;
        this.damage = this.type == 0 ? 10 : 25;
        this.currentGridTile = summonGridTile;
        this.damageModifier = damageModifier;

        if(this.type == 1){
            this.lifetime = 1;
        }
    }

    display() {
        if (this.xPos >= boardxOffset + xOffset * 8 || this.xPos < boardxOffset - xOffset / 2) {
            projectiles.splice(projectiles.indexOf(this), 1);
        }
        switch (this.type) {
            case 0:
                fill(255, 0, 0);
                ellipse(this.xPos, this.yPos, this.size, this.size);
                this.xPos += this.speed;
                break;
            case 1:
                fill(255, 0, 0);
                rectMode(CORNER);
                rect(0, this.yPos-yOffset/4, this.xPos, yOffset/2);
                break;
            default:
                //console.log("1");
                fill(255, 0, 0);
                ellipse(this.xPos, this.yPos, this.size, this.size);
                this.xPos += this.speed;
                break;
        }
        this.currentGridTile = Math.ceil(((this.xPos - this.size / 2) - boardxOffset - (xOffset / 2)) / xOffset) + Math.floor((this.yPos - boardyOffset + (this.size / 2)) / yOffset) * 8;
    }

    checkCollision() {
        switch(this.type){
            case 0:
                for (let unit of positions) {
                    if (unit != null && this.currentGridTile == unit.currentGridTile && this.team != unit.team) {
                        if (unit.shields.length > 0) {
                            let totalDamage = this.damage * this.damageModifier;
                            console.log(totalDamage);
                            for (let i = 0; i < unit.shields.length; i++) {
                                if (unit.shields[i] > totalDamage) {
                                    unit.shields[i] -= totalDamage;
                                    console.log(unit.shields);
                                    break;
                                } else {
                                    totalDamage -= unit.shields[i];
                                    unit.shields[i] = 0;
                                    unit.shields.splice(0, 1);
                                }
                            }
                        } else {
                            if(unit.hasOwnProperty("iframes")){
                                if(unit.iframes <= 0) {
                                    unit.currentHealth -= this.damage * this.damageModifier;
                                    unit.iframes = 15;
                                }
                                
                            } else {
                                unit.currentHealth -= this.damage * this.damageModifier;
                            }
                            
                        }

                        //console.log("HIT, UNITS HEALTH IS NOW: " + unit.currentHealth);
                        projectiles.splice(projectiles.indexOf(this), 1);
                        if (unit.currentHealth <= 0) {
                            bots.splice(bots.indexOf(unit), 1);
                            positions[positions.indexOf(unit)] = null;
                        }
                        
                    }
                }
                break;
            case 1:
                for(let i = Math.floor((this.yPos - boardyOffset + (this.size / 2)) / yOffset) * 8; i < Math.floor((this.yPos - boardyOffset + (this.size / 2)) / yOffset) * 8 + 8; i++){
                    if(positions[i] != null && positions[i].team != this.team) {
                        if(positions[i].hasOwnProperty("iframes")) {
                            if(positions[i].iframes <= 0){
                                positions[i].currentHealth -= this.damage * this.damageModifier;
                                positions[i].iframes = 15;
                            } 
                    } else {
                            positions[i].currentHealth -= this.damage * this.damageModifier;
                        }
                    }
                }
                break;
        }
        
    }
}

function keyPressed() {
    if (key == 'p') {
        paused = !paused;
    }
    if (gameState == 1 && !paused) {
        if (key == 'w') {
            p.move('up');
        }
        if (key == 'a') {
            p.move('left');
        }
        if (key == 's') {
            p.move('down');
        }
        if (key == 'd') {
            p.move('right');
        }
        if (key == 'q' && !waiting) {
            p.useCard('q');
        }
        if (key == 'e' && !waiting) {
            p.useCard('e');
        }
        if(keyCode == 32 && spawned) {
            countdown = 5;
        }
    }
}