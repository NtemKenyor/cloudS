// Play Button Functionality
/* function playGame(gameName) {
    alert("Loading " + gameName + "...");
    // Replace this alert with actual game launch logic
}
 */


// Play Button Functionality
function playGame(gameName) {
    // Dictionary of game titles and their respective directories
    const gameDirectories = {
        "Space Explorer": "space_explorer/",
        "Aquatic SOON": "aquatic_SOON/",
        "Riddle Time": "SOON_planet/",
    };

    // Check if the selected game exists in the dictionary
    if (gameDirectories[gameName]) {
        // Redirect to the game directory using a relative URL
        window.location.href = gameDirectories[gameName];
    } else {
        alert("Game not found!");
    }
}


