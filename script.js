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
// increasing global canvas font below
ctx.font = "50px Impact";

let timeToNextRaven = 0;
// everytime time to enxt raven accumlates enough to reach 500 milliseconds, will trigger next raven and reset back to 0.
let RavenInterval = 500;
// holding value fo time stamp from rpevioous loop, init at 0
let lastTime = 0;
// hold all raven objects
let ravens = [];
// blueprint based on which all my animated ravens will be created by JS

class Raven {
  // constructor will create one blank object everytime it is called and assign it properties and values as we define them
  constructor() {
    // helper properties for sprite sheet
    // moved up to calculate values that come after
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    // multiplication is faster than division in code
    // keep values scaling ratio correct below
    // m akes ravens all different sizes whhile preserving aspect ratio, no stretching.
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    // they can fly across to the left so canvas width
    this.x = canvas.width;
    // will be rnaodm number between 0 and canvas height, - height of raven so not off edge of screen
    // make sure in brackets to give us correct range of values
    this.y = Math.random() * (canvas.height - this.height);
    // random number between 3 and 8
    this.directionX = Math.random() * 5 + 3;
    // raves bounce up and down as they fly
    // random number beetween -2.5 and +2.5, 1 moves upwards, plus downwards
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    // loading in raven sprite sheet
    this.image = new Image();
    this.image.src = "assets/raven.png";
    // below number of frames in our sprite sheet
    this.frame = 0;
    this.maxFrame = 4;
    // helper properties for controlling frames speed for flap
    this.timeSinceFlap = 0;
    // change this value affects speed, how many milliseconds between each frame
    // could be set to 100ms but here using random numbers between two values.
    this.flapInterval = Math.random() * 50 + 50;
    // everytime raven created, roll dice and randomly give red, green or blue colour value. 225 colour range
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    // concatonate the rgb color declaration
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
  }
  // values that ened to be adjusted for moving raven around
  // passed in deltatime as argument here
  update(deltatime) {
    // if statement so they bounce and dont go off bottom/top of screen etc. setting so go opposite value if hit edge.
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }

    this.x -= this.directionX;
    // some ravens will move up and some will move down in positive to negative position along Y axis.
    this.y += this.directionY;
    if (this.x < 0 - this.width)
      // if horizontal x coordinate of this particular raven object is less than 0 - this.width meaning it has moved behind left edge
      // set markedForDeletion propery as TRUE.
      this.markedForDeletion = true;
    // unifying speed across different devices with deltatime.
    this.timeSinceFlap += deltatime;
    // handles cycling through frames
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      // reset back to 0 so can start counting again when to serve next frame
      this.timeSinceFlap = 0;
    }
    // if statement for if any raven gets passed the screen and I don't remove before, game will end!
    if (this.x < 0 - this.width) gameOver = true;
  }
  // draw method takes updated values and any drawing code will represent single raven object visually
  draw() {
    // each raven now has random color assigned below in their hitbox rectangle!
    // drawing coloured recetangles on the collision canvas instead of main one.
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    // callingbuilt in draw image method for ravens, expects between 3 or 9 arguments.
    // this,width and height scaling entire sprite sheet to fit
    // 4 arguments after this.image which portion of image we crop. source width height etc.
    // 2nd and 3rd argument using the sheet frames, only 1 line so 3rd is 0.
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

// holding animated explosion objects
let explosions = [];
// new blue print class for explosion
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "assets/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "assets/boomfire.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 150;
    this.markedForDeletion = false;
  }
  // increasing frame rate using delta time
  update(deltatime) {
    // for checking if active frame is first one for the explosion sound on frame 1.
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltatime;
    // if time since last frame is more than frame interval, increase this.frame by 1
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      // repeat this below line to make sure frame reset
      this.timeSinceLastFrame = 0;
      // if all frames in boom sprite sheet displayed and explosion complete, set markForDeletion as TRUE.
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  // same method with the ravens
  // this.y - this.size/4 is so better alignment
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

function drawScore() {
  ctx.fillStyle = "black";
  // drawing score at co-ordinates 50,70 etc.
  ctx.fillText("Score: " + score, 50, 75);
  // adding another score to give shadow effect
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 55, 80);
}

