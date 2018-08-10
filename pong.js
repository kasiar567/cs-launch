/* Symbolic Constants */
var DEFAULT_SPEED = 2; // In pixels per stepTime
var TOLERANCE = ((DEFAULT_SPEED * 3) / 2); 
      // How close to paddle to consider a hit.
var FIELD_WIDTH = 400
var FIELD_LENGTH = 600
var LINE_THICKNESS = 20
var PADDLE_HEIGHT = 80
var PADDLE_WIDTH = 20
var BALL_RADIUS = 20;
var PADDLE_SETBACK = 60; // Distance from paddle to boundary line
var STEP_TIME = 25; // Number of milliseconds between steps
var SVG_NS = "http://www.w3.org/2000/svg";
var PADDLE_INCREMENT = 5; // How far to move the paddle
var PLAY_UNTIL = 2; // Points needed to win the game.

// Return status from collision check (must be powers of 2),
// because they get ORed together
var NO_COLLISION = 0;
var LEFT_SIDE_COLLISION = 1; // collided with left side of paddle
var RIGHT_SIDE_COLLISION = 2; // collided with right side of paddle
var TOP_COLLISION = 4; // collided with top of paddle
var BOTTOM_COLLISION = 8; // collided with bottom of paddle

// x or y coordinates of inside edges of the boundary lines
var LEFT_LINE = LINE_THICKNESS + 10;
var TOP_LINE = LINE_THICKNESS + 10;
var RIGHT_LINE = FIELD_LENGTH - LINE_THICKNESS - 10;
var BOTTOM_LINE = FIELD_WIDTH - (2 * LINE_THICKNESS) + 10;

/* Global variables to hold objects */
var repeater = null; // Holds a pointer to the repeating timer
var leftPaddle = null;
var rightPaddle = null;
var theBall = null;
var leftScoreBox = null;
var rightScoreBox = null;
var svg = null;
var demo = false; // True if in demo mode
var leftScore = 0;
var rightScore = 0;
var gameOverMan = false;

/* Function to initialize the playing field */
function makeField() {
  var body = document.getElementById("body");
  body.onkeypress = function(event) {
    processKeyPress(event);
  }

  // Be sure the SVG pane is big enough 
  svg = resizeSvg(FIELD_WIDTH, FIELD_LENGTH);

  // Draw the field and boundary lines
  addRect(0, 0, FIELD_WIDTH, FIELD_LENGTH, "black", 5, "none", "");
  court = addRect(LINE_THICKNESS, LINE_THICKNESS, 
    (FIELD_WIDTH - 2 * LINE_THICKNESS),
    (FIELD_LENGTH - 2 * LINE_THICKNESS),
    "white", LINE_THICKNESS, "green", "");

  leftScore = 0;
  rightScore = 0;

  // Fields for the scores
  leftScoreBox = new scoreBox(PADDLE_SETBACK * 3,
    100, "leftScoreBox", leftScore);
  rightScoreBox = new scoreBox((RIGHT_LINE - (PADDLE_SETBACK * 3)), 
    100, "rightScoreBox", rightScore);

  // Instantiate the paddles
  leftPaddle = new paddle((LEFT_LINE + PADDLE_SETBACK),
      ((FIELD_WIDTH - PADDLE_HEIGHT) / 2), "leftPaddle");

  //alert("leftPaddle.right = " + leftPaddle.right);


  rightPaddle = new paddle((RIGHT_LINE - PADDLE_SETBACK - PADDLE_WIDTH),
      ((FIELD_WIDTH - PADDLE_HEIGHT) / 2), "rightPaddle");

  //alert("rightPaddle.right = " + rightPaddle.right);
  //alert("leftPaddle.right = " + leftPaddle.right);

  theBall = new ball(FIELD_LENGTH / 2, FIELD_WIDTH / 2, 
    BALL_RADIUS, "white", "theBall" );

}

/* Play the game */
function startPlay() {
  stop();
  reset();
  demo = false;
  gameOverMan = false; // Game not over, man!
  leftScore = 0;
  leftScoreBox.setScore(leftScore);
  rightScore = 0;
  rightScoreBox.setScore(rightScore);

  //serve();
}

