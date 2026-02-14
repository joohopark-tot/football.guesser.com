const fs = require('fs');

const API_KEY = process.env.API_KEY; 

// 1. Define leagues with their specific active season
const LEAGUES = [
    { id: 39, name: "Premier League", season: 2025 }, // 2025-2026 Season
    { id: 140, name: "La Liga", season: 2025 },       // 2025-2026 Season
    { id: 78, name: "Bundesliga", season: 2025 },     // 2025-2026 Season
    { id: 135, name: "Serie A", season: 2025 },       // 2025-2026 Season
    { id: 61, name: "Ligue 1", season: 2025 },        // 2025-2026 Season
    { id: 292, name: "K League 1", season: 2025 }     // 2025 Season (Use 2026 only if 2025 returns 0)
];

async function fetchAll() {
    let allPlayers = [];

    if (!API_KEY) {
        console.error("❌ API_KEY is missing! Check GitHub Secrets.");
        process.exit(1);
    }

    for (const league of LEAGUES) {
        console.log(`Fetching ${league.name} (Season ${league.season})...`);
        try {
            const url = `https://v3.football.api-sports.io/players?league=${league.id}&season=${league.season}&page=1`;
            
            const response = await fetch(url, {
                headers: { 
                    "x-rapidapi-key": API_KEY,
                    "x-rapidapi-host": "v3.football.api-sports.io"
                }
            });
            
            const data = await response.json();

            // Check for API Errors explicitly
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
                console.log(`⚠️ No players found for ${league.name} (Season ${league.season}). Try changing the year.`);
            }
            
            // Wait 1.5s to respect API rate limits
            await new Promise(r => setTimeout(r, 1500));

        } catch (e) {
            console.error(`❌ Network error fetching ${league.name}:`, e);
        }
    }

    // Write the result to player.json
    fs.writeFileSync('player.json', JSON.stringify(allPlayers, null, 2));
    console.log(`\n🎉 DONE! Saved ${allPlayers.length} players to player.json`);
}

fetchAll();
