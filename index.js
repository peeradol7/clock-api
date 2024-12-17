const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (images) from the "Clock" folder
app.use('/Clock', express.static(path.join(__dirname, 'Clock')));

// Image and number data
const clockImages = Array.from({ length: 20 }, (_, index) =>
  `clock${index + 2}-removebg-preview.png`
);

const innerNumbers = [
  "๔", "๗", "๑", "๒", "๔", "๗", "๗", "๑", 
  "๖", "๕", "๕", "๕", "๓", "๒", "๔", "๑", 
  "๖", "๓", "๖", "๓", "๒"
];

// Current state variables
let currentImageIndex = 2;
let currentNumberIndex = 0;
let rotationCounter = 0;

// Calculate the initial rotation time (23:56)
const initialRotationTime = new Date();
initialRotationTime.setHours(23, 56, 0, 0);

// Ensure the initial time is in the future
if (initialRotationTime < new Date()) {
  initialRotationTime.setDate(initialRotationTime.getDate() + 1);
}

let nextRotationTime = initialRotationTime.getTime();

// Function to rotate data
function rotateClockData() {
  const now = Date.now();

  // Check if it's time to rotate
  if (now >= nextRotationTime) {
    // Rotate image and numbers
    rotationCounter++;
    currentImageIndex = (currentImageIndex + 1) % clockImages.length;

    if (rotationCounter % 2 === 0) {
      currentNumberIndex = (currentNumberIndex + 1) % innerNumbers.length;
    }

    // Calculate the next rotation time (1360 minutes later)
    nextRotationTime += 1360 * 60 * 1000; // 1360 minutes in milliseconds
  }
}

// Polling interval to check rotation
setInterval(rotateClockData, 1000);

app.get('/clock-data', (req, res) => {
  res.json({
    image: clockImages[currentImageIndex],
    numbers: {
      current: innerNumbers[currentNumberIndex],
      fullList: innerNumbers
    },
    timestamp: new Date().toISOString(),
    rotationCounter: rotationCounter,
    nextRotationTime: new Date(nextRotationTime).toISOString()
  });
});

app.get('/initial-data', (req, res) => {
  res.json({
    images: clockImages,
    numbers: innerNumbers
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
