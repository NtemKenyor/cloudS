
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;  // Adjust the port for cPanel environment
let MAIN_DIR = "/sonic_universe/client/sonic_planet/api";
// Enable CORS for all routes
app.use(cors());


// TODO:
// the goal is to get the data from the blockchain
// get the riddles from the logs of the blocks in Sonic Devnet
// Riddles data
const riddles = [
  { riddle: "What has keys but can't open locks?", answer: "Keyboard" },
  { riddle: "What comes down but never goes up?", answer: "Rain" },
  { riddle: "What has a heart that doesn’t beat?", answer: "Artichoke" },
  { riddle: "I speak without a mouth and hear without ears. What am I?", answer: "Echo" },
  { riddle: "What can fill a room but takes up no space?", answer: "Light" }
];

console.log('Something conncted');

// Endpoint to return random riddles
app.get(MAIN_DIR+'/riddles', (req, res) => {
  const randomRiddles = riddles.sort(() => 0.5 - Math.random()).slice(0, 5);
  res.json(randomRiddles);
});

// Serve "Hello World" at /SOON_universe/client/SOON_planet/api/
app.get(MAIN_DIR+'/', (req, res) => {
  res.send('Hello World 2');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// 3g1GxyxjDpL5jZMiU4e39ngUBnUKjnZYEPXQRbxud7mH