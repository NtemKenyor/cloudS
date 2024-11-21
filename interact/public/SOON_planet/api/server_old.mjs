import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

//TODO: We would interact with the blockchain program and get the logs as the json struture...
const riddles = [
  { riddle: "What has keys but can't open locks?", answer: "Keyboard" },
  { riddle: "What comes down but never goes up?", answer: "Rain" },
  { riddle: "What has a heart that doesn’t beat?", answer: "Artichoke" },
  { riddle: "I speak without a mouth and hear without ears. What am I?", answer: "Echo" },
  { riddle: "What can fill a room but takes up no space?", answer: "Light" }
];

// Endpoint to return random riddles
app.get('/api/riddles', (req, res) => {
  const randomRiddles = riddles.sort(() => 0.5 - Math.random()).slice(0, 5);
  res.json(randomRiddles);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// 3g1GxyxjDpL5jZMiU4e39ngUBnUKjnZYEPXQRbxud7mH