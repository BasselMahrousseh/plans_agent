window.detections = {};
window.videoElement = document.getElementById("video");

const hands = new Hands({
  locateFile: function(file) {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.6
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
  width: 640,
  height: 480
});

camera.start();