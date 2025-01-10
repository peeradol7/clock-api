const express = require('express');
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Static files
const staticDir = path.join(__dirname, 'Clock');
if (fs.existsSync(staticDir)) {
  app.use('/Clock', express.static(staticDir));
} else {
  console.warn("Static directory 'Clock' not found. Static files will not be served.");
}

// Clock images and inner numbers
const clockImages = Array.from({ length: 20 }, (_, index) => `clock${index + 2}-removebg-preview.png`);
const innerNumbers = [
  "๔", "๗", "๑", "๒", "๔", "๗", "๗", "๑",
  "๖", "๕", "๕", "๕", "๓", "๒", "๔", "๑",
  "๖", "๓", "๖", "๓", "๒"
];

// Current state variables
let currentImageIndex = 0;
let rotationCounter = 0;

// Calculate initial rotation time (23:56 in Asia/Bangkok)
let initialRotationTime = moment.tz('Asia/Bangkok').startOf('hour').add(1, 'hour');
let nextRotationTime = initialRotationTime.valueOf();
if (initialRotationTime.isBefore(moment())) {
  initialRotationTime.add(1, 'day');
}

// Rotate numbers
function rotateInnerNumbers() {
  const firstNumber = innerNumbers.shift();
  innerNumbers.push(firstNumber);
}

// Function to rotate data
function rotateClockData() {
  const now = Date.now();

  // Check if it's time to rotate
  if (now >= nextRotationTime) {
    rotationCounter++;
    currentImageIndex = (currentImageIndex + 1) % clockImages.length;
    rotateInnerNumbers();
    nextRotationTime += 60 * 60 * 1000; // 1 hour in milliseconds
  }
}

// Polling interval to check rotation
setInterval(rotateClockData, 1000);

// Endpoint to fetch current clock data
app.get('/clock-data', (req, res) => {
  res.json({
    image: clockImages[currentImageIndex],
    numbers: {
      current: innerNumbers.slice(0, 21)
    },
    timestamp: moment().tz('Asia/Bangkok').format(),
    rotationCounter: rotationCounter,
    nextRotationTime: moment(nextRotationTime).tz('Asia/Bangkok').format()
  });
});

// Endpoint to fetch initial data
app.get('/initial-data', (req, res) => {
  res.json({
    images: clockImages,
    numbers: innerNumbers
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error logging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
