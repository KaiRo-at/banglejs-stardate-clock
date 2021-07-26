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
const divisionPos = 60;
const sbarGapPos = 150;

// Star Trek famously premiered on Thursday, September 8, 1966, at 8:30 p.m.
// See http://www.startrek.com/article/what-if-the-original-star-trek-had-debuted-on-friday-nights
const gSDBase = new Date("September 8, 1966 20:30:00 EST");
const sdatePosTop = 10;
const sdatePosLeft = sbarWid + 25;
const sdateDecimals = 4;
const secondsPerYear = 86400 * 365.2425;
const sdateDecFactor = Math.pow(10, sdateDecimals);


function updateStardate() {
  // work out how to display the current time
  var curDate = new Date();

  // Note that the millisecond division and the 1000-unit multiplier cancel each other out.
  var sdateval = (curDate - gSDBase) / secondsPerYear;

  var sdatestring = (Math.floor(sdateval * sdateDecFactor) / sdateDecFactor).toFixed(sdateDecimals);

  // Reset the state of the graphics library
  g.reset();
  // Set Font
  g.setFont("HaxorNarrow7x17", 2);
  // Clear the area where we want to draw the time
  //g.setBgColor("#FF6600"); // for debugging
  g.clearRect(sdatePosLeft,
              sdatePosTop,
              sdatePosLeft + g.stringWidth(sdatestring) + 3,
              sdatePosTop + g.getFontHeight());
  // draw the current time
  g.setColor("#9C9CFF");
  g.drawString(sdatestring, sdatePosLeft, sdatePosTop);

  // Schedule next when an update to the last decimal is due.
  var mstonextUpdate = (Math.ceil(sdateval * sdateDecFactor) / sdateDecFactor - sdateval) * secondsPerYear;
  if (redrawClock) {
    setTimeout(updateStardate, mstonextUpdate);
  }
}

// Clear the screen once, at startup.
g.clear();
// Draw LCARS borders.
// More colors: teal #008484, yellow FFCF00, purple #6050B0
// Upper section: rounded corner.
g.setColor("#A09090");
g.fillCircle(outRad,divisionPos-outRad,outRad);
g.fillRect(outRad,divisionPos-outRad,outRad*2,divisionPos);
g.fillRect(outRad,divisionPos-hbarHt,sbarWid+outRad,divisionPos); // div bar stub
g.fillRect(0,0,sbarWid,divisionPos-outRad); // side bar
g.setColor("#000000"); // blocked out areas of corner
g.fillCircle(sbarWid+inRad+1,divisionPos-hbarHt-inRad-1,inRad);
g.fillRect(sbarWid+1,divisionPos-outRad*2,sbarWid+outRad,divisionPos-hbarHt-inRad);
// upper division bar
g.setColor("#A06060");
g.fillRect(sbarWid+outRad+gap+1,divisionPos-hbarHt,g.getWidth(),divisionPos);
// Lower section: rounded corner.
const lowerTop = divisionPos+gap+1;
g.setColor("#E7ADE7");
g.fillCircle(outRad,lowerTop+outRad,outRad);
g.fillRect(outRad,lowerTop,outRad*2,lowerTop+outRad);
g.fillRect(outRad,lowerTop,sbarWid+outRad,lowerTop+hbarHt); // div bar stub
g.fillRect(0,lowerTop+outRad,sbarWid,sbarGapPos); // side bar
g.setColor("#000000"); // blocked out areas of corner
g.fillCircle(sbarWid+inRad+1,lowerTop+hbarHt+inRad+1,inRad);
g.fillRect(sbarWid+1,lowerTop+hbarHt+inRad,sbarWid+outRad,lowerTop+outRad*2);
// lower division bar
g.setColor("#FF9F00");
g.fillRect(sbarWid+outRad+gap+1,lowerTop,g.getWidth(),lowerTop+hbarHt);
// second color of side bar
g.setColor("#C09070");
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