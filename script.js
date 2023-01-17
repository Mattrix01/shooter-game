const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
    this.width = this.spriteWidth / 2;
    this.height = this.spriteHeight / 2;
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
    // helper properties for sprite sheet
    // moved up to calculate values that come after
    this.spriteWidth = 271;
    this.spriteHeight = 194;
  }
  // values that ened to be adjusted for moving raven around
  update() {
    this.x -= this.directionX;
    // if horizontal x coordinate of this particular raven object is less than 0 - this.width meaning it has moved behind left edge
    // set markedForDeletion propery as TRUE.
    if (this.x < 0 - this.width) this.markedForDeletion = true;
  }
  // draw method takes updated values and any drawing code will represent single raven object visually
  draw() {
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    // callingbuilt in draw image method for ravens, expects between 3 or 9 arguments.
    // this,width and height scaling entire sprite sheet to fit
    // 4 arguments after this.image which portion of image we crop. source width height etc.
    ctx.drawImage(
      this.image,
      0,
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
// this will create 1 raven object that will have access to update and draw class method
const raven = new Raven();
// animtion loop
// anycode isnide this function will run over and over updating and drawing our game frame by frame
// timestamps will compare how many milliseconds elapsed since last loop, only when reach certain amount of time only then draw next frame.
// timestamp is a default JS behaviour when using requestAnimationFrame
function animate(timestamp) {
  // clear old paint previous frame etc.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // calculate delta time in ms. between timestamp from this loop and saved time stamped value from previous loop
  let deltaTime = timestamp - lastTime;
  // after used last time value to calculate delta time, assign alst time var to new timestamp passed into the animate loop to comapre in next loop
  lastTime = timestamp;
  // increase its vlaue by delta time for every animation value.
  // starts at 0 and is increasing by this vlaue of around 16ms per each frame
  // delta time dependant on performance of your computer
  timeToNextRaven += deltaTime;
  // when time to enxt raven reaches this raven interval, increases by amount fo ms that happened between frame stated above variable
  // reaches 500, at that point push to array to let ravens
  if (timeToNextRaven > RavenInterval) {
    ravens.push(new Raven());
    // then set back to 0 so it can start counting again back from 0.
    timeToNextRaven = 0;
  }
  // we cycle through array through every single raven object and call thier update and draw methods.
  // calling raven variable
  // array literal by dropping [] ... is spread oeprator, spread each to be expanded in another array
  // cycle through it with forEach, call it object that represents each individual object
  // for each raven object in ravens array call/trigger their update and draw methods
  // we use this this below spread array because we can then spread particles into the same array along with the raves as long as calling update and draw method
  // we can call all classes by just expanding more and more arrays in here. for enemies, obstacles, powerups etc.
  // can call all at once with below syntax.
  [...ravens].forEach((object) => object.update());
  [...ravens].forEach((object) => object.draw());
  // use splice while cycling through array to move objects so not using ones going past screen
  // use built in array filter method.
  // take var that holds ravens array and reassign to new array. make sure let variable so can be changed.
  // filter method creates a new array
  // it wil be same array but objects that have markedForDeletion set to true, will be filtered out
  // filter method creates a new array with all elements that passed the test implemented by provided function.
  // take ravens variable and replace with same array but I wasntwed that array to be filled only with objects for which this condition below is TRUE.
  // only objects that ahve marked with deletion property dont go in array.
  ravens = ravens.filter((object) => !object.markedForDeletion);
  // using built in below method that will call animate again for constant loop based on timestamps
  requestAnimationFrame(animate);
}
// passing timestamp of 0 as an argument
animate(0);
