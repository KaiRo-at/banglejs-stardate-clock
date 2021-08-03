// Stardate clock face, by KaiRo.at, 2021

var redrawClock = true;
var clockface = "digital";

// Load fonts
require("FontHaxorNarrow7x17").add(Graphics);

// LCARS dimensions
const widgetsHeight = 24;
const sbarWid = 50;
const hbarHt = 5;
const outRad = 25;
const inRad = outRad - hbarHt;
const gap = 3;
const divisionPos = 80;
const sbarGapPos = 150;
const lowerTop = divisionPos+gap+1;

// Star Trek famously premiered on Thursday, September 8, 1966, at 8:30 p.m.
// See http://www.startrek.com/article/what-if-the-original-star-trek-had-debuted-on-friday-nights
const gSDBase = new Date("September 8, 1966 20:30:00 EST");
const sdatePosTop = widgetsHeight + 10;
const sdatePosLeft = sbarWid + 100;
const sdateDecimals = 1;
const secondsPerYear = 86400 * 365.2425;
const sdateDecFactor = Math.pow(10, sdateDecimals);

const clockAreaLeft = sbarWid + inRad / 2;
const clockAreaTop = lowerTop + hbarHt + inRad / 2;

const ctimePosTop = clockAreaTop + 15;
const ctimePosLeft = clockAreaLeft + 20;
const cdatePosTop = clockAreaTop + 85;
const cdatePosLeft = clockAreaLeft + 25;

const clockWid = g.getWidth() - clockAreaLeft;
const clockHt = g.getHeight() - clockAreaTop;
const clockCtrX = Math.floor(clockAreaLeft + clockWid / 2);
const clockCtrY = Math.floor(clockAreaTop + clockHt / 2);
const analogRad = Math.floor(Math.min(clockWid, clockHt) / 2);

const analogMainLineLength = 10;
const analogSubLineLength = 5;

const analogHourHandLength = analogRad / 2;
const analogMinuteHandLength = analogRad - 13;

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
  // Set Font
  g.setFont("HaxorNarrow7x17", 2);
  if (lastSDateString) {
    // Clear the area where we want to draw the time.
    //g.setBgColor("#FF6600"); // for debugging
    g.clearRect(sdatePosLeft,
                sdatePosTop,
                sdatePosLeft + g.stringWidth(lastSDateString) + 1,
                sdatePosTop + g.getFontHeight());
  }
  // Draw the current stardate.
  g.setColor("#FFCF00");
  g.drawString(sdatestring, sdatePosLeft, sdatePosTop);
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
  // Set Font
  g.setFont("HaxorNarrow7x17", 3);
  if (lastTimeString) {
    // Clear the area where we want to draw the time.
    //g.setBgColor("#FF6600"); // for debugging
    g.clearRect(ctimePosLeft,
                ctimePosTop,
                ctimePosLeft + g.stringWidth(lastTimeString) + 1,
                ctimePosTop + g.getFontHeight());
  }
  // Draw the current time.
  g.setColor("#9C9CFF");
  g.drawString(timestring, ctimePosLeft, ctimePosTop);
  lastTimeString = timestring;

  if (datestring != lastDateString) {
    // Set Font
    g.setFont("HaxorNarrow7x17", 2);
    if (lastDateString) {
      // Clear the area where we want to draw the time.
      //g.setBgColor("#FF6600"); // for debugging
      g.clearRect(cdatePosLeft,
                  cdatePosTop,
                  cdatePosLeft + g.stringWidth(lastDateString) + 1,
                  cdatePosTop + g.getFontHeight());
    }
    // Draw the current date.
    g.setColor("#A09090");
    g.drawString(datestring, cdatePosLeft, cdatePosTop);
    lastDateString = datestring;
  }
}

