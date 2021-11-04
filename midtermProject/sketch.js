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
let cardData;
let deck;
let displayedCards = [];
let returnPile = [];
let cardBuffer = 0;


async function preload() {
    await fetch("./cards.json")
        .then(response => response.json())
        .then(data => {
            cardData = data;
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
    for(const card of cardData){
        console.log(card);
    }

    p = new Player(19);

    /* rectMode(CENTER);
    for(let i = 0; i < cardData.length; i++){
        rect(100 + (105*i), 300, 101,151);
        switch(cardData[i].type){
            case "attack":
                image(placeholderAttack, 100 + (105 * i), 300, 100, 150);
                break;
            case "block": 
                image(placeholderBlock, 100 + (105 * i), 300, 100, 150);
                break;
            case "buff":
                image(placeholderBuff, 100 + (105 * i), 300, 100, 150);
                break;
        }
        textAlign(CENTER);
        text(cardData[i].name, 100 + (105*i), 310);
        textWrap(WORD);
        text(cardData[i].description, 100 + (105*i), 320, 100);
        
    } */
    
    
    deck = new Deck(cardData);
    displayedCards.push(deck.cards.pop(), deck.cards.pop());
    for(let i = 0; i < 4; i++){
        dummies.push(new Drone(6 + 8*i));
    }
}

function draw() {

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

    for(const dummy of dummies){
        dummy.display();
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
    text(Math.floor(p.currentMana) + "/5",125,518);
}
  
    

class Player {
    constructor(currentGridTile) {
        this.currentGridTile = currentGridTile;
        this.currentMana = 0;
        this.maxMana = 5;
        this.manaRegen = .5/60;
        positions[this.currentGridTile] = this;
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
            this.currentGridTile/8 > 0){
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
            if(deck.cards.length > 0){
                displayedCards[0] = deck.cards.pop();
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
            if(deck.cards.length > 0){
                displayedCards[1] = deck.cards.pop();
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
        this.currentGridTile = currentGridTile;
        positions[this.currentGridTile] = this;
    }

    display() {
        fill(0);
        ellipse(boardxOffset+((this.currentGridTile%4)*xOffset)*3, 95+((Math.floor(this.currentGridTile/8)*yOffset)), 15,15);
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
}