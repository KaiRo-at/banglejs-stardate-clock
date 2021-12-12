// Stardate clock face, by KaiRo.at, 2021-2022

var redrawClock = true;
var clockface = "digital";

// note: Bangle.js 1 has 240x240, 2 has 176x176 screen

// Load fonts
if (g.getWidth() < 200) { // Bangle.js 2
  //require("Font6x12").add(Graphics);
  //const fontName = "6x12";
  require("FontHaxorNarrow7x17").add(Graphics);
  const fontName = "HaxorNarrow7x17";
  const fontBaseHeight = 17;
  const fontSize = 2;
  const fontSizeLarge = 3;
}
else {
  require("FontHaxorNarrow7x17").add(Graphics);
  const fontName = "HaxorNarrow7x17";
  const fontBaseHeight = 17;
  const fontSize = 2;
  const fontSizeLarge = 3;
}

// LCARS dimensions
if (g.getWidth() < 200) { // Bangle.js 2
  const baseUnit1 = 3;
  const baseUnit2 = 2;
}
else {
  const baseUnit1 = 5;
  const baseUnit2 = 3;
}
const widgetsHeight = 24;
const sbarWid = baseUnit1 * 10;
const hbarHt = baseUnit1;
const outRad = baseUnit1 * 5;
const inRad = outRad - hbarHt;
const gap = baseUnit2;
const divisionPos = baseUnit1 * 16;
const sbarGapPos = baseUnit1 * 30;
const lowerTop = divisionPos+gap+1;

// Star Trek famously premiered on Thursday, September 8, 1966, at 8:30 p.m.
// See http://www.startrek.com/article/what-if-the-original-star-trek-had-debuted-on-friday-nights
const gSDBase = new Date("September 8, 1966 20:30:00 EST");
const sdatePosBottom = divisionPos - hbarHt;
const sdatePosRight = g.getWidth() - baseUnit2;
const sdateDecimals = 1;
const secondsPerYear = 86400 * 365.2425;
const sdateDecFactor = Math.pow(10, sdateDecimals);

const clockAreaLeft = sbarWid + inRad / 2;
const clockAreaTop = lowerTop + hbarHt + inRad / 2;
const clockWid = g.getWidth() - clockAreaLeft;
const clockHt = g.getHeight() - clockAreaTop;

const ctimePosTop = clockAreaTop + baseUnit1 * 3;
const ctimePosCenter = clockAreaLeft + clockWid / 2;
const cdatePosTop = ctimePosTop + fontBaseHeight * fontSizeLarge;
const cdatePosCenter = clockAreaLeft + clockWid / 2;

const clockCtrX = Math.floor(clockAreaLeft + clockWid / 2);
const clockCtrY = Math.floor(clockAreaTop + clockHt / 2);
const analogRad = Math.floor(Math.min(clockWid, clockHt) / 2);

const analogMainLineLength = baseUnit1 * 2;
const analogSubLineLength = baseUnit1;

const analogHourHandLength = analogRad / 2;
const analogMinuteHandLength = analogRad - analogMainLineLength / 2;

const colorBg = "#000000";
const colorTime = "#9C9CFF";
const colorDate = "#A09090";
const colorStardate = "#FFCF00";
const colorHours = "#9C9CFF";
const colorSeconds = "#E7ADE7";
const colorHands = "#A09090";
const colorLCARSGray = "#A09090";
const colorLCARSOrange = "#FF9F00";
const colorLCARSPink = "#E7ADE7";
const colorLCARSPurple = "#A06060";
const colorLCARSBrown = "#C09070";
// More colors: teal #008484, yellow FFCF00, purple #6050B0

var lastSDateString;
var lastTimeString;
var lastDateString;
var lastAnalogDate;

function updateStardate() {
  var curDate = new Date();

  // Note that the millisecond division and the 1000-unit multiplier cancel each other out.
  var sdateval = (curDate - gSDBase) / secondsPerYear;

  var sdatestring = (Math.floor(sdateval * sdateDecFactor) / sdateDecFactor).toFixed(sdateDecimals);

  // Reset the state of the graphics library.
  g.reset();
  g.setBgColor(colorBg);
  // Set Font
  g.setFont(fontName, fontSize);
  if (lastSDateString) {
    // Clear the area where we want to draw the time.
    //g.setBgColor("#FF6600"); // for debugging
    g.clearRect(sdatePosRight - g.stringWidth(lastSDateString) - 1,
                sdatePosBottom - g.getFontHeight(),
                sdatePosRight,
                sdatePosBottom);
  }
  // Draw the current stardate.
  g.setColor(colorStardate);
  g.setFontAlign(1, 1, 0); // Align following string to bottom right.
  g.drawString(sdatestring, sdatePosRight, sdatePosBottom);
  lastSDateString = sdatestring;

  // Schedule next when an update to the last decimal is due.
  var mstonextUpdate = (Math.ceil(sdateval * sdateDecFactor) / sdateDecFactor - sdateval) * secondsPerYear;
  if (redrawClock) {
    setTimeout(updateStardate, mstonextUpdate);
  }
}