/* Enter demo mode */
function startDemo() {
  stop();
  demo = true;
  leftScore = 0;
  leftScoreBox.setScore(leftScore);
  rightScore = 0;
  rightScoreBox.setScore(rightScore);
  gameOverMan = false; 
  serve();
}


/* Start running the game */
function serve() {
  if (gameOverMan) {
    alert("Not allowed to serve after game is over, man!");
    return false; // Cannot serve once game is over! 
  }

  // Be sure the ball is not moving
  stop();

  // Put ball into initial position
  theBall.place2(FIELD_LENGTH / 2, FIELD_WIDTH / 2); 

  // Start ball going diagonally .
  theBall.speed = DEFAULT_SPEED;
  theBall.xSpeed = DEFAULT_SPEED / Math.sqrt(2.0);
  theBall.ySpeed = DEFAULT_SPEED / Math.sqrt(2.0);

  <!-- Now move the ball repeatedly  -->

  repeater = setInterval(step, STEP_TIME);
  //step();

}

/* Stops the game */
function stop() {
  //xSpeed = 0;
  //ySpeed = 0;
  clearInterval(repeater);
}


/* One step of the game */
function step() {

  if (gameOverMan) { // If the game is over, stop repeating.
    stop();
    return;
  }

  moveBall();

  var pointOver = false; // Nobody scored yet!

  if (!demo) { 

   // Check for score
    if (theBall.x > RIGHT_LINE) {
      // Left player scores!
      leftScore++;
      pointOver = true;
    }
    if (theBall.x < LEFT_LINE) {
      // right player scores!
      rightScore++;
      //alert ("Right player scores!");
      pointOver = true;
    }
  }

  if (pointOver) {
    leftScoreBox.setScore(leftScore);
    rightScoreBox.setScore(rightScore);
    stop();
    reset();
  }

  if (leftScore >= PLAY_UNTIL) {
    alert("Left Player Wins!");
    gameOverMan = true; // game over, man!
  }

  if (rightScore >= PLAY_UNTIL) {
    alert("Right Player Wins!");
    gameOverMan = true; // game over, man!
  }
 
  if (gameOverMan) { // If the game is over, stop repeating.
    stop();
    reset();
  }

}

/* Moves the ball for one time step */
function moveBall() {
  // move the ball
  theBall.x += theBall.xSpeed;
  theBall.y += theBall.ySpeed;
  theBall.place();

  // Check for collisions

  // Did it hit the bottom line?
  if ((theBall.y + theBall.r) >= BOTTOM_LINE) {
    theBall.ySpeed = -theBall.ySpeed; // Bounce upward!
  }

  // Did it hit the top line?
  if ((theBall.y - theBall.r) <= TOP_LINE) {
    theBall.ySpeed = -theBall.ySpeed; // Bounce downward!
  }

  // For demo mode, bounce off the end lines.
  if (demo) {
    // Did it hit the left line?
    if ((theBall.x - theBall.r) <= LEFT_LINE) {
      theBall.xSpeed = -theBall.xSpeed; // Bounce right!
    }

    // Did it hit the right line?
    if ((theBall.x + theBall.r) >= RIGHT_LINE) {
      theBall.xSpeed = -theBall.xSpeed; // Bounce lef!
    }
  }

  var leftStatus = leftPaddle.checkCollision(theBall);
  if ((leftStatus & RIGHT_SIDE_COLLISION) != 0) theBall.xSpeed *= -1;
  if ((leftStatus & LEFT_SIDE_COLLISION) != 0) theBall.xSpeed *= -1;
  if ((leftStatus & TOP_COLLISION) != 0) theBall.ySpeed *= -1;
  if ((leftStatus & BOTTOM_COLLISION) != 0) theBall.ySpeed *= -1;

  var rightStatus = rightPaddle.checkCollision(theBall);
  //console.log("returned status = " + rightStatus);
  //if (rightStatus != 0) alert("returned status = " + rightStatus);

  if ((rightStatus & LEFT_SIDE_COLLISION) != 0) theBall.xSpeed *= -1;
  if ((rightStatus & RIGHT_SIDE_COLLISION) != 0) {
    theBall.xSpeed *= -1;
    //alert("Right side collison detected. xSpeed now = " + theBall.xSpeed); 
  }
  if ((rightStatus & TOP_COLLISION) != 0) theBall.ySpeed *= -1;
  if ((rightStatus & BOTTOM_COLLISION) != 0) theBall.ySpeed *= -1;

}

