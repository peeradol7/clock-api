const express = require('express');
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone'); // นำเข้า moment-timezone

const app = express();
app.use(cors());
app.use(express.json());

// Static files
app.use('/Clock', express.static(path.join(__dirname, 'Clock')));

// Clock images
const clockImages = Array.from({ length: 20 }, (_, index) =>
  `clock${index + 2}-removebg-preview.png`
);

// Inner numbers
const innerNumbers = [
  "๔", "๗", "๑", "๒", "๔", "๗", "๗", "๑",
  "๖", "๕", "๕", "๕", "๓", "๒", "๔", "๑",
  "๖", "๓", "๖", "๓", "๒"
];

// Current state variables
let currentImageIndex = 0;
let rotationCounter = 0;

// Calculate initial rotation time (23:56 in Asia/Bangkok)
let initialRotationTime = moment.tz('8:00', 'HH:mm', 'Asia/Bangkok');
if (initialRotationTime.isBefore(moment())) {
  initialRotationTime.add(1, 'day'); // เพิ่มวันถ้าผ่านเวลา 23:56 ของวันนี้
}
let nextRotationTime = initialRotationTime.valueOf();

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

    // Rotate image index
    currentImageIndex = (currentImageIndex + 1) % clockImages.length;

    // Rotate numbers
    rotateInnerNumbers();

    // Calculate the next rotation time (1360 minutes later)
    nextRotationTime += 1360 * 60 * 1000; // 1360 minutes in milliseconds
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
    timestamp: moment().tz('Asia/Bangkok').format(), // Current time in Bangkok
    rotationCounter: rotationCounter,
    nextRotationTime: moment(nextRotationTime).tz('Asia/Bangkok').format() // Next rotation time in Bangkok
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
