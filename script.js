const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let timeToNextRaven = 0;

// hold all raven objects
let ravens = [];
// blueprint based on which all my animated ravens will be created by JS

class Raven {
  // constructor will create one blank object everytime it is called and assign it properties and values as we define them
  constructor() {
    this.width = 100;
    this.height = 50;
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
  }
  // values that ened to be adjusted for moving raven around
  update() {
    this.x -= this.directionX;
  }
  // draw method takes updated values and any drawing code will represent single raven object visually
  draw() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
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
  // calling raven variable
  raven.update();
  raven.draw();
  // using built in below method that will call animate again for constant loop based on timestamps
  requestAnimationFrame(animate);
}
animate();