function drawAnalogClock(curDate) {
  // Reset the state of the graphics library.
  g.reset();
  if (!lastAnalogDate || curDate.getMinutes() != lastAnalogDate.getMinutes()) {
    // Draw the main hour lines.
    //g.setColor("#9C9CFF");
    //g.drawCircle(clockCtrX, clockCtrY, analogRad);
    for (let i = 0; i < 60; i = i + 15) {
      g.setColor("#9C9CFF");
      let edgeX = clockCtrX + analogRad * Math.sin(i * Math.PI / 30);
      let edgeY = clockCtrY - analogRad * Math.cos(i * Math.PI / 30);
      let innerX = clockCtrX + (analogRad - analogMainLineLength) * Math.sin(i * Math.PI / 30);
      let innerY = clockCtrY - (analogRad - analogMainLineLength) * Math.cos(i * Math.PI / 30);
      g.drawLineAA(edgeX, edgeY, innerX, innerY);
    }
    for (let i = 0; i < 60; i++) {
      if (i <= curDate.getSeconds()) {
        g.setColor("#E7ADE7");
      }
      else {
        g.setColor(i % 5 == 0 ? "#9C9CFF": "#000000");
      }
      let edgeX = clockCtrX + analogRad * Math.sin(i * Math.PI / 30);
      let edgeY = clockCtrY - analogRad * Math.cos(i * Math.PI / 30);
      let innerX = clockCtrX + (analogRad - analogSubLineLength) * Math.sin(i * Math.PI / 30);
      let innerY = clockCtrY - (analogRad - analogSubLineLength) * Math.cos(i * Math.PI / 30);
      g.drawLineAA(edgeX, edgeY, innerX, innerY);
    }
  }
  if (lastAnalogDate) {
    // Clear previous hands.
    g.setColor("#000000");
    if (curDate.getHours() != lastAnalogDate.getHours()) {
      // Clear hour hand.
      let HhEdgeX = clockCtrX + analogHourHandLength * Math.sin(curDate.getHours() * Math.PI / 6);
      let HhEdgeY = clockCtrY - analogHourHandLength * Math.cos(curDate.getHours() * Math.PI / 6);
      g.drawLineAA(HhEdgeX, HhEdgeY, clockCtrX, clockCtrY);
    }
    if (curDate.getMinutes() != lastAnalogDate.getMinutes()) {
      // Clear minute hand.
      let MhEdgeX = clockCtrX + analogMinuteHandLength * Math.sin(lastAnalogDate.getMinutes() * Math.PI / 30);
      let MhEdgeY = clockCtrY - analogMinuteHandLength * Math.cos(lastAnalogDate.getMinutes() * Math.PI / 30);
      g.drawLineAA(MhEdgeX, MhEdgeY, clockCtrX, clockCtrY);
    }
  }
  if (!lastAnalogDate || curDate.getMinutes() != lastAnalogDate.getMinutes()) {
    g.setColor("#A09090");
    // Draw hour hand.
    let HhEdgeX = clockCtrX + analogHourHandLength * Math.sin(curDate.getHours() * Math.PI / 6);
    let HhEdgeY = clockCtrY - analogHourHandLength * Math.cos(curDate.getHours() * Math.PI / 6);
    g.drawLineAA(HhEdgeX, HhEdgeY, clockCtrX, clockCtrY);
    // Draw minute hand.
    let MhEdgeX = clockCtrX + analogMinuteHandLength * Math.sin(curDate.getMinutes() * Math.PI / 30);
    let MhEdgeY = clockCtrY - analogMinuteHandLength * Math.cos(curDate.getMinutes() * Math.PI / 30);
    g.drawLineAA(MhEdgeX, MhEdgeY, clockCtrX, clockCtrY);
  }
  // Draw second "hand".
  g.setColor("#E7ADE7");
  let edgeX = clockCtrX + analogRad * Math.sin(curDate.getSeconds() * Math.PI / 30);
  let edgeY = clockCtrY - analogRad * Math.cos(curDate.getSeconds() * Math.PI / 30);
  let innerX = clockCtrX + (analogRad - analogSubLineLength) * Math.sin(curDate.getSeconds() * Math.PI / 30);
  let innerY = clockCtrY - (analogRad - analogSubLineLength) * Math.cos(curDate.getSeconds() * Math.PI / 30);
  g.drawLineAA(edgeX, edgeY, innerX, innerY);
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
g.clear();
// Draw LCARS borders.
// More colors: teal #008484, yellow FFCF00, purple #6050B0
// Upper section: rounded corner.
g.setColor("#A09090");
g.fillCircle(outRad,divisionPos-outRad,outRad);
g.fillRect(outRad,divisionPos-outRad,sbarWid+inRad,divisionPos);
g.fillRect(outRad,divisionPos-hbarHt,sbarWid+outRad,divisionPos); // div bar stub
g.fillRect(0,0,sbarWid,divisionPos-outRad); // side bar
g.setColor("#000000"); // blocked out areas of corner
g.fillCircle(sbarWid+inRad+1,divisionPos-hbarHt-inRad-1,inRad);
g.fillRect(sbarWid+1,divisionPos-outRad*2,sbarWid+outRad,divisionPos-hbarHt-inRad);
// upper division bar
g.setColor("#A06060");
g.fillRect(sbarWid+outRad+gap+1,divisionPos-hbarHt,g.getWidth(),divisionPos);
// Lower section: rounded corner.
g.setColor("#E7ADE7");
g.fillCircle(outRad,lowerTop+outRad,outRad);
g.fillRect(outRad,lowerTop,sbarWid+inRad,lowerTop+outRad);
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
updateConventionalTime();
// Make sure widgets can be shown.
Bangle.loadWidgets();
Bangle.drawWidgets();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
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
