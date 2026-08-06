let appState = "welcome";

let rightHandReady = false;
let confettiPieces = [];
let resultStarted = false;
let swipeStartX = null;
let swipeStartTime = 0;
let lastSwipeTime = 0;

let practiceStep = "right";
let feedbackMessage = "";

let instructionsStartTime = null;
let calibratedRightX = null;
let rightHandReadySince = null;
let thumbsUpSince = null;
let rightHandGraceUntil = 0;
let lastRightHandSeenAt = 0;
let lastRenderedState = null;
let stateEnteredAt = 0;
let quizTransition = null;
let quizEntryAt = 0;
let quizDisplayX = 0;
let recommendedPlans = [];
let ambientParticles = [];
let restartButton = null;
let questions = [
  { text: "Do you want the cheapest monthly plan?", tag: "cheap" },
  { text: "Do you need unlimited local data?", tag: "unlimitedData" },
  { text: "Do you care about the fastest speed?", tag: "fastSpeed" },
  { text: "Do you call local numbers a lot?", tag: "localMinutes" },
  { text: "Do you need international or flexi minutes?", tag: "flexiMinutes" },
  { text: "Do you need roaming data?", tag: "roaming" },
  { text: "Do you prefer a 12-month commitment?", tag: "shortCommitment" },
  { text: "Do you want subscriptions like Smiles, Go, or Starzplay?", tag: "subscriptions" }
];

