let video;
let handPose;
let hands = [];
let lastCheckTime = 0;
let run = 0;
let totalScore = 0;
let randomNum = 0;
let gameMessage = "";

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  handPose.detectStart(video, gotHands);
  textSize(20);
  textAlign(LEFT, TOP);
}

function draw() {
  image(video, 0, 0);
  fill(255);
  noStroke();

  if (hands.length > 0) {
    let hand = hands[0];

    if (hand.confidence > 0.6) {
      // Draw hand keypoints
      for (let kp of hand.keypoints) {
        circle(kp.x, kp.y, 10);
      }

      // Check every 3 seconds
      if (millis() - lastCheckTime > 3000) {
        run = detectRun(hand);
        randomNum = int(random(1, 7)); // random number between 1–6

        if (run === randomNum && run !== 0) {
          gameMessage = "OUT!";
           // reset score
        } else {
          if (run > 0) totalScore += run;
          gameMessage = `You scored ${run} run(s)!`;
        }

        lastCheckTime = millis();
      }
    }
  }

  // Display info
  fill(0, 255, 0);
  text(`Your Run: ${run}`, 20, 20);
  text(`Random Number: ${randomNum}`, 20, 50);
  text(`Total Score: ${totalScore}`, 20, 80);
  text(`Status: ${gameMessage}`, 20, 110);
}

// Function to detect run based on raised fingers
function detectRun(hand) {
  let keypoints = {};
  for (let kp of hand.keypoints) {
    keypoints[kp.name] = kp;
  }

  // Determine raised fingers
  let raised = {
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false
  };

  // Thumb (x comparison since thumb moves sideways)
  raised.thumb = keypoints["thumb_tip"].x > keypoints["thumb_ip"].x;

  // Other fingers (y comparison, tip above mcp)
  raised.index = keypoints["index_finger_tip"].y < keypoints["index_finger_mcp"].y;
  raised.middle = keypoints["middle_finger_tip"].y < keypoints["middle_finger_mcp"].y;
  raised.ring = keypoints["ring_finger_tip"].y < keypoints["ring_finger_mcp"].y;
  raised.pinky = keypoints["pinky_finger_tip"].y < keypoints["pinky_finger_mcp"].y;

  // Apply cricket scoring rules
  if (raised.thumb && !raised.index && !raised.middle && !raised.ring && !raised.pinky) {
    return 6;
  } else if (raised.index && !raised.middle && !raised.ring && !raised.pinky) {
    return 1;
  } else if (raised.index && raised.middle && !raised.ring && !raised.pinky) {
    return 2;
  } else if (raised.index && raised.middle && raised.ring && !raised.pinky) {
    return 3;
  } else if (raised.index && raised.middle && raised.ring && raised.pinky && !raised.thumb) {
    return 4;
  } else if (raised.index && raised.middle && raised.ring && raised.pinky && raised.thumb) {
    return 5;
  } else {
    return 0; // no valid gesture
  }
}
