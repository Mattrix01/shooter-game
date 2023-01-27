const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// collision canvas
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
let score = 0;
let gameOver = false;

var sample = document.getElementById("foobar");
sample.play();

ctx.font = "50px Impact";

let timeToNextAlien = 0;

let AlienInterval = 500;

let lastTime = 0;
let aliens = [];

class Alien {
  constructor() {
    //w 4100/20 h 176 = 205
    this.spriteWidth = 205;
    this.spriteHeight = 176;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "assets/alien-sheet.png";
    this.frame = 0;
    this.maxFrame = 18;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    // this below random result in a booleon value true or false 50/50
    this.hasTrail = Math.random() > 0.5;
  }
  update(deltatime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }

    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += deltatime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
      // only create trails if this is true, only half of them have trails.
      if (this.hasTrail) {
        //for loop to make trail nicer adding 5 particles everytime.
        for (let i = 0; i < 19; i++) {
          // we are going to push new particles inside
          // this.color is for the collision detection
          particles.push(new particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "assets/boom2.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    // laser fx
    this.sound.src = "assets/laser3.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 150;
    this.markedForDeletion = false;
  }
  update(deltatime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltatime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}

// creating trails behind flying sprites.
let particles = [];
class particle {
  constructor(x, y, size, color) {
    // offsetting x and y + size to get the trails centered correctly
    this.size = size;
    // randomising initial x and y co-ordinates to make more interesting
    this.x = x + this.size / 2 + Math.random() * 50 - 25;
    this.y = y + this.size / 3 + Math.random() * 50 - 25;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 35;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    // added code to stop blinking end of frame gully opaque, triggering mark for deletion sooners fixes it.(-5)
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
  }
  draw() {
    // will create snapshot of current global settings using save
    ctx.save();
    // change opacity alpha value for trails, depending on radius
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    // revert back to the save point with restore
    ctx.restore();
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 55, 80);
}

window.addEventListener("click", function (e) {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pc = detectPixelColor.data;
  aliens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      // collision detected
      object.markedForDeletion = true;
      score++;
      explosions.push(new Explosion(object.x, object.y, object.width));
      console.log(explosions);
    }
  });
});

const alien = new Alien();

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextAlien += deltatime;
  if (timeToNextAlien > AlienInterval) {
    aliens.push(new Alien());

    timeToNextAlien = 0;

    aliens.sort(function (a, b) {
      return a.width - b.width;
    });
  }

  drawScore();
  // expand spread method to add particles array so thier update method gets called.
  // how we order the objects is what order they are layered! drawing particles first.
  [...particles, ...aliens, ...explosions].forEach((object) =>
    object.update(deltatime)
  );
  [...particles, ...aliens, ...explosions].forEach((object) => object.draw());
  aliens = aliens.filter((object) => !object.markedForDeletion);
  explosions = explosions.filter((object) => !object.markedForDeletion);
  // making sure old particles wieth markedForDeletion property set to true get filtered out from the array.
  particles = particles.filter((object) => !object.markedForDeletion);
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

function drawGameOver() {
  ctx.textAlgin = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    "You killed " + score + " of the freaks!",
    canvas.width / 3,
    canvas.height / 3
  );
  // offset shadow
  ctx.fillStyle = "red";
  ctx.fillText(
    "You killed " + score + " of the freaks!",
    canvas.width / 3 + 5,
    canvas.height / 3
  );
}

animate(0);