let plans = [
  {
    name: "New Freedom Non-Stop Data Plan 250 Local",
    price: 188,
    speed: "Up to 3Mbps",
    data: "Non-Stop",
    minutes: "1000 local minutes",
    roaming: "200MB",
    commitment: "12 months",
    features: ["cheap", "localMinutes", "shortCommitment"]
  },
  {
    name: "New Freedom Non-Stop Data Plan 250 Flexi",
    price: 188,
    speed: "Up to 3Mbps",
    data: "Non-Stop",
    minutes: "500 flexi minutes",
    roaming: "200MB",
    commitment: "12 months",
    features: ["cheap", "flexiMinutes", "shortCommitment"]
  },
  {
    name: "New Freedom Non-Stop Data Plan 325 Local",
    price: 228,
    speed: "Up to 10Mbps",
    data: "Non-Stop",
    minutes: "1800 local minutes",
    roaming: "1GB",
    commitment: "12 months",
    features: ["localMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "New Freedom Non-Stop Data Plan 325 Flexi",
    price: 228,
    speed: "Up to 10Mbps",
    data: "Non-Stop",
    minutes: "900 flexi minutes",
    roaming: "1GB",
    commitment: "12 months",
    features: ["flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "New Freedom Non-Stop Data Plan 375 Local",
    price: 263,
    speed: "Up to 50Mbps",
    data: "Non-Stop",
    minutes: "2200 local minutes",
    roaming: "5GB",
    commitment: "12 months",
    features: ["fastSpeed", "localMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "New Freedom Non-Stop Data Plan 375 Flexi",
    price: 263,
    speed: "Up to 50Mbps",
    data: "Non-Stop",
    minutes: "1100 flexi minutes",
    roaming: "5GB",
    commitment: "12 months",
    features: ["fastSpeed", "flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "New Freedom Unlimited Data Plan 500 Local",
    price: 300,
    speed: "Unlimited at max speeds",
    data: "Unlimited local data",
    minutes: "3000 local minutes",
    roaming: "10GB",
    commitment: "12 months",
    features: ["unlimitedData", "fastSpeed", "localMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "New Freedom Unlimited Data Plan 500 Flexi",
    price: 300,
    speed: "Unlimited at max speeds",
    data: "Unlimited local data",
    minutes: "1500 flexi minutes",
    roaming: "10GB",
    commitment: "12 months",
    features: ["unlimitedData", "fastSpeed", "flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "Gold Plan 500 Local",
    price: 500,
    speed: "Standard Gold plan",
    data: "100GB local data",
    minutes: "Unlimited local minutes",
    roaming: "Not shown",
    commitment: "24 months",
    features: ["localMinutes"]
  },
  {
    name: "Gold Plan 500 Flexi",
    price: 500,
    speed: "Standard Gold plan",
    data: "100GB local data",
    minutes: "3500 flexi minutes",
    roaming: "Not shown",
    commitment: "24 months",
    features: ["flexiMinutes"]
  }
];

let currentQuestion = 0;
let answers = [];
let bestPlan = null;

let quizFeedback = "";
let quizCardX = 0;
let quizCardRotation = 0;
let questionNeedsCalibration = true;
let readyStartTime = null;
const CALIBRATION_HOLD_TIME = 700;
const THUMBS_UP_HOLD_TIME = 350;
const SWIPE_DISTANCE = 85;
const SWIPE_TIME_LIMIT = 1400;
const COOLDOWN = 350;
const HAND_LOSS_GRACE_TIME = 300;


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  textFont("Segoe UI");

  for (let i = 0; i < 24; i++) {
    ambientParticles.push({
      x: random(width),
      y: random(height),
      size: random(2, 7),
      speed: random(0.08, 0.3),
      phase: random(TWO_PI)
    });
  }

  restartButton = document.getElementById("restartButton");
  if (restartButton) {
    restartButton.addEventListener("click", restartExperience);
  }
}

function draw() {
  clear();

  updateStateEntrance();
  drawAmbientScene();
  updateStatusPill();

  let hands = getHands();

  if (appState === "welcome") {
    drawAllHands(hands);
    drawWelcomeScreen();

    let mainHand = getRightHand();

    if (mainHand && isThumbsUp(mainHand)) {
      if (thumbsUpSince === null) {
        thumbsUpSince = millis();
      }

      if (millis() - thumbsUpSince >= THUMBS_UP_HOLD_TIME) {
        appState = "openHands";
        feedbackMessage = "";
        thumbsUpSince = null;
      }
    } else {
      thumbsUpSince = null;
    }
  }

  else if (appState === "openHands") {
    detectOpenHands(hands);
    drawAllHandsWithSideColors(hands);
    drawOpenHandsScreen();

    if (rightHandReady) {
      if (rightHandReadySince === null) {
        rightHandReadySince = millis();
      }

      if (millis() - rightHandReadySince > CALIBRATION_HOLD_TIME) {
        calibrateRightHand();
        appState = "instructions";
      }
    } else {
      rightHandReadySince = null;
    }
  }

  else if (appState === "instructions") {
    drawAllHandsWithSideColors(hands);
    drawInstructionsScreen();

    if (instructionsStartTime === null) {
      instructionsStartTime = millis();
    }

    if (millis() - instructionsStartTime > 1600) {
      appState = "practice";
      practiceStep = "right";
      feedbackMessage = "Swipe your RIGHT hand to the right.";
      instructionsStartTime = null;
      resetSwipe();
      calibratedRightX = null;
    }
  }

  else if (appState === "practice") {
    drawAllHandsWithSideColors(hands);
    detectPracticeSwipe();
    drawPracticeScreen();
  }

  else if (appState === "ready") {
    drawAllHandsWithSideColors(hands);
    drawReadyScreen();

    if (readyStartTime === null) {
      readyStartTime = millis();
    }

    if (millis() - readyStartTime > 1500) {
      startQuiz();
    }
  }

  else if (appState === "quiz") {
    drawAllHandsWithSideColors(hands);
    updateQuizTransition();

    if (appState === "quiz") {
      if (!quizTransition) {
        detectQuizSwipe();
      }
      drawQuizScreen();
    }
  }

  else if (appState === "result") {
    drawResultScreen();
  }
}

function updateStateEntrance() {
  if (appState !== lastRenderedState) {
    lastRenderedState = appState;
    stateEnteredAt = millis();

    if (appState === "result" && restartButton) {
      restartButton.classList.add("is-visible");
    } else if (restartButton) {
      restartButton.classList.remove("is-visible");
    }
  }
}

function getEntranceProgress(delay = 0, duration = 520) {
  let elapsed = millis() - stateEnteredAt - delay;
  return easeOutCubic(constrain(elapsed / duration, 0, 1));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeOutBack(value) {
  let amount = 1.70158;
  return 1 + (amount + 1) * Math.pow(value - 1, 3) + amount * Math.pow(value - 1, 2);
}

function beginScreenEntrance(delay = 0) {
  let progress = getEntranceProgress(delay);
  push();
  drawingContext.globalAlpha = progress;
  translate(0, (1 - progress) * 24);
  return progress;
}

function endScreenEntrance() {
  pop();
}

function drawAmbientScene() {
  push();

  let topGradient = drawingContext.createLinearGradient(0, 0, 0, height * 0.72);
  topGradient.addColorStop(0, "rgba(4, 5, 8, 0.70)");
  topGradient.addColorStop(0.45, "rgba(4, 5, 8, 0.16)");
  topGradient.addColorStop(1, "rgba(4, 5, 8, 0)");
  drawingContext.fillStyle = topGradient;
  drawingContext.fillRect(0, 0, width, height * 0.72);

  noStroke();
  for (let particle of ambientParticles) {
    particle.y -= particle.speed;
    if (particle.y < -10) {
      particle.y = height + 10;
      particle.x = random(width);
    }

    let glow = 35 + sin(frameCount * 0.02 + particle.phase) * 18;
    fill(255, 35, 48, glow);
    circle(particle.x, particle.y, particle.size);
  }

  let scanY = (millis() * 0.035) % max(height, 1);
  let scanGradient = drawingContext.createLinearGradient(0, scanY - 45, 0, scanY + 45);
  scanGradient.addColorStop(0, "rgba(255, 28, 48, 0)");
  scanGradient.addColorStop(0.5, "rgba(255, 28, 48, 0.07)");
  scanGradient.addColorStop(1, "rgba(255, 28, 48, 0)");
  drawingContext.fillStyle = scanGradient;
  drawingContext.fillRect(0, scanY - 45, width, 90);
  pop();
}

function updateStatusPill() {
  let statusPill = document.getElementById("statusPill");
  if (!statusPill) return;

  let labels = {
    welcome: "READY FOR YOUR GESTURE",
    openHands: "CALIBRATING RIGHT HAND",
    instructions: "GESTURE GUIDE",
    practice: "PRACTICE MODE",
    ready: "CALIBRATION COMPLETE",
    quiz: `MATCHING · ${min(currentQuestion + 1, questions.length)}/${questions.length}`,
    result: "YOUR PACKAGES ARE READY"
  };

  statusPill.textContent = labels[appState] || "PACKAGE ADVISOR READY";
}

/* -------------------- STATE SCREENS -------------------- */
function calibrateRightHand() {
  let rightHand = getRightHand();

  if (!rightHand) {
    calibratedRightX = null;
    return false;
  }

  calibratedRightX = getHandCenter(rightHand).x;
  swipeStartTime = millis();
  feedbackMessage = "Right hand calibrated!";
  return true;
}


function drawWelcomeScreen() {
  drawDarkOverlay(28);
  beginScreenEntrance();

  let panelY = min(270, height * 0.36);
  let panelW = min(720, width * 0.86);
  drawGlassPanel(width / 2, panelY, panelW, 245, 32, [255, 31, 52]);

  noStroke();
  textAlign(CENTER, CENTER);
  drawEyebrow("e& PACKAGE ADVISOR", width / 2, panelY - 82);

  fill(255);
  textStyle(BOLD);
  textSize(min(48, width * 0.085));
  text("Find the package that fits you", width / 2, panelY - 32);

  fill(205, 208, 216);
  textStyle(NORMAL);
  textSize(17);
  text("Smart questions, agentic reasoning, and a match made for you.", width / 2, panelY + 13);

  let pulse = 0.5 + sin(millis() * 0.006) * 0.5;
  drawActionPill(
    width / 2,
    panelY + 72,
    330,
    52,
    "THUMBS UP  ·  HOLD TO BEGIN",
    [255, 31, 52],
    pulse
  );

  if (thumbsUpSince !== null) {
    let holdProgress = constrain((millis() - thumbsUpSince) / THUMBS_UP_HOLD_TIME, 0, 1);
    noStroke();
    fill(255, 31, 52);
    rectMode(CORNER);
    rect(width / 2 - 150, panelY + 101, 300 * holdProgress, 3, 99);
  }

  endScreenEntrance();
}



function drawOpenHandsScreen() {
  drawDarkOverlay(36);
  beginScreenEntrance();
  let panelY = 205;
  drawGlassPanel(width / 2, panelY, min(640, width * 0.86), 190, 28, [0, 210, 142]);

  drawEyebrow("STEP 1 OF 2  ·  CALIBRATION", width / 2, panelY - 62);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28);
  text("Show your right hand", width / 2, panelY - 20);

  textSize(15.5);
  textStyle(NORMAL);
  fill(200, 204, 212);
  text("Open your palm and hold it comfortably inside the frame.", width / 2, panelY + 18);

  drawDetectionStatus(
    width / 2,
    panelY + 64,
    "Right hand detected!",
    rightHandReady,
    [0, 190, 90]
  );
  endScreenEntrance();
}
function drawInstructionsScreen() {
  drawDarkOverlay(36);
  beginScreenEntrance();
  let panelY = 210;
  drawGlassPanel(width / 2, panelY, min(720, width * 0.9), 200, 28, [255, 31, 52]);

  drawEyebrow("STEP 2 OF 2  ·  LEARN THE CONTROLS", width / 2, panelY - 72);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(27);
  text("One hand. Two simple choices.", width / 2, panelY - 34);

  drawChoiceChip(width / 2 - 150, panelY + 22, "←", "NO", [255, 57, 76]);
  drawChoiceChip(width / 2 + 150, panelY + 22, "→", "YES", [0, 212, 145]);

  fill(190, 195, 205);
  textStyle(NORMAL);
  textSize(14);
  text("Keep your palm open and move from the middle", width / 2, panelY + 78);
  endScreenEntrance();
}
function drawPracticeScreen() {
  drawDarkOverlay(30);
  beginScreenEntrance();
  let panelY = 205;
  let isRight = practiceStep === "right";
  let accent = isRight ? [0, 212, 145] : [255, 57, 76];
  drawGlassPanel(width / 2, panelY, min(680, width * 0.88), 205, 30, accent);

  drawEyebrow("PRACTICE  ·  BUILD MUSCLE MEMORY", width / 2, panelY - 70);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  fill(accent[0], accent[1], accent[2]);
  text(isRight ? "Swipe right" : "Now swipe left", width / 2, panelY - 24);
  drawAnimatedArrow(width / 2, panelY + 22, isRight ? 1 : -1, accent);

  fill(205, 208, 216);
  textStyle(NORMAL);
  textSize(14);
  text(feedbackMessage || "Move your open right hand clearly to the side", width / 2, panelY + 76);
  endScreenEntrance();
}

function drawReadyScreen() {
  drawDarkOverlay(42);
  beginScreenEntrance();
  let panelY = 220;
  drawGlassPanel(width / 2, panelY, min(580, width * 0.84), 190, 30, [0, 212, 145]);

  let pulse = 1 + sin(millis() * 0.008) * 0.04;
  push();
  translate(width / 2, panelY - 46);
  scale(pulse);
  noStroke();
  fill(0, 212, 145, 45);
  circle(0, 0, 64);
  fill(0, 212, 145);
  circle(0, 0, 44);
  fill(5, 15, 13);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(23);
  text("✓", 0, -1);
  pop();

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text("You're ready", width / 2, panelY + 7);

  fill(195, 200, 210);
  textStyle(NORMAL);
  textSize(15);
  text("Preparing your first question...", width / 2, panelY + 49);
  let readyProgress = readyStartTime === null ? 0 : (millis() - readyStartTime) / 1500;
  drawLoadingBar(width / 2, panelY + 76, 260, readyProgress);
  endScreenEntrance();
}
/* -------------------- OPEN HAND DETECTION -------------------- */

function detectOpenHands(hands) {
  rightHandReady = false;

  if (hands.length === 0) return;

  let rightHand = getRightHand();

  if (rightHand && isOpenHand(rightHand)) {
    rightHandReady = true;
  }
}

function isOpenHand(hand) {
  let indexOpen = hand[8].y < hand[6].y;
  let middleOpen = hand[12].y < hand[10].y;
  let ringOpen = hand[16].y < hand[14].y;
  let pinkyOpen = hand[20].y < hand[18].y;

  return indexOpen && middleOpen && ringOpen && pinkyOpen;
}

/* -------------------- SWIPE PRACTICE -------------------- */

function detectPracticeSwipe() {
  let rightHand = getRightHand();

  if (!rightHand) {
    feedbackMessage = "Show only your RIGHT hand.";
    calibratedRightX = null;
    return;
  }

  let rightX = getHandCenter(rightHand).x;

  let now = millis();

  if (now - lastSwipeTime < COOLDOWN) {
    return;
  }

  if (calibratedRightX === null) {
    if (!isHandInStartZone(rightX)) {
      feedbackMessage = "Move your RIGHT hand to the center first.";
      return;
    }

    calibrateRightHand();
    feedbackMessage = `Now swipe ${practiceStep.toUpperCase()} with your RIGHT hand.`;
    return;
  }

  let rightMovement = rightX - calibratedRightX;

  if (practiceStep === "right") {
    feedbackMessage = "Swipe your RIGHT hand to the right.";

    if (rightMovement > 50) {
      feedbackMessage = "Right hand moving right...";
    }

    if (rightMovement > getSwipeDistance()) {
      feedbackMessage = "Right swipe detected!";
      practiceStep = "left";
      lastSwipeTime = now;
      calibratedRightX = null;

      return;
    }

    if (rightMovement < -getSwipeDistance()) {
      feedbackMessage = "Swipe right first. Return your hand to center.";
      lastSwipeTime = now;
      calibratedRightX = null;
      return;
    }
  }

  if (practiceStep === "left") {
    feedbackMessage = "Swipe your RIGHT hand to the left.";

    if (rightMovement < -50) {
      feedbackMessage = "Right hand moving left...";
    }

    if (rightMovement < -getSwipeDistance()) {
      feedbackMessage = "Left swipe detected!";
      lastSwipeTime = now;
      calibratedRightX = null;

      setTimeout(() => {
        appState = "ready";
      }, 700);

      return;
    }

    if (rightMovement > getSwipeDistance()) {
      feedbackMessage = "Swipe left now. Return your hand to center.";
      lastSwipeTime = now;
      calibratedRightX = null;
      return;
    }
  }
}

function resetSwipe() {
  swipeStartX = null;
  swipeStartTime = 0;
}

function isHandInStartZone(handX) {
  return handX >= width * 0.2 && handX <= width * 0.8;
}

function getSwipeDistance() {
  return min(SWIPE_DISTANCE, max(55, width * 0.065));
}

/* -------------------- HAND DRAWING -------------------- */

function drawAllHands(hands) {
  for (let hand of hands) {
    drawHand(hand, [255, 255, 255]);
  }
}

function drawAllHandsWithSideColors(hands) {
  for (let i = 0; i < hands.length; i++) {
    let isRightHand = getPhysicalHandedness(i) === "Right";
    let handColor = isRightHand ? [0, 190, 90] : [230, 0, 0];
    drawHand(hands[i], handColor);
  }
}

function drawHand(hand, handColor) {
  drawHandLines(hand, handColor);
  drawHandPoints(hand, handColor);

  if (isThumbsUp(hand)) {
    drawThumbsUpLabel(hand);
  }
}

function drawHandLines(hand, handColor) {
  stroke(handColor[0], handColor[1], handColor[2]);
  strokeWeight(2);
  noFill();

  drawConnection(hand, [0, 5, 9, 13, 17, 0], handColor);
  drawConnection(hand, [0, 1, 2, 3, 4], handColor);
  drawConnection(hand, [5, 6, 7, 8], handColor);
  drawConnection(hand, [9, 10, 11, 12], handColor);
  drawConnection(hand, [13, 14, 15, 16], handColor);
  drawConnection(hand, [17, 18, 19, 20], handColor);
}

function drawConnection(hand, indexes, handColor) {
  stroke(handColor[0], handColor[1], handColor[2]);
  strokeWeight(2);

  for (let i = 0; i < indexes.length - 1; i++) {
    let start = landmarkToScreen(hand[indexes[i]]);
    let end = landmarkToScreen(hand[indexes[i + 1]]);

    line(start.x, start.y, end.x, end.y);
  }
}

function drawHandPoints(hand, handColor) {
  for (let i = 0; i < hand.length; i++) {
    let point = landmarkToScreen(hand[i]);

    noStroke();

    fill(0);
    circle(point.x, point.y, 8);

    fill(handColor[0], handColor[1], handColor[2]);
    circle(point.x, point.y, 5);

    fill(255);
    circle(point.x, point.y, 2.5);
  }
}

function drawThumbsUpLabel(hand) {
  let thumb = landmarkToScreen(hand[4]);

  rectMode(CENTER);
  stroke(230, 0, 0);
  strokeWeight(2);
  fill(0);
  rect(thumb.x, thumb.y - 55, 180, 42, 14);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  text("THUMBS UP", thumb.x, thumb.y - 55);

  rectMode(CORNER);
}

/* -------------------- THUMBS UP -------------------- */

function isThumbsUp(hand) {
  let wrist = hand[0];
  let thumbTip = hand[4];
  let thumbMcp = hand[2];
  let palmSize = landmarkDistance(wrist, hand[9]);
  let thumbLength = landmarkDistance(thumbMcp, thumbTip);
  let thumbRise = thumbMcp.y - thumbTip.y;
  let thumbAngle = landmarkAngle(hand[2], hand[3], hand[4]);
  let thumbDirection = thumbRise / max(thumbLength, 0.001);

  let thumbIsExtended = thumbAngle > 145;
  let thumbPointsUp =
    thumbDirection > 0.55 &&
    thumbRise > palmSize * 0.45 &&
    thumbTip.y < wrist.y;

  let foldedFingerCount = 0;
  let fingerIndexes = [
    [5, 6, 8],
    [9, 10, 12],
    [13, 14, 16],
    [17, 18, 20]
  ];

  for (let indexes of fingerIndexes) {
    let mcp = hand[indexes[0]];
    let pip = hand[indexes[1]];
    let tip = hand[indexes[2]];
    let jointIsBent = landmarkAngle(mcp, pip, tip) < 145;
    let tipIsNearPalm =
      landmarkDistance(tip, wrist) < landmarkDistance(pip, wrist) * 1.12;

    if (jointIsBent || tipIsNearPalm) {
      foldedFingerCount++;
    }
  }

  return thumbIsExtended && thumbPointsUp && foldedFingerCount >= 3;
}

function landmarkDistance(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function landmarkAngle(a, vertex, c) {
  let first = {
    x: a.x - vertex.x,
    y: a.y - vertex.y,
    z: (a.z || 0) - (vertex.z || 0)
  };
  let second = {
    x: c.x - vertex.x,
    y: c.y - vertex.y,
    z: (c.z || 0) - (vertex.z || 0)
  };
  let firstLength = Math.sqrt(first.x ** 2 + first.y ** 2 + first.z ** 2);
  let secondLength = Math.sqrt(second.x ** 2 + second.y ** 2 + second.z ** 2);

  if (firstLength === 0 || secondLength === 0) return 0;

  let cosine =
    (first.x * second.x + first.y * second.y + first.z * second.z) /
    (firstLength * secondLength);

  return Math.acos(constrain(cosine, -1, 1)) * (180 / Math.PI);
}



function drawConfetti() {
  for (let piece of confettiPieces) {
    piece.y += piece.speedY;
    piece.x += piece.speedX;
    piece.rotation += piece.rotationSpeed;

    if (piece.y > height + 30) {
      piece.y = random(-120, -20);
      piece.x = random(width);
    }

    push();
    translate(piece.x, piece.y);
    rotate(piece.rotation);

    if (piece.colorType === 0) {
      fill(230, 0, 0); // red
      noStroke();
    } else if (piece.colorType === 1) {
      fill(255); // white
      noStroke();
    } else {
      fill(20); // black
      stroke(255, 120); // slight outline so black pieces still show
      strokeWeight(0.8);
    }

    rectMode(CENTER);
    rect(0, 0, piece.w, piece.h, 2);
    pop();
  }
}

/* -------------------- HELPERS -------------------- */
function startResultCelebration() {
  confettiPieces = [];
  resultStarted = true;
  stateEnteredAt = millis();

  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: random(width),
      y: random(-height, 0),
      w: random(8, 16),
      h: random(10, 22),
      speedY: random(2, 6),
      speedX: random(-1.5, 1.5),
      rotation: random(TWO_PI),
      rotationSpeed: random(-0.08, 0.08),
      colorType: floor(random(3)) // 0 red, 1 white, 2 black
    });
  }
}
function getHands() {
  if (
    window.detections &&
    window.detections.multiHandLandmarks &&
    window.detections.multiHandLandmarks.length > 0
  ) {
    return window.detections.multiHandLandmarks;
  }

  return [];
}

function getRightHand() {
  let hands = getHands();

  for (let i = 0; i < hands.length; i++) {
    if (getPhysicalHandedness(i) === "Right") {
      rightHandGraceUntil = Date.now() + 800;
      return hands[i];
    }
  }

  // Handedness can flicker for a frame while the hand moves quickly. Once a
  // right hand has been confirmed, keep the single tracked hand briefly.
  if (hands.length === 1 && Date.now() < rightHandGraceUntil) {
    return hands[0];
  }

  return null;
}

function getPhysicalHandedness(handIndex) {
  let handednessList = window.detections.multiHandedness || [];
  let handedness = handednessList[handIndex];

  if (!handedness) return null;

  let classification = handedness;

  if (Array.isArray(handedness)) {
    classification = handedness[0];
  } else if (handedness.classification) {
    classification = handedness.classification[0];
  }

  let modelLabel = classification && classification.label;

  if (!modelLabel) return null;

  // MediaPipe Hands assumes a mirrored input image. The camera frame sent to
  // the model is not mirrored (only its CSS display is), so swap its label.
  return modelLabel === "Left" ? "Right" : "Left";
}

function getHandCenter(hand) {
  let indexes = [0, 5, 9, 13, 17];

  let sumX = 0;
  let sumY = 0;

  for (let index of indexes) {
    let point = landmarkToScreen(hand[index]);
    sumX += point.x;
    sumY += point.y;
  }

  return {
    x: sumX / indexes.length,
    y: sumY / indexes.length
  };
}

function landmarkToScreen(landmark) {
  let video = window.videoElement;

  let videoW = video.videoWidth || 640;
  let videoH = video.videoHeight || 480;

  let scaleAmount = max(width / videoW, height / videoH);

  let drawW = videoW * scaleAmount;
  let drawH = videoH * scaleAmount;

  let offsetX = (width - drawW) / 2;
  let offsetY = (height - drawH) / 2;

  let x = offsetX + (1 - landmark.x) * drawW;
  let y = offsetY + landmark.y * drawH;

  return { x, y };
}

/* -------------------- UI HELPERS -------------------- */

function drawDarkOverlay(opacity = 45) {
  noStroke();
  fill(0, 0, 0, opacity);
  rect(0, 0, width, height);
}

function drawGlassPanel(x, y, panelW, panelH, radius, accent) {
  push();
  rectMode(CENTER);
  drawingContext.shadowColor = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.28)`;
  drawingContext.shadowBlur = 34;
  drawingContext.shadowOffsetY = 14;
  stroke(accent[0], accent[1], accent[2], 115);
  strokeWeight(1.5);

  let gradient = drawingContext.createLinearGradient(
    x - panelW / 2,
    y - panelH / 2,
    x + panelW / 2,
    y + panelH / 2
  );
  gradient.addColorStop(0, "rgba(20, 22, 28, 0.94)");
  gradient.addColorStop(0.52, "rgba(8, 9, 13, 0.92)");
  gradient.addColorStop(1, "rgba(14, 8, 12, 0.94)");
  drawingContext.fillStyle = gradient;
  rect(x, y, panelW, panelH, radius);

  drawingContext.shadowBlur = 0;
  noStroke();
  fill(accent[0], accent[1], accent[2], 210);
  rect(x, y - panelH / 2 + 1, min(panelW * 0.34, 210), 3, 99);

  noFill();
  stroke(255, 255, 255, 20);
  strokeWeight(1);
  rect(x, y, panelW - 8, panelH - 8, max(8, radius - 5));
  pop();
}

function drawEyebrow(label, x, y) {
  noStroke();
  fill(255, 80, 97);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(11);
  text(label, x, y);
}

function drawActionPill(x, y, pillW, pillH, label, accent, pulse) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(accent[0], accent[1], accent[2], 22 + pulse * 18);
  rect(x, y, pillW + pulse * 7, pillH + pulse * 4, 999);
  stroke(accent[0], accent[1], accent[2], 130 + pulse * 80);
  strokeWeight(1.4);
  fill(8, 9, 13, 220);
  rect(x, y, pillW, pillH, 999);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  text(label, x, y);
  pop();
}

function drawChoiceChip(x, y, arrow, label, accent) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(accent[0], accent[1], accent[2], 25);
  rect(x, y, 210, 64, 18);
  stroke(accent[0], accent[1], accent[2], 130);
  strokeWeight(1.2);
  noFill();
  rect(x, y, 210, 64, 18);
  noStroke();
  fill(accent[0], accent[1], accent[2]);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(22);
  text(`${arrow}  ${label}`, x, y - 1);
  pop();
}

function drawAnimatedArrow(x, y, direction, accent) {
  let travel = (millis() * 0.12) % 36;
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  for (let i = 0; i < 3; i++) {
    let local = (travel + i * 26) % 78;
    let alpha = map(local, 0, 78, 45, 255);
    fill(accent[0], accent[1], accent[2], alpha);
    noStroke();
    text(direction > 0 ? "›" : "‹", x + direction * (local - 39), y);
  }
  pop();
}

function drawLoadingBar(x, y, barW, progress) {
  let clamped = constrain(progress, 0, 1);
  rectMode(CENTER);
  noStroke();
  fill(255, 255, 255, 20);
  rect(x, y, barW, 5, 99);
  rectMode(CORNER);
  fill(0, 212, 145);
  rect(x - barW / 2, y - 2.5, barW * clamped, 5, 99);
  rectMode(CORNER);
}
function drawGlassCard(cardW, cardH) {
  rectMode(CENTER);

  let finalW = min(cardW, width * 0.82);
  let finalH = cardH;

  // smaller card near the top instead of center
  let x = width / 2;
  let y = 115;

  stroke(230, 0, 0, 180);
  strokeWeight(2);
  fill(0, 0, 0, 200);
  rect(x, y, finalW, finalH, 24);

  noFill();
  stroke(230, 0, 0, 70);
  strokeWeight(5);
  rect(x, y, finalW, finalH, 24);

  rectMode(CORNER);
}

function drawDetectionStatus(x, y, label, active, activeColor) {
  rectMode(CENTER);

  if (active) {
    stroke(activeColor[0], activeColor[1], activeColor[2]);
    strokeWeight(2);
    fill(0, 0, 0, 220);
  } else {
    stroke(120);
    strokeWeight(1.5);
    fill(20, 20, 20, 190);
  }

  rect(x, y, 220, 44, 999);

  noStroke();

  if (active) {
    fill(activeColor[0], activeColor[1], activeColor[2]);
    circle(x - 75, y, 12);

    fill(255);
    textStyle(BOLD);
    textSize(15);
    text(label, x + 18, y);
  } else {
    fill(130);
    circle(x - 75, y, 12);

    fill(190);
    textStyle(BOLD);
    textSize(14);
    text("Waiting...", x + 18, y);
  }

  rectMode(CORNER);
}

function drawButtonLikeText(label, x, y) {
  rectMode(CENTER);
  noStroke();
  fill(230, 0, 0);
  rect(x, y, 180, 46, 999);

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(17);
  text(label, x, y);

  rectMode(CORNER);
}



function startQuiz() {
  appState = "quiz";
  currentQuestion = 0;
  answers = [];
  bestPlan = null;

  quizFeedback = "Move your right hand to the center.";
  questionNeedsCalibration = true;

  quizCardX = 0;
  quizCardRotation = 0;
  quizDisplayX = 0;
  quizTransition = null;
  quizEntryAt = millis();

  calibratedRightX = null;

  // The first question should be ready immediately. Previously this started
  // an 800 ms blind period that swallowed an early swipe.
  lastSwipeTime = 0;
}


function handleQuizAnswer(isInterested) {
  if (quizTransition) return;

  quizTransition = {
    isInterested,
    startedAt: millis(),
    fromX: quizDisplayX
  };
  quizFeedback = isInterested ? "Great choice · saving YES" : "Got it · saving NO";
  lastSwipeTime = millis();
}

function updateQuizTransition() {
  if (!quizTransition) return;

  let progress = constrain((millis() - quizTransition.startedAt) / 420, 0, 1);
  if (progress < 1) return;

  let isInterested = quizTransition.isInterested;
  quizTransition = null;

  if (isInterested) {
    answers.push(questions[currentQuestion].tag);
  }

  lastSwipeTime = millis();
  currentQuestion++;
  quizCardX = 0;
  quizCardRotation = 0;
  quizDisplayX = 0;
  questionNeedsCalibration = true;
  quizEntryAt = millis();

  if (currentQuestion >= questions.length) {
    recommendedPlans = getRecommendedPlans(3);
    bestPlan = recommendedPlans[0];
    startResultCelebration();
    appState = "result";
  } else {
    quizFeedback = "Reset your hand for the next question...";
  }
}

function detectQuizSwipe() {
  let rightHand = getRightHand();
  let now = millis();

  if (!rightHand) {
    if (now - lastRightHandSeenAt <= HAND_LOSS_GRACE_TIME) {
      quizFeedback = "Keep swiping...";
      return;
    }

    quizFeedback = "Show only your RIGHT hand.";
    questionNeedsCalibration = true;
    calibratedRightX = null;
    quizCardX = 0;
    quizCardRotation = 0;
    return;
  }

  lastRightHandSeenAt = now;
  let rightX = getHandCenter(rightHand).x;

  if (now - lastSwipeTime < COOLDOWN) {
    quizFeedback = "Reset your hand for the next question...";
    return;
  }

  if (questionNeedsCalibration) {
    if (!isHandInStartZone(rightX)) {
      quizFeedback = "Bring your RIGHT hand back toward the middle.";
      return;
    }

    calibratedRightX = rightX;
    swipeStartTime = now;
    questionNeedsCalibration = false;
    quizFeedback = "Swipe your RIGHT hand: RIGHT for YES, LEFT for NO.";
    return;
  }

  let rightMovement = rightX - calibratedRightX;
  quizCardX = constrain(rightMovement * 0.55, -120, 120);
  quizCardRotation = constrain(rightMovement * 0.04, -10, 10);

  if (rightMovement > 35) {
    quizFeedback = "YES detected...";
  } else if (rightMovement < -35) {
    quizFeedback = "NO detected...";
  } else {
    quizFeedback = "RIGHT hand: swipe right = YES · swipe left = NO";
  }

  if (rightMovement > getSwipeDistance()) {
    handleQuizAnswer(true);
    return;
  }

  if (rightMovement < -getSwipeDistance()) {
    handleQuizAnswer(false);
    return;
  }
}



function getBestPlan() {
  let selectedPlan = plans[0];
  let selectedScore = -1;

  for (let plan of plans) {
    let score = 0;

    for (let answer of answers) {
      if (plan.features.includes(answer)) {
        score++;
      }
    }

    if (score > selectedScore) {
      selectedScore = score;
      selectedPlan = plan;
    }
  }

  return {
    ...selectedPlan,
    score: selectedScore
  };
}

function drawQuizScreen() {
  drawDarkOverlay(30);
  let q = questions[currentQuestion];
  if (!q) return;

  let cardW = min(760, width * 0.86);
  let cardY = min(330, height * 0.39);
  let entryProgress = easeOutBack(
    constrain((millis() - quizEntryAt) / 520, 0, 1)
  );

  quizDisplayX = lerp(quizDisplayX, quizCardX, 0.2);
  let displayX = quizDisplayX;
  let displayRotation = quizCardRotation;
  let cardAlpha = 1;

  if (quizTransition) {
    let exitProgress = constrain((millis() - quizTransition.startedAt) / 420, 0, 1);
    let direction = quizTransition.isInterested ? 1 : -1;
    displayX = lerp(quizTransition.fromX, direction * width * 0.72, easeOutCubic(exitProgress));
    displayRotation = lerp(quizCardRotation, direction * 13, exitProgress);
    cardAlpha = 1 - exitProgress;
  }

  drawQuestionProgress();

  push();
  drawingContext.globalAlpha = cardAlpha * constrain(entryProgress, 0, 1);
  translate(width / 2 + displayX, cardY + (1 - entryProgress) * 34);
  rotate(radians(displayRotation));
  scale(0.94 + entryProgress * 0.06);

  let accent = displayX > 15 ? [0, 212, 145] : displayX < -15 ? [255, 57, 76] : [255, 31, 52];
  drawGlassPanel(0, 0, cardW, 250, 32, accent);

  noStroke();
  textAlign(CENTER, CENTER);
  drawEyebrow(`QUESTION ${currentQuestion + 1} OF ${questions.length}`, 0, -88);

  fill(255);
  textStyle(BOLD);
  textSize(min(30, width * 0.055));
  drawWrappedText(q.text, 0, -22, cardW - 110, 34);

  fill(195, 200, 210);
  textStyle(NORMAL);
  textSize(14.5);
  text(quizFeedback, 0, 74);

  pop();
  drawQuizGestureDock(cardY + 180);
}

function drawQuestionProgress() {
  let progressW = min(560, width * 0.72);
  let gap = 7;
  let segmentW = (progressW - gap * (questions.length - 1)) / questions.length;
  let startX = width / 2 - progressW / 2;
  let y = 122;

  noStroke();
  for (let i = 0; i < questions.length; i++) {
    if (i < currentQuestion) {
      fill(0, 212, 145, 220);
    } else if (i === currentQuestion) {
      let pulse = 190 + sin(millis() * 0.008) * 55;
      fill(255, 31, 52, pulse);
    } else {
      fill(255, 255, 255, 34);
    }
    rect(startX + i * (segmentW + gap), y, segmentW, 5, 99);
  }
}

function drawQuizGestureDock(y) {
  let dockW = min(560, width * 0.84);
  y = min(y, height - 74);
  push();
  rectMode(CENTER);
  noStroke();
  fill(5, 6, 9, 205);
  rect(width / 2, y, dockW, 70, 24);
  stroke(255, 255, 255, 24);
  strokeWeight(1);
  noFill();
  rect(width / 2, y, dockW, 70, 24);

  noStroke();
  fill(255, 72, 90);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(15);
  text("←  NO", width / 2 - dockW / 2 + 30, y);

  fill(0, 212, 145);
  textAlign(RIGHT, CENTER);
  text("YES  →", width / 2 + dockW / 2 - 30, y);

  let indicatorX = constrain(quizDisplayX * 0.55, -dockW * 0.22, dockW * 0.22);
  fill(255, 255, 255, 20);
  rect(width / 2, y, 118, 42, 999);
  fill(255);
  circle(width / 2 + indicatorX, y, 10);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(11);
  fill(190, 195, 205);
  text("SWIPE", width / 2, y + 22);
  pop();
}




function drawResultScreen() {
  drawDarkOverlay(175);

  if (resultStarted) {
    drawConfetti();
  }

  let titleProgress = getEntranceProgress(0, 520);
  push();
  drawingContext.globalAlpha = titleProgress;
  translate(0, (1 - titleProgress) * 18);
  noStroke();
  textAlign(CENTER, CENTER);
  drawEyebrow("YOUR PERSONALIZED SHORTLIST", width / 2, 92);
  fill(255);
  textStyle(BOLD);
  textSize(min(38, width * 0.065));
  text("Packages picked for you", width / 2, 128);
  fill(185, 190, 200);
  textStyle(NORMAL);
  textSize(14.5);
  text("Ranked by the preferences you shared", width / 2, 160);
  pop();

  if (width >= 760) {
    drawDesktopPlanCards();
  } else {
    drawMobilePlanCards();
  }

  fill(175, 180, 190);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(12);
  text("Prices shown per month · VAT may apply", width / 2, height - 24);
}

function drawDesktopPlanCards() {
  let availableW = min(1180, width - 80);
  let gap = 18;
  let cardW = (availableW - gap * 2) / 3;
  let cardH = min(410, height - 250);
  let centerY = 190 + cardH / 2;

  for (let i = 0; i < recommendedPlans.length; i++) {
    let x = width / 2 + (i - 1) * (cardW + gap);
    drawPlanCard(recommendedPlans[i], i, x, centerY, cardW, cardH);
  }
}

function drawMobilePlanCards() {
  if (recommendedPlans.length === 0) return;

  let mainW = width - 40;
  drawPlanCard(recommendedPlans[0], 0, width / 2, 345, mainW, 315);

  for (let i = 1; i < recommendedPlans.length; i++) {
    let miniW = (width - 52) / 2;
    let x = 20 + miniW / 2 + (i - 1) * (miniW + 12);
    drawMiniPlanCard(recommendedPlans[i], i, x, 555, miniW, 116);
  }
}

function drawPlanCard(plan, rank, x, y, cardW, cardH) {
  if (!plan) return;

  let entrance = easeOutBack(
    constrain((millis() - stateEnteredAt - 170 - rank * 120) / 620, 0, 1)
  );
  if (entrance <= 0) return;

  let accent = rank === 0 ? [0, 212, 145] : rank === 1 ? [255, 64, 82] : [152, 118, 255];

  push();
  drawingContext.globalAlpha = constrain(entrance, 0, 1);
  translate(x, y + (1 - entrance) * 48);
  scale(0.88 + entrance * 0.12);
  drawGlassPanel(0, 0, cardW, cardH, 28, accent);

  rectMode(CENTER);
  noStroke();
  fill(accent[0], accent[1], accent[2]);
  rect(0, -cardH / 2 + 30, rank === 0 ? 126 : 88, 28, 999);
  fill(rank === 0 ? 4 : 255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(10.5);
  text(rank === 0 ? "BEST MATCH" : `#${rank + 1} OPTION`, 0, -cardH / 2 + 30);

  fill(255);
  textStyle(BOLD);
  textSize(constrain(cardW * 0.062, 16, 21));
  drawWrappedText(plan.name, 0, -cardH / 2 + 82, cardW - 48, 23);

  fill(accent[0], accent[1], accent[2]);
  textSize(constrain(cardW * 0.09, 25, 34));
  text(`AED ${plan.price}`, 0, -cardH / 2 + 140);
  fill(170, 175, 185);
  textStyle(NORMAL);
  textSize(11);
  text("PER MONTH", 0, -cardH / 2 + 166);

  let metricStart = -cardH / 2 + 205;
  let metricGap = min(39, (cardH - 225) / 4);
  drawPlanMetric("DATA", plan.data, 0, metricStart, cardW);
  drawPlanMetric("SPEED", plan.speed, 0, metricStart + metricGap, cardW);
  drawPlanMetric("MINUTES", plan.minutes, 0, metricStart + metricGap * 2, cardW);
  drawPlanMetric("ROAMING", plan.roaming, 0, metricStart + metricGap * 3, cardW);

  let footerY = cardH / 2 - 26;
  fill(accent[0], accent[1], accent[2], 24);
  rect(0, footerY, cardW - 34, 38, 13);
  fill(accent[0], accent[1], accent[2]);
  textStyle(BOLD);
  textSize(11.5);
  let matchLabel = answers.length > 0
    ? `${plan.matchPercent}% preference match`
    : "Best value match";
  text(`${matchLabel}  ·  ${plan.commitment}`, 0, footerY);
  pop();
}

function drawPlanMetric(label, value, x, y, cardW) {
  noStroke();
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(9.5);
  fill(135, 140, 152);
  text(label, x - cardW / 2 + 24, y);
  textAlign(RIGHT, CENTER);
  textStyle(NORMAL);
  textSize(constrain(cardW * 0.038, 11, 14));
  fill(235, 237, 241);
  let displayValue = value.length > 28 ? `${value.slice(0, 27)}…` : value;
  text(displayValue, x + cardW / 2 - 24, y);
}

function drawMiniPlanCard(plan, rank, x, y, cardW, cardH) {
  let entrance = easeOutBack(
    constrain((millis() - stateEnteredAt - 300 - rank * 120) / 560, 0, 1)
  );
  if (entrance <= 0) return;

  push();
  drawingContext.globalAlpha = constrain(entrance, 0, 1);
  translate(x, y + (1 - entrance) * 30);
  scale(0.9 + entrance * 0.1);
  drawGlassPanel(0, 0, cardW, cardH, 20, rank === 1 ? [255, 64, 82] : [152, 118, 255]);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(12);
  drawWrappedText(plan.name, 0, -22, cardW - 22, 15);
  fill(255, 75, 94);
  textSize(19);
  text(`AED ${plan.price}`, 0, 25);
  fill(170, 175, 185);
  textStyle(NORMAL);
  textSize(9);
  text("PER MONTH", 0, 43);
  pop();
}

function restartExperience() {
  appState = "welcome";
  currentQuestion = 0;
  answers = [];
  bestPlan = null;
  recommendedPlans = [];
  resultStarted = false;
  confettiPieces = [];
  quizTransition = null;
  questionNeedsCalibration = true;
  calibratedRightX = null;
  rightHandReadySince = null;
  thumbsUpSince = null;
  practiceStep = "right";
  instructionsStartTime = null;
  readyStartTime = null;
  lastSwipeTime = 0;
  stateEnteredAt = millis();

  if (restartButton) {
    restartButton.classList.remove("is-visible");
  }
}


function drawWrappedText(txt, x, y, maxWidth, lineHeight) {
  let words = txt.split(" ");
  let line = "";
  let lines = [];

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";

    if (textWidth(testLine) > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }

  lines.push(line);

  let startY = y - ((lines.length - 1) * lineHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, startY + i * lineHeight);
  }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getRecommendedPlans(limit = 3) {
  return plans
    .map((plan) => {
      let score = answers.reduce(
        (total, answer) => total + (plan.features.includes(answer) ? 1 : 0),
        0
      );

      return {
        ...plan,
        score,
        matchPercent: answers.length > 0 ? round((score / answers.length) * 100) : 0
      };
    })
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return first.price - second.price;
    })
    .slice(0, limit);
}