/* Adds a rectangle to the screen.
Parameters: x, y = Upper Left Corner (in pixels)
            height (n pixels)
            width
            strokeColor (string)
            strokeWidth
            fillColor
            id (string)
*/
function addRect(x, y, height, width, strokeColor, strokeWidth,
      fillColor, id) {
  // Create the rectangle element
  var newRect = document.createElementNS(SVG_NS,"rect");
  newRect.setAttributeNS(null, "id", id );
  newRect.setAttributeNS(null,"x", x);
  newRect.setAttributeNS(null,"y", y);
  newRect.setAttributeNS(null,"height",height);
  newRect.setAttributeNS(null,"width",width);
  newRect.setAttributeNS(null,"fill",fillColor);
  newRect.setAttributeNS(null,"stroke",strokeColor);
  newRect.setAttributeNS(null,"stroke-width",strokeWidth);

  // Find the svg pane on the screen, then add the new ball.
  if (svg == null) svg = document.getElementById("svgPane");
  svg.appendChild(newRect);

  return newRect;
}

/* Constructs a scoreBox and adds it to the screen at (x, y) */
function scoreBox(x, y, id, initialValue) {
  var newBox = document.createElementNS(SVG_NS,"text");
  newBox.setAttributeNS(null,"x", x);
  newBox.setAttributeNS(null,"y", y);
  newBox.setAttributeNS(null, "id", id );
  newBox.setAttributeNS(null,"height",80);
  newBox.setAttributeNS(null,"width",60);
  newBox.setAttributeNS(null,"stroke", "white");
  newBox.setAttributeNS(null,"stroke-width", 7);
  newBox.setAttributeNS(null,"fill", "white");
  newBox.setAttributeNS(null,"font-size",60);
  newBox.setAttributeNS(null,"font-family", "courier");
  newBox.textContent = initialValue;

  // Find the svg pane on the screen, then add the new box.
  this.element = newBox;
  if (svg == null) svg = document.getElementById("svgPane");
  svg.appendChild(newBox);

  this.setScore = function(n) {
    this.element.textContent = n;
  }

}

/* Constructs a ball object and adds it to the screen.
Parameters: x, y = center
            r = radius
            color = color to make the ball (as a string)
            id = id (string)
 */
function ball(x, y, r, color, id) {

  this.x = x;
  this.y = y;
  this.r = r;

  this.speed = 0;
  this.xSpeed = 0;
  this.ySpeed = 0;

  // Create the ball element
  var newBall = document.createElementNS(SVG_NS,"circle");
  newBall.setAttributeNS(null, "id", id );
  newBall.setAttributeNS(null,"cx",x);
  newBall.setAttributeNS(null,"cy",y);
  newBall.setAttributeNS(null,"r",r);
  newBall.setAttributeNS(null,"fill",color);
  newBall.setAttributeNS(null,"stroke", color);

  this.element = newBall;

  // Find the svg pane on the screen, then add the new ball.
  if (svg == null) svg = document.getElementById("svgPane");
  svg.appendChild(newBall);

  /* Draws the ball at current (x, y) */
  this.place = function() {
    //alert("Placing ball at (" + xpos + ", " + ypos + ")");

    this.element.setAttribute('cx', this.x);
    this.element.setAttribute('cy', this.y);
  }

  /* Places the ball at specified (x, y) coordinates */
  this.place2 = function(x, y) {
    this.x = x;
    this.y = y;

    this.element.setAttribute('cx', x);
    this.element.setAttribute('cy', y);
  }
}

