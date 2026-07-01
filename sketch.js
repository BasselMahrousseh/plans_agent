let appState = "welcome";

let leftHandReady = false;
let rightHandReady = false;
let confettiPieces = [];
let resultStarted = false;
let swipeStartX = null;
let swipeStartTime = 0;
let lastSwipeTime = 0;

let practiceStep = "right";
let feedbackMessage = "";

let instructionsStartTime = null;
let calibratedLeftX = null;
let calibratedRightX = null;
let bothHandsReadySince = null;
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
const SWIPE_DISTANCE = 130;
const SWIPE_TIME_LIMIT = 1400;
const COOLDOWN = 800;


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  textFont("Arial");
}

function draw() {
  clear();

  let hands = getHands();

  if (appState === "welcome") {
    drawAllHands(hands);
    drawWelcomeScreen();

    let mainHand = getMainHand();

    if (mainHand && isThumbsUp(mainHand)) {
      appState = "openHands";
      feedbackMessage = "";
    }
  }

  else if (appState === "openHands") {
    detectOpenHands(hands);
    drawAllHandsWithSideColors(hands);
    drawOpenHandsScreen();

    if (leftHandReady && rightHandReady) {
      if (bothHandsReadySince === null) {
        bothHandsReadySince = millis();
      }

      if (millis() - bothHandsReadySince > CALIBRATION_HOLD_TIME) {
        calibrateHandPositions(hands);
        appState = "instructions";
      }
    } else {
      bothHandsReadySince = null;
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
      calibrateHandPositions(hands);
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
    detectQuizSwipe();
    drawQuizScreen();
  }

  else if (appState === "result") {
    drawAllHandsWithSideColors(hands);
    drawResultScreen();
  }
}

/* -------------------- STATE SCREENS -------------------- */
function calibrateHandPositions(hands) {
  let sorted = getHandsSortedByScreenX(hands);

  if (sorted.length < 2) {
    return;
  }

  let leftHand = sorted[0].hand;
  let rightHand = sorted[sorted.length - 1].hand;

  calibratedLeftX = getHandCenter(leftHand).x;
  calibratedRightX = getHandCenter(rightHand).x;

  feedbackMessage = "Hands calibrated!";
}


function drawWelcomeScreen() {
  // lighter overlay so camera stays visible
  noStroke();
  fill(0, 0, 0, 55);
  rect(0, 0, width, height);

  // small top message card
  rectMode(CENTER);
  stroke(230, 0, 0, 180);
  strokeWeight(2);
  fill(0, 0, 0, 215);
  rect(width / 2, 190, min(560, width * 0.78), 155, 24);

  noFill();
  stroke(230, 0, 0, 75);
  strokeWeight(5);
  rect(width / 2, 190, min(560, width * 0.78), 155, 24);

  // text
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  fill(255);
  textSize(26);
  text("Welcome to the", width / 2, 150);

  fill(230, 0, 0);
  textSize(38);
  text("e& Genie", width / 2, 195);

  fill(255);
  textSize(18);
  textStyle(NORMAL);
  text("Give a thumbs up when you're ready to start", width / 2, 240);

  rectMode(CORNER);
}



function drawOpenHandsScreen() {
  drawDarkOverlay();

  drawGlassCard(560, 130);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  textSize(24);
  text("Hold both hands open", width / 2, 85);

  textSize(15);
  textStyle(NORMAL);
  fill(220);
  text("Left hand will turn red · Right hand will turn green", width / 2, 122);

  drawDetectionStatus(
    width / 2 - 135,
    170,
    "Left detected!",
    leftHandReady,
    [230, 0, 0]
  );

  drawDetectionStatus(
    width / 2 + 135,
    170,
    "Right detected!",
    rightHandReady,
    [0, 190, 90]
  );
}
function drawInstructionsScreen() {
  drawDarkOverlay();

  drawGlassCard(620, 125);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);

  textStyle(BOLD);
  textSize(22);
  text("Swipe instructions", width / 2, 82);

  textSize(17);
  fill(0, 190, 90);
  text("RIGHT HAND → YES", width / 2 - 125, 125);

  fill(230, 0, 0);
  text("LEFT HAND ← NO", width / 2 + 125, 125);

  fill(220);
  textStyle(NORMAL);
  textSize(14);
  text("Practice starts in a moment", width / 2, 158);
}
function drawPracticeScreen() {
  drawDarkOverlay();

  drawGlassCard(580, 135);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  textSize(22);
  text("Practice swipe", width / 2, 78);

  if (practiceStep === "right") {
    fill(0, 190, 90);
    textSize(30);
    text("Swipe RIGHT", width / 2, 120);
  }

  if (practiceStep === "left") {
    fill(230, 0, 0);
    textSize(30);
    text("Swipe LEFT", width / 2, 120);
  }

  fill(230);
  textStyle(NORMAL);
  textSize(14);

  if (feedbackMessage !== "") {
    text(feedbackMessage, width / 2, 160);
  } else {
    text("Move one open hand clearly to the side", width / 2, 160);
  }
}

