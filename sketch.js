let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSwooshSound() {
  let ctx = getAudioContext();
  let duration = 0.22;
  let bufferSize = Math.floor(ctx.sampleRate * duration);
  let buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  let data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  let noise = ctx.createBufferSource();
  noise.buffer = buffer;

  let filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(1800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);

  let gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + duration);

  let toneDuration = 0.16;
  let osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(420, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + toneDuration);

  let toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.001, ctx.currentTime);
  toneGain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.04);
  toneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + toneDuration);

  osc.connect(toneGain);
  toneGain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + toneDuration);
}

function playHapticSound() {
  let ctx = getAudioContext();
  let now = ctx.currentTime;

  let clickDuration = 0.03;
  let bufferSize = Math.floor(ctx.sampleRate * clickDuration);
  let buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  let data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  let noise = ctx.createBufferSource();
  noise.buffer = buffer;

  let noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 2500;

  let noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + clickDuration);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + clickDuration);

  let toneDuration = 0.07;
  let osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + toneDuration);

  let toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.5, now + 0.008);
  toneGain.gain.exponentialRampToValueAtTime(0.001, now + toneDuration);

  osc.connect(toneGain);
  toneGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + toneDuration);
}

function playChargeTick(progress) {
  let ctx = getAudioContext();
  let now = ctx.currentTime;
  let duration = 0.09;

  let bufferSize = Math.floor(ctx.sampleRate * duration);
  let buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  let data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  let noise = ctx.createBufferSource();
  noise.buffer = buffer;

  let filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.value = lerp(450, 750, progress);

  let gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.5, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);

  let toneOsc = ctx.createOscillator();
  toneOsc.type = "sine";
  toneOsc.frequency.setValueAtTime(lerp(180, 260, progress), now);
  toneOsc.frequency.exponentialRampToValueAtTime(lerp(90, 130, progress), now + duration);

  let toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.8, now + 0.008);
  toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  toneOsc.connect(toneGain);
  toneGain.connect(ctx.destination);
  toneOsc.start(now);
  toneOsc.stop(now + duration);
}

function startChargeSound() {
  if (chargeActive) return;

  let ctx = getAudioContext();
  let now = ctx.currentTime;

  chargeActive = true;
  playChargeTick(0);
  chargeNextTickAt = now + 0.25;
}

function updateChargeSound(progress) {
  if (!chargeActive) return;

  let ctx = getAudioContext();
  let now = ctx.currentTime;

  if (now >= chargeNextTickAt) {
    playChargeTick(progress);
    chargeNextTickAt = now + lerp(0.25, 0.06, constrain(progress, 0, 1));
  }
}

function stopChargeSound() {
  chargeActive = false;
  chargeNextTickAt = 0;
}

function playSelectSound() {
  let ctx = getAudioContext();
  let now = ctx.currentTime;
  let duration = 0.42;

  let osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + duration);

  let filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(3200, now + duration);

  let gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(0.22, now + 0.06);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/* -------------------- NARRATION -------------------- */
// Recorded voice-over, one MP3 per quiz question plus one for the plan-type
// question, named "questions/{mobile|home}_{questionNumber}_{tag}.mp3" -
// questionNumber is the question's 1-based position in mobileQuestions/
// homeQuestions (zero padded to 2 digits) and tag is that question's own
// `tag` field, so the path is derived straight from the question data
// instead of a hand-kept lookup table. Drop in a new /questions folder that
// follows the same "{planType}_{NN}_{tag}.mp3" naming (matching whatever
// mobileQuestions/homeQuestions look like at the time) and playback picks
// it up with no code changes. Arabic recordings live alongside the
// English ones in an "ar" subfolder with the same base filename (see
// localizeAudioPath) - startNarrationClip swaps to that path whenever
// appLanguage is "ar".
// Step-by-step walkthrough narration lives in /instructions, one MP3 per
// screen (01_thumbs_up_begin.mp3 etc). Numbers 07 and 08 aren't recorded
// yet (the intro tagline and "here we go" ready screen). Keyed by appState
// so it can be dispatched centrally from updateStateEntrance(); the
// practice screen's two sub-steps (swipe right/left) and the plan-selected
// moment don't map 1:1 to an appState, so those are triggered explicitly
// where that happens instead. These recordings are English only too.
const INSTRUCTION_AUDIO = {
  welcome: "instructions/01_thumbs_up_begin.mp3",
  openHands: "instructions/02_palm_open.mp3",
  language: "instructions/03_finger_count_language.mp3",
  backGesture: "instructions/06_thumbs_down_back.mp3",
  loading: "instructions/09_shortlisting_plans.mp3"
};

// The results screen's narration is two clips with a deliberate pause
// between them (hover-to-preview, then close-fist-to-select), so it's
// played as a sequence rather than through the single-clip map above.
const RESULT_NARRATION_SEQUENCE = ["instructions/hoverhandplan.mp3", "instructions/closehandtoselect.mp3"];
const RESULT_NARRATION_GAP = 700;
// Longer than the usual screen-entry delay - gives the card entrance
// animation and confetti time to settle before "hover over a plan" starts.
const RESULT_NARRATION_START_DELAY = 3000;

// The instructions screen is likewise two clips back to back: keep your
// hands visible, then the "remember" reminder that follows it.
const INSTRUCTIONS_SCREEN_SEQUENCE = ["instructions/handsvisible.mp3", "instructions/rememberinto.mp3"];
const INSTRUCTIONS_SCREEN_GAP = 100;

// Gap used for a quiz question whose narration is itself a short sequence
// (e.g. the priority question's clip, followed by a clip explaining the
// hover-and-hold gesture) via that question's own `audioSequence` field.
const QUESTION_NARRATION_GAP = 150;

// Beat of silence after a new screen appears before its voice note starts,
// so the narration doesn't talk over the entrance animation. The language
// screen is the one exception - it plays immediately (see
// playInstructionNarration below).
const NARRATION_SCREEN_DELAY = 250;

let narrationAudio = null;
let narrationQueue = [];
let narrationQueueGap = 0;
let narrationTimeoutId = null;
// True once the most recently started clip/sequence has actually finished
// playing - lets a screen advance exactly when its narration ends instead
// of guessing a fixed delay long enough for every language's recording.
let narrationSequenceDone = false;

function getQuestionAudioPath(planType, questionIndex, tag) {
  let questionNumber = String(questionIndex + 1).padStart(2, "0");
  return `questions/${planType}_${questionNumber}_${tag}.mp3`;
}

// Plays a single clip, abandoning any queued sequence that was still
// pending (see playNarrationSequence below).
function playNarrationClip(path, startDelay = NARRATION_SCREEN_DELAY) {
  stopNarration();
  scheduleNarrationStart(path, startDelay);
}

// Plays each path in order, waiting for one clip to finish (plus an
// optional pause) before starting the next, instead of overlapping them.
function playNarrationSequence(paths, gapMs = 0, startDelay = NARRATION_SCREEN_DELAY) {
  if (paths.length === 0) return;
  stopNarration();
  narrationQueue = paths.slice(1);
  narrationQueueGap = gapMs;
  scheduleNarrationStart(paths[0], startDelay);
}

// Waits startDelay before the very first clip of a clip/sequence begins -
// separate from narrationQueueGap, which paces the clips within a sequence
// once it's already under way.
function scheduleNarrationStart(path, startDelay) {
  if (startDelay > 0) {
    narrationTimeoutId = setTimeout(() => {
      narrationTimeoutId = null;
      startNarrationClip(path);
    }, startDelay);
  } else {
    startNarrationClip(path);
  }
}

// Arabic narration lives alongside the English clips in an "ar" subfolder
// with the same base filename, as .m4a instead of .mp3 (macOS's `say`
// can't encode mp3 itself, only AAC/ALAC - but any real .mp3 dropped in
// under the same name works fine here).
function localizeAudioPath(path) {
  if (appLanguage !== "ar") return path;

  let slashIndex = path.indexOf("/");
  let folder = path.slice(0, slashIndex);
  let filename = path.slice(slashIndex + 1);
  return `${folder}/ar/${filename}`;
}

// Shared playback step used by both of the above - does not touch
// narrationQueue, so a sequence's remaining clips survive the moment the
// current one starts.
function startNarrationClip(path) {
  narrationAudio = new Audio(localizeAudioPath(path));

  // A clip that fails to load (missing file, 404) never fires "ended" -
  // only "error" does - so without this, a missing clip anywhere in a
  // sequence would silently hang narrationSequenceDone forever instead of
  // just skipping it like a clip that finished normally.
  let advance = () => {
    narrationAudio = null;
    if (narrationQueue.length === 0) {
      narrationSequenceDone = true;
      return;
    }

    let next = narrationQueue.shift();
    if (narrationQueueGap > 0) {
      narrationTimeoutId = setTimeout(() => {
        narrationTimeoutId = null;
        startNarrationClip(next);
      }, narrationQueueGap);
    } else {
      startNarrationClip(next);
    }
  };

  narrationAudio.onended = advance;
  narrationAudio.onerror = advance;
  narrationAudio.play().catch(() => {});
}

function stopNarration() {
  narrationQueue = [];
  narrationQueueGap = 0;
  narrationSequenceDone = false;

  if (narrationTimeoutId !== null) {
    clearTimeout(narrationTimeoutId);
    narrationTimeoutId = null;
  }

  if (!narrationAudio) return;
  narrationAudio.onended = null;
  narrationAudio.pause();
  narrationAudio = null;
}

function playQuestionNarration() {
  let q = questions[currentQuestion];
  if (!q || !selectedPlanType) {
    stopNarration();
    return;
  }

  // audioSequence is for a question whose narration is more than one clip
  // (e.g. the priority question's own clip, then a clip explaining the
  // hover-and-hold gesture).
  if (q.audioSequence) {
    playNarrationSequence(q.audioSequence, QUESTION_NARRATION_GAP);
    return;
  }

  // Most questions' clips follow the "{planType}_{NN}_{tag}.mp3" naming
  // convention and need no per-question wiring - audioFile is only for the
  // rare one that doesn't (e.g. the data-amount slider's recording, which
  // isn't named after its tag).
  playNarrationClip(q.audioFile || getQuestionAudioPath(selectedPlanType, currentQuestion, q.tag));
}

function playInstructionNarration(key) {
  if (key === "result") {
    playNarrationSequence(RESULT_NARRATION_SEQUENCE, RESULT_NARRATION_GAP, RESULT_NARRATION_START_DELAY);
    return;
  }

  if (key === "instructions") {
    playNarrationSequence(INSTRUCTIONS_SCREEN_SEQUENCE, INSTRUCTIONS_SCREEN_GAP, NARRATION_SCREEN_DELAY);
    return;
  }

  let path = INSTRUCTION_AUDIO[key];
  if (!path) return;

  // Language selection is the one screen whose narration plays right away,
  // with no lead-in pause.
  playNarrationClip(path, key === "language" ? 0 : NARRATION_SCREEN_DELAY);
}

function playPlanTypeNarration() {
  playNarrationClip("questions/00_home_or_mobile.mp3");
}

function checkRestartButtonClick(x, y) {
  if (appState !== "result") return;

  let pos = getRestartButtonPos();
  if (dist(x, y, pos.x, pos.y) < RESTART_HOVER_RADIUS) {
    stopChargeSound();
    restartHoverSince = null;
    restartHoldStartAt = null;
    playSelectSound();
    restartExperience();
  }
}

function touchStarted() {
  getAudioContext();

  if (touches && touches.length > 0) {
    checkRestartButtonClick(touches[0].x, touches[0].y);
  } else {
    checkRestartButtonClick(mouseX, mouseY);
  }
}

function mousePressed() {
  getAudioContext();
  checkRestartButtonClick(mouseX, mouseY);
}

// Dev-only input: left/right arrows stand in for a right-hand swipe, up
// arrow stands in for a thumbs-down (go back), Enter skips a hold/timer
// step, so the flow can be tested without a camera. On the data-amount
// slider question, left/right instead nudge the selected step and Enter
// confirms it. On the priority question, left/right move the highlighted
// pill (reusing priorityHoverIndex, the same field the real hover-hold
// flow drives) and Enter confirms it immediately, skipping the hold.
// Not surfaced anywhere in the UI.
function keyPressed() {
  let currentQ = appState === "quiz" && !quizTransition ? questions[currentQuestion] : null;
  let isSliderQuestion = currentQ && currentQ.type === "slider";
  let isPriorityQuestion = currentQ && currentQ.type === "priority";

  if (keyCode === ENTER || keyCode === RETURN) {
    if (isSliderQuestion) {
      let now = millis();
      if (now - lastSwipeTime < COOLDOWN) return;
      lastSwipeTime = now;
      playHapticSound();
      handleSliderAnswer(DATA_SLIDER_STEPS[sliderStepIndex].value);
      return;
    }
    if (isPriorityQuestion) {
      let now = millis();
      if (now - lastSwipeTime < COOLDOWN) return;
      lastSwipeTime = now;
      playHapticSound();
      let index = priorityHoverIndex === null ? 0 : priorityHoverIndex;
      priorityHoverIndex = null;
      priorityHoldStartAt = null;
      handlePriorityAnswer(currentQ.options[index].key);
      return;
    }
    skipCurrentStep();
    return;
  }

  if (keyCode === UP_ARROW) {
    let now = millis();
    if (now - lastSwipeTime < COOLDOWN) return;

    if (appState === "backGesture" && !backGesturePracticed) {
      lastSwipeTime = now;
      backGesturePracticed = true;
      playHapticSound();
    } else if (appState === "quiz" && !quizTransition) {
      lastSwipeTime = now;
      playHapticSound();
      goToPreviousQuestion();
    }
    return;
  }

  if (keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW) return;

  let direction = keyCode === RIGHT_ARROW ? "right" : "left";

  if (isSliderQuestion) {
    sliderStepIndex = constrain(sliderStepIndex + (direction === "right" ? 1 : -1), 0, DATA_SLIDER_STEPS.length - 1);
    return;
  }

  if (isPriorityQuestion) {
    let base = priorityHoverIndex === null ? 0 : priorityHoverIndex;
    priorityHoverIndex = constrain(base + (direction === "right" ? 1 : -1), 0, currentQ.options.length - 1);
    priorityDelayUntil = 0;
    priorityHoldStartAt = null;
    return;
  }

  // No COOLDOWN gate here - unlike a real hand swipe, a keypress is
  // already a single deliberate action, so there's nothing to debounce.
  let now = millis();

  if (appState === "practice") {
    confirmPracticeSwipe(direction);
  } else if (appState === "planType") {
    lastSwipeTime = now;
    selectPlanType(direction === "right" ? "mobile" : "home");
  } else if (appState === "quiz" && !quizTransition) {
    handleQuizAnswer(direction === "right");
  }
}

function skipCurrentStep() {
  if (appState === "welcome") {
    appState = "openHands";
    feedbackMessage = "";
    thumbsUpSince = null;
  } else if (appState === "openHands") {
    rightHandReadySince = null;
    appState = "language";
  } else if (appState === "language") {
    languageGestureType = null;
    languageGestureSince = null;
    updatePlanTypeButtonLabels();
    updateQrLabel();
    appState = "practice";
    practiceStep = "right";
    practiceStepEnteredAt = millis();
    playNarrationClip("instructions/04_center_swipe_right.mp3");
    feedbackMessage = t("swipeRightInstruction");
    instructionsStartTime = null;
    resetSwipe();
    calibratedRightX = null;
    practiceResetUntil = 0;
    practiceIndicatorTarget = 0;
    practiceIndicatorX = 0;
  } else if (appState === "practice") {
    appState = "backGesture";
    backGestureStartTime = null;
    thumbsDownSince = null;
  } else if (appState === "backGesture") {
    appState = "instructions";
    instructionsStartTime = null;
    backGestureStartTime = null;
    backGesturePracticed = false;
    thumbsDownSince = null;
  } else if (appState === "instructions") {
    appState = "ready";
  } else if (appState === "ready") {
    startPlanTypeSelection();
  } else if (appState === "loading") {
    loadingStartTime = null;
    recommendedPlans = getRecommendedPlans(3);
    bestPlan = recommendedPlans[0];
    startResultCelebration();
    appState = "result";
  }
}

let appState = "welcome";

let appLanguage = "en";
let languageGestureType = null;
let languageGestureSince = null;

let rightHandReady = false;
let confettiPieces = [];
let resultStarted = false;
let swipeStartX = null;
let swipeStartTime = 0;
let lastSwipeTime = 0;
let smoothedRightX = null;
let swipeHoldDirection = null;
let swipeHoldStartAt = 0;
let swipeHoldSamples = []; // {movement, t} recorded each frame while the current hold streak is active
let thumbsDownSince = null;

let practiceStep = "right";
let practiceStepEnteredAt = 0;
let feedbackMessage = "";
let practiceResetUntil = 0;
let practiceIndicatorTarget = 0;
let practiceIndicatorX = 0;

let instructionsStartTime = null;
let calibratedRightX = null;
let calibrationSettleSince = null;
let rightHandReadySince = null;
let thumbsUpSince = null;
let backGestureStartTime = null;
let backGesturePracticed = false;
let rightHandGraceUntil = 0;
let lastRightHandSeenAt = 0;
let lastRenderedState = null;
let stateEnteredAt = 0;
let quizTransition = null;
let quizEntryAt = 0;
let quizDisplayX = 0;
let recommendedPlans = [];
let planHoverX = null;
let planHoverY = null;
let planCardScales = [];
let planCardX = [];
let planCardAlpha = [];
let selectHoverIndex = null;
let selectLossSince = null;
let selectDelayUntil = 0;
let selectHoldStartAt = null;
let selectedPlanIndex = null;
let selectedPlanStartedAt = 0;
let resultFistBackDelayUntil = 0;
let planSelectResumeDelayUntil = 0;
let chargeActive = false;
let chargeNextTickAt = 0;
let restartHoverSince = null;
let restartHoldStartAt = null;
let welcomeGestureLockedUntil = 0;
let ambientParticles = [];

// Grab-and-slide data-amount question: hover the RIGHT hand near the
// handle, close it into a fist to grab, drag to a step, then open the
// hand to release and confirm - mirrors the hover+fist "hold to select"
// pattern used for plan selection, but follows the hand continuously
// instead of requiring a hold timer.
const DATA_SLIDER_STEPS = [
  { value: 0, label: "0GB" },
  { value: 5, label: "5GB" },
  { value: 10, label: "10GB" },
  { value: 20, label: "20GB" },
  { value: 40, label: "40GB" },
  { value: 50, label: "50GB" },
  { value: 80, label: "80GB" },
  { value: 100, label: "100GB" },
  { value: Infinity, label: "Unlimited" }
];
const SLIDER_GRAB_RADIUS = 120;
const SLIDER_HANDLE_OFFSET_Y = 62;
// After the user lets go of the handle, auto-confirm the current value
// unless they grab it again before this much time passes.
const SLIDER_CONFIRM_WAIT = 3000;

// Idle demo: a ghost hand drifts from the center of the screen down to the
// handle, grabs it, slides to a demo step and back, then lets go - teaches
// the hover/grab/slide gesture in place, same idea as drawSelectGestureDrift
// on the results screen.
const SLIDER_DEMO_START_DELAY = 3700;
const SLIDER_DEMO_TRAVEL_TIME = 900;
const SLIDER_DEMO_OPEN_HOLD = 500;
const SLIDER_DEMO_MORPH = 200;
const SLIDER_DEMO_SLIDE_TIME = 1400;
const SLIDER_DEMO_FIST_HOLD = 400;
const SLIDER_DEMO_FINAL_SLIDE_TIME = 900;
const SLIDER_DEMO_LOOP_PAUSE = 1000;

let sliderStepIndex = 0;
let sliderGrabbed = false;
let sliderPendingConfirmSince = null;
let sliderDisplayX = null;
let sliderPointerX = null;
let sliderPointerY = null;