/* Constructor */
function paddle(x, y, id) {

  // Coordinates of the four edges
  this.left = x;
  this.top = y;
  this.right = x + PADDLE_WIDTH;
  this.bottom = y + PADDLE_HEIGHT;

  //alert("left = " + this.left + ", right = " + this.right);

  this.id = id;

  this.element = addRect(x, y, PADDLE_HEIGHT, PADDLE_WIDTH, "none", 0,
    "white", id);

  /* A method that takes the x,y and updates all four coordinates,
  then moves the paddle on the screen 
  */
  this.move = function(x, y) {
    this.left = x;
    this.top = y;
    this.right = x + PADDLE_WIDTH;
    this.bottom = y + PADDLE_HEIGHT;

    this.element.setAttributeNS(null,"x", x);
    this.element.setAttributeNS(null,"y", y);
  }

  /* Moves the paddle up or down (i.e. across the court) */
  this.moveVertical = function(increment) {
    this.move(this.left, this.top + increment);
  }

  /* Checks if ball is colliding with this paddle.
     Parameters: aBall = the ball to check.

     Returns: NO_COLLISION
              SIDE_COLLISION
              TOP_COLLISION
  */
  this.checkCollision = function(aBall) {
    var status = NO_COLLISION; // nothing detected yet.

    // If ball is traveling left, did it hit the right side of the paddle?
    if ((aBall.xSpeed < 0)
        && (Math.abs(((aBall.x - aBall.r) - this.right)) < TOLERANCE)
        && ((aBall.y + aBall.r) >= this.top) && 
           ((aBall.y - aBall.r) <= this.bottom)) {
      status |= RIGHT_SIDE_COLLISION;
    }

    // If ball is traveling right, did it hit the left side of the paddle?
    if ((aBall.xSpeed > 0)
        && (Math.abs(((aBall.x + aBall.r) - this.left)) < TOLERANCE)
        && ((aBall.y + aBall.r) >= this.top) &&
           ((aBall.y - aBall.r) <= this.bottom)) {
      status |= LEFT_SIDE_COLLISION;
    }

    // If ball is traveling down, did it hit the top side of the paddle?
    if ((aBall.ySpeed > 0)
        && (Math.abs(((aBall.y + aBall.r) - this.top)) < TOLERANCE)
        && ((aBall.x + aBall.r) >= this.left) && 
           ((aBall.x - aBall.r) <= this.right)) {
      status |= TOP_COLLISION;
    }

    // If ball is traveling up, did it hit the bottom side of the paddle?
    if ((aBall.ySpeed < 0)
        && (Math.abs(((aBall.y - aBall.r) - this.bottom)) < TOLERANCE)
        && ((aBall.x + aBall.r) >= this.left) && 
           ((aBall.x - aBall.r) <= this.right)) {
      status |= TOP_COLLISION;
    }

    return status;
  }


}

/* Set the SVG page to specified size.
  returns a pointer to the SVG tag object. */
function resizeSvg(vertical, horizontal) {
  var svg = document.getElementById("svgPane");
  svg.setAttribute("height", vertical);
  svg.setAttribute("width", horizontal);

  //alert("svg.width = " + svg.width);
  return svg;
}

/* Resets the court for a new game */
function fullReset() {
  stop();
  reset();
  leftScore = 0;
  leftScoreBox.setScore(leftScore);
  rightScore = 0;
  rightScoreBox.setScore(rightScore);
}

/* Resets the court for the next point */
function reset() {

  leftPaddle.move((LEFT_LINE + PADDLE_SETBACK),
      ((FIELD_WIDTH - PADDLE_HEIGHT) / 2));
  rightPaddle.move((RIGHT_LINE - PADDLE_SETBACK - PADDLE_WIDTH),
      ((FIELD_WIDTH - PADDLE_HEIGHT) / 2));

  theBall.place2(FIELD_LENGTH / 2, FIELD_WIDTH /  2);
}

/* Function to process keys.
  'w' and 's' move left paddle up and down, "p' and 'l' move right paddle
  up and down.
 */
function processKeyPress(e) {
  var whichKey = String.fromCharCode(e.charCode);
 
  if (whichKey == "w") leftPaddle.moveVertical(-PADDLE_INCREMENT);
  if (whichKey == "s") leftPaddle.moveVertical(PADDLE_INCREMENT);
  if (whichKey == "p") rightPaddle.moveVertical(-PADDLE_INCREMENT);
  if (whichKey == "l") rightPaddle.moveVertical(PADDLE_INCREMENT);
}
