window.detections = {};
window.videoElement = document.getElementById("video");

const hands = new Hands({
  locateFile: function(file) {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.65,
  minTrackingConfidence: 0.7
});

hands.onResults(function(results) {
  window.detections = results;
});

const camera = new Camera(window.videoElement, {
  onFrame: async function() {
    await hands.send({
      image: window.videoElement
    });
  },
  width: 1280,
  height: 720
});

camera.start();