function drawReadyScreen() {
  drawDarkOverlay();

  drawGlassCard(560, 120);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  textSize(28);
  text("You're ready!", width / 2, 95);

  fill(230, 0, 0);
  textSize(18);
  text("e& Genie is ready to begin", width / 2, 135);
}
/* -------------------- OPEN HAND DETECTION -------------------- */

function detectOpenHands(hands) {
  leftHandReady = false;
  rightHandReady = false;

  if (hands.length === 0) return;

  let sorted = getHandsSortedByScreenX(hands);

  if (sorted.length >= 1) {
    let leftCandidate = sorted[0];

    if (isOpenHand(leftCandidate.hand)) {
      leftHandReady = true;
    }
  }

  if (sorted.length >= 2) {
    let rightCandidate = sorted[sorted.length - 1];

    if (isOpenHand(rightCandidate.hand)) {
      rightHandReady = true;
    }
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
  let hands = getHands();
  let sorted = getHandsSortedByScreenX(hands);

  if (sorted.length < 2) {
    feedbackMessage = "Keep both hands visible.";
    return;
  }

  let leftHand = sorted[0].hand;
  let rightHand = sorted[sorted.length - 1].hand;

  let leftX = getHandCenter(leftHand).x;
  let rightX = getHandCenter(rightHand).x;

  if (calibratedLeftX === null || calibratedRightX === null) {
    calibrateHandPositions(hands);
    return;
  }

  let now = millis();

  if (now - lastSwipeTime < COOLDOWN) {
    return;
  }

  let leftMovement = leftX - calibratedLeftX;
  let rightMovement = rightX - calibratedRightX;

  if (practiceStep === "right") {
    feedbackMessage = "Swipe your RIGHT hand to the right.";

    if (rightMovement > 50) {
      feedbackMessage = "Right hand moving right...";
    }

    if (rightMovement > SWIPE_DISTANCE) {
      feedbackMessage = "Right swipe detected!";
      practiceStep = "left";
      lastSwipeTime = now;

      // recalibrate after successful right swipe
      calibrateHandPositions(hands);

      return;
    }

    if (leftMovement < -SWIPE_DISTANCE) {
      feedbackMessage = "Left swipe detected! Starting questions...";
      lastSwipeTime = now;
      resetSwipe();

      startQuiz();

      return;
    }
  }

  if (practiceStep === "left") {
    feedbackMessage = "Swipe your LEFT hand to the left.";

    if (leftMovement < -50) {
      feedbackMessage = "Left hand moving left...";
    }

    if (leftMovement < -SWIPE_DISTANCE) {
      feedbackMessage = "Left swipe detected!";
      lastSwipeTime = now;

      setTimeout(() => {
        appState = "ready";
      }, 700);

      return;
    }

    if (rightMovement > SWIPE_DISTANCE) {
      feedbackMessage = "That was your right hand. Use your LEFT hand.";
      lastSwipeTime = now;
      calibrateHandPositions(hands);
      return;
    }
  }
}

function resetSwipe() {
  swipeStartX = null;
  swipeStartTime = 0;
}

/* -------------------- HAND DRAWING -------------------- */

function drawAllHands(hands) {
  for (let hand of hands) {
    drawHand(hand, [255, 255, 255]);
  }
}

function drawAllHandsWithSideColors(hands) {
  let sorted = getHandsSortedByScreenX(hands);

  for (let i = 0; i < sorted.length; i++) {
    let hand = sorted[i].hand;

    if (i === 0) {
      drawHand(hand, [230, 0, 0]); // left hand red
    } else {
      drawHand(hand, [0, 190, 90]); // right hand green
    }
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
  let thumbIp = hand[3];
  let thumbMcp = hand[2];

  let indexTip = hand[8];
  let indexPip = hand[6];

  let middleTip = hand[12];
  let middlePip = hand[10];

  let ringTip = hand[16];
  let ringPip = hand[14];

  let pinkyTip = hand[20];
  let pinkyPip = hand[18];

  let thumbIsUp =
    thumbTip.y < thumbIp.y &&
    thumbTip.y < thumbMcp.y &&
    thumbTip.y < wrist.y;

  let indexFolded = indexTip.y > indexPip.y;
  let middleFolded = middleTip.y > middlePip.y;
  let ringFolded = ringTip.y > ringPip.y;
  let pinkyFolded = pinkyTip.y > pinkyPip.y;

  return (
    thumbIsUp &&
    indexFolded &&
    middleFolded &&
    ringFolded &&
    pinkyFolded
  );
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

function getMainHand() {
  let hands = getHands();

  if (hands.length > 0) {
    return hands[0];
  }

  return null;
}

function getHandsSortedByScreenX(hands) {
  let withCenters = [];

  for (let hand of hands) {
    let center = getHandCenter(hand);

    withCenters.push({
      hand: hand,
      x: center.x
    });
  }

  withCenters.sort((a, b) => a.x - b.x);

  return withCenters;
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

function drawDarkOverlay() {
  noStroke();
  fill(0, 0, 0, 45); // much lighter overlay
  rect(0, 0, width, height);
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

  quizFeedback = "Hold both hands still for a moment.";
  questionNeedsCalibration = true;

  quizCardX = 0;
  quizCardRotation = 0;

  calibratedLeftX = null;
  calibratedRightX = null;

  lastSwipeTime = millis();
}


function handleQuizAnswer(isInterested) {
  if (isInterested) {
    answers.push(questions[currentQuestion].tag);
    quizFeedback = "Saved as interested.";
  } else {
    quizFeedback = "Skipped.";
  }

  lastSwipeTime = millis();

  currentQuestion++;

  quizCardX = 0;
  quizCardRotation = 0;
  questionNeedsCalibration = true;

  if (currentQuestion >= questions.length) {
    bestPlan = getBestPlan();
    startResultCelebration();
    appState = "result";
  }
}

function detectQuizSwipe() {
  let hands = getHands();
  let sorted = getHandsSortedByScreenX(hands);

  if (sorted.length < 2) {
    quizFeedback = "Keep both hands visible.";
    questionNeedsCalibration = true;
    quizCardX = 0;
    quizCardRotation = 0;
    return;
  }

  let leftHand = sorted[0].hand;
  let rightHand = sorted[sorted.length - 1].hand;

  let leftX = getHandCenter(leftHand).x;
  let rightX = getHandCenter(rightHand).x;

  if (questionNeedsCalibration) {
    calibratedLeftX = leftX;
    calibratedRightX = rightX;
    questionNeedsCalibration = false;
    quizFeedback = "Swipe right hand RIGHT for YES, or left hand LEFT for NO.";
    return;
  }

  let now = millis();

  if (now - lastSwipeTime < COOLDOWN) {
    return;
  }

  let leftMovement = leftX - calibratedLeftX;
  let rightMovement = rightX - calibratedRightX;

  let dominantMovement = 0;

  if (rightMovement > abs(leftMovement)) {
    dominantMovement = rightMovement;
  } else {
    dominantMovement = leftMovement;
  }

  quizCardX = constrain(dominantMovement * 0.55, -120, 120);
  quizCardRotation = constrain(dominantMovement * 0.04, -10, 10);

  if (rightMovement > 60) {
    quizFeedback = "YES detected...";
  } else if (leftMovement < -60) {
    quizFeedback = "NO detected...";
  } else {
    quizFeedback = "Right hand right = YES · Left hand left = NO";
  }

  if (rightMovement > SWIPE_DISTANCE) {
    handleQuizAnswer(true);
    return;
  }

  if (leftMovement < -SWIPE_DISTANCE) {
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
  drawDarkOverlay();

  let q = questions[currentQuestion];

  push();

  translate(width / 2 + quizCardX, 145);
  rotate(radians(quizCardRotation));
  rectMode(CENTER);

  stroke(230, 0, 0, 190);
  strokeWeight(2);
  fill(0, 0, 0, 225);
  rect(0, 0, min(620, width * 0.82), 150, 24);

  noFill();
  stroke(230, 0, 0, 70);
  strokeWeight(5);
  rect(0, 0, min(620, width * 0.82), 150, 24);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  textSize(15);
  text(`Question ${currentQuestion + 1} / ${questions.length}`, 0, -52);

  textSize(23);
  drawWrappedText(q.text, 0, -8, 520, 26);

  fill(230);
  textStyle(NORMAL);
  textSize(14);
  text(quizFeedback, 0, 52);

  pop();

  drawQuizSideLabels();
}

function drawQuizSideLabels() {
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  noStroke();

  fill(230, 0, 0, 230);
  textSize(26);
  text("NO", 85, height / 2);

  textSize(14);
  fill(255);
  text("left hand ←", 85, height / 2 + 35);

  fill(0, 190, 90, 230);
  textSize(26);
  text("YES", width - 85, height / 2);

  textSize(14);
  fill(255);
  text("right hand →", width - 85, height / 2 + 35);
}




function drawResultScreen() {
  // lighter dark tint so confetti still shows
  noStroke();
  fill(0, 0, 0, 55);
  rect(0, 0, width, height);

  if (resultStarted) {
    drawConfetti();
  }

  rectMode(CENTER);

  stroke(230, 0, 0);
  strokeWeight(3);
  fill(0, 0, 0, 220);
  rect(width / 2, height / 2, min(680, width * 0.88), 470, 30);

  noFill();
  stroke(230, 0, 0, 90);
  strokeWeight(8);
  rect(width / 2, height / 2, min(680, width * 0.88), 470, 30);

  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  fill(255);
  textSize(22);
  text("Congratulations!", width / 2, height / 2 - 180);

  fill(230, 0, 0);
  textSize(30);
  text("Your Best e& Package", width / 2, height / 2 - 140);

  fill(255);
  textSize(26);
  drawWrappedText(bestPlan.name, width / 2, height / 2 - 85, 520, 30);

  fill(230, 0, 0);
  textSize(40);
  text(`AED ${bestPlan.price}/month`, width / 2, height / 2 + 5);

  fill(255);
  textSize(18);
  textStyle(NORMAL);

  text(`Speed: ${bestPlan.speed}`, width / 2, height / 2 + 62);
  text(`Data: ${bestPlan.data}`, width / 2, height / 2 + 95);
  text(`Minutes: ${bestPlan.minutes}`, width / 2, height / 2 + 128);
  text(`Roaming: ${bestPlan.roaming}`, width / 2, height / 2 + 161);
  text(`Commitment: ${bestPlan.commitment}`, width / 2, height / 2 + 194);

  fill(210);
  textSize(15);
  text(`Matched ${bestPlan.score} of your selected preferences`, width / 2, height / 2 + 230);

  fill(255);
  textSize(14);
  text("Refresh the page to start again", width / 2, height / 2 + 262);

  rectMode(CORNER);
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