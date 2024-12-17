const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ข้อมูลรูปภาพ
const clockImages = Array.from({length: 20}, (_, index) => 
  `./Clock/clock${index + 2}-removebg-preview.png`
);

// เลขไทย
const innerNumbers = [
  "๔", "๗", "๑", "๒", "๔", "๗", "๗", "๑", 
  "๖", "๕", "๕", "๕", "๓", "๒", "๔", "๑", 
  "๖", "๓", "๖", "๓", "๒"
];

// ตัวแปรเก็บสถานะปัจจุบัน
let currentImageIndex = 2;
let currentNumberIndex = 0;
let rotationCounter = 0;

function rotateClockData() {
  // นับรอบการหมุน
  rotationCounter++;

  // สลับรูปทุก 5 วินาที
  currentImageIndex = (currentImageIndex + 1) % clockImages.length;

  // สลับตำแหน่งเลขทุก 10 วินาที
  if (rotationCounter % 2 === 0) {
    currentNumberIndex = (currentNumberIndex + 1) % innerNumbers.length;
  }

  // รีเซ็ตตัวนับเมื่อถึง 10
  if (rotationCounter >= 10) {
    rotationCounter = 0;
  }
}

// สร้าง Interval เพื่อหมุนข้อมูล
setInterval(rotateClockData, 5000);

app.get('/clock-data', (req, res) => {
  res.json({
    image: clockImages[currentImageIndex],
    numbers: {
      current: innerNumbers[currentNumberIndex],
      fullList: innerNumbers
    },
    timestamp: new Date().toISOString(),
    rotationCounter: rotationCounter
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