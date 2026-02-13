// Helper for accents
const slug = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function loadGame() {
    // Load the auto-generated JSON file
    const response = await fetch("./players.json");
    window.players = await response.json();
    
    initGame(); // Your existing function to pick a random player
}

window.showSuggestions = function() {
    const val = slug(document.getElementById("guessInput").value.trim());
    if (val.length < 2) return;

    const matches = window.players
        .filter(p => slug(p.name).includes(val))
        .slice(0, 10);
        
    // ... render your suggestion divs ...
};
