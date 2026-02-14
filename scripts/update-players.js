const fs = require('fs');

const API_KEY = process.env.API_KEY; 
// CHANGED: Use 2024 or 2023 to guarantee data exists. 
// 2025 might be empty depending on the current date in real life.
const SEASON = 2024; 

const LEAGUES = [
    { id: 39, name: "Premier League" },
    { id: 140, name: "La Liga" },
    { id: 78, name: "Bundesliga" },
    { id: 135, name: "Serie A" },
    { id: 61, name: "Ligue 1" },
    { id: 292, name: "K League 1" }
];

async function fetchAll() {
    let allPlayers = [];

    if (!API_KEY) {
        console.error("❌ ERROR: API_KEY is missing! Check your GitHub Secrets.");
        process.exit(1);
    }

    for (const league of LEAGUES) {
        console.log(`Fetching ${league.name} (Season ${SEASON})...`);
        try {
            // Using pagination to get valid players who have played minutes
            const url = `https://v3.football.api-sports.io/players?league=${league.id}&season=${SEASON}&page=1`;
            
            const response = await fetch(url, {
                headers: { 
                    "x-rapidapi-key": API_KEY,
                    "x-rapidapi-host": "v3.football.api-sports.io"
                }
            });
            
            const data = await response.json();

            // Check for API Errors
            if (data.errors && Object.keys(data.errors).length > 0) {
                console.error(`⚠️ API Error for ${league.name}:`, JSON.stringify(data.errors));
                continue;
            }

            if (data.response && data.response.length > 0) {
                const mapped = data.response.map(item => ({
                    name: item.player.name,
                    club: item.statistics[0].team.name,
                    league: league.name,
                    nationality: item.player.nationality,
                    position: item.player.statistics[0].games.position || "Unknown",
                    age: item.player.age || 0
                }));
                
                console.log(`✅ Found ${mapped.length} players in ${league.name}`);
                allPlayers = [...allPlayers, ...mapped];
            } else {
                console.log(`⚠️ No players found for ${league.name}. Response was empty.`);
            }

            // Sleep to respect rate limits
            await new Promise(r => setTimeout(r, 1500));

        } catch (e) {
            console.error(`❌ Network error fetching ${league.name}:`, e);
        }
    }

    // CRITICAL: Writing to "player.json" (singular) to match your HTML
    fs.writeFileSync('player.json', JSON.stringify(allPlayers, null, 2));
    console.log(`\n🎉 DONE! Saved ${allPlayers.length} players to player.json`);
}

fetchAll();
