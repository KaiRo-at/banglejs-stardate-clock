// Stardate clock face, by KaiRo.at, 2021

var redrawClock = true;

// Load fonts
require("FontHaxorNarrow7x17").add(Graphics);

// LCARS dimensions
const sbarWid = 30;
const hbarHt = 5;
const outRad = 25;
const inRad = outRad - hbarHt;
const gap = 3;
const sbarGapPos = 80;

// Star Trek famously premiered on Thursday, September 8, 1966, at 8:30 p.m.
// See http://www.startrek.com/article/what-if-the-original-star-trek-had-debuted-on-friday-nights
const gSDBase = new Date("September 8, 1966 20:30:00 EST");
const sdatePosTop = hbarHt + 25;
const sdatePosLeft = sbarWid + 25;

function updateStardate() {
  // work out how to display the current time
  var curDate = new Date();

  var secondsPerYear = 86400 * 365.2425;
  var SDDecimals = 3;
  var decFactor = Math.pow(10, SDDecimals);

  // Note that the millisecond division and the 1000-unit multiplier cancel each other out.
  var sdateval = (curDate - gSDBase) / secondsPerYear;

  var sdatestring = (Math.floor(sdateval * decFactor) / decFactor).toFixed(SDDecimals);

  // Reset the state of the graphics library
  g.reset();
  // Set Font
  g.setFont("HaxorNarrow7x17", 2);
  // Clear the area where we want to draw the time
  //g.setBgColor("#FF6600"); // for debugging
  g.clearRect(sdatePosLeft,
              sdatePosTop,
              sdatePosLeft + g.stringWidth(sdatestring) + 1,
              sdatePosTop + g.getFontHeight());
  // draw the current time
  g.setColor("#9C9CFF");
  g.drawString(sdatestring, sdatePosLeft, sdatePosTop);


  // Schedule next when an update to the last decimal is due.
  var mstonextUpdate = (Math.ceil(sdateval * decFactor) / decFactor - sdateval) * secondsPerYear;
  if (redrawClock) {
    setTimeout(updateStardate, mstonextUpdate);
  }
}

// Clear the screen once, at startup.
g.clear();
// Draw fancy borders.
// First, create the rounded corner.
g.setColor("#E7ADE7");
g.fillCircle(outRad,outRad,outRad);
g.fillRect(outRad,0,outRad*2,outRad);
g.fillRect(outRad,0,sbarWid+outRad,hbarHt); // top bar stub
g.fillRect(0,outRad,sbarWid,sbarGapPos); // side bar
g.setColor("#000000"); // blocked out areas of corner
g.fillCircle(sbarWid+inRad+1,hbarHt+inRad+1,inRad);
g.fillRect(sbarWid+1,hbarHt+inRad,sbarWid+outRad,outRad*2);
// top bar
g.setColor("#FF9F00");
g.fillRect(sbarWid+outRad+gap+1,0,g.getWidth(),hbarHt);
// second color of side bar
g.setColor("#008484");
g.fillRect(0,sbarGapPos+gap+1,sbarWid,g.getHeight());
// Draw immediately at first.
updateStardate();
// Make sure widgets can be shown.
Bangle.loadWidgets();
Bangle.drawWidgets();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    redrawClock = true;
    updateStardate(); // draw immediately
  }
  else {
    redrawClock = false;
  }
});