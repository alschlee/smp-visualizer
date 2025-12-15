function setup() {
  createCanvas(800, 600);
}

function draw() {
  // 하늘 그리기
  for (let y = 0; y < 400; y++) {
    let inter = map(y, 0, 400, 0, 1);
    let c = lerpColor(color(15, 10, 40), color(40, 20, 60), inter);
    stroke(c);
    line(0, y, width, y);
  }

  // 도로 그리기
  let roadY = height * 0.7;
  noStroke();
  fill(40, 40, 50);
  rect(0, roadY, width, height - roadY);

  // 차선
  stroke(255, 200);
  strokeWeight(2);
  for (let i = 0; i < 20; i++) {
    let x = (i * 60 - frameCount % 60) % width;
    line(x, roadY + 50, x + 30, roadY + 50);
  }
}