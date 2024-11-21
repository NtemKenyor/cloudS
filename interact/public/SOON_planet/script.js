window.onload = function() {
  let MAIN_URL = "https://roynek.com/sonic_universe/client/sonic_planet/api";
  let URL = MAIN_URL + "/riddles";
  // https://roynek.com/sonic_universe/client/sonic_planet/api/
  let riddles = [];
  let currentRiddle = null;

  // Fetch riddles from the server
  fetch(URL)
    .then(response => response.json())
    .then(data => {
      riddles = data;
      displayRandomRiddle();
    });

  // Display a random riddle
  function displayRandomRiddle() {
    const randomIndex = Math.floor(Math.random() * riddles.length);
    currentRiddle = riddles[randomIndex];
    document.getElementById('riddle-text').textContent = currentRiddle.riddle;
  }

  // Check the user's answer
  document.getElementById('submit-answer').addEventListener('click', function() {
    const userAnswer = document.getElementById('riddle-answer').value.trim();
    const resultMessage = document.getElementById('result-message');

    if (userAnswer.toLowerCase() === currentRiddle.answer.toLowerCase()) {
      resultMessage.textContent = "Correct! You may proceed.";
      resultMessage.style.color = "green";
      setTimeout(displayRandomRiddle, 2000); // Show the next riddle after 2 seconds
    } else {
      resultMessage.textContent = "Incorrect! Try again.";
      resultMessage.style.color = "red";
    }

    document.getElementById('riddle-answer').value = ''; // Clear input field
  });
};
