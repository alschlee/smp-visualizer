let roadY;
let carX = 320;
let carY;
let song;
let amplitude;
let scrollSpeed = 0;
let buildings = [];
let streetLights = [];
let trees = [];
let stars = [];

function preload() {
  song = loadSound('blinding_lights.mp3');
}

function setup() {
  createCanvas(800, 600);
  roadY = height * 0.7;
  carY = roadY - 40;

  amplitude = new p5.Amplitude();
  amplitude.setInput(song);

  for (let i = 0; i < 8; i++) {
    buildings.push(createBuilding(i * 150 + random(-20, 20)));
  }

  for (let i = 0; i < 6; i++) {
    streetLights.push({
      x: i * 200 + random(-30, 30),
      brightness: 150
    });
  }

  for (let i = 0; i < 12; i++) {
    trees.push({
      x: i * 100 + random(-20, 20),
      height: random(40, 80),
      width: random(15, 25)
    });
  }

  // 별 생성
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.5),
      size: random(1, 3),
      twinkle: random(100, 255)
    });
  }
}

function draw() {
  drawNightSky();

  let level = amplitude.getLevel();
  let targetSpeed = map(level * 150, 0, 150, 2, 30);
  scrollSpeed = lerp(scrollSpeed, targetSpeed, 0.2);

  drawStars(scrollSpeed * 0.3);
  drawBuildings(scrollSpeed * 0.8);
  drawTrees(scrollSpeed * 1.2);

  noStroke();
  fill(40, 40, 50);
  rect(0, roadY, width, height - roadY);

  stroke(255, 200);
  strokeWeight(2);
  for (let i = 0; i < 20; i++) {
    let x = (i * 60 - (frameCount * scrollSpeed * 0.5) % 60) % width;
    line(x, roadY + 50, x + 30, roadY + 50);
  }

  drawStreetLights(scrollSpeed);

  push();
  translate(carX, carY);

  let bounce = map(level, 0, 1, 0, 5);
  translate(0, sin(frameCount * 0.5) * bounce);

  noStroke();
  fill(0, 0, 0, 100);
  ellipse(0, 45, 80, 15);

  fill(200, 10, 40);
  rect(-40, 10, 80, 25, 5);

  fill(220, 10, 35);
  rect(-25, -15, 50, 25, 8, 8, 0, 0);

  fill(100, 150, 200, 150);
  rect(-20, -10, 15, 18, 3);
  rect(5, -10, 15, 18, 3);

  fill(255, 255, 200);
  ellipse(38, 20, 8, 6);

  fill(255, 0, 0);
  ellipse(-38, 20, 6, 5);

  drawWheel(-20, 35, frameCount * scrollSpeed * 0.03);
  drawWheel(20, 35, frameCount * scrollSpeed * 0.03);

  pop();

  if (!song.isPlaying()) {
    fill(255, 255, 100);
    textSize(24);
    textAlign(CENTER);
    text("클릭해서 드라이브 시작하기", width / 2, height / 2);
  }
}

function drawNightSky() {
  let topColor = [15, 10, 40];
  let bottomColor = [40, 20, 60];

  for (let y = 0; y < height * 0.6; y++) {
    let inter = map(y, 0, height * 0.6, 0, 1);
    let c = lerpColor(
        color(topColor[0], topColor[1], topColor[2]),
        color(bottomColor[0], bottomColor[1], bottomColor[2]),
        inter
    );
    stroke(c);
    line(0, y, width, y);
  }

  for (let y = height * 0.6; y < roadY; y++) {
    let inter = map(y, height * 0.6, roadY, 0, 1);
    let c = lerpColor(
        color(bottomColor[0], bottomColor[1], bottomColor[2]),
        color(bottomColor[0] + 20, bottomColor[1] + 10, bottomColor[2] + 20),
        inter
    );
    stroke(c);
    line(0, y, width, y);
  }
}

function drawStars(speed) {
  for (let star of stars) {
    star.x -= speed;
    if (star.x < -10) {
      star.x = width + 10;
      star.y = random(height * 0.5);
    }
    noStroke();
    fill(255, star.twinkle);
    ellipse(star.x, star.y, star.size);
  }
}

function createBuilding(x) {
  return {
    x: x,
    width: random(60, 120),
    height: random(100, 200),
    windows: floor(random(3, 8)),
    color: random(['purple', 'blue', 'pink'])
  };
}

function drawBuildings(speed) {
  for (let building of buildings) {
    building.x -= speed;
    if (building.x < -building.width) {
      building.x = width + random(50, 150);
      building.height = random(100, 200);
      building.width = random(60, 120);
    }

    noStroke();
    if (building.color === 'purple') fill(60, 30, 80);
    else if (building.color === 'blue') fill(30, 50, 90);
    else fill(80, 40, 90);

    rect(building.x, roadY - building.height, building.width, building.height);

    fill(200, 150, 50, 150);
    let windowCols = 3;
    let windowRows = building.windows;
    let windowW = building.width / (windowCols + 1);
    let windowH = building.height / (windowRows + 2);

    for (let col = 0; col < windowCols; col++) {
      for (let row = 0; row < windowRows; row++) {
        let wx = building.x + (col + 0.7) * windowW;
        let wy = roadY - building.height + (row + 1) * windowH;
        rect(wx, wy, windowW * 0.5, windowH * 0.6);
      }
    }
  }
}

function drawTrees(speed) {
  for (let tree of trees) {
    tree.x -= speed;
    if (tree.x < -30) {
      tree.x = width + 30;
      tree.height = random(40, 80);
    }

    noStroke();
    fill(40, 30, 30);
    rect(tree.x - tree.width * 0.15, roadY - tree.height * 0.5, tree.width * 0.3, tree.height * 0.5);

    fill(20, 60, 30);
    ellipse(tree.x, roadY - tree.height * 0.6, tree.width, tree.width);
    ellipse(tree.x - tree.width * 0.3, roadY - tree.height * 0.7, tree.width * 0.8, tree.width * 0.8);
    ellipse(tree.x + tree.width * 0.3, roadY - tree.height * 0.7, tree.width * 0.8, tree.width * 0.8);
  }
}

function drawStreetLights(speed) {
  for (let light of streetLights) {
    light.x -= speed;
    if (light.x < -50) {
      light.x = width + random(150, 250);
    }

    stroke(80);
    strokeWeight(4);
    line(light.x, roadY, light.x, roadY - 120);
    line(light.x, roadY - 120, light.x + 30, roadY - 130);

    noStroke();
    fill(255, 255, 200, 100);
    ellipse(light.x + 30, roadY - 130, 40);

    fill(255, 255, 150);
    ellipse(light.x + 30, roadY - 130, 20);
  }
}

function drawWheel(x, y, rotation) {
  push();
  translate(x, y);
  rotate(rotation);

  fill(30);
  stroke(50);
  strokeWeight(2);
  ellipse(0, 0, 18, 18);

  stroke(150);
  strokeWeight(2);
  for (let i = 0; i < 5; i++) {
    let angle = (360 / 5) * i;
    line(0, 0, cos(angle) * 6, sin(angle) * 6);
  }

  fill(100);
  noStroke();
  ellipse(0, 0, 6);

  pop();
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}