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
  night2: { top: [25, 20, 55], bottom: [50, 30, 75] },
  night3: { top: [35, 30, 70], bottom: [60, 40, 90] },
  dawn1: { top: [60, 50, 100], bottom: [90, 70, 120] },
  dawn2: { top: [90, 80, 130], bottom: [120, 100, 150] },
  dawn3: { top: [120, 120, 160], bottom: [150, 140, 180] },
  day1: { top: [150, 160, 200], bottom: [180, 180, 210] },
  day2: { top: [170, 190, 230], bottom: [200, 210, 240] },
  day: { top: [135, 206, 250], bottom: [200, 230, 255] }
};
let playbackRate = 1.0;

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

  if (song.isPlaying()) {
    let currentTime = song.currentTime();
    let duration = song.duration();
    let nightDuration = duration * 0.5;
    let transitionDuration = duration * 0.5;
    let section = transitionDuration / 8;

    if (currentTime < nightDuration) {
      timeOfDay = 'night';
    }
    else if (currentTime < nightDuration + section) {
      timeOfDay = 'night2';
    }
    else if (currentTime < nightDuration + section * 2) {
      timeOfDay = 'night3';
    }
    else if (currentTime < nightDuration + section * 3) {
      timeOfDay = 'dawn1';
    }
    else if (currentTime < nightDuration + section * 4) {
      timeOfDay = 'dawn2';
    }
    else if (currentTime < nightDuration + section * 5) {
      timeOfDay = 'dawn3';
    }
    else if (currentTime < nightDuration + section * 6) {
      timeOfDay = 'day1';
    }
    else if (currentTime < nightDuration + section * 7) {
      timeOfDay = 'day2';
    }
    else {
      timeOfDay = 'day';
    }
  }

  targetSkyColors = skyColors[timeOfDay];
  currentSkyColors.top[0] = lerp(currentSkyColors.top[0], targetSkyColors.top[0], 0.005);
  currentSkyColors.top[1] = lerp(currentSkyColors.top[1], targetSkyColors.top[1], 0.005);
  currentSkyColors.top[2] = lerp(currentSkyColors.top[2], targetSkyColors.top[2], 0.005);
  currentSkyColors.bottom[0] = lerp(currentSkyColors.bottom[0], targetSkyColors.bottom[0], 0.005);
  currentSkyColors.bottom[1] = lerp(currentSkyColors.bottom[1], targetSkyColors.bottom[1], 0.005);
  currentSkyColors.bottom[2] = lerp(currentSkyColors.bottom[2], targetSkyColors.bottom[2], 0.005);

  if (song.isPlaying()) {
    if (keyIsDown(UP_ARROW)) {
      playbackRate = constrain(playbackRate + 0.01, 0.5, 2.0);
    }
    if (keyIsDown(DOWN_ARROW)) {
      playbackRate = constrain(playbackRate - 0.01, 0.5, 2.0);
    }
    if (keyIsDown(LEFT_ARROW)) {
      playbackRate = constrain(playbackRate - 0.02, 0.5, 2.0);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      playbackRate = constrain(playbackRate + 0.02, 0.5, 2.0);
    }
    song.rate(playbackRate);
  }

  let speedMultiplier = playbackRate;
  let targetSpeed = map(level * 150 + treble * 1.5, 0, 500, 2, 50) * speedMultiplier;
  scrollSpeed = lerp(scrollSpeed, targetSpeed, 0.2);

  if (timeOfDay === 'night' || timeOfDay === 'night2' || timeOfDay === 'night3') {
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

  if (treble > 150) {
    drawNeonFlash(treble);
  }

  drawUI(scrollSpeed, bass, mid, treble);
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

  if (mid > 100) {
    noFill();
    stroke(320, 100, 255, map(mid, 100, 255, 80, 255));
    strokeWeight(map(mid, 100, 255, 2, 5));
    rect(-40, 10, 80, 25, 5);
  }

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

function drawNeonFlash(treble) {
  noFill();
  let alpha = map(treble, 150, 255, 100, 255);

  for (let i = 0; i < 5; i++) {
    stroke(320, 100, 255, alpha / (i + 1));
    strokeWeight(25 - i * 5);
    rect(10 + i * 10, 10 + i * 10, width - 20 - i * 20, height - 20 - i * 20);
  }

  for (let i = 0; i < 3; i++) {
    if (random() > 0.5) {
      stroke(random([320, 280, 180, 60]), 100, 255, alpha);
      strokeWeight(random(2, 6));
      let x1 = random(width);
      let y1 = random(height * 0.4);
      let x2 = random(width);
      let y2 = random(height * 0.4);
      line(x1, y1, x2, y2);
    }
  }
}

function drawUI(speed, bass, mid, treble) {
  push();
  translate(width - 100, height - 100);

  noFill();
  stroke(255, 150);
  strokeWeight(3);
  arc(0, 0, 80, 80, -150, 150);

  let angle = map(speed, 0, 50, -150, 150);
  stroke(map(speed, 0, 50, 120, 0), 100, 255);
  strokeWeight(4);
  line(0, 0, cos(angle) * 35, sin(angle) * 35);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(floor(speed), 0, 15);
  textSize(10);
  text("km/h", 0, 30);

  pop();

  fill(255, 200);
  textAlign(CENTER);
  textSize(20);

  if (!song.isPlaying()) {
    fill(255, 255, 100);
    textSize(24);
    text("클릭해서 드라이브 시작하기", width / 2, height / 2);
  }

  textSize(12);
  fill(255, 150);
  text("클릭: 재생/정지 | 방향키 ←→↑↓: 속도 조절", width / 2, height - 20);

  textAlign(LEFT);
  textSize(10);
  text(`속도: ${floor(speed)} | 재생속도: ${playbackRate.toFixed(2)}x`, 10, height - 10);
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}