function updateConventionalTime() {
  var curDate = new Date();

  if (clockface == "digital") {
    drawDigitalClock(curDate);
  }
  else {
    drawAnalogClock(curDate);
  }

  // Schedule next when an update to the last second is due.
  var mstonextUpdate = Math.ceil(curDate / 1000) * 1000 - curDate;
  if (redrawClock) {
    setTimeout(updateConventionalTime, mstonextUpdate);
  }
}

function drawDigitalClock(curDate) {
  var timestring = ("0"+curDate.getHours()).substr(-2) + ":"
    +("0"+curDate.getMinutes()).substr(-2) + ":"
    +("0"+curDate.getSeconds()).substr(-2);
  var datestring = ""+curDate.getFullYear() + "-"
    +("0"+(curDate.getMonth()+1)).substr(-2) + "-"
    +("0"+curDate.getDate()).substr(-2);

  // Reset the state of the graphics library.
  g.reset();
  g.setBgColor(colorBg);
  // Set Font
  g.setFont(fontName, fontSizeLarge);
  var ctimePosLeft = ctimePosCenter - g.stringWidth("00:00:00") / 2;
  if (lastTimeString) {
    // Clear the area where we want to draw the time.
    //g.setBgColor("#FF6600"); // for debugging
    g.clearRect(ctimePosLeft,
                ctimePosTop,
                ctimePosLeft + g.stringWidth(lastTimeString) + 1,
                ctimePosTop + g.getFontHeight());
  }
  // Draw the current time.
  g.setColor(colorTime);
  g.drawString(timestring, ctimePosLeft, ctimePosTop);
  lastTimeString = timestring;

  if (datestring != lastDateString) {
    // Set Font
    g.setFont(fontName, fontSize);
    var cdatePosLeft = cdatePosCenter - g.stringWidth("0000-00-00") / 2;
    if (lastDateString) {
      // Clear the area where we want to draw the time.
      //g.setBgColor("#FF6600"); // for debugging
      g.clearRect(cdatePosLeft,
                  cdatePosTop,
                  cdatePosLeft + g.stringWidth(lastDateString) + 1,
                  cdatePosTop + g.getFontHeight());
    }
    // Draw the current date.
    g.setColor(colorDate);
    g.drawString(datestring, cdatePosLeft, cdatePosTop);
    lastDateString = datestring;
  }
}

function drawLine(x1, y1, x2, y2) {
  if (g.drawLineAA) {
    g.drawLineAA(x1, y1, x2, y2);
  }
  else {
    g.drawLine(x1, y1, x2, y2);
  }
}

function drawAnalogClock(curDate) {
  // Reset the state of the graphics library.
  g.reset();
  g.setBgColor(colorBg);
  // Init variables for drawing any seconds we have not drawn.
  // If minute changed, we'll set for the full wheel below.
  var firstDrawSecond = lastAnalogDate ? lastAnalogDate.getSeconds() + 1 : curDate.getSeconds();
  var lastDrawSecond = curDate.getSeconds();
  if (!lastAnalogDate || curDate.getMinutes() != lastAnalogDate.getMinutes()) {
    // Draw the main hour lines.
    //g.setColor("#9C9CFF");
    //g.drawCircle(clockCtrX, clockCtrY, analogRad);
    for (let i = 0; i < 60; i = i + 15) {
      g.setColor(colorHours);
      let edgeX = clockCtrX + analogRad * Math.sin(i * Math.PI / 30);
      let edgeY = clockCtrY - analogRad * Math.cos(i * Math.PI / 30);
      let innerX = clockCtrX + (analogRad - analogMainLineLength) * Math.sin(i * Math.PI / 30);
      let innerY = clockCtrY - (analogRad - analogMainLineLength) * Math.cos(i * Math.PI / 30);
      drawLine(edgeX, edgeY, innerX, innerY);
    }
    // Set for drawing the full second wheel.
    firstDrawSecond = 0;
    lastDrawSecond = 59;
  }
  // Draw the second wheel, or the parts of it that we haven't done yet.
  for (let i = firstDrawSecond; i <= lastDrawSecond; i++) {
    if (i <= curDate.getSeconds()) {
      g.setColor(colorSeconds);
    }
    else {
      g.setColor(i % 5 == 0 ? colorHours: colorBg);
    }
    let edgeX = clockCtrX + analogRad * Math.sin(i * Math.PI / 30);
    let edgeY = clockCtrY - analogRad * Math.cos(i * Math.PI / 30);
    let innerX = clockCtrX + (analogRad - analogSubLineLength) * Math.sin(i * Math.PI / 30);
    let innerY = clockCtrY - (analogRad - analogSubLineLength) * Math.cos(i * Math.PI / 30);
    drawLine(edgeX, edgeY, innerX, innerY);
  }
  if (lastAnalogDate) {
    // Clear previous hands.
    g.setColor(colorBg);
    if (curDate.getMinutes() != lastAnalogDate.getMinutes()) {
      // Clear hour hand.
      let HhAngle = (lastAnalogDate.getHours() + lastAnalogDate.getMinutes() / 60) * Math.PI / 6;
      let HhEdgeX = clockCtrX + analogHourHandLength * Math.sin(HhAngle);
      let HhEdgeY = clockCtrY - analogHourHandLength * Math.cos(HhAngle);
      drawLine(HhEdgeX, HhEdgeY, clockCtrX, clockCtrY);
      // Clear minute hand.
      let MhEdgeX = clockCtrX + analogMinuteHandLength * Math.sin(lastAnalogDate.getMinutes() * Math.PI / 30);
      let MhEdgeY = clockCtrY - analogMinuteHandLength * Math.cos(lastAnalogDate.getMinutes() * Math.PI / 30);
      drawLine(MhEdgeX, MhEdgeY, clockCtrX, clockCtrY);
    }
  }
  if (!lastAnalogDate || curDate.getMinutes() != lastAnalogDate.getMinutes()) {
    g.setColor(colorHands);
    // Draw hour hand.
    let HhAngle = (curDate.getHours() + curDate.getMinutes() / 60) * Math.PI / 6;
    let HhEdgeX = clockCtrX + analogHourHandLength * Math.sin(HhAngle);
    let HhEdgeY = clockCtrY - analogHourHandLength * Math.cos(HhAngle);
    drawLine(HhEdgeX, HhEdgeY, clockCtrX, clockCtrY);
    // Draw minute hand.
    let MhEdgeX = clockCtrX + analogMinuteHandLength * Math.sin(curDate.getMinutes() * Math.PI / 30);
    let MhEdgeY = clockCtrY - analogMinuteHandLength * Math.cos(curDate.getMinutes() * Math.PI / 30);
    drawLine(MhEdgeX, MhEdgeY, clockCtrX, clockCtrY);
  }
  lastAnalogDate = curDate;
}

