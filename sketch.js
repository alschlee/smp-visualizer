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
let clouds = [];
let fft;
let timeOfDay = 'night';
let currentSkyColors = { top: [15, 10, 40], bottom: [40, 20, 60] };
let targetSkyColors = { top: [15, 10, 40], bottom: [40, 20, 60] };
let skyColors = {
  night: { top: [15, 10, 40], bottom: [40, 20, 60] },
  day: { top: [135, 206, 250], bottom: [200, 230, 255] }
};

function preload() {
  song = loadSound('blinding_lights.mp3');
}

function setup() {
  createCanvas(800, 600);
  roadY = height * 0.7;
  carY = roadY - 40;

  amplitude = new p5.Amplitude();
  fft = new p5.FFT(0.8, 256);

  amplitude.setInput(song);
  fft.setInput(song);

  for (let i = 0; i < 8; i++) {
    buildings.push(createBuilding(i * 150 + random(-20, 20)));
  }

  for (let i = 0; i < 6; i++) {
    streetLights.push({
      x: i * 200 + random(-30, 30),
      brightness: 150,
      glowSize: 30
    });
  }

  for (let i = 0; i < 12; i++) {
    trees.push({
      x: i * 100 + random(-20, 20),
      height: random(40, 80),
      width: random(15, 25)
    });
  }

  for (let i = 0; i < 80; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.5),
      size: random(1, 3),
      twinkle: random(100, 255)
    });
  }

  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(width),
      y: random(50, 200),
      size: random(40, 80)
    });
  }
}

function draw() {
  drawNightSky();

  let level = amplitude.getLevel();
  let bass = fft.getEnergy(20, 150);
  let mid = fft.getEnergy(400, 2600);
  let treble = fft.getEnergy(5000, 20000);

  // 시간대 변화
  if (song.isPlaying()) {
    let currentTime = song.currentTime();
    let duration = song.duration();

    if (currentTime < duration * 0.6) {
      timeOfDay = 'night';
    } else {
      timeOfDay = 'day';
    }
  }

  // 하늘 색상 전환
  targetSkyColors = skyColors[timeOfDay];
  currentSkyColors.top[0] = lerp(currentSkyColors.top[0], targetSkyColors.top[0], 0.005);
  currentSkyColors.top[1] = lerp(currentSkyColors.top[1], targetSkyColors.top[1], 0.005);
  currentSkyColors.top[2] = lerp(currentSkyColors.top[2], targetSkyColors.top[2], 0.005);
  currentSkyColors.bottom[0] = lerp(currentSkyColors.bottom[0], targetSkyColors.bottom[0], 0.005);
  currentSkyColors.bottom[1] = lerp(currentSkyColors.bottom[1], targetSkyColors.bottom[1], 0.005);
  currentSkyColors.bottom[2] = lerp(currentSkyColors.bottom[2], targetSkyColors.bottom[2], 0.005);

  let targetSpeed = map(level * 150 + treble * 1.5, 0, 500, 2, 50);
  scrollSpeed = lerp(scrollSpeed, targetSpeed, 0.2);

  if (timeOfDay === 'night') {
    drawStars(scrollSpeed * 0.3);
  }

  drawClouds(scrollSpeed * 0.5);
  drawBuildings(scrollSpeed * 0.8);
  drawTrees(scrollSpeed * 1.2);

  noStroke();
  fill(40, 40, 50);
  rect(0, roadY, width, height - roadY);

  let lineThickness = map(bass, 0, 255, 1, 12);
  stroke(255, 200);
  strokeWeight(lineThickness);
  for (let i = 0; i < 20; i++) {
    let x = (i * 60 - (frameCount * scrollSpeed * 0.5) % 60) % width;
    line(x, roadY + 50, x + 30, roadY + 50);
  }

  drawStreetLights(mid, scrollSpeed);
  drawCar(bass, mid, treble, scrollSpeed);

  if (!song.isPlaying()) {
    fill(255, 255, 100);
    textSize(24);
    textAlign(CENTER);
    text("클릭해서 드라이브 시작하기", width / 2, height / 2);
  }
}

function drawNightSky() {
  let topColor = currentSkyColors.top;
  let bottomColor = currentSkyColors.bottom;

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

function drawClouds(speed) {
  for (let cloud of clouds) {
    cloud.x -= speed;
    if (cloud.x < -100) {
      cloud.x = width + 100;
      cloud.y = random(50, 200);
    }
    noStroke();
    fill(50, 40, 80, 100);
    ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6);
    ellipse(cloud.x + 20, cloud.y, cloud.size * 0.8, cloud.size * 0.5);
    ellipse(cloud.x - 20, cloud.y, cloud.size * 0.7, cloud.size * 0.5);
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

function drawStreetLights(mid, speed) {
  for (let light of streetLights) {
    light.x -= speed;
    if (light.x < -50) {
      light.x = width + random(150, 250);
    }

    light.brightness = lerp(light.brightness, map(mid, 0, 255, 50, 255), 0.3);
    light.glowSize = map(mid, 0, 255, 10, 100);

    stroke(80);
    strokeWeight(4);
    line(light.x, roadY, light.x, roadY - 120);
    line(light.x, roadY - 120, light.x + 30, roadY - 130);

    noStroke();
    for (let i = 5; i > 0; i--) {
      fill(50, 100, light.brightness, map(i, 5, 1, 20, 150));
      ellipse(light.x + 30, roadY - 130, light.glowSize * i * 0.5);
    }

    fill(60, 100, 255);
    ellipse(light.x + 30, roadY - 130, light.glowSize * 0.4);

    fill(50, 80, light.brightness, map(mid, 0, 255, 50, 180));
    ellipse(light.x + 15, roadY + 5, light.glowSize * 2, 40);
  }
}

function drawCar(bass, mid, treble, speed) {
  push();
  translate(carX, carY);

  let bounce = map(bass, 0, 255, 0, 8);
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

  let headlightBrightness = map(treble, 0, 255, 100, 255);
  fill(60, 100, headlightBrightness);
  ellipse(38, 20, 8, 6);

  if (treble > 80) {
    let beamLength = map(treble, 80, 255, 50, 200);
    let beamAlpha = map(treble, 80, 255, 50, 150);
    fill(60, 50, headlightBrightness, beamAlpha);
    triangle(38, 20, beamLength, 12, beamLength, 28);
  }

  fill(0, 100, 100);
  ellipse(-38, 20, 6, 5);

  drawWheel(-20, 35, frameCount * speed * 0.03);
  drawWheel(20, 35, frameCount * speed * 0.03);

  pop();
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