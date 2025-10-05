// --- sketch.js (MODIFIED) ---

let video;
let handPose;
let hands = [];
let lastCheckTime = 0;
let run = 0;
let totalScore = 0;
let randomNum = 0;
// Changed initial message for clarity
let gameMessage = "Show your hand to start!";

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  let canvas = createCanvas(640, 480);
  // This line makes sure the canvas is placed inside our <main> tag
  canvas.parent(document.querySelector('main')); 
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  if (hands.length > 0) {
    let hand = hands[0];
    if (hand.confidence > 0.6) {
      for (let kp of hand.keypoints) {
        fill(255);
        noStroke();
        circle(kp.x, kp.y, 10);
      }

      if (millis() - lastCheckTime > 3000) {
        run = detectRun(hand);
        randomNum = int(random(1, 7));

        if (run === randomNum && run !== 0) {
          gameMessage = "OUT!";
          totalScore = 0; // Reset score on out
        } else {
          if (run > 0) {
             totalScore += run;
             gameMessage = `You scored ${run} run(s)!`;
          } else {
             gameMessage = "Show a valid number (1-6).";
          }
        }
        lastCheckTime = millis();
      }
    }
  }

  // --- REMOVED ---
  // The old code that drew text ON the canvas is deleted from here.

  // --- ADDED ---
  // Update the new HTML dashboard elements
  updateDashboard();
}

function updateDashboard() {
  // These functions select the HTML elements by their ID and update the text
  document.getElementById('your-run').innerText = run;
  document.getElementById('cpu-run').innerText = randomNum;
  document.getElementById('total-score').innerText = totalScore;
  document.getElementById('status').innerText = gameMessage;
}

// Function to detect run based on raised fingers (Unchanged)
function detectRun(hand) {
  let keypoints = {};
  for (let kp of hand.keypoints) {
    keypoints[kp.name] = kp;
  }
  let raised = {
    thumb: keypoints["thumb_tip"].x < keypoints["thumb_ip"].x,
    index: keypoints["index_finger_tip"].y < keypoints["index_finger_mcp"].y,
    middle: keypoints["middle_finger_tip"].y < keypoints["middle_finger_mcp"].y,
    ring: keypoints["ring_finger_tip"].y < keypoints["ring_finger_mcp"].y,
    pinky: keypoints["pinky_finger_tip"].y < keypoints["pinky_finger_mcp"].y
  };
  if (raised.thumb && !raised.index && !raised.middle && !raised.ring && !raised.pinky) return 6;
  if (raised.index && !raised.middle && !raised.ring && !raised.pinky) return 1;
  if (raised.index && raised.middle && !raised.ring && !raised.pinky) return 2;
  if (raised.index && raised.middle && raised.ring && !raised.pinky) return 3;
  if (raised.index && raised.middle && raised.ring && raised.pinky && !raised.thumb) return 4;
  if (raised.index && raised.middle && raised.ring && raised.pinky && raised.thumb) return 5;
  return 0;
}