// click event co-ordinates, using colors
window.addEventListener("click", function (e) {
  // get image data method scans area of canvas and returns an array-like object called UNIT8 clamped array.
  // it is a simple data structure full of unassigned 8-bit intergers (whole numbers) between a certain value range
  // getImageData needs 4 arguments. x y width height with area we want to scan. 1 pixel etc.
  // image data object we recieve when click, each 4 elemtns represent 1 pixel, its red green blue and alpha (opacity) value. 1-255.
  // changed to the collision convas context so only scanning that one.
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  console.log(detectPixelColor);
  // variable to get hold of array of colors pressed
  const pc = detectPixelColor.data;
  // for each object in array below, will check if its random color vlaue 1 is same value as pixel clicked on
  // also check if second and third match, if random colours array amtches exactly the rgb value we know we have collision
  ravens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      // collision detected
      object.markedForDeletion = true;
      score++;
      // pushing new explosion, triggering class
      // takes arguments into class for x y co-oridinates and size of raven
      explosions.push(new Explosion(object.x, object.y, object.width));
      console.log(explosions);
    }
  });
});
// this will create 1 raven object that will have access to update and draw class method
const raven = new Raven();
// animtion loop
// anycode isnide this function will run over and over updating and drawing our game frame by frame
// timestamps will compare how many milliseconds elapsed since last loop, only when reach certain amount of time only then draw next frame.
// timestamp is a default JS behaviour when using requestAnimationFrame
function animate(timestamp) {
  // clear old paint previous frame etc.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // clearing old pain on second canvas
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  // calculate delta time in ms. between timestamp from this loop and saved time stamped value from previous loop
  let deltatime = timestamp - lastTime;
  // after used last time value to calculate delta time, assign alst time var to new timestamp passed into the animate loop to comapre in next loop
  lastTime = timestamp;
  // increase its vlaue by delta time for every animation value.
  // starts at 0 and is increasing by this vlaue of around 16ms per each frame
  // delta time dependant on performance of your computer
  timeToNextRaven += deltatime;
  // when time to enxt raven reaches this raven interval, increases by amount fo ms that happened between frame stated above variable
  // reaches 500, at that point push to array to let ravens
  if (timeToNextRaven > RavenInterval) {
    ravens.push(new Raven());
    // then set back to 0 so it can start counting again back from 0.
    timeToNextRaven = 0;
    // built in array sort method, will reorganise order of elements in the array
    // based on provided check in a callback function run thorugh array and compare every element against each other and sort in acsending order
    ravens.sort(function (a, b) {
      // sorting by width as finiding smallers ones, array sorted by width
      return a.width - b.width;
    });
  }

  drawScore();
  // we cycle through array through every single raven object and call thier update and draw methods.
  // calling raven variable
  // array literal by dropping [] ... is spread oeprator, spread each to be expanded in another array
  // cycle through it with forEach, call it object that represents each individual object
  // for each raven object in ravens array call/trigger their update and draw methods
  // we use this this below spread array because we can then spread particles into the same array along with the raves as long as calling update and draw method
  // we can call all classes by just expanding more and more arrays in here. for enemies, obstacles, powerups etc.
  // can call all at once with below syntax.
  // passing argument fo deltatime to update method so its available above.
  // ADDING spread operator for explosion
  [...ravens, ...explosions].forEach((object) => object.update(deltatime));
  [...ravens, ...explosions].forEach((object) => object.draw());
  // use splice while cycling through array to move objects so not using ones going past screen
  // use built in array filter method.
  // take var that holds ravens array and reassign to new array. make sure let variable so can be changed.
  // filter method creates a new array
  // it wil be same array but objects that have markedForDeletion set to true, will be filtered out
  // filter method creates a new array with all elements that passed the test implemented by provided function.
  // take ravens variable and replace with same array but I wasntwed that array to be filled only with objects for which this condition below is TRUE.
  // only objects that ahve marked with deletion property dont go in array.
  ravens = ravens.filter((object) => !object.markedForDeletion);
  explosions = explosions.filter((object) => !object.markedForDeletion);
  // using built in below method that will call animate again for constant loop based on timestamps
  // only run animation enct frame of our game if gameOver is not true.
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

// draw gameover
function drawGameOver() {
  ctx.textALgin = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    "GAME OVER, your score is " + score,
    canvas.width / 2,
    canvas.height / 2
  );
  // offset shadow
  ctx.fillStyle = "white";
  ctx.fillText(
    "GAME OVER, your score is " + score,
    canvas.width / 2 + 5,
    canvas.height / 2
  );
}

// passing timestamp of 0 as an argument
animate(0);
