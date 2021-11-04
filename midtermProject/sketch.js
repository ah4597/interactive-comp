let platformOn, platformOff;
let xOffset = 32;
let yOffset = 22;
let boardxOffset = 200;

let placeholderAttack, placeholderBlock, placeholderBuff;

/* let grid = [[ 0,  1,  2,  3,  4,  5,  6,  7],
            [ 8,  9, 10, 11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20, 21, 22, 23], 
            [24, 25, 26, 27, 28, 29, 30, 31]]; */

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

async function preload() {
    /* await fetch("./cards.json")
        .then(response => response.json())
        .then(data => {
            cardData = data;
        }); */

    loadJSON('./cards.json', (obj) => {
        for(const card of obj){
            cardData.push(card);
        }
    }
    );
    console.log(cardData);
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
    /* for(const card of cardData){
        console.log(card);
    } */

    p = new Player(19);
    
    deck = new Deck(cardData);
    displayedCards.push(deck.cards.pop(), deck.cards.pop());
    for(let i = 2; i < 4; i++){
        dummies.push(new Drone(6 + 8*i));
    }
}

function draw() {
    background(255);
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

    for(const proj of projectiles){
        proj.display();
        proj.checkCollision();
    }

    for(const dummy of dummies){
        dummy.display();
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
  
    

class Player {
    constructor(currentGridTile) {
        this.currentGridTile = currentGridTile;
        this.currentMana = 0;
        this.maxMana = 5;
        this.manaRegen = .5/60;
        positions[this.currentGridTile] = this;
        this.team = 1;
        this.maxHealth = 1000;
        this.currentHealth = 1000;
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
            this.currentGridTile--;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
        //Right
        if(keyIsPressed && keyCode === 68 && buffer === 0 &&
            this.currentGridTile%8 < 3){
            positions[this.currentGridTile] = null;
            this.currentGridTile++;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
        //Up
        if(keyIsPressed && keyCode === 87 && buffer === 0 &&
            this.currentGridTile > 8){
            positions[this.currentGridTile] = null;
            this.currentGridTile -= 8;
            positions[this.currentGridTile] = this;
            buffer = 15;
        }
        //Down
        if(keyIsPressed && keyCode === 83 && buffer === 0 &&
            this.currentGridTile/8 < 3){
            positions[this.currentGridTile] = null;
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
            projectiles.push(new Projectile(0, p.currentGridTile, p.team));
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
            projectiles.push(new Projectile(0, p.currentGridTile, p.team));
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
    constructor(currentGridTile) {
        this.type = 0;
        this.currentGridTile = currentGridTile;
        positions[this.currentGridTile] = this;
        this.maxHealth = 20;
        this.currentHealth = 20;
        this.team = -1;
    }

    display() {
        fill(0);
        ellipse(boardxOffset+((this.currentGridTile%4)*xOffset)*3, 95+((Math.floor(this.currentGridTile/8)*yOffset)), 15,15);
    }
    
    attack(){
        switch(this.type){
            default:
                projectiles.push(new Projectile(0, this.currentGridTile, this.team));
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

    play(summonGridTile) {
        projectiles.push(new Projectile(0, summonGridTile));
    }
}

class Projectile {
    constructor(type, summonGridTile, team) {
        this.type = type;
        this.team = team;
        this.xPos = team == 1 ? boardxOffset+(((summonGridTile)%4)*(xOffset+1)) : boardxOffset+((summonGridTile%4)*xOffset)*3;
        this.yPos = team == 1 ? 95+((Math.floor((summonGridTile + 1)/8)*yOffset)) : 95+((Math.floor(summonGridTile/8)*yOffset));
        this.speed = 1*team;
        this.damage = 10;
        this.currentGridTile = summonGridTile;
        
    }

    display() {
        if(this.xPos >= 450 || this.xPos < 200){
            projectiles.splice(projectiles.indexOf(this), 1);
        }
        switch(this.type){
            case 0:
                console.log("0");
                fill(255, 0, 0);
                ellipse(this.xPos, this.yPos, 10, 10);
                this.xPos += this.speed;
                break;
            default: 
                console.log("1");
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
                unit.currentHealth -= this.damage;
                console.log("HIT, UNITS HEALTH IS NOW: " + unit.currentHealth);
                projectiles.splice(projectiles.indexOf(this), 1);
                if(unit.currentHealth <= 0){
                    dummies.splice(dummies.indexOf(unit), 1);
                    positions[positions.indexOf(unit)] = null;
                }
            }
        }
    }
}