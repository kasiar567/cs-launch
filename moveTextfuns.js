// This is moveTextfuns.js - used with moveText.html 

   var finalx = 300, finaly = 300;

/************************************************* 
* A function to initialize the x and y coordinates
*  using the current position of the text to be moved,
*  and then repeatedly call the mover function to move the text to where
* we want it. 
* 
* Parameters:
* fx = Desired final X (in pixels)
* fy = Desired final Y (in pixels)
*/
   function initText(fx, fy) {
      var dom = document.getElementById('theText').style;

	finalx = fx;
	finaly = fy;

   /* Get the current position of the text */

      var x = dom.left;
      var y = dom.top;

   /* Convert the string values of left and top to 
      numbers by stripping off the units */

      x = x.match(/\d+/);
      y = y.match(/\d+/);

   /* Call the function that moves it */

      //moveText(x, y);
      
        setInterval(moveText2, 5, finalx, finaly);
        //moveText2(200, 250);

   } /*** end of function initText */


  /* Move from current position toward (finalX, finalY) 
   * One step at each time the function is called.
  */

  function moveText2(finalX, finalY) {
     var dom = document.getElementById('theText').style;

   /* Get the current position of the text */

      var oldX = dom.left;
      var oldY = dom.top;

   /* Convert the string values of left and top to 
      numbers by stripping off the units */

      oldX = oldX.match(/\d+/);
      oldY = oldY.match(/\d+/);

      var newX = oldX; // Updated positions after moving.
      var newY = oldY;

   /* If the x coordinates are not equal, move
       x toward finalx */

      if (newX != finalX) {
         if (newX > finalX) newX--;
         else newX++;
      }
    
   /* If the y coordinates are not equal, move
       y toward finaly */

      if (newY != finalY) {
         if (newY > finalY) finalY--;
         else newY++;
      }

     /*
      alert("oldX = " + oldX + ", oldY = " + oldY +
        ", finalX = " + finalX + ", finalY = " + finalY +
        ", newX = " + newX + ", newY = " +newY);
     */

   /* As long as the text is not at the destination,
       update the current position */
         
      if ((newX != finalX) || (newY != finalY)) { 

   /* Put the units back on the coordinates before
      assigning them to the properties to cause the 
      move */

         dom.left = newX + "px";
         dom.top = newY + "px";
      }


   }