// Priority-pill question: hover-to-preview, close a fist and hold to lock
// in - the same expanding-scale + hold-ring mechanic as picking a plan on
// the results screen (see updatePlanSelection/drawDesktopPlanCards),
// just retargeted from plan cards to priority pills. A bonus multiplier
// on top of a plan's normal match score, not a separate hard requirement.
const PRIORITY_HOVER_RADIUS = 145;
const PRIORITY_BONUS_WEIGHT = 2;
const PRIORITY_DEMO_LOOP_PAUSE = 1000;
// Fallback only - if the hover-instruction clip never actually starts
// (Arabic narration is silent, or the file fails to load), don't leave
// the demo waiting forever.
const PRIORITY_DEMO_FALLBACK_DELAY = 6000;
let priorityPointerX = null;
let priorityPointerY = null;
let priorityHoverIndex = null;
let priorityHoldStartAt = null;
let priorityDelayUntil = 0;
let priorityLossSince = null;
let priorityScales = [];
let priorityInstructionStartedAt = null;
const mobileQuestions = [
  {
    en: "Are you an Emirati citizen?",
    ar: "هل أنت مواطن إماراتي؟",
    tag: "emarati"
  },
  {
    en: "Do most of your calls stay within the UAE?",
    ar: "هل معظم مكالماتك محلية داخل الإمارات؟",
    tag: "localMinutes"
  },
  {
    en: "Do you regularly call people outside the UAE?",
    ar: "هل تتصل كثيرًا بأشخاص خارج الإمارات؟",
    tag: "flexiMinutes"
  },
  {
    en: "About how much data do you need each month?",
    ar: "تقريباً كم تحتاج من البيانات شهرياً؟",
    tag: "dataGb",
    type: "slider",
    audioFile: "questions/data.mp3"
  },
  {
    en: "Do you stream, game, or work on your phone enough that speed really matters?",
    ar: "هل السرعة مهمة بالنسبة لك، خصوصًا عند اللعب أو المشاهدة أو العمل من جوالك؟",
    tag: "fastSpeed"
  },
  {
    en: "Do you travel outside the UAE often enough to need roaming?",
    ar: "هل تسافر خارج الإمارات كثيراً لتحتاج خدمة التجوال؟",
    tag: "roaming"
  },
  {
    en: "Would you rather commit to 12 months than a longer 24-month contract?",
    ar: "هل تريد الالتزام بعقد 12 شهر بدل عقد أطول مدته 24 شهر؟",
    tag: "shortCommitment"
  },
  {
    en: "What should we prioritize when picking your best-fit package?",
    ar: "بماذا يجب أن نُعطي الأولوية عند اختيار الباقة الأنسب لك؟",
    tag: "priority",
    type: "priority",
    audioSequence: ["questions/priorityquestion.mp3", "instructions/priorityhoverinstruction.mp3"],
    options: [
      { key: "cheap", en: "Price", ar: "السعر" },
      { key: "fastSpeed", en: "Speed", ar: "السرعة" },
      { key: "dataGb", en: "Data", ar: "البيانات" },
      { key: "minutes", en: "Minutes", ar: "الدقائق" },
      { key: "roaming", en: "Roaming", ar: "التجوال" },
      { key: "equal", en: "All equal", ar: "كلها متساوية" }
    ]
  }
];

const homeQuestions = [
  {
    en: "Is price your top priority for home internet, even if it means fewer extras?",
    ar: "هل السعر هو الأهم بالنسبة لك للإنترنت المنزلي، حتى لو قلّت المزايا؟",
    tag: "homeValue"
  },
  {
    en: "Do you need fast internet for working, gaming, or streaming?",
    ar: "هل تحتاج إنترنت سريع للعمل أو الألعاب أو البث؟",
    tag: "fastHome"
  },
  {
    en: "Do you have several people or devices online at once, needing the fastest tier available?",
    ar: "هل لديك عدة أشخاص أو أجهزة متصلة في وقت واحد، وتحتاج أسرع فئة متاحة؟",
    tag: "ultraFastHome"
  },
  {
    en: "Do you want premium TV and sports channels included?",
    ar: "هل تريد قنوات التلفاز المميزة والرياضة ضمن الباقة؟",
    tag: "premiumTv"
  },
  {
    en: "Is having the latest WiFi 7 router specifically important to you?",
    ar: "هل يهمك تحديداً الحصول على أحدث راوتر واي فاي 7؟",
    tag: "wifi7"
  },
  {
    en: "Would a shorter 12-month contract suit you better?",
    ar: "هل يناسبك عقد أقصر لمدة 12 شهراً؟",
    tag: "shortHomeCommitment"
  },
  {
    en: "Are you interested in extras like streaming, smart-home, and lifestyle benefits?",
    ar: "هل تهمك مزايا إضافية مثل خدمات البث والمنزل الذكي وعروض ترفيهية؟",
    tag: "homeBenefits"
  }
];

const STRINGS = {
  en: {
    statusReadyForGesture: "READY FOR YOUR GESTURE",
    statusChooseLanguage: "CHOOSE YOUR LANGUAGE",
    statusCalibrating: "CALIBRATING RIGHT HAND",
    statusGestureGuide: "GESTURE GUIDE",
    statusPracticeMode: "PRACTICE MODE",
    statusCalibrationComplete: "CALIBRATION COMPLETE",
    statusChoosePlanType: "CHOOSE YOUR PLAN TYPE",
    statusMatching: "MATCHING",
    statusComputingPlans: "FINDING YOUR MATCHES",
    statusResultsReady: "YOUR PACKAGES ARE READY",
    statusDefault: "PACKAGE ADVISOR READY",

    welcomeTitle: "Find the package that fits you",
    welcomeSubtitle: "Smart questions, agentic reasoning, and a match made for you.",
    thumbsUpPrompt: "THUMBS UP  ·  HOLD TO BEGIN",

    step1Calibration: "STEP 1 OF 2  ·  CALIBRATION",
    showRightHand: "Show your right hand",
    openPalmInstruction: "Open your palm and hold it comfortably inside the frame.",
    rightHandDetected: "Right hand detected!",
    waiting: "Waiting...",
    handCalibrated: "Right hand calibrated!",

    introEyebrow: "INTRODUCING",
    no: "NO",
    yes: "YES",
    introTagline: "Your hand is the controller — swipe, point, and grab to find your plan.",

    practiceBuildMuscle: "PRACTICE  ·  BUILD MUSCLE MEMORY",
    swipeRight: "Swipe right",
    swipeLeftNow: "Now swipe left",
    moveHandSide: "Move your open right hand clearly to the side",
    showOnlyRightHand: "Show only your RIGHT hand.",
    resetHandCenter: "Nice! Reset your RIGHT hand to the center...",
    moveHandCenterFirst: "Move your RIGHT hand to the center first.",
    nowSwipeDirection: "Now swipe {DIR} with your RIGHT hand.",
    directionRight: "RIGHT",
    directionLeft: "LEFT",
    swipeRightInstruction: "Swipe your RIGHT hand to the right.",
    movingRight: "Right hand moving right...",
    rightSwipeDetected: "Right swipe detected!",
    swipeRightFirst: "Swipe right first. Return your hand to center.",
    swipeLeftInstruction: "Swipe your RIGHT hand to the left.",
    movingLeft: "Right hand moving left...",
    leftSwipeDetected: "Left swipe detected!",
    swipeLeftFirst: "Swipe left now. Return your hand to center.",

    oneMoreGesture: "ONE MORE GESTURE  ·  GOING BACK",
    niceThatsIt: "Nice, that's it!",
    thumbsDownNow: "Thumbs down whenever you want to go back",
    tryIt: "Try it",
    continuingFirstQuestion: "Continuing to your first question...",
    thumbsDownExplain: "Turn your right hand into a thumbs-down and hold it to jump back to the previous question.",

    youreReady: "You're ready",
    preparingFirstQuestion: "Preparing your first question...",

    planTypeEyebrow: "START HERE",
    planTypeQuestion: "Are you looking for a home plan or a mobile plan?",
    swipeHomeOrMobileHint: "Swipe LEFT for HOME PLAN or RIGHT for MOBILE PLAN.",
    homeSelectedHint: "HOME PLAN selected...",
    mobileSelectedHint: "MOBILE PLAN selected...",
    homeLabel: "HOME PLAN",
    mobileLabel: "MOBILE PLAN",

    questionOf: "QUESTION {n} OF {total}",
    moveHandCenterQuiz: "Move your right hand to the center.",
    savingYes: "Great choice · saving YES",
    savingNo: "Got it · saving NO",
    resetForNext: "Reset your hand for the next question...",
    keepSwiping: "Keep swiping...",
    keepHandOpenWarning: "Open your hand back up to keep swiping.",
    bringHandMiddle: "Bring your RIGHT hand back toward the middle.",
    swipeYesNoInstruction: "Swipe your RIGHT hand: RIGHT for YES, LEFT for NO.",
    yesDetected: "YES detected...",
    noDetected: "NO detected...",
    swipeHint: "RIGHT hand: swipe right = YES · swipe left = NO",
    thumbsDownHoldToGoBack: "Hold it there · going back...",
    thumbsDownHoldingBack: "Keep holding...",
    thumbsDownToGoBack: "Thumbs down to go back to the previous question",
    firstQuestionMsg: "This is the first question.",
    backToPrevious: "Back to the previous question. Move your right hand to the center.",
    swipeDock: "SWIPE",

    unlimitedLabel: "Unlimited",
    keepSliding: "Keep sliding...",
    sliderHoverInstruction: "Close your RIGHT hand into a fist anywhere on the track to grab it there.",
    sliderGrabbed: "Grabbed at {value} · slide left or right",
    sliderDragging: "Sliding to {value}...",
    sliderConfirmingIn: "Confirming {value} in {seconds}s · grab the handle again to change it",
    savingAmount: "Great choice · saving {value}",
    keepHoveringPriority: "Keep hovering...",
    priorityHoverInstruction: "Hover your RIGHT hand over an option, then close it into a fist to lock it in.",
    priorityHovering: "Hovering {value} · hold your fist to confirm",
    priorityHolding: "Holding · confirming your priority...",
    savingPriority: "Great choice · saving {value}",

    loadingEyebrow: "ONE MOMENT",
    loadingTitle: "Building your shortlist",

    personalizedShortlist: "YOUR PERSONALIZED SHORTLIST",
    packagesPickedTitle: "Packages picked for you",
    homePackagesPickedTitle: "Home plans picked for you",
    mobilePackagesPickedTitle: "Mobile plans picked for you",
    rankedSubtitle: "Ranked by the preferences you shared",
    pricesFootnote: "Prices shown per month · VAT may apply",
    restartLabel: "RESTART",
    scanForDetails: "SCAN FOR PLAN DETAILS",
    selectHint: "Hover over a plan to preview it. Close your fist to select.",
    selectHolding: "Fist held · selecting...",
    bestMatch: "BEST MATCH",
    selectedBadge: "✓ YOUR PACKAGE",
    optionN: "#{n} OPTION",
    perMonth: "PER MONTH",
    dataLabel: "DATA",
    speedLabel: "SPEED",
    minutesLabel: "MINUTES",
    roamingLabel: "ROAMING",
    internetLabel: "INTERNET",
    tvLabel: "TV",
    benefitsLabel: "BENEFITS",
    commitmentLabel: "COMMITMENT",
    preferenceMatch: "{pct}% preference match",
    bestValueMatch: "Best value match"
  },
  ar: {
    statusReadyForGesture: "جاهز لإيماءتك",
    statusChooseLanguage: "اختر لغتك",
    statusCalibrating: "معايرة اليد اليمنى",
    statusGestureGuide: "دليل الإيماءات",
    statusPracticeMode: "وضع التدريب",
    statusCalibrationComplete: "اكتملت المعايرة",
    statusChoosePlanType: "اختر نوع باقتك",
    statusMatching: "جارٍ المطابقة",
    statusComputingPlans: "جارٍ إيجاد باقاتك",
    statusResultsReady: "باقاتك جاهزة",
    statusDefault: "مستشار الباقات جاهز",

    welcomeTitle: "اعثر على الباقة المناسبة لك",
    welcomeSubtitle: "أسئلة ذكية وتحليل آلي لإيجاد الباقة الأنسب لك.",
    thumbsUpPrompt: "إبهام لأعلى  ·  ثبّته للبدء",

    step1Calibration: "الخطوة 1 من 2  ·  المعايرة",
    showRightHand: "أظهر يدك اليمنى",
    openPalmInstruction: "افتح يدك وثبّتها بشكل مريح داخل الإطار.",
    rightHandDetected: "تم رصد اليد اليمنى!",
    waiting: "في الانتظار...",
    handCalibrated: "تمت معايرة اليد اليمنى!",

    introEyebrow: "نقدّم لكم",
    no: "لا",
    yes: "نعم",
    introTagline: "يدك هي أداة التحكم — اسحب وأشر واقبض لإيجاد باقتك.",

    practiceBuildMuscle: "تدريب  ·  بناء الذاكرة الحركية",
    swipeRight: "اسحب لليمين",
    swipeLeftNow: "الآن اسحب لليسار",
    moveHandSide: "حرّك يدك اليمنى المفتوحة بوضوح إلى الجانب",
    showOnlyRightHand: "أظهر يدك اليمنى فقط.",
    resetHandCenter: "أحسنت! أعد يدك اليمنى إلى المنتصف...",
    moveHandCenterFirst: "حرّك يدك اليمنى إلى المنتصف أولاً.",
    nowSwipeDirection: "الآن اسحب يدك اليمنى إلى {DIR}.",
    directionRight: "اليمين",
    directionLeft: "اليسار",
    swipeRightInstruction: "اسحب يدك اليمنى إلى اليمين.",
    movingRight: "اليد اليمنى تتحرك لليمين...",
    rightSwipeDetected: "تم رصد السحب لليمين!",
    swipeRightFirst: "اسحب لليمين أولاً. أعد يدك إلى المنتصف.",
    swipeLeftInstruction: "اسحب يدك اليمنى إلى اليسار.",
    movingLeft: "اليد اليمنى تتحرك لليسار...",
    leftSwipeDetected: "تم رصد السحب لليسار!",
    swipeLeftFirst: "اسحب لليسار الآن. أعد يدك إلى المنتصف.",

    oneMoreGesture: "إيماءة إضافية  ·  الرجوع للخلف",
    niceThatsIt: "أحسنت، تمام!",
    thumbsDownNow: "اجعل إبهامك لأسفل في أي وقت تريد الرجوع",
    tryIt: "جرّبها الآن",
    continuingFirstQuestion: "الانتقال إلى سؤالك الأول...",
    thumbsDownExplain: "اجعل يدك اليمنى بوضعية إبهام لأسفل واثبتها للرجوع إلى السؤال السابق.",

    youreReady: "أنت جاهز",
    preparingFirstQuestion: "يتم تجهيز سؤالك الأول...",

    planTypeEyebrow: "ابدأ هنا",
    planTypeQuestion: "هل تبحث عن باقة منزلية أم باقة جوال؟",
    swipeHomeOrMobileHint: "اسحب لليسار للباقة المنزلية أو لليمين لباقة الجوال.",
    homeSelectedHint: "تم اختيار الباقة المنزلية...",
    mobileSelectedHint: "تم اختيار باقة الجوال...",
    homeLabel: "باقة منزلية",
    mobileLabel: "باقة جوال",

    questionOf: "السؤال {n} من {total}",
    moveHandCenterQuiz: "حرّك يدك اليمنى إلى المنتصف.",
    savingYes: "اختيار رائع · جارٍ حفظ نعم",
    savingNo: "تم · جارٍ حفظ لا",
    resetForNext: "أعد ضبط يدك للسؤال التالي...",
    keepSwiping: "تابع السحب...",
    keepHandOpenWarning: "افتح يدك لمتابعة السحب.",
    bringHandMiddle: "أعد يدك اليمنى نحو المنتصف.",
    swipeYesNoInstruction: "اسحب يدك اليمنى: يمين يعني نعم، ويسار يعني لا.",
    yesDetected: "تم رصد نعم...",
    noDetected: "تم رصد لا...",
    swipeHint: "اليد اليمنى: يمين = نعم · يسار = لا",
    thumbsDownHoldToGoBack: "ثبّت يدك · جارٍ الرجوع...",
    thumbsDownHoldingBack: "واصل التثبيت...",
    thumbsDownToGoBack: "إبهام لأسفل للرجوع إلى السؤال السابق",
    firstQuestionMsg: "هذا هو السؤال الأول.",
    backToPrevious: "رجعت إلى السؤال السابق. حرّك يدك اليمنى إلى المنتصف.",
    swipeDock: "اسحب",

    unlimitedLabel: "غير محدود",
    keepSliding: "تابع السحب...",
    sliderHoverInstruction: "اقفل يدك اليمنى في أي مكان على الشريط لتمسك به هناك.",
    sliderGrabbed: "أمسكت عند {value} · حرّك يمين أو يسار",
    sliderDragging: "جارٍ التحريك إلى {value}...",
    sliderConfirmingIn: "جارٍ تأكيد {value} خلال {seconds} ثانية · أمسك المقبض مجدداً للتغيير",
    savingAmount: "اختيار رائع · جارٍ حفظ {value}",
    keepHoveringPriority: "تابع التحويم...",
    priorityHoverInstruction: "ضع يدك اليمنى فوق أحد الخيارات، ثم اقبضها لتأكيد الخيار.",
    priorityHovering: "التحويم على {value} · ثبّت قبضتك للتأكيد",
    priorityHolding: "جارٍ التثبيت... تأكيد أولويتك",
    savingPriority: "اختيار رائع · جارٍ حفظ {value}",

    loadingEyebrow: "لحظة واحدة",
    loadingTitle: "جارٍ تجهيز قائمتك",

    personalizedShortlist: "قائمتك المختارة",
    packagesPickedTitle: "باقات مختارة لك",
    homePackagesPickedTitle: "باقات المنزل المختارة لك",
    mobilePackagesPickedTitle: "باقات الجوال المختارة لك",
    rankedSubtitle: "مرتّبة حسب تفضيلاتك",
    pricesFootnote: "الأسعار شهرياً · قد تُضاف ضريبة القيمة المضافة",
    restartLabel: "إعادة",
    scanForDetails: "امسح لمعرفة تفاصيل الباقة",
    selectHint: "ضع يدك فوق باقة لعرض معاينتها. أغلق يدك لاختيارها.",
    selectHolding: "القبضة مُثبّتة · جارٍ الاختيار...",
    bestMatch: "الأنسب لك",
    selectedBadge: "✓ باقتك المختارة",
    optionN: "الخيار #{n}",
    perMonth: "شهرياً",
    dataLabel: "البيانات",
    speedLabel: "السرعة",
    minutesLabel: "الدقائق",
    roamingLabel: "التجوال",
    internetLabel: "الإنترنت",
    tvLabel: "التلفاز",
    benefitsLabel: "المزايا",
    commitmentLabel: "الالتزام",
    preferenceMatch: "تطابق {pct}٪ مع تفضيلاتك",
    bestValueMatch: "الأفضل من حيث القيمة"
  }
};

function t(key, vars) {
  let dict = STRINGS[appLanguage] || STRINGS.en;
  let str = dict[key] !== undefined ? dict[key] : STRINGS.en[key];

  if (vars) {
    for (let name in vars) {
      str = str.replace(new RegExp(`\\{${name}\\}`, "g"), vars[name]);
    }
  }

  return str;
}

function translateCommitment(value) {
  if (appLanguage !== "ar") return value;

  let match = value.match(/(\d+)\s*months?/i);
  if (match) {
    return `${match[1]} شهراً`;
  }

  return value;
}

