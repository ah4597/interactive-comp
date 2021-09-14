function setup() {
    angleMode(DEGREES);
    // set the background size of our canvas
    createCanvas(1000,600);
  
    // erase the background with a "grey" color
    background(100);
    
    // set all content drawn from this point forward
    // so that it uses "white" (0 = black, 255 = white)
    fill(255);
    noStroke();

    //pengu left foot
    fill('#f75930');
    beginShape();
    vertex(760,408);
    vertex(785,390);
    vertex(775, 385);
    vertex(783, 375);
    vertex(775, 370);
    vertex(760,370);
    endShape();

    //pengu right foot
    //fill(128);
    beginShape();
    vertex(600,510);
    vertex(590, 530);
    vertex(580, 525);
    vertex(580, 515);
    vertex(570, 520);
    vertex(560,510);
    vertex(570, 500);
    endShape();

    //pengu dark body 1
    fill('#211329');
    push();
    translate(600, 338);
    rotate(-20);
    ellipse(0,0, 300,350);
    pop();

    //pengu light body
    //fill('#feba5a');
    fill('#36152d');
    push();
    translate(660,290);
    rotate(-15);
    ellipse(0,0, 200,370);
    pop();
    //pengu left arm
    triangle(730,220, 800,200, 750,300);

    
    fill(255);
    //pengu main body 1
    push();
    translate(575,200);
    rotate(155);
    ellipse(0,0, 230,170);
    pop();
    //pengu main body 2 
    push();
    translate(630,350);
    rotate(-20);
    ellipse(0,0, 250,305);
    pop();

  

    //pengu right side dark body 2
    fill('#211329');
    ellipse(480,275, 58, 80);

    //pengu right hand
    fill('#36152d');
    beginShape();
    vertex(375,220);
    vertex(480,235);
    vertex(495,285);
    vertex(475,300);
    vertex(375,260);
    endShape();

    //beak 1
    fill('#ff8661');
    quad(550,250, 570,210, 615,225, 585,250);
    fill(253, 215, 102, 50);
    //ellipse(580, 235, 20, 25);

    //beak 2
    fill('#370e24');
    stroke('#ff8661');
    quad(550,250, 585,250, 615,225, 595,280);
    noStroke();

    //tongue
    fill(112,28,50,200);
    push();
    translate(590,260);
    rotate(10);
    ellipse(0,0, 20,25);  
    pop();

    //headband
    fill('#d59ee2');
    beginShape();
    vertex(480,170);
    vertex(488,170);
    vertex(500,153);
    vertex(550,120);
    vertex(580,115);
    vertex(650,120);
    vertex(700,150);
    vertex(700,115);
    vertex(650, 85);
    vertex(580, 80);
    vertex(550, 85);
    vertex(500, 115);
    vertex(480, 140);
    endShape();

    //headband tail 1
    //fill(128);
    beginShape();
    vertex(580, 81);
    vertex(630,85);
    vertex(650,50);
    vertex(700,85);
    vertex(750, 50);
    vertex(735, 35);
    vertex(700, 60);
    vertex(635, 20);
    //vertex(800, -200);
    endShape();

    //headband tail 2
    //fill(128);
    beginShape();
    vertex(650, 90);
    vertex(680, 115);
    vertex(700, 90);
    vertex(730, 115);
    vertex(760, 90);
    vertex(810, 115);
    vertex(825, 90);
    vertex(755, 60);
    vertex(725, 80);
    vertex(695,60);
    //vertex(1000,-200);
    endShape();

    //right eye
    fill(0);
    push();
    translate(495,195);
    rotate(-35);
    ellipse(0,0, 70,60);
    pop();

    //left eye
    push();
    translate(635,155);
    rotate(-10);
    ellipse(0,0, 75, 60);
    pop();

    //sword handle
    fill('#cd6c55');
    triangle(378,220, 378,256, 430,250);

    //3d sword hilt
    fill('#623d3e');
    quad(345,190, 365,185, 365,275, 345,270);

    //sword hilt
    fill('#f8915b');
    quad(365,185, 390,215, 390,265, 365,275);

    //hilt circle
    fill('#ffd6a1');
    ellipse(378, 238, 5, 5);

    //sword front
    fill('#fba45c');
    beginShape();
    vertex(50,100);
    vertex(200,100);
    vertex(355,205);
    vertex(355,255);
    vertex(200,235);
    endShape();

    //3d effect sword
    fill('#692c3d');
    quad(30,100,50,100,200,235,180,230);

  }