function switchClockface() {
  if (clockface == "digital") {
    clockface = "analog";
  }
  else {
    clockface = "digital";
  }
  // Clear whole lower area.
  g.clearRect(clockAreaLeft,clockAreaTop,g.getWidth(),g.getHeight());
  lastTimeString = undefined;
  lastDateString = undefined;
  lastAnalogDate = undefined;
}

// Clear the screen once, at startup.
g.setBgColor(colorBg);
g.clear();
// Draw LCARS borders.
// Upper section: rounded corner.
g.setColor(colorLCARSGray);
g.fillCircle(outRad,divisionPos-outRad,outRad);
g.fillRect(outRad,divisionPos-outRad,sbarWid+inRad,divisionPos);
g.fillRect(outRad,divisionPos-hbarHt,sbarWid+outRad,divisionPos); // div bar stub
g.fillRect(0,0,sbarWid,divisionPos-outRad); // side bar
g.setColor(colorBg); // blocked out areas of corner
g.fillCircle(sbarWid+inRad+1,divisionPos-hbarHt-inRad-1,inRad);
g.fillRect(sbarWid+1,divisionPos-outRad*2,sbarWid+outRad,divisionPos-hbarHt-inRad);
// upper division bar
g.setColor(colorLCARSPurple);
g.fillRect(sbarWid+outRad+gap+1,divisionPos-hbarHt,g.getWidth(),divisionPos);
// Lower section: rounded corner.
g.setColor(colorLCARSPink);
g.fillCircle(outRad,lowerTop+outRad,outRad);
g.fillRect(outRad,lowerTop,sbarWid+inRad,lowerTop+outRad);
g.fillRect(outRad,lowerTop,sbarWid+outRad,lowerTop+hbarHt); // div bar stub
g.fillRect(0,lowerTop+outRad,sbarWid,sbarGapPos); // side bar
g.setColor(colorBg); // blocked out areas of corner
g.fillCircle(sbarWid+inRad+1,lowerTop+hbarHt+inRad+1,inRad);
g.fillRect(sbarWid+1,lowerTop+hbarHt+inRad,sbarWid+outRad,lowerTop+outRad*2);
// lower division bar
g.setColor(colorLCARSOrange);
g.fillRect(sbarWid+outRad+gap+1,lowerTop,g.getWidth(),lowerTop+hbarHt);
// second color of side bar
g.setColor(colorLCARSBrown);
g.fillRect(0,sbarGapPos+gap+1,sbarWid,g.getHeight());
// Draw immediately at first.
updateStardate();
updateConventionalTime();
// Make sure widgets can be shown.
Bangle.loadWidgets();
Bangle.drawWidgets();
// Show launcher on button press as usual for a clock face
Bangle.setUI("clock", Bangle.showLauncher);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    redrawClock = true;
    // Draw immediately to kick things off.
    updateStardate();
    updateConventionalTime();
  }
  else {
    redrawClock = false;
  }
});
Bangle.on('touch', button=>{
  // button == 1 is left, 2 is right
  switchClockface();
});