const mobilePlans = [
  {
    name: "New Freedom Non-Stop Data Plan 250 Local",
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1760114&skuId=sku1770310&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1760115&skuId=sku1770312&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1750030&skuId=sku1760315&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1750029&skuId=sku1760314&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod375425-local&skuId=sku375-com-local&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod375425-flexi&skuId=sku375-com-flexi&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1760120&skuId=sku1770322&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1760121&skuId=sku1770325&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod-goldplans&skuId=sku-goldplan500-local&lang=en",
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
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod-goldplans&skuId=sku-goldplan500-flexi&lang=en",
    price: 500,
    speed: "Standard Gold plan",
    data: "100GB local data",
    minutes: "3500 flexi minutes",
    roaming: "Not shown",
    commitment: "24 months",
    features: ["flexiMinutes"]
  },
  {
    name: "Emirati Freedom Plan 250",
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1930023&skuId=sku1880313&catName=Emirati_Freedom&listVal=Emirati_Freedom_Plans&locale=EN",
    price: 250,
    speed: "Standard speed",
    data: "20GB local data",
    minutes: "1,000 local minutes",
    roaming: "Roam Like Home GCC & 200MB RoW",
    commitment: "12 months",
    features: ["emarati", "cheap", "localMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "Emirati Freedom Plan 400",
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1930024&skuId=sku1880315&catName=Emirati_Freedom&listVal=Emirati_Freedom_Plans&locale=EN",
    price: 400,
    speed: "Standard speed",
    data: "40GB local data",
    minutes: "Unlimited local minutes",
    roaming: "Roam Like Home GCC & 1GB RoW",
    commitment: "12 months",
    features: ["emarati", "localMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "Emirati Freedom Plan 750",
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1930025&skuId=sku1880317&catName=Emirati_Freedom&listVal=Emirati_Freedom_Plans&locale=EN",
    price: 750,
    speed: "Standard speed",
    data: "80GB local data",
    minutes: "Unlimited flexi minutes (local & international)",
    roaming: "Roam Like Home GCC & 5GB RoW",
    commitment: "12 months",
    features: ["emarati", "flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
  },
  {
    name: "Emirati Freedom Plan 1500",
    url: "https://www.eand.ae/b2c/heshop/plans/postpaid-plan?productId=prod1930026&skuId=sku1880319&catName=Emirati_Freedom&listVal=Emirati_Freedom_Plans&locale=EN",
    price: 1500,
    speed: "Standard speed",
    data: "Unlimited local data",
    minutes: "Unlimited flexi minutes (local & international)",
    roaming: "Roam Like Home Globally",
    commitment: "12 months",
    features: ["emarati", "unlimitedData", "flexiMinutes", "roaming", "shortCommitment", "subscriptions"]
  }
];

const homePlans = [
  {
    name: "eLife Family",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeProd-4_0Family-1E&skuId=elifeSku-4_0Family-1",
    price: 287,
    speed: "100 Mbps",
    tv: "150+ premium & basic channels",
    benefits: "Subscription and more",
    commitment: "24 months",
    features: ["homeValue", "premiumTv", "homeBenefits"]
  },
  {
    name: "Unlimited Starter",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeProd-unl-starter-1B&skuId=elifeSku-UnlimitedStarter-1",
    price: 311,
    speed: "250 Mbps",
    tv: "180+ basic channels",
    benefits: "Subscription and more",
    commitment: "24 months",
    features: ["homeValue", "homeBenefits"]
  },
  {
    name: "Neo",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeprod-neostarter&skuId=elifeSku-Neo-Starter",
    price: 319,
    speed: "1 Gbps",
    tv: "200+ basic channels",
    benefits: "Prime and more",
    commitment: "12 months",
    features: ["fastHome", "shortHomeCommitment", "homeBenefits"]
  },
  {
    name: "Ultra Starter",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeProd1-UltraStarter&skuId=sku1570335",
    price: 343,
    speed: "500 Mbps (1 Gbps promo)",
    tv: "180+ basic channels",
    benefits: "STARZPLAY, Prime Video, Smiles and more",
    commitment: "24 months",
    features: ["homeBenefits", "wifi7"]
  },
  {
    name: "Neo Fusion",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeprod-neofusion&skuId=elifeSku-NeoFusion",
    price: 639,
    speed: "1 Gbps",
    tv: "500+ sports & premium channels",
    benefits: "STARZPLAY, OSN and more",
    commitment: "24 months",
    features: ["fastHome", "premiumTv", "wifi7", "homeBenefits"]
  },
  {
    name: "Neo Fusion 5G",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeprod-ultra5g&skuId=elifesku-ultra5g",
    price: 1799,
    speed: "5 Gbps",
    tv: "300+ premium channels",
    benefits: "OSN, STARZPLAY and more",
    commitment: "24 months",
    features: ["ultraFastHome", "premiumTv", "homeBenefits"]
  },
  {
    name: "Neo Fusion 10G",
    url: "https://www.eand.ae/eshop/elife/configuration-checkout/location?productId=elifeprod-ultra10g&skuId=elifesku-ultra10g",
    price: 2699,
    speed: "10 Gbps",
    tv: "300+ premium channels",
    benefits: "OSN, STARZPLAY, Arena and more",
    commitment: "24 months",
    features: ["fastHome", "ultraFastHome", "premiumTv", "homeBenefits"]
  }
];

// TODO: replace with real per-plan links once available (e.g. a checkout page
// or plan-details page). Until then each plan gets a placeholder URL derived
// from its name, so the QR code on the result screen has something to encode.
const LOADING_MESSAGES = {
  en: [
    "Searching for your perfect plan...",
    "Comparing every package...",
    "Computing your preferences...",
    "Weighing price against perks...",
    "Ranking your best matches...",
    "Putting together your shortlist..."
  ],
  ar: [
    "نبحث عن الباقة المثالية لك...",
    "نقارن جميع الباقات المتاحة...",
    "نحسب تفضيلاتك...",
    "نوازن بين السعر والمزايا...",
    "نرتب أفضل الخيارات لك...",
    "نجهّز قائمتك المختارة..."
  ]
};

function slugifyPlanName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function assignPlaceholderPlanUrls(planList) {
  for (let plan of planList) {
    if (!plan.url) {
      plan.url = `https://REPLACE-WITH-REAL-LINK.eand.ae/plans/${slugifyPlanName(plan.name)}`;
    }
  }
}

assignPlaceholderPlanUrls(mobilePlans);
assignPlaceholderPlanUrls(homePlans);

let questions = mobileQuestions;
let plans = mobilePlans;
let selectedPlanType = null;

let currentQuestion = 0;
let answers = [];
let bestPlan = null;

let quizFeedback = "";
let handClosedWarningActive = false;
let quizCardX = 0;
let quizCardRotation = 0;
let questionNeedsCalibration = true;
let readyStartTime = null;
let loadingStartTime = null;
const CALIBRATION_HOLD_TIME = 1200;
const LOADING_DURATION = 5000;
const LOADING_MESSAGE_INTERVAL = 2500;
const THUMBS_UP_HOLD_TIME = 1000;
const THUMBS_DOWN_HOLD_TIME = 350;
const THUMBS_DOWN_BOB_CYCLE = 1800;
const RESTART_GESTURE_LOCK = 1800;
const LANGUAGE_HOLD_TIME = 1500;
const FINGER_PULSE_DURATION = 1700;
const PULSE_START_DELAY = 500;
const HAND_PULSE_DURATION = 3200;
const SWIPE_DISTANCE = 500;
const SWIPE_TIME_LIMIT = 1400;
const COOLDOWN = 1500;
const BACK_NAV_COOLDOWN = 400;
const PLAN_TYPE_TO_QUIZ_DELAY = 1200;
const PRACTICE_RESET_DELAY = 700;
const HAND_LOSS_GRACE_TIME = 550;
const CALIBRATION_SETTLE_TIME = 220;
const HAND_SMOOTHING = 0.4;
const SWIPE_HOLD_TIME = 90;
const SWIPE_MAX_WOBBLE_RATIO = 1.5; // path length / net movement allowed during the hold window before it's treated as jitter, not a clean swipe
const SWIPE_HOLD_MAX_SAMPLES = 60;  // ~2s at 30fps - if a hold streak runs this long without stabilizing, give up rather than grow the sample list forever
const PLAN_HOVER_REST_SCALE = 0.86;
const PLAN_HOVER_PEAK_SCALE = 1.2;
const PLAN_HOVER_RADIUS = 260;
const SELECT_TARGET_THRESHOLD = 0.6;
const SELECT_HOVER_DELAY = 400;
const SELECT_HOLD_DURATION = 1400;
const SELECT_DRIFT_DURATION = 650;
const SELECT_DEMO_OPEN_HOLD = 550;
const SELECT_DEMO_MORPH = 200;
const SELECT_DEMO_FIST_HOLD = 1300;
const SELECT_DEMO_START_DELAY = 4000;
const SWEEP_DWELL = 400;
const SELECT_LOSS_GRACE = 350;
const SELECT_SWITCH_MARGIN = 0.12;
const RESULT_FIST_BACK_DELAY = 900;
const PLAN_SELECT_RESUME_DELAY = 900;
const SELECT_EXPANDED_SCALE = 1.6;
const RESTART_HOVER_RADIUS = 75;

let handIcon;
let handIconWhite;
let arabicIcon;
let englishIcon;
let oneFingerIcon;
let twoFingerIcon;
let openHandIcon;
let openHandIconWhite;
let fistIcon;
let fistIconWhite;
let thumbIcon;
let thumbIconWhite;
let openHandIconRed;
let fistIconRed;
let openHandIconAmber;
let planTypeControls = null;
let qrPanelEl = null;
let qrLabelEl = null;
let qrCodeInstance = null;
let qrRenderedUrl = null;
let selectedCardScreenRect = null;

const HAND_ICON_DATA_URI = "data:image/png;base64,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";

const ARABIC_ICON_DATA_URI = "data:image/png;base64,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";
const ENGLISH_ICON_DATA_URI = "data:image/webp;base64,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";
const ONE_FINGER_ICON_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAACjElEQVR4nO2Zy2sUQRDGf9vx4CsmEkHFBBGiIoKiQSGKkIOeVPAiKAb8HzwHPQni2aMg+CLERxQUBBEV/QPi46IRgoqBmBgxKz4O+slIDQwLKzOz25Odxg+K6im6e+qjqnu6ayqSCAGOQOAIBI5A4BoYux4YAT4CU9buZZ5QybnYtwBPgfYaexXYBbykJBE5YyRuAGtMbprtNCWKSBVYCqy01IqwGpgE5oAOSkJE8fiUdu9wBAJHIHAEAkcgcAQCRyBwnua9BMwAn4BhoAffkJRHYtSz1+K9pD2SRiVVTe5J2pbz/dSKLyJ3JHWb3P0HwTlJG1qZSHfC1pOwn5O0QlKXpBGz3ZJ0UdKUpFl73pTVp6KOKLG9C5hNnKCf1Zn/M9AHTLTqrhWToMbJa0CnyXVgOXAiy8RFR6SefSvwPNEeA97Y5a0Up9+4/0LgZ6L93Z6j9rwQaRaUdf7/X/ZWgyMQOALBghzEByk5kcXAbWCvPT+gpKl1wUhEVcXDwD5aCJWU35EB4CHwBdgBjHv2S76+I8dNny2ARC6kJbLb9CgtikrK1PoKLDH55t8tvKXW75zbdWFwKfu9Nb2ZkhN5YvoAJScybPoY0EbJIzIOrAWOUmIiSvyJOtmKi95l6HsZeGX36CMefVpmOvrz5YXIr0RUhjyulV7TH3zeR64Cr4GNHtfKQdOPM43KUWUctArhhKT2ZtVuTTolzdj8A75Lpm2SXtjLzkv6e8xpgjgrl0a4X1Ttd6ekH/bSK5IWNSESMYlpSeuKIhLJoQSZSUlDkvokdaQc3279TyXSaVpSfx5/Gk2H7ZLG1BxE6ZQ5ErHkrTQmEe18+20X6wdWpSx1RleDd3ZqiI5Ajxpx4g8A62zhH3+QmwAAAABJRU5ErkJggg==";
const TWO_FINGER_ICON_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAACpUlEQVR4nO2ay2vVQBTGf5m68HW1vvCFiKBUERStCsVNF7pSwY2gWPB/cF10JZbu3QmKqIivVkERRFT0D6i60grFV0UrFqv4WOgnY08gXLyYpMm9SfCDc89kkpk53z0nM3PCIImMZa2kQUkTJgOSOnIYh6gE/idDrAAeAfPq6j8CG4HX5ASXcX99RuKGkfJyE5gPHCdHBBl75C2wxAiE/74vv7R7yyigR9YAF4H3wBhw2khQF0KvTC+lgB7ZADwEao36rbtWg/qWe6TPSFwBlptcpYUIUnrkMzAbWGyhFYbOaNhvsz0SpCTSyLCk9YWdflsGR0XgqAgcFYGjInBUBI6KwDV5vOvAuC2ot4BNZV0Q6+EJbQGeUTKPnAAWAQuBS7Zf6wfOAO8sARsE1hXdIwvM2HAH7bPJv2Ec6ARGiuqRkAR1RnrvtJtctizzcJk2jWG9z+cfR8pDwHNL3gpF5F/9TAd+RMrf7NqXW0IkKyhp//8XxKLBURE4KoJpKYj3UHIiM4FrwA67vkNJQ+uUkfB7on3ATgqEIOY60g3cBT4BW4HhnO1SXuvIIdP9TSCRCnGJbDc9QEERxAytL8Ask6/5m0VuofUr5XTdNLiYz70wvZ6SE3lgejclJ3LB9EGgjZJ7ZBhYCRygxEQEHLPykSK+9C7Bs2eBp5ZH78/RpjmmJ/Ii8jPild4c35XVpt/kmY+ct6+CHTm+K3tM30/UKsW5jx5NYkRSLeMzJe2SPlj/3UnaphmsTdITG+ykpD/bnAzE2WEcj9tJ26cddJuk7zboOUkzMvBESGJM0qpmEfGyN0JmVFKvpE5Jc2O2r9nzRyPhNCapK409Uw2HzZKGlA18OCX2RChZnA7yM98um8W67GBNnE+dPjXwp4b8rsFvge5NxYjfP4g7Tbh3gWgAAAAASUVORK5CYII=";
const OPEN_HAND_ICON_DATA_URI = "data:image/png;base64,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";
const CLOSED_HAND_ICON_DATA_URI = "data:image/png;base64,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";
const THUMB_ICON_DATA_URI = "data:image/png;base64,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";


function preload() {
  handIcon = loadImage(HAND_ICON_DATA_URI);
  arabicIcon = loadImage(ARABIC_ICON_DATA_URI);
  englishIcon = loadImage(ENGLISH_ICON_DATA_URI);
  oneFingerIcon = loadImage(ONE_FINGER_ICON_DATA_URI);
  twoFingerIcon = loadImage(TWO_FINGER_ICON_DATA_URI);
  openHandIcon = loadImage(OPEN_HAND_ICON_DATA_URI);
  fistIcon = loadImage(CLOSED_HAND_ICON_DATA_URI);
  thumbIcon = loadImage(THUMB_ICON_DATA_URI);
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  textFont("Segoe UI");

  handIconWhite = createGraphics(handIcon.width, handIcon.height);
  handIconWhite.image(handIcon, 0, 0);
  handIconWhite.drawingContext.globalCompositeOperation = "source-atop";
  handIconWhite.drawingContext.fillStyle = "#ffffff";
  handIconWhite.drawingContext.fillRect(0, 0, handIconWhite.width, handIconWhite.height);
  handIconWhite.drawingContext.globalCompositeOperation = "source-over";

  openHandIconWhite = createGraphics(openHandIcon.width, openHandIcon.height);
  openHandIconWhite.image(openHandIcon, 0, 0);
  openHandIconWhite.drawingContext.globalCompositeOperation = "source-atop";
  openHandIconWhite.drawingContext.fillStyle = "#ffffff";
  openHandIconWhite.drawingContext.fillRect(0, 0, openHandIconWhite.width, openHandIconWhite.height);
  openHandIconWhite.drawingContext.globalCompositeOperation = "source-over";

  fistIconWhite = createGraphics(fistIcon.width, fistIcon.height);
  fistIconWhite.image(fistIcon, 0, 0);
  fistIconWhite.drawingContext.globalCompositeOperation = "source-atop";
  fistIconWhite.drawingContext.fillStyle = "#ffffff";
  fistIconWhite.drawingContext.fillRect(0, 0, fistIconWhite.width, fistIconWhite.height);
  fistIconWhite.drawingContext.globalCompositeOperation = "source-over";

  thumbIconWhite = createGraphics(thumbIcon.width, thumbIcon.height);
  thumbIconWhite.image(thumbIcon, 0, 0);
  thumbIconWhite.drawingContext.globalCompositeOperation = "source-atop";
  thumbIconWhite.drawingContext.fillStyle = "#ffffff";
  thumbIconWhite.drawingContext.fillRect(0, 0, thumbIconWhite.width, thumbIconWhite.height);
  thumbIconWhite.drawingContext.globalCompositeOperation = "source-over";

  // Brand-red hand cursor that tracks the live hand position on the
  // priority screen, so the user can see exactly what they're pointing at.
  openHandIconRed = createGraphics(openHandIcon.width, openHandIcon.height);
  openHandIconRed.image(openHandIcon, 0, 0);
  openHandIconRed.drawingContext.globalCompositeOperation = "source-atop";
  openHandIconRed.drawingContext.fillStyle = "#ff1f34";
  openHandIconRed.drawingContext.fillRect(0, 0, openHandIconRed.width, openHandIconRed.height);
  openHandIconRed.drawingContext.globalCompositeOperation = "source-over";

  fistIconRed = createGraphics(fistIcon.width, fistIcon.height);
  fistIconRed.image(fistIcon, 0, 0);
  fistIconRed.drawingContext.globalCompositeOperation = "source-atop";
  fistIconRed.drawingContext.fillStyle = "#ff1f34";
  fistIconRed.drawingContext.fillRect(0, 0, fistIconRed.width, fistIconRed.height);
  fistIconRed.drawingContext.globalCompositeOperation = "source-over";

  // Amber, distinct from the brand red used everywhere else, so the
  // "open your hand back up" warning during the swipe questions reads
  // clearly as a caution rather than blending into the normal UI.
  openHandIconAmber = createGraphics(openHandIcon.width, openHandIcon.height);
  openHandIconAmber.image(openHandIcon, 0, 0);
  openHandIconAmber.drawingContext.globalCompositeOperation = "source-atop";
  openHandIconAmber.drawingContext.fillStyle = "#ffb020";
  openHandIconAmber.drawingContext.fillRect(0, 0, openHandIconAmber.width, openHandIconAmber.height);
  openHandIconAmber.drawingContext.globalCompositeOperation = "source-over";

  for (let i = 0; i < 24; i++) {
    ambientParticles.push({
      x: random(width),
      y: random(height),
      size: random(2, 7),
      speed: random(0.08, 0.3),
      phase: random(TWO_PI)
    });
  }

  planTypeControls = document.getElementById("planTypeControls");
  document.querySelectorAll("[data-plan-type]").forEach((button) => {
    button.addEventListener("click", () => selectPlanType(button.dataset.planType));
  });
  updatePlanTypeButtonLabels();

  qrPanelEl = document.getElementById("qrPanel");
  qrLabelEl = document.getElementById("qrLabel");
  let qrCodeEl = document.getElementById("qrCode");

  if (qrCodeEl && typeof QRCode !== "undefined") {
    qrCodeInstance = new QRCode(qrCodeEl, {
      text: " ",
      width: 264,
      height: 264,
      colorDark: "#0b0c10",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  updateQrLabel();
}

function updateQrLabel() {
  if (qrLabelEl) {
    qrLabelEl.textContent = t("scanForDetails");
  }
}

function updateQrPanel() {
  if (!qrPanelEl) return;

  let plan = selectedPlanIndex !== null ? recommendedPlans[selectedPlanIndex] : null;
  let show = appState === "result" && plan && plan.url && selectedCardScreenRect;

  qrPanelEl.classList.toggle("is-visible", !!show);

  if (show) {
    let anchorX = min(
      selectedCardScreenRect.x + selectedCardScreenRect.w / 2 + 20,
      width - 210
    );
    let anchorY = constrain(selectedCardScreenRect.y, 140, height - 140);
    qrPanelEl.style.left = `${anchorX}px`;
    qrPanelEl.style.top = `${anchorY}px`;

    if (qrCodeInstance && qrRenderedUrl !== plan.url) {
      qrCodeInstance.makeCode(plan.url);
      qrRenderedUrl = plan.url;
    }
  } else {
    qrRenderedUrl = null;
  }
}

function updatePlanTypeButtonLabels() {
  if (!planTypeControls) return;

  let homeButton = planTypeControls.querySelector('[data-plan-type="home"] .planTypeButtonLabel');
  let mobileButton = planTypeControls.querySelector('[data-plan-type="mobile"] .planTypeButtonLabel');

  if (homeButton) homeButton.textContent = t("homeLabel");
  if (mobileButton) mobileButton.textContent = t("mobileLabel");
}

function draw() {
  clear();
  drawingContext.direction = appLanguage === "ar" ? "rtl" : "ltr";

  updateStateEntrance();
  drawAmbientScene();
  updateStatusPill();
  updateQrPanel();

  let hands = getHands();

  if (appState === "welcome") {
    drawAllHands(hands);
    drawWelcomeScreen();

    let mainHand = getRightHand();

    if (millis() < welcomeGestureLockedUntil) {
      thumbsUpSince = null;
    } else if (mainHand && isThumbsUp(mainHand)) {
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
        appState = "language";
      }
    } else {
      rightHandReadySince = null;
    }
  }

  else if (appState === "language") {
    drawAllHands(hands);
    drawLanguageScreen();

    let mainHand = getRightHand();
    let detected = null;

    if (mainHand && isOneFingerUp(mainHand)) {
      detected = "ar";
    } else if (mainHand && isTwoFingersUp(mainHand)) {
      detected = "en";
    }

    if (detected) {
      if (languageGestureType !== detected) {
        languageGestureType = detected;
        languageGestureSince = millis();
      } else if (millis() - languageGestureSince >= LANGUAGE_HOLD_TIME) {
        appLanguage = detected;
        languageGestureType = null;
        languageGestureSince = null;
        updatePlanTypeButtonLabels();
        updateQrLabel();
        appState = "practice";
        practiceStep = "right";
        practiceStepEnteredAt = millis();
        playNarrationClip("instructions/04_center_swipe_right.mp3");
        feedbackMessage = t("swipeRightInstruction");
        instructionsStartTime = null;
        resetSwipe();
        calibratedRightX = null;
        practiceResetUntil = 0;
        practiceIndicatorTarget = 0;
        practiceIndicatorX = 0;
      }
    } else {
      languageGestureType = null;
      languageGestureSince = null;
    }
  }

  else if (appState === "practice") {
    drawAllHandsWithSideColors(hands);
    detectPracticeSwipe();
    drawPracticeScreen();
  }

  else if (appState === "backGesture") {
    drawAllHandsWithSideColors(hands);
    drawBackGestureScreen();

    if (backGestureStartTime === null) {
      backGestureStartTime = millis();
    }

    if (!backGesturePracticed) {
      detectBackGesturePractice();
    }

    let elapsed = millis() - backGestureStartTime;
    let readyToAdvance = backGesturePracticed ? elapsed > 900 : elapsed > 8000;

    if (readyToAdvance) {
      appState = "instructions";
      instructionsStartTime = null;
      backGestureStartTime = null;
      backGesturePracticed = false;
    }
  }

  else if (appState === "instructions") {
    drawAllHandsWithSideColors(hands);
    drawInstructionsScreen();

    if (instructionsStartTime === null) {
      instructionsStartTime = millis();
    }

    // Advance as soon as this screen's narration actually finishes -
    // whether that's one clip or two, and however long the real recording
    // runs in either language - instead of guessing a fixed delay long
    // enough for the slowest case and sitting on it for every other one.
    // The fallback catches narration failing to play at all.
    let instructionsElapsed = millis() - instructionsStartTime;
    if ((instructionsElapsed > 300 && narrationSequenceDone) || instructionsElapsed > 10000) {
      appState = "ready";
      instructionsStartTime = null;
    }
  }

  else if (appState === "ready") {
    drawAllHandsWithSideColors(hands);
    drawReadyScreen();

    if (readyStartTime === null) {
      readyStartTime = millis();
    }

    if (millis() - readyStartTime > 1500) {
      startPlanTypeSelection();
    }
  }

  else if (appState === "planType") {
    drawAllHandsWithSideColors(hands);
    detectPlanTypeSwipe();
    drawPlanTypeScreen();
  }

  else if (appState === "quiz") {
    drawAllHandsWithSideColors(hands);
    updateQuizTransition();

    if (appState === "quiz") {
      let currentType = questions[currentQuestion] && questions[currentQuestion].type;

      if (!quizTransition) {
        if (currentType === "slider") {
          detectQuizSlider();
        } else if (currentType === "priority") {
          detectPriorityPointer();
          detectQuizPriority();
        } else {
          detectQuizSwipe();
        }
      }
      drawQuizScreen();
    }
  }

  else if (appState === "loading") {
    drawAllHandsWithSideColors(hands);
    drawLoadingScreen();

    if (loadingStartTime === null) {
      loadingStartTime = millis();
    }

    if (millis() - loadingStartTime > LOADING_DURATION) {
      recommendedPlans = getRecommendedPlans(3);
      bestPlan = recommendedPlans[0];
      startResultCelebration();
      appState = "result";
    }
  }

  else if (appState === "result") {
    detectPlanHover();
    updatePlanSelection();
    detectResultSwipeBack();
    detectRestartHover();
    drawAllHandsWithSideColors(hands);
    drawResultScreen();
  }
}

function updateStateEntrance() {
  if (appState !== lastRenderedState) {
    lastRenderedState = appState;
    stateEnteredAt = millis();
    playInstructionNarration(appState);

    if (planTypeControls) {
      planTypeControls.classList.toggle("is-visible", appState === "planType");
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
    welcome: t("statusReadyForGesture"),
    language: t("statusChooseLanguage"),
    openHands: t("statusCalibrating"),
    instructions: t("statusGestureGuide"),
    practice: t("statusPracticeMode"),
    backGesture: t("statusGestureGuide"),
    ready: t("statusCalibrationComplete"),
    planType: t("statusChoosePlanType"),
    quiz: `${t("statusMatching")} · ${min(currentQuestion + 1, questions.length)}/${questions.length}`,
    loading: t("statusComputingPlans"),
    result: t("statusResultsReady")
  };

  statusPill.textContent = labels[appState] || t("statusDefault");
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
  feedbackMessage = t("handCalibrated");
  return true;
}


function drawWelcomeScreen() {
  drawDarkOverlay(28);
  beginScreenEntrance();

  let panelY = min(270, height * 0.36);
  let panelW = min(720, width * 0.86);
  let panelH = 245;
  drawGlassPanel(width / 2, panelY, panelW, panelH, 32, [255, 31, 52]);

  noStroke();
  textAlign(CENTER, CENTER);
  drawEyebrow("e& PACKAGE ADVISOR", width / 2, panelY - 82);

  fill(255);
  textStyle(BOLD);
  textSize(min(48, width * 0.085));
  text(t("welcomeTitle"), width / 2, panelY - 32);

  fill(205, 208, 216);
  textStyle(NORMAL);
  textSize(17);
  text(t("welcomeSubtitle"), width / 2, panelY + 13);

  let pulse = 0.5 + sin(millis() * 0.006) * 0.5;

  // Same bob logic as the thumbs-down tutorial, but lifting up instead of
  // pressing down, and drawn in the thumb icon's natural (thumbs-up)
  // orientation instead of flipped.
  let liftPhase = (millis() % THUMBS_DOWN_BOB_CYCLE) / THUMBS_DOWN_BOB_CYCLE;
  let lift = (1 - cos(liftPhase * TWO_PI)) / 2;
  let liftOffsetY = -lift * 15;
  let liftScale = 1 - lift * 0.08;

  let pillW = 330;
  let pillX = width / 2 + 30;
  let iconX = pillX - pillW / 2 - 34;

  drawActionPill(
    pillX,
    panelY + 72,
    pillW,
    52,
    t("thumbsUpPrompt"),
    [255, 31, 52],
    pulse,
    thumbIconWhite,
    iconX,
    liftScale,
    liftOffsetY
  );

  if (thumbsUpSince !== null) {
    let holdProgress = constrain((millis() - thumbsUpSince) / THUMBS_UP_HOLD_TIME, 0, 1);
    noStroke();
    fill(255, 31, 52);
    rectMode(CORNER);
    rect(pillX - 150, panelY + 101, 300 * holdProgress, 3, 99);
  }

  endScreenEntrance();
}

function drawLanguageScreen() {
  drawDarkOverlay(32);
  beginScreenEntrance();
  let panelY = min(260, height * 0.34);
  drawGlassPanel(width / 2, panelY, min(680, width * 0.88), 340, 30, [255, 31, 52]);

  drawEyebrow("CHOOSE YOUR LANGUAGE  ·  اختر لغتك", width / 2, panelY - 145);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(26, width * 0.05));
  text("Pick your language", width / 2, panelY - 100);

  let holdProgress = languageGestureSince !== null
    ? constrain((millis() - languageGestureSince) / LANGUAGE_HOLD_TIME, 0, 1)
    : 0;
  let accent = [224, 8, 0];

  // Slowly grows the Arabic finger-count badge, shrinks it back, then does
  // the same for the English one, alternating forever - a gentle "look
  // here" cue for how many fingers to hold up for each language. Waits a
  // beat after the screen appears before the first pulse starts.
  let arabicFingerScale = 1;
  let englishFingerScale = 1;
  let fingerElapsed = millis() - stateEnteredAt - PULSE_START_DELAY;

  if (fingerElapsed >= 0) {
    let fingerCycle = fingerElapsed % (FINGER_PULSE_DURATION * 2);

    if (fingerCycle < FINGER_PULSE_DURATION) {
      arabicFingerScale = 1 + sin((fingerCycle / FINGER_PULSE_DURATION) * PI) * 0.35;
    } else {
      let t = fingerCycle - FINGER_PULSE_DURATION;
      englishFingerScale = 1 + sin((t / FINGER_PULSE_DURATION) * PI) * 0.35;
    }
  }

  drawLanguageOptionCard(
    width / 2 - 150, panelY + 15, 190, 170,
    arabicIcon, oneFingerIcon, "العربية",
    languageGestureType === "ar", holdProgress, accent, arabicFingerScale
  );
  drawLanguageOptionCard(
    width / 2 + 150, panelY + 15, 190, 170,
    englishIcon, twoFingerIcon, "English",
    languageGestureType === "en", holdProgress, accent, englishFingerScale
  );

  fill(190, 195, 205);
  textStyle(NORMAL);
  textSize(13.5);
  text("Hold up 1 finger for Arabic · Hold up 2 fingers for English", width / 2, panelY + 122);

  endScreenEntrance();
}

function drawLanguageOptionCard(x, y, cardW, cardH, iconImg, fingerImg, label, isActive, progress, accent, fingerScale = 1) {
  push();
  drawingContext.direction = "ltr";
  translate(x, y);

  rectMode(CENTER);
  noStroke();
  fill(accent[0], accent[1], accent[2], isActive ? 34 : 12);
  rect(0, 0, cardW, cardH, 24);
  stroke(accent[0], accent[1], accent[2], isActive ? 220 : 70);
  strokeWeight(isActive ? 1.8 : 1.1);
  noFill();
  rect(0, 0, cardW, cardH, 24);

  noStroke();
  imageMode(CENTER);
  image(iconImg, 0, -30, 88, 88);

  push();
  translate(36, 12);
  scale(fingerScale);
  fill(accent[0], accent[1], accent[2]);
  stroke(20, 6, 4, 200);
  strokeWeight(2.5);
  circle(0, 0, 56);
  noStroke();
  image(fingerImg, 0, 0, 34, 34);
  pop();

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text(label, 0, 62);

  if (isActive) {
    noStroke();
    fill(accent[0], accent[1], accent[2]);
    rectMode(CORNER);
    rect(-60, 78, 120 * progress, 3, 99);
  }

  pop();
}

function drawOpenHandsScreen() {
  drawDarkOverlay(36);
  beginScreenEntrance();
  let panelY = 205;
  drawGlassPanel(width / 2, panelY, min(680, width * 0.88), 280, 28, [0, 210, 142]);

  // This screen now runs before language selection, so appLanguage isn't
  // known yet - show the instruction in both languages instead of
  // guessing (t() would otherwise just default to English here).
  drawingContext.direction = "ltr";
  drawEyebrow(
    `${STRINGS.en.step1Calibration}  ·  ${STRINGS.ar.step1Calibration}`,
    width / 2,
    panelY - 98
  );

  // Same gentle grow-then-shrink pulse as the language picker's finger
  // badges, after the same short pause once the screen appears - but
  // slower, since this icon sits alone with nothing to alternate with.
  let handScale = 1;
  let handElapsed = millis() - stateEnteredAt - PULSE_START_DELAY;

  if (handElapsed >= 0) {
    let handCycle = handElapsed % HAND_PULSE_DURATION;
    handScale = 1 + sin((handCycle / HAND_PULSE_DURATION) * PI) * 0.35;
  }

  push();
  drawingContext.direction = "ltr";
  imageMode(CENTER);
  noStroke();
  fill(0, 210, 142, 30);
  circle(width / 2, panelY - 40, 76);
  push();
  translate(width / 2, panelY - 40);
  scale(handScale);
  image(openHandIconWhite, 0, 0, 46, 46);
  pop();
  pop();

  // English on top, Arabic underneath - no extra instructional subtitle,
  // the icon plus this one line pair says enough.
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(25);
  text(STRINGS.en.showRightHand, width / 2, panelY + 16);
  text(STRINGS.ar.showRightHand, width / 2, panelY + 46);

  drawDetectionStatus(
    width / 2,
    panelY + 96,
    `${STRINGS.en.rightHandDetected}  ·  ${STRINGS.ar.rightHandDetected}`,
    rightHandReady,
    [0, 190, 90],
    min(400, width * 0.7),
    `${STRINGS.en.waiting}  ·  ${STRINGS.ar.waiting}`
  );
  endScreenEntrance();
}
function drawInstructionsScreen() {
  drawDarkOverlay(36);
  beginScreenEntrance();
  let panelY = 210;
  drawGlassPanel(width / 2, panelY, min(720, width * 0.9), 200, 28, [255, 31, 52]);

  drawEyebrow(t("introEyebrow"), width / 2, panelY - 62);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(40, width * 0.07));
  text("e& Plan Agent", width / 2, panelY - 8);

  fill(190, 195, 205);
  textStyle(NORMAL);
  textSize(15);
  drawWrappedText(t("introTagline"), width / 2, panelY + 46, min(560, width * 0.76), 20);
  endScreenEntrance();
}
function drawPracticeScreen() {
  drawDarkOverlay(30);
  beginScreenEntrance();
  let panelY = 205;
  let isRight = practiceStep === "right";
  let accent = isRight ? [0, 212, 145] : [255, 57, 76];
  drawGlassPanel(width / 2, panelY, min(680, width * 0.88), 205, 30, accent);

  drawEyebrow(t("practiceBuildMuscle"), width / 2, panelY - 70);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  fill(accent[0], accent[1], accent[2]);
  text(isRight ? t("swipeRight") : t("swipeLeftNow"), width / 2, panelY - 24);
  drawSwipeHandDemo(width / 2, panelY + 22, isRight ? 1 : -1);

  fill(205, 208, 216);
  textStyle(NORMAL);
  textSize(14);
  text(feedbackMessage || t("moveHandSide"), width / 2, panelY + 76);

  endScreenEntrance();

  practiceIndicatorX = lerp(practiceIndicatorX, practiceIndicatorTarget, 0.2);
  drawGestureDock(panelY + 158, practiceIndicatorX);
}

function drawBackGestureScreen() {
  drawDarkOverlay(36);
  beginScreenEntrance();
  let panelY = 210;
  let accent = backGesturePracticed ? [0, 212, 145] : [255, 31, 52];
  drawGlassPanel(width / 2, panelY, min(680, width * 0.88), 240, 30, accent);

  drawEyebrow(t("oneMoreGesture"), width / 2, panelY - 78);

  push();
  drawingContext.direction = "ltr";
  translate(width / 2, panelY - 22);
  noStroke();
  fill(accent[0], accent[1], accent[2], 30);
  circle(0, 0, 76);

  if (backGesturePracticed) {
    imageMode(CENTER);
    image(handIconWhite, 0, -2, 42, 42);
  } else {
    // Slow, continuous press-down loop so the motion itself teaches the
    // gesture, not just the static icon.
    let bobPhase = (millis() % THUMBS_DOWN_BOB_CYCLE) / THUMBS_DOWN_BOB_CYCLE;
    let dip = (1 - cos(bobPhase * TWO_PI)) / 2;
    let dipY = dip * 15;
    let dipScale = 1 - dip * 0.08;

    push();
    imageMode(CENTER);
    translate(0, 2 + dipY);
    scale(dipScale, -dipScale);
    image(thumbIconWhite, 0, 0, 40, 40);
    pop();
  }

  pop();

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  if (backGesturePracticed) {
    textSize(23);
    text(t("niceThatsIt"), width / 2, panelY + 44);

    fill(200, 204, 212);
    textStyle(NORMAL);
    textSize(14.5);
    text(t("continuingFirstQuestion"), width / 2, panelY + 72);
  } else {
    textSize(28);
    drawWrappedText(t("thumbsDownNow"), width / 2, panelY + 50, min(560, width * 0.8), 33);

    fill(accent[0], accent[1], accent[2]);
    textStyle(BOLD);
    textSize(20);
    text(t("tryIt"), width / 2, panelY + 90);
  }

  if (!backGesturePracticed && thumbsDownSince !== null) {
    let holdProgress = constrain((millis() - thumbsDownSince) / THUMBS_DOWN_HOLD_TIME, 0, 1);
    noStroke();
    fill(accent[0], accent[1], accent[2]);
    rectMode(CENTER);
    rect(width / 2, panelY + 116, 200 * holdProgress, 3, 99);
  }

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
  text(t("youreReady"), width / 2, panelY + 7);

  fill(195, 200, 210);
  textStyle(NORMAL);
  textSize(15);
  text(t("preparingFirstQuestion"), width / 2, panelY + 49);
  let readyProgress = readyStartTime === null ? 0 : (millis() - readyStartTime) / 1500;
  drawLoadingBar(width / 2, panelY + 76, 260, readyProgress);
  endScreenEntrance();
}
function drawLoadingScreen() {
  drawDarkOverlay(50);
  beginScreenEntrance();
  let panelW = min(620, width * 0.86);
  let panelH = 236;
  let panelY = 214;
  let elapsed = loadingStartTime === null ? 0 : millis() - loadingStartTime;

  let haloPulse = 1 + sin(millis() * 0.0035) * 0.12;
  push();
  noStroke();
  fill(255, 31, 52, 16);
  circle(width / 2, panelY, panelW * 0.62 * haloPulse);
  pop();

  drawGlassPanel(width / 2, panelY, panelW, panelH, 32, [255, 31, 52]);

  drawEyebrow(t("loadingEyebrow"), width / 2, panelY - 96);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(27, panelW * 0.05));
  text(t("loadingTitle"), width / 2, panelY - 58);

  drawLoadingDots(width / 2, panelY - 6, elapsed);

  let messages = LOADING_MESSAGES[appLanguage] || LOADING_MESSAGES.en;
  let messageIndex = Math.floor(elapsed / LOADING_MESSAGE_INTERVAL) % messages.length;

  fill(195, 200, 210);
  textStyle(NORMAL);
  textSize(15);
  drawWrappedText(messages[messageIndex], width / 2, panelY + 50, min(460, panelW - 96), 20);

  endScreenEntrance();
}

function drawLoadingDots(x, y, elapsed) {
  push();
  drawingContext.direction = "ltr";
  noStroke();
  let spacing = 30;

  for (let i = 0; i < 3; i++) {
    let phase = elapsed * 0.0042 - i * 0.75;
    let bounce = (sin(phase) + 1) / 2;
    let dotY = y - bounce * 14;
    let dotScale = 0.75 + bounce * 0.45;
    let dotX = x + (i - 1) * spacing;

    fill(255, 31, 52, 30 + bounce * 30);
    circle(dotX, y + 6, 26 * dotScale);

    fill(255, 31, 52, 140 + bounce * 115);
    circle(dotX, dotY, 15 * dotScale);
  }
  pop();
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

function detectPlanHover() {
  let rightHand = getRightHand();

  if (rightHand && (isOpenHand(rightHand) || isFist(rightHand))) {
    let center = getHandCenter(rightHand);
    planHoverX = center.x;
    planHoverY = center.y;
  } else {
    planHoverX = null;
    planHoverY = null;
  }
}

function getDesktopPlanLayout() {
  let availableW = min(1180, width - 80);
  let gap = 18;
  let cardW = (availableW - gap * 2) / 3;
  let cardH = min(410, height - 250);
  let centerY = 190 + cardH / 2;
  let positions = [];

  for (let i = 0; i < recommendedPlans.length; i++) {
    positions.push(width / 2 + (i - 1) * (cardW + gap));
  }

  return { cardW, cardH, centerY, positions };
}

function updatePlanSelection() {
  let now = millis();

  if (selectedPlanIndex !== null) {
    return;
  }

  if (now < planSelectResumeDelayUntil) {
    cancelPlanSelection();
    return;
  }

  let layout = getDesktopPlanLayout();
  let bestIndex = null;
  let bestFalloff = 0;

  if (planHoverX !== null && recommendedPlans.length > 0 && width >= 760) {
    for (let i = 0; i < layout.positions.length; i++) {
      let falloff = constrain(1 - abs(planHoverX - layout.positions[i]) / PLAN_HOVER_RADIUS, 0, 1);
      if (falloff > bestFalloff) {
        bestFalloff = falloff;
        bestIndex = i;
      }
    }
  }

  let rightHand = getRightHand();
  let isFisted = rightHand && isFist(rightHand);
  let targetValid = isFisted && bestIndex !== null && bestFalloff >= SELECT_TARGET_THRESHOLD;

  if (!targetValid) {
    // A single noisy frame (fist relaxes slightly, hand drifts, tracking
    // blips) shouldn't wipe an in-progress hold — only cancel once the
    // target has stayed invalid for a bit.
    if (selectHoverIndex === null) {
      return;
    }

    if (selectLossSince === null) {
      selectLossSince = now;
      return;
    }

    if (now - selectLossSince < SELECT_LOSS_GRACE) {
      return;
    }

    cancelPlanSelection();
    return;
  }

  selectLossSince = null;

  if (selectHoverIndex !== null && selectHoverIndex !== bestIndex) {
    // Require the new card to clearly win, not just barely edge out the
    // current one — stops boundary jitter between two cards from
    // constantly restarting the hold.
    let currentFalloff = constrain(
      1 - abs(planHoverX - layout.positions[selectHoverIndex]) / PLAN_HOVER_RADIUS,
      0,
      1
    );
    if (bestFalloff - currentFalloff < SELECT_SWITCH_MARGIN) {
      bestIndex = selectHoverIndex;
    }
  }

  if (selectHoverIndex !== bestIndex) {
    selectHoverIndex = bestIndex;
    selectDelayUntil = now + SELECT_HOVER_DELAY;
    selectHoldStartAt = null;
    stopChargeSound();
    return;
  }

  if (now < selectDelayUntil) {
    return;
  }

  if (selectHoldStartAt === null) {
    selectHoldStartAt = now;
    startChargeSound();
  }

  let progress = constrain((now - selectHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);
  updateChargeSound(progress);

  if (progress >= 1) {
    stopChargeSound();
    playSelectSound();
    selectedPlanIndex = selectHoverIndex;
    selectedPlanStartedAt = now;
    resultFistBackDelayUntil = now + RESULT_FIST_BACK_DELAY;
    selectHoverIndex = null;
    selectHoldStartAt = null;
    playNarrationSequence(["instructions/11_scan_qr.mp3", "instructions/12_restart_left_hand.mp3"]);
  }
}

function cancelPlanSelection() {
  if (selectHoverIndex !== null || selectHoldStartAt !== null) {
    stopChargeSound();
  }

  selectHoverIndex = null;
  selectHoldStartAt = null;
  selectLossSince = null;
}

function detectResultSwipeBack() {
  if (selectedPlanIndex === null || millis() < resultFistBackDelayUntil) {
    thumbsDownSince = null;
    return;
  }

  let rightHand = getRightHand();

  if (!rightHand || !isThumbsDown(rightHand)) {
    thumbsDownSince = null;
    return;
  }

  if (thumbsDownSince === null) {
    thumbsDownSince = millis();
    return;
  }

  if (millis() - thumbsDownSince >= THUMBS_DOWN_HOLD_TIME) {
    thumbsDownSince = null;
    playHapticSound();
    deselectPlan();
  }
}

function deselectPlan() {
  selectedPlanIndex = null;
  selectHoverIndex = null;
  selectDelayUntil = 0;
  selectHoldStartAt = null;
  selectLossSince = null;
  stopChargeSound();
  stateEnteredAt = millis();
  planSelectResumeDelayUntil = millis() + PLAN_SELECT_RESUME_DELAY;
}

function getRestartButtonPos() {
  if (width < 760) {
    return { x: width / 2, y: height - 100 };
  }

  return { x: width - 140, y: height - 120 };
}

function detectRestartHover() {
  let leftHand = getLeftHand();
  let hovering = leftHand && isThumbsUp(leftHand);

  if (!hovering) {
    if (restartHoldStartAt !== null) {
      stopChargeSound();
    }
    restartHoverSince = null;
    restartHoldStartAt = null;
    return;
  }

  let now = millis();

  if (restartHoverSince === null) {
    restartHoverSince = now;
    return;
  }

  if (now - restartHoverSince < SELECT_HOVER_DELAY) {
    return;
  }

  if (restartHoldStartAt === null) {
    restartHoldStartAt = now;
    startChargeSound();
  }

  let progress = constrain((now - restartHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);
  updateChargeSound(progress);

  if (progress >= 1) {
    stopChargeSound();
    playSelectSound();
    restartHoverSince = null;
    restartHoldStartAt = null;
    restartExperience();
  }
}

function drawRestartButton() {
  let pos = getRestartButtonPos();
  let circleRadius = 32;
  let ringRadius = 44;

  let progress = restartHoldStartAt === null
    ? 0
    : constrain((millis() - restartHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);

  push();
  drawingContext.direction = "ltr";
  noFill();
  stroke(255, 255, 255, 28);
  strokeWeight(2);
  circle(pos.x, pos.y, ringRadius * 2);

  if (progress > 0) {
    drawSelectionRing(pos.x, pos.y, ringRadius, progress, [255, 31, 52]);
  }

  noStroke();
  fill(9, 10, 14, 225);
  stroke(255, 255, 255, 50);
  strokeWeight(1.4);
  circle(pos.x, pos.y, circleRadius * 2);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text("↻", pos.x, pos.y - 1);

  fill(200, 204, 212);
  textStyle(BOLD);
  textSize(10.5);
  text(t("restartLabel"), pos.x, pos.y + circleRadius + 18);
  pop();
}

// Per-finger curl via direction comparison: does the finger continue
// straight out from the palm, or fold back? baseDirection runs
// wrist -> knuckle (the hand's own "forward" direction, stable regardless
// of curl); tipDirection runs knuckle -> tip. An extended finger continues
// in roughly that same direction (dot near +1); a curled finger folds
// back against it (dot near -1 as it approaches a full fold). Comparing
// against the palm's own forward direction (instead of distance to a
// palm-center point) avoids a degenerate near-zero vector once a curled
// tip ends up close to that center - exactly the pose that matters most.
function getFingerCurlDot(wrist, mcp, tip) {
  let baseX = mcp.x - wrist.x;
  let baseY = mcp.y - wrist.y;
  let tipX = tip.x - mcp.x;
  let tipY = tip.y - mcp.y;

  let baseLen = Math.sqrt(baseX * baseX + baseY * baseY) || 1;
  let tipLen = Math.sqrt(tipX * tipX + tipY * tipY) || 1;

  return (baseX * tipX + baseY * tipY) / (baseLen * tipLen);
}

// Average across the four fingers (thumb excluded - a thumbs-up has a
// strongly extended thumb that would otherwise outweigh four curled
// fingers in the average and misread as an open hand), from +1 (fully
// extended, continuing straight out) to -1 (folded all the way back).
const HAND_OPEN_THRESHOLD = 0.4;

function getHandCurlScore(hand) {
  let wrist = hand[0];

  let fingers = [
    [hand[5], hand[8]],
    [hand[9], hand[12]],
    [hand[13], hand[16]],
    [hand[17], hand[20]]
  ];

  let total = 0;
  for (let [mcp, tip] of fingers) {
    total += getFingerCurlDot(wrist, mcp, tip);
  }

  return total / fingers.length;
}

// Tune HAND_OPEN_THRESHOLD, not these - if real open hands aren't
// registering, lower it; if a fist or thumbs-up still reads as open,
// raise it.
function isOpenHand(hand) {
  return getHandCurlScore(hand) >= HAND_OPEN_THRESHOLD;
}

/* -------------------- SWIPE PRACTICE -------------------- */

function detectPracticeSwipe() {
  let rightHand = getRightHand();

  if (!rightHand) {
    feedbackMessage = t("showOnlyRightHand");
    calibratedRightX = null;
    resetSwipeSmoothing();
    practiceIndicatorTarget = 0;
    return;
  }

  let rightX = updateSmoothedRightX(getHandCenter(rightHand).x);

  let now = millis();

  if (now < practiceResetUntil) {
    feedbackMessage = t("resetHandCenter");
    practiceIndicatorTarget = 0;
    return;
  }

  if (now - lastSwipeTime < COOLDOWN) {
    return;
  }

  if (calibratedRightX === null) {
    practiceIndicatorTarget = 0;

    if (!isHandInStartZone(rightX)) {
      feedbackMessage = t("moveHandCenterFirst");
      return;
    }

    calibrateRightHand();
    resetSwipeSmoothing();
    feedbackMessage = t("nowSwipeDirection", {
      DIR: practiceStep === "right" ? t("directionRight") : t("directionLeft")
    });
    return;
  }

  let rightMovement = rightX - calibratedRightX;
  practiceIndicatorTarget = rightMovement * 0.55;
  let confirmedDirection = getConfirmedSwipeDirection(rightMovement, getSwipeDistance());

  if (practiceStep === "right") {
    feedbackMessage = t("swipeRightInstruction");

    if (rightMovement > 50) {
      feedbackMessage = t("movingRight");
    }

    if (confirmedDirection) {
      confirmPracticeSwipe(confirmedDirection);
      return;
    }
  }

  if (practiceStep === "left") {
    feedbackMessage = t("swipeLeftInstruction");

    if (rightMovement < -50) {
      feedbackMessage = t("movingLeft");
    }

    if (confirmedDirection) {
      confirmPracticeSwipe(confirmedDirection);
      return;
    }
  }
}

function confirmPracticeSwipe(direction) {
  let now = millis();

  if (practiceStep === "right") {
    if (direction === "right") {
      feedbackMessage = t("rightSwipeDetected");
      practiceStep = "left";
      practiceStepEnteredAt = now;
      playNarrationClip("instructions/05_swipe_left.mp3");
      lastSwipeTime = now;
      calibratedRightX = null;
      resetSwipeSmoothing();
      practiceResetUntil = now + PRACTICE_RESET_DELAY;
      playSwooshSound();
      return;
    }

    if (direction === "left") {
      feedbackMessage = t("swipeRightFirst");
      lastSwipeTime = now;
      calibratedRightX = null;
      resetSwipeSmoothing();
      practiceIndicatorTarget = 0;
      return;
    }
  }

  if (practiceStep === "left") {
    if (direction === "left") {
      feedbackMessage = t("leftSwipeDetected");
      lastSwipeTime = now;
      calibratedRightX = null;
      resetSwipeSmoothing();
      practiceResetUntil = now + PRACTICE_RESET_DELAY;
      playSwooshSound();

      setTimeout(() => {
        appState = "backGesture";
      }, 700);

      return;
    }

    if (direction === "right") {
      feedbackMessage = t("swipeLeftFirst");
      lastSwipeTime = now;
      calibratedRightX = null;
      resetSwipeSmoothing();
      practiceIndicatorTarget = 0;
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
  return min(SWIPE_DISTANCE, max(140, width * 0.11));
}

// Exponential moving average over the raw per-frame hand X so single-frame
// tracking jitter doesn't get read as swipe movement.
function updateSmoothedRightX(rawX) {
  smoothedRightX =
    smoothedRightX === null ? rawX : lerp(smoothedRightX, rawX, HAND_SMOOTHING);
  return smoothedRightX;
}

function resetSwipeSmoothing() {
  smoothedRightX = null;
  swipeHoldDirection = null;
  swipeHoldStartAt = 0;
  swipeHoldSamples = [];
  calibrationSettleSince = null;
}

// Only reports a swipe once movement has stayed past the threshold, in the
// same direction, for SWIPE_HOLD_TIME - filters out momentary spikes from a
// single noisy tracking frame. Also checks the frame-by-frame samples
// collected during that hold window aren't just jitter that happens to stay
// past the threshold (see isHoldWobbly) - a hand oscillating back and forth
// near the threshold shouldn't confirm just because it never dipped below it.
// Returns "right", "left", or null.
function getConfirmedSwipeDirection(movement, threshold) {
  let direction = movement > threshold ? "right" : movement < -threshold ? "left" : null;

  if (!direction) {
    swipeHoldDirection = null;
    swipeHoldSamples = [];
    return null;
  }

  if (swipeHoldDirection !== direction) {
    swipeHoldDirection = direction;
    swipeHoldStartAt = millis();
    swipeHoldSamples = [{ movement, t: swipeHoldStartAt }];
    return null;
  }

  swipeHoldSamples.push({ movement, t: millis() });

  if (swipeHoldSamples.length > SWIPE_HOLD_MAX_SAMPLES) {
    swipeHoldDirection = null;
    swipeHoldSamples = [];
    return null;
  }

  if (millis() - swipeHoldStartAt >= SWIPE_HOLD_TIME) {
    if (isHoldWobbly(swipeHoldSamples)) {
      // Backtracked too much relative to net progress to trust yet - keep
      // collecting samples instead of resetting the clock, so a hand that
      // settles down still confirms without starting the hold over.
      return null;
    }

    swipeHoldDirection = null;
    swipeHoldSamples = [];
    return direction;
  }

  return null;
}

// True if the hold-window samples backtracked a lot relative to their net
// displacement - i.e. path length (sum of frame-to-frame movement) far
// exceeds the net movement from first sample to last. A clean swipe keeps
// those close; jitter that wanders back and forth inflates path length.
function isHoldWobbly(samples) {
  if (samples.length < 3) return false;

  let net = Math.abs(samples[samples.length - 1].movement - samples[0].movement);
  let pathLength = 0;
  for (let i = 1; i < samples.length; i++) {
    pathLength += Math.abs(samples[i].movement - samples[i - 1].movement);
  }

  return pathLength > net * SWIPE_MAX_WOBBLE_RATIO;
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
  // A pointing/relaxed hand can have a fairly straight thumb resting close
  // alongside the index finger - a real thumbs-up holds it clearly out and
  // away from the rest of the hand.
  let thumbIsSeparated = landmarkDistance(thumbTip, hand[5]) > palmSize * 0.5;

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

    // Require both signals together, not just one - a relaxed open hand
    // often satisfies one of these alone (e.g. a slightly bent finger with
    // its tip still clearly extended), which was enough to misread as a
    // folded finger and false-positive the whole gesture.
    if (jointIsBent && tipIsNearPalm) {
      foldedFingerCount++;
    }
  }

  // Every finger must be folded, not just most of them - a pointing hand
  // (index out, other three curled) already clears 3-of-4 and was getting
  // misread as thumbs-up whenever the thumb also happened to sit fairly
  // straight and high.
  return thumbIsExtended && thumbPointsUp && thumbIsSeparated && foldedFingerCount === 4;
}

function isThumbsDown(hand) {
  let wrist = hand[0];
  let thumbTip = hand[4];
  let thumbMcp = hand[2];
  let palmSize = landmarkDistance(wrist, hand[9]);
  let thumbLength = landmarkDistance(thumbMcp, thumbTip);
  let thumbDrop = thumbTip.y - thumbMcp.y;
  let thumbAngle = landmarkAngle(hand[2], hand[3], hand[4]);
  let thumbDirection = thumbDrop / max(thumbLength, 0.001);

  let thumbIsExtended = thumbAngle > 145;
  let thumbPointsDown =
    thumbDirection > 0.55 &&
    thumbDrop > palmSize * 0.45 &&
    thumbTip.y > wrist.y;
  let thumbIsSeparated = landmarkDistance(thumbTip, hand[5]) > palmSize * 0.5;

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

    // Require both signals together, not just one - a relaxed open hand
    // often satisfies one of these alone (e.g. a slightly bent finger with
    // its tip still clearly extended), which was enough to misread as a
    // folded finger and false-positive the whole gesture.
    if (jointIsBent && tipIsNearPalm) {
      foldedFingerCount++;
    }
  }

  return thumbIsExtended && thumbPointsDown && thumbIsSeparated && foldedFingerCount === 4;
}

/* -------------------- FIST -------------------- */

function isFist(hand) {
  let wrist = hand[0];
  let palmSize = landmarkDistance(wrist, hand[9]);

  let fingerIndexes = [
    [5, 6, 8],
    [9, 10, 12],
    [13, 14, 16],
    [17, 18, 20]
  ];

  let foldedFingerCount = 0;
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

  let thumbTip = hand[4];
  let thumbAngle = landmarkAngle(hand[2], hand[3], hand[4]);
  let thumbTipNearPalm = landmarkDistance(thumbTip, hand[9]) < palmSize * 0.9;
  let thumbCurled = thumbAngle < 150 || thumbTipNearPalm;

  return foldedFingerCount === 4 && thumbCurled;
}

/* -------------------- FINGER COUNT (LANGUAGE PICKER) -------------------- */

function getFingerExtensionState(hand) {
  let wrist = hand[0];
  let palmSize = landmarkDistance(wrist, hand[9]);
  let thumbTip = hand[4];
  let thumbAngle = landmarkAngle(hand[2], hand[3], hand[4]);
  let thumbTipNearPalm = landmarkDistance(thumbTip, hand[9]) < palmSize * 0.9;

  return {
    index: hand[8].y < hand[6].y,
    middle: hand[12].y < hand[10].y,
    ring: hand[16].y < hand[14].y,
    pinky: hand[20].y < hand[18].y,
    thumbCurled: thumbAngle < 150 || thumbTipNearPalm
  };
}

function isOneFingerUp(hand) {
  let f = getFingerExtensionState(hand);
  return f.index && !f.middle && !f.ring && !f.pinky && f.thumbCurled;
}

function isTwoFingersUp(hand) {
  let f = getFingerExtensionState(hand);
  return f.index && f.middle && !f.ring && !f.pinky && f.thumbCurled;
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
  planHoverX = null;
  planHoverY = null;
  planCardScales = [];
  planCardX = [];
  planCardAlpha = [];
  selectHoverIndex = null;
  selectDelayUntil = 0;
  selectHoldStartAt = null;
  selectLossSince = null;
  selectedPlanIndex = null;
  resultFistBackDelayUntil = 0;
  planSelectResumeDelayUntil = 0;
  stopChargeSound();
  restartHoverSince = null;
  restartHoldStartAt = null;

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

function getLeftHand() {
  let hands = getHands();

  for (let i = 0; i < hands.length; i++) {
    if (getPhysicalHandedness(i) === "Left") {
      return hands[i];
    }
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

function drawActionPill(x, y, pillW, pillH, label, accent, pulse, icon = null, iconX = null, iconScale = 1, iconOffsetY = 0) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(accent[0], accent[1], accent[2], 22 + pulse * 18);
  rect(x, y, pillW + pulse * 7, pillH + pulse * 4, 999);
  stroke(accent[0], accent[1], accent[2], 130 + pulse * 80);
  strokeWeight(1.4);
  fill(8, 9, 13, 220);
  rect(x, y, pillW, pillH, 999);

  if (icon) {
    // Sits fully to the left of the pill (its own explicit x, not clipped
    // to pillW) so the bigger icon never overlaps the label text.
    drawingContext.direction = "ltr";
    imageMode(CENTER);
    noStroke();
    push();
    translate(iconX, y + iconOffsetY);
    scale(iconScale);
    image(icon, 0, 0, 46, 46);
    pop();
  }

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  text(label, x, y);
  pop();
}

// Slides an open-hand icon back and forth toward the swipe direction, with
// a couple of faint trailing copies to sell the motion - shows the learner
// the actual hand gesture instead of an abstract arrow.
const SWIPE_HAND_CYCLE = 1500;
const SWIPE_HAND_TRAVEL = 140;

function drawSwipeHandDemo(x, y, direction) {
  let iconSize = 50;
  // Anchored to when this practice step began, not raw millis(), so the
  // wave always starts at 0 (center) the moment "swipe right"/"swipe left"
  // appears instead of picking up wherever the global clock happened to be.
  let elapsed = millis() - practiceStepEnteredAt;

  push();
  drawingContext.direction = "ltr";
  imageMode(CENTER);
  noStroke();

  // Trailing afterimages (older, fainter positions) drawn first so the
  // current position layers on top.
  for (let i = 2; i >= 1; i--) {
    let phase = (((elapsed - i * 90) % SWIPE_HAND_CYCLE) + SWIPE_HAND_CYCLE) % SWIPE_HAND_CYCLE / SWIPE_HAND_CYCLE;
    let wave = (1 - cos(phase * TWO_PI)) / 2;
    let handX = x + direction * SWIPE_HAND_TRAVEL * wave;

    drawingContext.globalAlpha = 0.22 - i * 0.06;
    image(openHandIconWhite, handX, y, iconSize, iconSize);
  }

  let phase = (((elapsed % SWIPE_HAND_CYCLE) + SWIPE_HAND_CYCLE) % SWIPE_HAND_CYCLE) / SWIPE_HAND_CYCLE;
  let wave = (1 - cos(phase * TWO_PI)) / 2;
  let handX = x + direction * SWIPE_HAND_TRAVEL * wave;

  drawingContext.globalAlpha = 0.95;
  image(openHandIconWhite, handX, y, iconSize, iconSize);
  pop();
}

function drawAnimatedArrowUp(x, y, accent) {
  let travel = (millis() * 0.12) % 36;
  push();
  drawingContext.direction = "ltr";
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  for (let i = 0; i < 3; i++) {
    let local = (travel + i * 26) % 78;
    let alpha = map(local, 0, 78, 45, 255);
    fill(accent[0], accent[1], accent[2], alpha);
    noStroke();
    text("˄", x, y - (local - 39));
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

function drawDetectionStatus(x, y, label, active, activeColor, pillWidth = 220, waitingLabel = null) {
  rectMode(CENTER);

  let isWide = pillWidth > 260;
  let dotX = x - pillWidth / 2 + 35;
  let textX = x - pillWidth / 2 + 62;

  if (active) {
    stroke(activeColor[0], activeColor[1], activeColor[2]);
    strokeWeight(2);
    fill(0, 0, 0, 220);
  } else {
    stroke(120);
    strokeWeight(1.5);
    fill(20, 20, 20, 190);
  }

  rect(x, y, pillWidth, 44, 999);

  noStroke();
  textAlign(isWide ? LEFT : CENTER, CENTER);

  if (active) {
    fill(activeColor[0], activeColor[1], activeColor[2]);
    circle(dotX, y, 12);

    fill(255);
    textStyle(BOLD);
    textSize(isWide ? 12.5 : 15);
    text(label, isWide ? textX : x + 18, y);
  } else {
    fill(130);
    circle(dotX, y, 12);

    fill(190);
    textStyle(BOLD);
    textSize(isWide ? 12 : 14);
    text(waitingLabel !== null ? waitingLabel : t("waiting"), isWide ? textX : x + 18, y);
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



function startPlanTypeSelection() {
  appState = "planType";
  selectedPlanType = null;
  quizFeedback = t("moveHandCenterQuiz");
  questionNeedsCalibration = true;

  quizCardX = 0;
  quizCardRotation = 0;
  quizDisplayX = 0;
  quizEntryAt = millis();

  calibratedRightX = null;
  resetSwipeSmoothing();
  lastSwipeTime = 0;

  playPlanTypeNarration();
}

function selectPlanType(type) {
  selectedPlanType = type;
  questions = type === "home" ? homeQuestions : mobileQuestions;
  plans = type === "home" ? homePlans : mobilePlans;
  startQuiz();
}

function detectPlanTypeSwipe() {
  let rightHand = getRightHand();
  let now = millis();

  if (!rightHand) {
    if (now - lastRightHandSeenAt <= HAND_LOSS_GRACE_TIME) {
      quizFeedback = t("keepSwiping");
      return;
    }

    quizFeedback = t("showOnlyRightHand");
    questionNeedsCalibration = true;
    calibratedRightX = null;
    resetSwipeSmoothing();
    quizCardX = 0;
    quizCardRotation = 0;
    return;
  }

  lastRightHandSeenAt = now;
  let rightX = updateSmoothedRightX(getHandCenter(rightHand).x);

  if (now - lastSwipeTime < COOLDOWN) {
    return;
  }

  if (questionNeedsCalibration) {
    if (!isHandInStartZone(rightX)) {
      quizFeedback = t("bringHandMiddle");
      calibrationSettleSince = null;
      return;
    }

    // Require the hand to sit still in the zone for a beat before locking
    // in the calibration point - otherwise a hand still settling into
    // place gets captured mid-motion, and the rest of that motion reads
    // back as an unintended swipe the instant calibration completes.
    if (calibrationSettleSince === null) {
      calibrationSettleSince = now;
    }

    if (now - calibrationSettleSince < CALIBRATION_SETTLE_TIME) {
      quizFeedback = t("bringHandMiddle");
      return;
    }

    calibratedRightX = rightX;
    resetSwipeSmoothing();
    questionNeedsCalibration = false;
    quizFeedback = t("swipeHomeOrMobileHint");
    return;
  }

  let movement = rightX - calibratedRightX;
  let cardBound = getSwipeDistance() * 0.55;
  quizCardX = constrain(movement * 0.55, -cardBound, cardBound);
  quizCardRotation = constrain(movement * 0.04, -10, 10);

  if (movement > 35) {
    quizFeedback = t("mobileSelectedHint");
  } else if (movement < -35) {
    quizFeedback = t("homeSelectedHint");
  } else {
    quizFeedback = t("swipeHomeOrMobileHint");
  }

  let confirmedDirection = getConfirmedSwipeDirection(movement, getSwipeDistance());

  if (confirmedDirection === "right") {
    lastSwipeTime = now;
    playSwooshSound();
    selectPlanType("mobile");
    return;
  }

  if (confirmedDirection === "left") {
    lastSwipeTime = now;
    playSwooshSound();
    selectPlanType("home");
    return;
  }
}

function drawPlanTypeScreen() {
  drawDarkOverlay(30);

  let cardW = min(760, width * 0.86);
  let cardY = min(330, height * 0.39);
  let entryProgress = easeOutBack(
    constrain((millis() - quizEntryAt) / 520, 0, 1)
  );

  quizDisplayX = lerp(quizDisplayX, quizCardX, 0.2);
  let displayX = quizDisplayX;
  let displayRotation = quizCardRotation;

  push();
  drawingContext.globalAlpha = constrain(entryProgress, 0, 1);
  translate(width / 2 + displayX, cardY + (1 - entryProgress) * 34);
  rotate(radians(displayRotation));
  scale(0.94 + entryProgress * 0.06);

  drawGlassPanel(0, 0, cardW, 250, 32, [255, 31, 52]);

  noStroke();
  textAlign(CENTER, CENTER);
  drawEyebrow(t("planTypeEyebrow"), 0, -88);

  fill(255);
  textStyle(BOLD);
  textSize(min(30, width * 0.055));
  drawWrappedText(t("planTypeQuestion"), 0, -22, cardW - 110, 34);

  fill(195, 200, 210);
  textStyle(NORMAL);
  textSize(14.5);
  text(quizFeedback, 0, 74);

  pop();

  drawGestureDock(cardY + 180, quizDisplayX, null, null);
}

function startQuiz() {
  appState = "quiz";
  currentQuestion = 0;
  answers = [];
  bestPlan = null;

  quizFeedback = t("moveHandCenterQuiz");
  questionNeedsCalibration = true;

  quizCardX = 0;
  quizCardRotation = 0;
  quizDisplayX = 0;
  quizTransition = null;
  quizEntryAt = millis();

  calibratedRightX = null;
  thumbsDownSince = null;
  handClosedWarningActive = false;
  resetSwipeSmoothing();
  resetSliderState();
  resetPriorityState();

  // Give the user a moment to reposition after choosing a plan type before
  // the first question's calibration becomes active. This is intentionally
  // separate from COOLDOWN, which governs the delay between later questions.
  lastSwipeTime = millis() - (COOLDOWN - PLAN_TYPE_TO_QUIZ_DELAY);

  playQuestionNarration();
}

function resetSliderState() {
  sliderGrabbed = false;
  sliderStepIndex = 0;
  sliderPendingConfirmSince = null;
  sliderDisplayX = null;
  sliderPointerX = null;
  sliderPointerY = null;
}

function resetPriorityState() {
  if (priorityHoverIndex !== null || priorityHoldStartAt !== null) {
    stopChargeSound();
  }

  priorityPointerX = null;
  priorityPointerY = null;
  priorityHoverIndex = null;
  priorityHoldStartAt = null;
  priorityDelayUntil = 0;
  priorityLossSince = null;
  priorityScales = [];
  priorityInstructionStartedAt = null;
}

function cancelPriorityHover() {
  if (priorityHoverIndex !== null || priorityHoldStartAt !== null) {
    stopChargeSound();
  }

  priorityHoverIndex = null;
  priorityHoldStartAt = null;
  priorityLossSince = null;
}

function handleQuizAnswer(isInterested) {
  if (quizTransition) return;

  quizTransition = {
    kind: "boolean",
    isInterested,
    startedAt: millis(),
    fromX: quizDisplayX
  };
  quizFeedback = isInterested ? t("savingYes") : t("savingNo");
  lastSwipeTime = millis();
  playSwooshSound();
}

function handleSliderAnswer(value) {
  if (quizTransition) return;

  quizTransition = {
    kind: "slider",
    value,
    startedAt: millis()
  };
  quizFeedback = t("savingAmount", { value: formatSliderValue(value) });
  lastSwipeTime = millis();
  playSwooshSound();
}

function handlePriorityAnswer(key) {
  if (quizTransition) return;

  let option = questions[currentQuestion].options.find((opt) => opt.key === key);
  quizTransition = {
    kind: "priority",
    key,
    startedAt: millis()
  };
  quizFeedback = t("savingPriority", { value: option ? option[appLanguage] : key });
  lastSwipeTime = millis();
  playSwooshSound();
}

function updateQuizTransition() {
  if (!quizTransition) return;

  let progress = constrain((millis() - quizTransition.startedAt) / 420, 0, 1);
  if (progress < 1) return;

  let transition = quizTransition;
  quizTransition = null;

  if (transition.kind === "slider") {
    // 0GB means "no particular data need" - treat it like a boolean "no"
    // and leave it out of answers entirely, rather than let it drag down
    // every plan's match percentage.
    if (transition.value !== 0) {
      answers.push({ tag: questions[currentQuestion].tag, value: transition.value });
    }
  } else if (transition.kind === "priority") {
    // "All equal" carries no preference - same treatment as a boolean "no".
    if (transition.key !== "equal") {
      answers.push({ tag: questions[currentQuestion].tag, key: transition.key });
    }
  } else if (transition.isInterested) {
    answers.push(questions[currentQuestion].tag);
  }

  lastSwipeTime = millis();
  currentQuestion++;
  quizCardX = 0;
  quizCardRotation = 0;
  quizDisplayX = 0;
  questionNeedsCalibration = true;
  quizEntryAt = millis();
  handClosedWarningActive = false;
  resetSliderState();
  resetPriorityState();

  if (currentQuestion >= questions.length) {
    stopNarration();
    appState = "loading";
    loadingStartTime = millis();
  } else {
    quizFeedback = t("resetForNext");
    playQuestionNarration();
  }
}

function detectBackGesturePractice() {
  let rightHand = getRightHand();

  if (!rightHand || !isThumbsDown(rightHand)) {
    thumbsDownSince = null;
    return;
  }

  if (thumbsDownSince === null) {
    thumbsDownSince = millis();
    return;
  }

  if (millis() - thumbsDownSince >= THUMBS_DOWN_HOLD_TIME) {
    thumbsDownSince = null;
    backGesturePracticed = true;
    playHapticSound();
  }
}

function goToPreviousQuestion() {
  if (currentQuestion === 0) {
    quizFeedback = t("firstQuestionMsg");
    return;
  }

  currentQuestion--;

  let previousTag = questions[currentQuestion].tag;
  let answerIndex = answers.findIndex(
    (answer) => answer === previousTag || (answer && answer.tag === previousTag)
  );
  if (answerIndex !== -1) {
    answers.splice(answerIndex, 1);
  }

  quizCardX = 0;
  quizCardRotation = 0;
  quizDisplayX = 0;
  questionNeedsCalibration = true;
  calibratedRightX = null;
  resetSwipeSmoothing();
  resetSliderState();
  resetPriorityState();
  quizEntryAt = millis();
  // Shorter cooldown than a normal answer - the user already read this
  // question, so there's no need to make them wait as long before swiping.
  lastSwipeTime = millis() - (COOLDOWN - BACK_NAV_COOLDOWN);
  quizFeedback = t("backToPrevious");
  playQuestionNarration();
}

function detectQuizSwipe() {
  let rightHand = getRightHand();
  let now = millis();
  handClosedWarningActive = false;

  if (!rightHand) {
    thumbsDownSince = null;

    if (now - lastRightHandSeenAt <= HAND_LOSS_GRACE_TIME) {
      quizFeedback = t("keepSwiping");
      return;
    }

    quizFeedback = t("showOnlyRightHand");
    questionNeedsCalibration = true;
    calibratedRightX = null;
    resetSwipeSmoothing();
    quizCardX = 0;
    quizCardRotation = 0;
    return;
  }

  lastRightHandSeenAt = now;

  if (now - lastSwipeTime < COOLDOWN) {
    quizFeedback = t("resetForNext");
    thumbsDownSince = null;
    return;
  }

  if (isThumbsDown(rightHand)) {
    if (thumbsDownSince === null) {
      thumbsDownSince = now;
    }

    quizFeedback = t("thumbsDownHoldToGoBack");

    if (now - thumbsDownSince >= THUMBS_DOWN_HOLD_TIME) {
      thumbsDownSince = null;
      lastSwipeTime = now;
      questionNeedsCalibration = true;
      calibratedRightX = null;
      resetSwipeSmoothing();
      quizCardX = 0;
      quizCardRotation = 0;
      playHapticSound();
      goToPreviousQuestion();
    }

    return;
  }

  thumbsDownSince = null;

  // Swiping tracks an open hand's position - closing it into a fist isn't
  // a recognized gesture here (unlike the slider/priority questions),
  // so just remind the user to reopen it rather than silently keep
  // tracking a pose that isn't meant to do anything.
  if (isFist(rightHand)) {
    handClosedWarningActive = true;
    quizFeedback = t("keepHandOpenWarning");
    return;
  }

  let handCenter = getHandCenter(rightHand);
  let rightX = updateSmoothedRightX(handCenter.x);

  if (questionNeedsCalibration) {
    if (!isHandInStartZone(rightX)) {
      quizFeedback = t("bringHandMiddle");
      calibrationSettleSince = null;
      return;
    }

    // Require the hand to sit still in the zone for a beat before locking
    // in the calibration point - otherwise a hand still settling into
    // place gets captured mid-motion, and the rest of that motion reads
    // back as an unintended swipe the instant calibration completes.
    if (calibrationSettleSince === null) {
      calibrationSettleSince = now;
    }

    if (now - calibrationSettleSince < CALIBRATION_SETTLE_TIME) {
      quizFeedback = t("bringHandMiddle");
      return;
    }

    calibratedRightX = rightX;
    resetSwipeSmoothing();
    swipeStartTime = now;
    questionNeedsCalibration = false;
    quizFeedback = t("swipeYesNoInstruction");
    return;
  }

  let rightMovement = rightX - calibratedRightX;
  let cardBound = getSwipeDistance() * 0.55;
  quizCardX = constrain(rightMovement * 0.55, -cardBound, cardBound);
  quizCardRotation = constrain(rightMovement * 0.04, -10, 10);

  if (rightMovement > 35) {
    quizFeedback = t("yesDetected");
  } else if (rightMovement < -35) {
    quizFeedback = t("noDetected");
  } else {
    quizFeedback = t("swipeHint");
  }

  let confirmedDirection = getConfirmedSwipeDirection(rightMovement, getSwipeDistance());

  if (confirmedDirection === "right") {
    handleQuizAnswer(true);
    return;
  }

  if (confirmedDirection === "left") {
    handleQuizAnswer(false);
    return;
  }
}

function formatSliderValue(value) {
  return value === Infinity ? t("unlimitedLabel") : `${value}GB`;
}

function getQuizCardY() {
  let type = questions[currentQuestion] && questions[currentQuestion].type;
  // The slider dock and priority pills both need more room below the
  // question card than the small yes/no gesture dock, so their question
  // card sits a bit higher.
  return (type === "slider" || type === "priority") ? min(250, height * 0.3) : min(330, height * 0.39);
}

function getPriorityLayout() {
  let options = questions[currentQuestion].options;
  let cols = 3;
  let rows = Math.ceil(options.length / cols);
  let pillW = min(280, (width - 120) / cols - 24);
  let pillH = 130;
  let gapX = 24;
  let gapY = 28;
  let blockH = rows * pillH + (rows - 1) * gapY;
  let startY = min(getQuizCardY() + 235, height - 110 - blockH) + pillH / 2;
  let positions = [];

  for (let i = 0; i < options.length; i++) {
    let row = Math.floor(i / cols);
    let itemsInRow = Math.min(cols, options.length - row * cols);
    let rowW = itemsInRow * pillW + (itemsInRow - 1) * gapX;
    let col = i % cols;
    let x = width / 2 - rowW / 2 + col * (pillW + gapX) + pillW / 2;
    let y = startY + row * (pillH + gapY);
    positions.push({ x, y });
  }

  return { pillW, pillH, gapY, rows, positions };
}

function getSliderLayout() {
  let trackW = min(920, width * 0.94);
  let x0 = width / 2 - trackW / 2;
  let x1 = width / 2 + trackW / 2;
  let y = min(getQuizCardY() + 250, height - 110);
  let stepCount = DATA_SLIDER_STEPS.length;
  let positions = [];

  for (let i = 0; i < stepCount; i++) {
    positions.push(x0 + (x1 - x0) * (i / (stepCount - 1)));
  }

  return { x0, x1, y, trackW, positions };
}

function getNearestSliderIndex(handX, layout) {
  let bestIndex = 0;
  let bestDist = Infinity;

  for (let i = 0; i < layout.positions.length; i++) {
    let d = abs(handX - layout.positions[i]);
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// Once the handle is let go, keep the chosen value on screen for a beat
// before locking it in - returns true once it has (auto-)confirmed.
function checkSliderPendingConfirm(now) {
  let remaining = SLIDER_CONFIRM_WAIT - (now - sliderPendingConfirmSince);

  if (remaining <= 0) {
    let confirmedValue = DATA_SLIDER_STEPS[sliderStepIndex].value;
    sliderPendingConfirmSince = null;
    handleSliderAnswer(confirmedValue);
    return true;
  }

  quizFeedback = t("sliderConfirmingIn", {
    value: formatSliderValue(DATA_SLIDER_STEPS[sliderStepIndex].value),
    seconds: Math.ceil(remaining / 1000)
  });
  return false;
}

function detectQuizSlider() {
  let rightHand = getRightHand();
  let now = millis();

  if (!rightHand) {
    thumbsDownSince = null;
    sliderPointerX = null;
    sliderPointerY = null;

    if (sliderGrabbed) {
      sliderGrabbed = false;
      sliderPendingConfirmSince = now;
    }

    // The confirm countdown is time-based, not hand-presence-based - it
    // keeps ticking down even if the hand briefly leaves frame.
    if (sliderPendingConfirmSince !== null) {
      checkSliderPendingConfirm(now);
      return;
    }

    if (now - lastRightHandSeenAt <= HAND_LOSS_GRACE_TIME) {
      quizFeedback = t("keepSliding");
      return;
    }

    quizFeedback = t("showOnlyRightHand");
    return;
  }

  lastRightHandSeenAt = now;

  if (now - lastSwipeTime < COOLDOWN) {
    quizFeedback = t("resetForNext");
    thumbsDownSince = null;
    return;
  }

  if (isThumbsDown(rightHand)) {
    sliderGrabbed = false;
    sliderPendingConfirmSince = null;

    if (thumbsDownSince === null) {
      thumbsDownSince = now;
    }

    quizFeedback = t("thumbsDownHoldToGoBack");

    if (now - thumbsDownSince >= THUMBS_DOWN_HOLD_TIME) {
      thumbsDownSince = null;
      lastSwipeTime = now;
      resetSliderState();
      playHapticSound();
      goToPreviousQuestion();
    }

    return;
  }

  thumbsDownSince = null;

  let layout = getSliderLayout();
  let handCenter = getHandCenter(rightHand);
  sliderPointerX = handCenter.x;
  sliderPointerY = handCenter.y;
  let fisted = isFist(rightHand);

  if (!sliderGrabbed) {
    // Grabbing doesn't require finding the current handle first - closing
    // a fist anywhere near the track jumps the handle straight to that
    // spot and hands over control from there.
    let nearestIndex = getNearestSliderIndex(handCenter.x, layout);
    let distanceToNearest = dist(handCenter.x, handCenter.y, layout.positions[nearestIndex], layout.y);

    if (fisted && distanceToNearest <= SLIDER_GRAB_RADIUS) {
      sliderStepIndex = nearestIndex;
      sliderGrabbed = true;
      sliderPendingConfirmSince = null;
      quizFeedback = t("sliderGrabbed", { value: formatSliderValue(DATA_SLIDER_STEPS[sliderStepIndex].value) });
      return;
    }

    if (sliderPendingConfirmSince !== null) {
      checkSliderPendingConfirm(now);
      return;
    }

    quizFeedback = t("sliderHoverInstruction");
    return;
  }

  if (fisted) {
    sliderStepIndex = getNearestSliderIndex(handCenter.x, layout);
    quizFeedback = t("sliderDragging", { value: formatSliderValue(DATA_SLIDER_STEPS[sliderStepIndex].value) });
    return;
  }

  // The hand just unclenched - start (or continue) the auto-confirm countdown.
  sliderGrabbed = false;
  if (sliderPendingConfirmSince === null) {
    sliderPendingConfirmSince = now;
  }
  checkSliderPendingConfirm(now);
}

// Tracks the raw hand position for the priority pills, independent of the
// fist/hold confirm logic below - mirrors detectPlanHover, which is what
// drives the plan cards' hover-scale-up even before you've closed a fist.
function detectPriorityPointer() {
  let rightHand = getRightHand();

  if (rightHand && (isOpenHand(rightHand) || isFist(rightHand))) {
    let center = getHandCenter(rightHand);
    priorityPointerX = center.x;
    priorityPointerY = center.y;
  } else {
    priorityPointerX = null;
    priorityPointerY = null;
  }
}

// True once the point is within a pill's own drawn rectangle (plus a
// little slack) - used instead of a falloff-from-center radius so a fist
// resting anywhere inside the pill's visible border counts, not just a
// small zone near dead-center.
const PRIORITY_HOLD_MARGIN = 26;
function isPointOnPriorityPill(px, py, pos, layout, margin) {
  return Math.abs(px - pos.x) <= layout.pillW / 2 + margin &&
    Math.abs(py - pos.y) <= layout.pillH / 2 + margin;
}

// Fist-and-hold confirm logic for the priority pills - same shape as
// updatePlanSelection (hover, switch, loss grace, hold ring), just
// against 2D pill rectangles instead of a single row of cards.
function detectQuizPriority() {
  let rightHand = getRightHand();
  let now = millis();

  if (!rightHand) {
    thumbsDownSince = null;
    cancelPriorityHover();

    if (now - lastRightHandSeenAt <= HAND_LOSS_GRACE_TIME) {
      quizFeedback = t("keepHoveringPriority");
      return;
    }

    quizFeedback = t("showOnlyRightHand");
    return;
  }

  lastRightHandSeenAt = now;

  if (now - lastSwipeTime < COOLDOWN) {
    quizFeedback = t("resetForNext");
    thumbsDownSince = null;
    return;
  }

  if (isThumbsDown(rightHand)) {
    cancelPriorityHover();

    if (thumbsDownSince === null) {
      thumbsDownSince = now;
    }

    quizFeedback = t("thumbsDownHoldToGoBack");

    if (now - thumbsDownSince >= THUMBS_DOWN_HOLD_TIME) {
      thumbsDownSince = null;
      lastSwipeTime = now;
      resetPriorityState();
      playHapticSound();
      goToPreviousQuestion();
    }

    return;
  }

  thumbsDownSince = null;

  let layout = getPriorityLayout();
  let options = questions[currentQuestion].options;
  let handCenter = getHandCenter(rightHand);
  let isFisted = isFist(rightHand);

  // Sticky: if a pill is already being held, the fist staying anywhere
  // within that pill's own border (plus slack) keeps it engaged, rather
  // than re-checking against whichever pill is nearest to hand-center -
  // that's what let a fist resting near a pill's edge get judged as
  // "closer" to a neighboring pill and restart the hold.
  let targetIndex = null;

  if (isFisted) {
    if (
      priorityHoverIndex !== null &&
      isPointOnPriorityPill(handCenter.x, handCenter.y, layout.positions[priorityHoverIndex], layout, PRIORITY_HOLD_MARGIN)
    ) {
      targetIndex = priorityHoverIndex;
    } else {
      for (let i = 0; i < layout.positions.length; i++) {
        if (isPointOnPriorityPill(handCenter.x, handCenter.y, layout.positions[i], layout, 0)) {
          targetIndex = i;
          break;
        }
      }
    }
  }

  let targetValid = targetIndex !== null;

  if (!targetValid) {
    if (priorityHoverIndex === null) {
      quizFeedback = t("priorityHoverInstruction");
      return;
    }

    if (priorityLossSince === null) {
      priorityLossSince = now;
      return;
    }

    if (now - priorityLossSince < SELECT_LOSS_GRACE) {
      return;
    }

    cancelPriorityHover();
    quizFeedback = t("priorityHoverInstruction");
    return;
  }

  priorityLossSince = null;

  if (priorityHoverIndex !== targetIndex) {
    priorityHoverIndex = targetIndex;
    priorityDelayUntil = now + SELECT_HOVER_DELAY;
    priorityHoldStartAt = null;
    stopChargeSound();
    quizFeedback = t("priorityHovering", { value: options[targetIndex][appLanguage] });
    return;
  }

  if (now < priorityDelayUntil) {
    return;
  }

  if (priorityHoldStartAt === null) {
    priorityHoldStartAt = now;
    startChargeSound();
  }

  let progress = constrain((now - priorityHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);
  updateChargeSound(progress);
  quizFeedback = t("priorityHolding");

  if (progress >= 1) {
    stopChargeSound();
    playSelectSound();
    let key = options[priorityHoverIndex].key;
    priorityHoverIndex = null;
    priorityHoldStartAt = null;
    handlePriorityAnswer(key);
  }
}

function drawQuizScreen() {
  drawDarkOverlay(30);
  let q = questions[currentQuestion];
  if (!q) return;

  let isSlider = q.type === "slider";
  let isPriority = q.type === "priority";
  let cardW = min(760, width * 0.86);
  let cardY = getQuizCardY();
  let entryProgress = easeOutBack(
    constrain((millis() - quizEntryAt) / 520, 0, 1)
  );

  quizDisplayX = lerp(quizDisplayX, quizCardX, 0.2);
  let displayX = (isSlider || isPriority) ? 0 : quizDisplayX;
  let displayRotation = (isSlider || isPriority) ? 0 : quizCardRotation;
  let cardAlpha = 1;

  if (quizTransition) {
    let exitProgress = constrain((millis() - quizTransition.startedAt) / 420, 0, 1);

    if (quizTransition.kind === "slider" || quizTransition.kind === "priority") {
      cardAlpha = 1 - exitProgress;
    } else {
      let direction = quizTransition.isInterested ? 1 : -1;
      displayX = lerp(quizTransition.fromX, direction * width * 0.72, easeOutCubic(exitProgress));
      displayRotation = lerp(quizCardRotation, direction * 13, exitProgress);
      cardAlpha = 1 - exitProgress;
    }
  }

  drawQuestionProgress();

  push();
  drawingContext.globalAlpha = cardAlpha * constrain(entryProgress, 0, 1);
  translate(width / 2 + displayX, cardY + (1 - entryProgress) * 34);
  rotate(radians(displayRotation));
  scale(0.94 + entryProgress * 0.06);

  let accent = (isSlider || isPriority)
    ? [255, 31, 52]
    : (displayX > 15 ? [0, 212, 145] : displayX < -15 ? [255, 57, 76] : [255, 31, 52]);
  drawGlassPanel(0, 0, cardW, 250, 32, accent);

  noStroke();
  textAlign(CENTER, CENTER);
  drawEyebrow(t("questionOf", { n: currentQuestion + 1, total: questions.length }), 0, -88);

  fill(255);
  textStyle(BOLD);
  textSize(min(30, width * 0.055));
  drawWrappedText(q[appLanguage], 0, -22, cardW - 110, 34);

  fill(195, 200, 210);
  textStyle(NORMAL);
  textSize(14.5);
  text(quizFeedback, 0, 74);

  pop();

  let backHintY = cardY + 228;

  if (isSlider) {
    drawSliderDock();
    backHintY = getSliderLayout().y + 110;
  } else if (isPriority) {
    drawPriorityPills();
    let priorityLayout = getPriorityLayout();
    let lastPos = priorityLayout.positions[priorityLayout.positions.length - 1];
    backHintY = lastPos.y + priorityLayout.pillH / 2 + 40;
  } else if (handClosedWarningActive) {
    drawHandClosedWarning(cardY + 180);
  } else {
    drawGestureDock(cardY + 180, quizDisplayX);
  }

  if (currentQuestion > 0) {
    drawThumbsDownBackHint(backHintY);
  }
}

// Amber warning banner shown in place of the swipe dock whenever the user
// closes their hand during a yes/no question - same glass-card treatment
// as the rest of the app, in a color reserved for this so it reads as a
// caution rather than blending into the normal red/green UI.
function drawHandClosedWarning(y) {
  y = min(y, height - 74);
  let dockW = min(560, width * 0.84);
  let accent = [255, 176, 32];
  let pulse = 0.5 + 0.5 * sin(millis() * 0.007);

  push();
  drawingContext.direction = "ltr";

  drawGlassPanel(width / 2, y, dockW, 74, 22, accent);

  let iconX = width / 2 - dockW / 2 + 44;
  let iconSize = 32 + pulse * 5;

  noStroke();
  fill(accent[0], accent[1], accent[2], 45 + pulse * 25);
  circle(iconX, y, iconSize * 1.7);

  imageMode(CENTER);
  image(openHandIconAmber, iconX, y, iconSize, iconSize);

  fill(255);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(15);
  let textStartX = width / 2 - dockW / 2 + 76;
  let textMaxWidth = (width / 2 + dockW / 2) - textStartX - 24;
  drawWrappedText(t("keepHandOpenWarning"), textStartX, y, textMaxWidth, 19);

  pop();
}

function drawSliderDock() {
  let layout = getSliderLayout();
  let y = layout.y;
  let handleTargetX = layout.positions[sliderStepIndex];
  sliderDisplayX = sliderDisplayX === null
    ? handleTargetX
    : lerp(sliderDisplayX, handleTargetX, sliderGrabbed ? 0.55 : 0.2);

  push();
  drawingContext.direction = "ltr";

  rectMode(CENTER);
  noStroke();
  fill(5, 6, 9, 205);
  rect(width / 2, y, layout.trackW + 110, 190, 32);
  stroke(255, 255, 255, 24);
  strokeWeight(1);
  noFill();
  rect(width / 2, y, layout.trackW + 110, 190, 32);

  rectMode(CORNER);
  noStroke();
  fill(255, 255, 255, 26);
  rect(layout.x0, y - 6, layout.trackW, 12, 99);

  fill(255, 31, 52, 200);
  rect(layout.x0, y - 6, constrain(sliderDisplayX - layout.x0, 0, layout.trackW), 12, 99);

  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  for (let i = 0; i < layout.positions.length; i++) {
    let px = layout.positions[i];
    noStroke();
    fill(i <= sliderStepIndex ? color(255, 31, 52) : color(255, 255, 255, 70));
    circle(px, y, 20);
    fill(190, 195, 205);
    textSize(17);
    text(DATA_SLIDER_STEPS[i].label, px, y + 46);
  }

  let handleRadius = sliderGrabbed ? 36 : 28;
  let handleY = y - SLIDER_HANDLE_OFFSET_Y;
  noStroke();
  fill(sliderGrabbed ? color(255, 31, 52) : color(255));
  circle(sliderDisplayX, handleY, handleRadius * 2);

  if (sliderGrabbed) {
    noFill();
    stroke(255, 31, 52, 160);
    strokeWeight(3);
    circle(sliderDisplayX, handleY, handleRadius * 2 + 22);
  }

  if (sliderPendingConfirmSince !== null) {
    let confirmProgress = constrain((millis() - sliderPendingConfirmSince) / SLIDER_CONFIRM_WAIT, 0, 1);
    drawSelectionRing(sliderDisplayX, handleY, handleRadius + 16, confirmProgress, [0, 212, 145]);
  }

  noStroke();
  fill(sliderGrabbed ? 255 : 10);
  textStyle(BOLD);
  textSize(20);
  text(formatSliderValue(DATA_SLIDER_STEPS[sliderStepIndex].value), sliderDisplayX, handleY);

  pop();

  if (!sliderGrabbed && sliderPendingConfirmSince === null) {
    drawSliderGestureDrift(layout);
  }

  drawHandCursor(sliderPointerX, sliderPointerY);
}

// Idle teaching loop for the data-amount slider: a ghost hand drifts in
// from the center of the screen (where a resting hand naturally sits) down
// to the handle, hovers, closes into a fist, slides to a nearby step and
// back (to show the drag), then slides once more to the 50GB step and
// opens back up there (to show the release/select) - same technique as
// drawSelectGestureDrift, just linear instead of cycling between targets.
function drawSliderGestureDrift(layout) {
  let sinceEntered = millis() - quizEntryAt - SLIDER_DEMO_START_DELAY;
  if (sinceEntered < 0) return;

  let startIndex = sliderStepIndex;
  let demoTargetIndex = constrain(
    startIndex + (startIndex >= DATA_SLIDER_STEPS.length - 3 ? -3 : 3),
    0,
    DATA_SLIDER_STEPS.length - 1
  );
  let midBackIndex = DATA_SLIDER_STEPS.findIndex((step) => step.value === 10);
  let selectIndex = DATA_SLIDER_STEPS.findIndex((step) => step.value === 50);
  let handleY = layout.y - SLIDER_HANDLE_OFFSET_Y;
  let centerX = width / 2;
  let centerY = height / 2;

  let cycleDuration = SLIDER_DEMO_TRAVEL_TIME + SLIDER_DEMO_OPEN_HOLD +
    SLIDER_DEMO_MORPH + SLIDER_DEMO_SLIDE_TIME + SLIDER_DEMO_FINAL_SLIDE_TIME +
    SLIDER_DEMO_FIST_HOLD + SLIDER_DEMO_MORPH + SLIDER_DEMO_OPEN_HOLD + SLIDER_DEMO_LOOP_PAUSE;
  let localT = sinceEntered % cycleDuration;

  let iconX, iconY;
  let openAlpha = 1;
  let fistAlpha = 0;
  let iconScale = 1;

  if (localT < SLIDER_DEMO_TRAVEL_TIME) {
    let progress = localT / SLIDER_DEMO_TRAVEL_TIME;
    let eased = progress * progress * (3 - 2 * progress);
    iconX = lerp(centerX, layout.positions[startIndex], eased);
    iconY = lerp(centerY, handleY, eased);
  } else {
    iconY = handleY;
    let t2 = localT - SLIDER_DEMO_TRAVEL_TIME;

    if (t2 < SLIDER_DEMO_OPEN_HOLD) {
      iconX = layout.positions[startIndex];
      iconScale = 1 + sin((t2 / SLIDER_DEMO_OPEN_HOLD) * PI) * 0.05;
    } else {
      t2 -= SLIDER_DEMO_OPEN_HOLD;

      if (t2 < SLIDER_DEMO_MORPH) {
        let m = t2 / SLIDER_DEMO_MORPH;
        iconX = layout.positions[startIndex];
        openAlpha = 1 - m;
        fistAlpha = m;
        iconScale = 1 - m * 0.14;
      } else {
        t2 -= SLIDER_DEMO_MORPH;
        openAlpha = 0;
        fistAlpha = 1;

        if (t2 < SLIDER_DEMO_SLIDE_TIME) {
          // Drag forward to demoTargetIndex, then back only partway (to
          // midBackIndex, not all the way to the start) to demonstrate
          // free sliding in both directions.
          let half = SLIDER_DEMO_SLIDE_TIME / 2;
          if (t2 < half) {
            let progress = t2 / half;
            let eased = progress * progress * (3 - 2 * progress);
            iconX = lerp(layout.positions[startIndex], layout.positions[demoTargetIndex], eased);
          } else {
            let progress = (t2 - half) / half;
            let eased = progress * progress * (3 - 2 * progress);
            iconX = lerp(layout.positions[demoTargetIndex], layout.positions[midBackIndex], eased);
          }
          iconScale = 0.86 + sin((t2 / SLIDER_DEMO_SLIDE_TIME) * PI) * 0.05;
        } else {
          t2 -= SLIDER_DEMO_SLIDE_TIME;

          if (t2 < SLIDER_DEMO_FINAL_SLIDE_TIME) {
            // One-way drag to the 50GB step, then hold and release there
            // to demonstrate how a real selection is made.
            let progress = t2 / SLIDER_DEMO_FINAL_SLIDE_TIME;
            let eased = progress * progress * (3 - 2 * progress);
            iconX = lerp(layout.positions[midBackIndex], layout.positions[selectIndex], eased);
            iconScale = 0.86 + sin(progress * PI) * 0.05;
          } else {
            t2 -= SLIDER_DEMO_FINAL_SLIDE_TIME;
            iconX = layout.positions[selectIndex];

            if (t2 < SLIDER_DEMO_FIST_HOLD) {
              iconScale = 0.86;
            } else {
              t2 -= SLIDER_DEMO_FIST_HOLD;

              if (t2 < SLIDER_DEMO_MORPH) {
                let m = t2 / SLIDER_DEMO_MORPH;
                openAlpha = m;
                fistAlpha = 1 - m;
                iconScale = 0.86 + m * 0.14;
              } else {
                openAlpha = 1;
                fistAlpha = 0;
                let holdT = t2 - SLIDER_DEMO_MORPH;
                // Settles flat for the trailing loop pause instead of
                // continuing to oscillate past the intended single pulse.
                iconScale = 1 + sin(constrain(holdT / SLIDER_DEMO_OPEN_HOLD, 0, 1) * PI) * 0.05;
              }
            }
          }
        }
      }
    }
  }

  let iconSize = 84;
  push();
  drawingContext.direction = "ltr";
  imageMode(CENTER);
  noStroke();
  fill(255, 255, 255, 24);
  circle(iconX, iconY, iconSize * 1.3);

  translate(iconX, iconY);
  scale(iconScale);

  if (openAlpha > 0.01) {
    drawingContext.globalAlpha = openAlpha * 0.75;
    image(openHandIconWhite, 0, 0, iconSize, iconSize);
  }
  if (fistAlpha > 0.01) {
    drawingContext.globalAlpha = fistAlpha * 0.75;
    image(fistIconWhite, 0, 0, iconSize, iconSize);
  }
  pop();
}

// Notices the moment the hover-instruction narration clip actually starts
// playing (by watching the shared narration player's current src), so the
// teaching demo can be timed to it instead of a guessed fixed delay.
function updatePriorityDemoTiming() {
  if (priorityInstructionStartedAt !== null) return;

  if (narrationAudio && narrationAudio.src && narrationAudio.src.indexOf("priorityhoverinstruction") !== -1) {
    priorityInstructionStartedAt = millis();
    return;
  }

  // Narration is English-only (see startNarrationClip) and clips can fail
  // to load, so fall back to a fixed delay rather than never showing the
  // demo at all.
  if (millis() - quizEntryAt >= PRIORITY_DEMO_FALLBACK_DELAY) {
    priorityInstructionStartedAt = millis();
  }
}

// Priority pills: same expanding-scale-on-hover + hold-ring-to-confirm
// animation as the plan-selection cards (drawDesktopPlanCards), just laid
// out as a row (or two) of small pills instead of three big cards.
function drawPriorityPills() {
  updatePriorityDemoTiming();

  let layout = getPriorityLayout();
  let options = questions[currentQuestion].options;

  push();
  drawingContext.direction = "ltr";

  for (let i = 0; i < options.length; i++) {
    let pos = layout.positions[i];
    let targetScale = PLAN_HOVER_REST_SCALE;

    if (priorityPointerX !== null) {
      let falloff = constrain(1 - dist(priorityPointerX, priorityPointerY, pos.x, pos.y) / PRIORITY_HOVER_RADIUS, 0, 1);
      targetScale = lerp(PLAN_HOVER_REST_SCALE, PLAN_HOVER_PEAK_SCALE, falloff);
    }

    if (priorityScales[i] === undefined) priorityScales[i] = PLAN_HOVER_REST_SCALE;
    priorityScales[i] = lerp(priorityScales[i], targetScale, 0.28);

    let isLocking = priorityHoverIndex === i;
    let accent = isLocking ? [0, 212, 145] : [255, 31, 52];
    let scaleAmt = priorityScales[i];

    // Same glass-card treatment as the question card and plan cards
    // (gradient fill, drop shadow, accent border + top notch), just sized
    // down to pill scale, so this screen reads as part of the same app.
    drawGlassPanel(pos.x, pos.y, layout.pillW * scaleAmt, layout.pillH * scaleAmt, 22, accent);

    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(constrain(20 * scaleAmt, 15, 24));
    text(options[i][appLanguage], pos.x, pos.y + 2);
  }

  pop();

  if (priorityHoverIndex !== null && millis() >= priorityDelayUntil) {
    let pos = layout.positions[priorityHoverIndex];
    let progress = priorityHoldStartAt === null ? 0 : constrain((millis() - priorityHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);
    drawSelectionRing(pos.x, pos.y, max(layout.pillW, layout.pillH) * 0.62, progress, [0, 212, 145]);
  }

  if (priorityPointerX === null && priorityHoverIndex === null) {
    drawPriorityGestureDrift(layout);
  }

  drawHandCursor(priorityPointerX, priorityPointerY);
}

// Idle teaching loop for the priority pills: a ghost hand drifts in from
// the center of the screen, hovers a pill, closes into a fist and holds,
// then reopens - the same hover/grab/hold-to-select gesture as the plan
// cards on the results screen (and reusing its own demo timing constants),
// just cycling through a different pill each time it loops. Timed to
// start alongside the hover-instruction narration clip (see
// updatePriorityDemoTiming) rather than a fixed delay.
function drawPriorityGestureDrift(layout) {
  if (priorityInstructionStartedAt === null) return;

  let options = questions[currentQuestion].options;
  let numOptions = options.length;
  if (numOptions === 0) return;

  let sinceEntered = millis() - priorityInstructionStartedAt;

  let cycleDuration = SELECT_DRIFT_DURATION + SELECT_DEMO_OPEN_HOLD + SELECT_DEMO_MORPH +
    SELECT_DEMO_FIST_HOLD + SELECT_DEMO_MORPH + PRIORITY_DEMO_LOOP_PAUSE;
  let macroCycle = Math.floor(sinceEntered / cycleDuration);
  let localT = sinceEntered - macroCycle * cycleDuration;
  let targetIndex = macroCycle % numOptions;
  let targetPos = layout.positions[targetIndex];
  let centerX = width / 2;
  let centerY = height / 2;

  let iconX, iconY;
  let openAlpha = 1;
  let fistAlpha = 0;
  let iconScale = 1;

  if (localT < SELECT_DRIFT_DURATION) {
    let progress = localT / SELECT_DRIFT_DURATION;
    let eased = progress * progress * (3 - 2 * progress);
    iconX = lerp(centerX, targetPos.x, eased);
    iconY = lerp(centerY, targetPos.y, eased);
  } else {
    iconX = targetPos.x;
    iconY = targetPos.y;
    let t2 = localT - SELECT_DRIFT_DURATION;

    if (t2 < SELECT_DEMO_OPEN_HOLD) {
      iconScale = 1 + sin((t2 / SELECT_DEMO_OPEN_HOLD) * PI) * 0.05;
    } else {
      t2 -= SELECT_DEMO_OPEN_HOLD;

      if (t2 < SELECT_DEMO_MORPH) {
        let m = t2 / SELECT_DEMO_MORPH;
        openAlpha = 1 - m;
        fistAlpha = m;
        iconScale = 1 - m * 0.14;
      } else {
        t2 -= SELECT_DEMO_MORPH;
        openAlpha = 0;
        fistAlpha = 1;

        if (t2 < SELECT_DEMO_FIST_HOLD) {
          iconScale = 0.86 + sin(constrain(t2 / SELECT_DEMO_FIST_HOLD, 0, 1) * PI) * 0.05;
        } else {
          t2 -= SELECT_DEMO_FIST_HOLD;

          if (t2 < SELECT_DEMO_MORPH) {
            let m = t2 / SELECT_DEMO_MORPH;
            openAlpha = m;
            fistAlpha = 1 - m;
            iconScale = 0.86 + m * 0.14;
          } else {
            // Settles flat for the trailing loop pause.
            openAlpha = 1;
            fistAlpha = 0;
            iconScale = 1;
          }
        }
      }
    }
  }

  let iconSize = 84;
  push();
  drawingContext.direction = "ltr";
  imageMode(CENTER);
  noStroke();
  fill(255, 255, 255, 24);
  circle(iconX, iconY, iconSize * 1.3);

  translate(iconX, iconY);
  scale(iconScale);

  if (openAlpha > 0.01) {
    drawingContext.globalAlpha = openAlpha * 0.75;
    image(openHandIconWhite, 0, 0, iconSize, iconSize);
  }
  if (fistAlpha > 0.01) {
    drawingContext.globalAlpha = fistAlpha * 0.75;
    image(fistIconWhite, 0, 0, iconSize, iconSize);
  }
  pop();
}

// A brand-red hand icon that tracks the live hand position, so the user
// can see exactly what they're pointing at while hovering - swaps between
// the open and fist shape to match the real gesture. Used on both the
// priority pills and the plan-selection cards.
function drawHandCursor(x, y) {
  if (x === null || y === null) return;

  let rightHand = getRightHand();
  let isFisted = rightHand && isFist(rightHand);
  let icon = isFisted ? fistIconRed : openHandIconRed;
  let size = 70;

  push();
  imageMode(CENTER);
  noStroke();
  fill(255, 31, 52, 35);
  circle(x, y, size * 1.35);
  image(icon, x, y, size, size);
  pop();
}

function drawThumbsDownBackHint(y) {
  y = min(y, height - 30);
  let holdProgress = thumbsDownSince !== null
    ? constrain((millis() - thumbsDownSince) / THUMBS_DOWN_HOLD_TIME, 0, 1)
    : 0;

  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(12);
  fill(holdProgress > 0 ? lerpColor(color(190, 195, 205), color(255, 31, 52), holdProgress) : color(190, 195, 205, 190));
  drawWrappedText(
    holdProgress > 0 ? t("thumbsDownHoldingBack") : t("thumbsDownToGoBack"),
    width / 2,
    y,
    min(420, width * 0.82),
    16
  );
}

function drawSelectHint(y) {
  y = min(y, height - 30);
  let holdProgress = selectHoldStartAt === null
    ? 0
    : constrain((millis() - selectHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);

  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(12);
  fill(holdProgress > 0 ? lerpColor(color(190, 195, 205), color(255, 31, 52), holdProgress) : color(190, 195, 205, 190));
  text(
    holdProgress > 0 ? t("selectHolding") : t("selectHint"),
    width / 2,
    y
  );
}

// Loops an open-hand icon drifting between the card positions, pausing over
// each one, closing into a fist for a beat, then reopening and moving on to
// the next card - teaches the hover/grab-to-select gesture in place, on top
// of the actual cards, rather than as a static icon off to the side.
function drawSelectGestureDrift(layout) {
  let numCards = layout.positions.length;
  if (numCards === 0) return;

  let sinceEntered = millis() - stateEnteredAt - SELECT_DEMO_START_DELAY;
  if (sinceEntered < 0) return;

  // Each macro-cycle: hover past every card in order without grabbing
  // (a "scan"), then return to that cycle's target card and close the fist
  // on it. The target advances one card each cycle (0, then 1, then 2, ...)
  // so it doesn't look like every hover ends in a grab.
  let holdCycle = SELECT_DEMO_OPEN_HOLD + SELECT_DEMO_MORPH + SELECT_DEMO_FIST_HOLD + SELECT_DEMO_MORPH;
  let sweepSegment = SELECT_DRIFT_DURATION + SWEEP_DWELL;
  let grabSegment = SELECT_DRIFT_DURATION + holdCycle;
  let macroCycleDuration = sweepSegment * numCards + grabSegment;

  let macroCycle = Math.floor(sinceEntered / macroCycleDuration);
  let localElapsed = sinceEntered - macroCycle * macroCycleDuration;
  let targetIndex = macroCycle % numCards;
  let prevTargetIndex = (macroCycle - 1 + numCards) % numCards;

  let stopIndices = [];
  let segmentDurations = [];
  for (let i = 0; i < numCards; i++) {
    stopIndices.push(i);
    segmentDurations.push(sweepSegment);
  }
  stopIndices.push(targetIndex);
  segmentDurations.push(grabSegment);

  let stop = 0;
  let cursor = 0;
  while (stop < segmentDurations.length - 1 && localElapsed >= cursor + segmentDurations[stop]) {
    cursor += segmentDurations[stop];
    stop++;
  }
  let localT = localElapsed - cursor;
  let toIndex = stopIndices[stop];
  let isGrabStop = stop === stopIndices.length - 1;
  let fromIndex = stop === 0
    ? (macroCycle === 0 ? toIndex : prevTargetIndex)
    : stopIndices[stop - 1];

  let iconSize = constrain(layout.cardW * 0.24, 62, 98);
  let iconY = layout.centerY;
  let iconX;
  let openAlpha = 1;
  let fistAlpha = 0;
  let iconScale = 1;
  let baseAlpha;

  if (localT < SELECT_DRIFT_DURATION) {
    let progress = localT / SELECT_DRIFT_DURATION;
    let eased = progress * progress * (3 - 2 * progress);
    iconX = lerp(layout.positions[fromIndex], layout.positions[toIndex], eased);
    baseAlpha = 0.55;
  } else {
    iconX = layout.positions[toIndex];
    let holdT = localT - SELECT_DRIFT_DURATION;

    if (!isGrabStop) {
      // Just passing over this card while scanning - open hand only.
      baseAlpha = 0.65;
      openAlpha = 1;
      fistAlpha = 0;
      iconScale = 1 + sin(constrain(holdT / SWEEP_DWELL, 0, 1) * PI) * 0.04;
    } else {
      baseAlpha = 0.82;
      let openEnd = SELECT_DEMO_OPEN_HOLD;
      let morph1End = openEnd + SELECT_DEMO_MORPH;
      let fistEnd = morph1End + SELECT_DEMO_FIST_HOLD;

      if (holdT < openEnd) {
        openAlpha = 1;
        fistAlpha = 0;
        iconScale = 1 + sin((holdT / openEnd) * PI) * 0.05;
      } else if (holdT < morph1End) {
        let m = (holdT - openEnd) / SELECT_DEMO_MORPH;
        openAlpha = 1 - m;
        fistAlpha = m;
        iconScale = 1 - m * 0.14;
      } else if (holdT < fistEnd) {
        let localHold = (holdT - morph1End) / SELECT_DEMO_FIST_HOLD;
        openAlpha = 0;
        fistAlpha = 1;
        iconScale = 0.86 + sin(localHold * PI) * 0.05;
      } else {
        let m = (holdT - fistEnd) / SELECT_DEMO_MORPH;
        openAlpha = m;
        fistAlpha = 1 - m;
        iconScale = 0.86 + m * 0.14;
      }
    }
  }

  push();
  drawingContext.direction = "ltr";
  imageMode(CENTER);
  noStroke();
  fill(255, 255, 255, 24);
  circle(iconX, iconY, iconSize * 1.3);

  translate(iconX, iconY);
  scale(iconScale);

  if (openAlpha > 0.01) {
    drawingContext.globalAlpha = openAlpha * baseAlpha;
    image(openHandIconWhite, 0, 0, iconSize, iconSize);
  }
  if (fistAlpha > 0.01) {
    drawingContext.globalAlpha = fistAlpha * baseAlpha;
    image(fistIconWhite, 0, 0, iconSize, iconSize);
  }
  pop();
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

function drawGestureDock(y, displayX, leftLabel, rightLabel, leftColor, rightColor) {
  if (leftLabel === undefined) leftLabel = `←  ${t("no")}`;
  if (rightLabel === undefined) rightLabel = `${t("yes")}  →`;
  if (leftColor === undefined) leftColor = [255, 72, 90];
  if (rightColor === undefined) rightColor = [0, 212, 145];
  let dockW = min(560, width * 0.84);
  y = min(y, height - 74);
  push();
  drawingContext.direction = "ltr";
  rectMode(CENTER);
  noStroke();
  fill(5, 6, 9, 205);
  rect(width / 2, y, dockW, 70, 24);
  stroke(255, 255, 255, 24);
  strokeWeight(1);
  noFill();
  rect(width / 2, y, dockW, 70, 24);

  if (leftLabel !== null && rightLabel !== null) {
    noStroke();
    fill(leftColor[0], leftColor[1], leftColor[2]);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(18);
    text(leftLabel, width / 2 - dockW / 2 + 30, y);

    fill(rightColor[0], rightColor[1], rightColor[2]);
    textAlign(RIGHT, CENTER);
    text(rightLabel, width / 2 + dockW / 2 - 30, y);
  }

  let trackW = 118;
  let dotRadius = 5;
  let indicatorX = constrain(displayX, -(trackW / 2 - dotRadius - 1), trackW / 2 - dotRadius - 1);
  noStroke();
  fill(255, 255, 255, 20);
  rect(width / 2, y, trackW, 42, 999);
  fill(255);
  circle(width / 2 + indicatorX, y, dotRadius * 2);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(11);
  fill(190, 195, 205);
  text(t("swipeDock"), width / 2, y + 22);
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
  drawEyebrow(t("personalizedShortlist"), width / 2, 92);
  fill(255);
  textStyle(BOLD);
  textSize(min(38, width * 0.065));
  text(
    selectedPlanType === "home" ? t("homePackagesPickedTitle") : t("mobilePackagesPickedTitle"),
    width / 2,
    128
  );
  fill(185, 190, 200);
  textStyle(NORMAL);
  textSize(14.5);
  text(t("rankedSubtitle"), width / 2, 160);
  pop();

  if (width >= 760) {
    drawDesktopPlanCards();

    if (selectedPlanIndex === null) {
      drawSelectHint(height - 46);
    } else if (millis() >= resultFistBackDelayUntil) {
      drawThumbsDownBackHint(height - 46);
    }
  } else {
    drawMobilePlanCards();
  }

  fill(175, 180, 190);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(12);
  text(t("pricesFootnote"), width / 2, height - 24);

  drawRestartButton();
}

function drawDesktopPlanCards() {
  selectedCardScreenRect = null;

  let layout = getDesktopPlanLayout();
  let cardW = layout.cardW;
  let cardH = layout.cardH;
  let centerY = layout.centerY;

  let cards = [];

  for (let i = 0; i < recommendedPlans.length; i++) {
    let gridX = layout.positions[i];
    let isSelected = selectedPlanIndex === i;
    let targetScale = PLAN_HOVER_REST_SCALE;

    if (isSelected) {
      targetScale = SELECT_EXPANDED_SCALE;
    } else if (planHoverX !== null) {
      let falloff = constrain(1 - abs(planHoverX - gridX) / PLAN_HOVER_RADIUS, 0, 1);
      targetScale = lerp(PLAN_HOVER_REST_SCALE, PLAN_HOVER_PEAK_SCALE, falloff);
    }

    let targetX = isSelected ? width / 2 : gridX;
    let targetAlpha = selectedPlanIndex === null || isSelected ? 1 : 0;

    if (planCardScales[i] === undefined) planCardScales[i] = PLAN_HOVER_REST_SCALE;
    if (planCardX[i] === undefined) planCardX[i] = gridX;
    if (planCardAlpha[i] === undefined) planCardAlpha[i] = 1;

    planCardScales[i] = lerp(planCardScales[i], targetScale, isSelected ? 0.1 : 0.28);
    planCardX[i] = lerp(planCardX[i], targetX, 0.1);
    planCardAlpha[i] = lerp(planCardAlpha[i], targetAlpha, 0.14);

    cards.push({
      index: i,
      x: planCardX[i],
      scale: planCardScales[i],
      alpha: planCardAlpha[i],
      selected: isSelected
    });
  }

  cards.sort((a, b) => a.scale - b.scale);

  for (let card of cards) {
    if (card.alpha < 0.01) continue;
    drawPlanCard(recommendedPlans[card.index], card.index, card.x, centerY, cardW, cardH, card.scale, card.alpha, card.selected);
  }

  if (selectHoverIndex !== null && selectedPlanIndex === null && millis() >= selectDelayUntil) {
    let ringX = layout.positions[selectHoverIndex];
    let progress = selectHoldStartAt === null ? 0 : constrain((millis() - selectHoldStartAt) / SELECT_HOLD_DURATION, 0, 1);
    let accent = selectHoverIndex === 0 ? [0, 212, 145] : selectHoverIndex === 1 ? [255, 64, 82] : [152, 118, 255];
    drawSelectionRing(ringX, centerY, min(cardW, cardH) * 0.24, progress, accent);
  }

  // Pause the teaching demo the moment a real hand is tracked (moving
  // between cards, not just fisted-and-hovering) so it doesn't fight the
  // user's own motion for attention - resumes on its own once the hand is
  // gone, picking back up wherever its endless loop naturally is by then.
  if (selectedPlanIndex === null && selectHoverIndex === null && planHoverX === null) {
    drawSelectGestureDrift(layout);
  }

  if (selectedPlanIndex === null) {
    drawHandCursor(planHoverX, planHoverY);
  }
}

function drawSelectionRing(x, y, radius, progress, accent) {
  push();
  noFill();
  stroke(0, 0, 0, 120);
  strokeWeight(8);
  circle(x, y, radius * 2);

  stroke(255, 255, 255, 45);
  strokeWeight(5);
  circle(x, y, radius * 2);

  stroke(accent[0], accent[1], accent[2]);
  strokeWeight(5);
  strokeCap(ROUND);
  noFill();
  arc(x, y, radius * 2, radius * 2, -HALF_PI, -HALF_PI + TWO_PI * progress);
  pop();
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

function drawPlanCard(plan, rank, x, y, cardW, cardH, hoverScale = 1, alpha = 1, selected = false) {
  if (!plan) return;

  let entrance = easeOutBack(
    constrain((millis() - stateEnteredAt - 170 - rank * 120) / 620, 0, 1)
  );
  if (entrance <= 0) return;

  let accent = rank === 0 ? [0, 212, 145] : rank === 1 ? [255, 64, 82] : [152, 118, 255];
  let effectiveScale = (0.88 + entrance * 0.12) * hoverScale;
  let cardCenterY = y + (1 - entrance) * 48;

  if (selected) {
    selectedCardScreenRect = {
      x: x,
      y: cardCenterY,
      w: cardW * effectiveScale,
      h: cardH * effectiveScale
    };
  }

  push();
  drawingContext.globalAlpha = constrain(entrance, 0, 1) * constrain(alpha, 0, 1);
  translate(x, cardCenterY);
  scale(effectiveScale);
  drawGlassPanel(0, 0, cardW, cardH, 28, accent);

  rectMode(CENTER);
  noStroke();
  fill(accent[0], accent[1], accent[2]);
  rect(0, -cardH / 2 + 30, selected ? 150 : rank === 0 ? 126 : 88, 28, 999);
  fill(rank === 0 || selected ? 4 : 255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(10.5);
  text(selected ? t("selectedBadge") : rank === 0 ? t("bestMatch") : t("optionN", { n: rank + 1 }), 0, -cardH / 2 + 30);

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
  text(t("perMonth"), 0, -cardH / 2 + 166);

  let metricStart = -cardH / 2 + 205;
  let metricGap = min(39, (cardH - 225) / 4);
  if (selectedPlanType === "home") {
    drawPlanMetric(t("internetLabel"), plan.speed, 0, metricStart, cardW);
    drawPlanMetric(t("tvLabel"), plan.tv, 0, metricStart + metricGap, cardW);
    drawPlanMetric(t("benefitsLabel"), plan.benefits, 0, metricStart + metricGap * 2, cardW);
    drawPlanMetric(t("commitmentLabel"), translateCommitment(plan.commitment), 0, metricStart + metricGap * 3, cardW);
  } else {
    drawPlanMetric(t("dataLabel"), plan.data, 0, metricStart, cardW);
    drawPlanMetric(t("speedLabel"), plan.speed, 0, metricStart + metricGap, cardW);
    drawPlanMetric(t("minutesLabel"), plan.minutes, 0, metricStart + metricGap * 2, cardW);
    drawPlanMetric(t("roamingLabel"), plan.roaming, 0, metricStart + metricGap * 3, cardW);
  }

  let footerY = cardH / 2 - 26;
  fill(accent[0], accent[1], accent[2], 24);
  rect(0, footerY, cardW - 34, 38, 13);
  fill(accent[0], accent[1], accent[2]);
  textStyle(BOLD);
  textSize(11.5);
  let matchLabel = answers.length > 0
    ? t("preferenceMatch", { pct: plan.matchPercent })
    : t("bestValueMatch");
  text(`${matchLabel}  ·  ${translateCommitment(plan.commitment)}`, 0, footerY);
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
  text(t("perMonth"), 0, 43);
  pop();
}

function restartExperience() {
  stopNarration();
  appState = "welcome";
  // Always greet the next person in English, regardless of what the
  // previous person picked - the language screen still lets them switch.
  appLanguage = "en";
  updatePlanTypeButtonLabels();
  updateQrLabel();
  currentQuestion = 0;
  answers = [];
  bestPlan = null;
  recommendedPlans = [];
  selectedPlanType = null;
  questions = mobileQuestions;
  plans = mobilePlans;
  planHoverX = null;
  planHoverY = null;
  planCardScales = [];
  planCardX = [];
  planCardAlpha = [];
  selectHoverIndex = null;
  selectDelayUntil = 0;
  selectHoldStartAt = null;
  selectLossSince = null;
  selectedPlanIndex = null;
  resultFistBackDelayUntil = 0;
  planSelectResumeDelayUntil = 0;
  stopChargeSound();
  restartHoverSince = null;
  restartHoldStartAt = null;
  welcomeGestureLockedUntil = millis() + RESTART_GESTURE_LOCK;
  resultStarted = false;
  confettiPieces = [];
  quizTransition = null;
  questionNeedsCalibration = true;
  loadingStartTime = null;
  calibratedRightX = null;
  thumbsDownSince = null;
  handClosedWarningActive = false;
  resetSwipeSmoothing();
  resetSliderState();
  resetPriorityState();
  rightHandReadySince = null;
  thumbsUpSince = null;
  languageGestureType = null;
  languageGestureSince = null;
  backGestureStartTime = null;
  backGesturePracticed = false;
  practiceStep = "right";
  practiceStepEnteredAt = millis();
  practiceResetUntil = 0;
  practiceIndicatorTarget = 0;
  practiceIndicatorX = 0;
  instructionsStartTime = null;
  readyStartTime = null;
  lastSwipeTime = 0;
  stateEnteredAt = millis();
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

// GB capacity for a plan, for comparison against the data-amount slider
// answer. Plans already tagged "unlimitedData" in features are truly
// unlimited; numeric tiers are parsed straight from the data string (e.g.
// "40GB local data"). Plans with neither (the speed-capped "Non-Stop"
// tier) have no quantified cap, so they can't be verified against a
// specific GB requirement and return null.
function getPlanDataGb(plan) {
  if (plan.features.includes("unlimitedData")) return Infinity;

  let match = /(\d+)\s*GB/i.exec(plan.data);
  return match ? parseInt(match[1], 10) : null;
}

function getDataGbMatchScore(plan, requiredGb) {
  let planGb = getPlanDataGb(plan);
  if (planGb === null) return 0;
  if (requiredGb === Infinity) return planGb === Infinity ? 1 : 0;
  return planGb >= requiredGb ? 1 : 0;
}

// The priority question is a bonus multiplier on top of a plan's normal
// match score, not a separate hard requirement - it amplifies whichever
// dimension the user says matters most (using the same signals the other
// questions already produce), and "all equal" contributes nothing.
function getPriorityBonusScore(plan, priorityKey) {
  if (priorityKey === "cheap") return plan.features.includes("cheap") ? 1 : 0;
  if (priorityKey === "fastSpeed") return plan.features.includes("fastSpeed") ? 1 : 0;
  if (priorityKey === "roaming") return plan.features.includes("roaming") ? 1 : 0;

  if (priorityKey === "minutes") {
    return (plan.features.includes("localMinutes") || plan.features.includes("flexiMinutes")) ? 1 : 0;
  }

  if (priorityKey === "dataGb") {
    let dataAnswer = answers.find((answer) => answer && answer.tag === "dataGb");
    return dataAnswer ? getDataGbMatchScore(plan, dataAnswer.value) : 0;
  }

  return 0;
}

function getRecommendedPlans(limit = 3) {
  return plans
    .map((plan) => {
      let score = answers.reduce((total, answer) => {
        if (typeof answer === "string") {
          return total + (plan.features.includes(answer) ? 1 : 0);
        }

        if (answer && answer.tag === "dataGb") {
          return total + getDataGbMatchScore(plan, answer.value);
        }

        if (answer && answer.tag === "priority") {
          return total + getPriorityBonusScore(plan, answer.key) * PRIORITY_BONUS_WEIGHT;
        }

        return total;
      }, 0);

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
