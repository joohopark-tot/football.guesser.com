const fs = require('fs');

const API_KEY = process.env.API_KEY; 
const SEASON = 2024; // changed to 2024 to guarantee data exists

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
        console.error("❌ API_KEY is missing! Check Secrets.");
        process.exit(1);
    }

    for (const league of LEAGUES) {
        console.log(`Fetching ${league.name}...`);
        try {
            const url = `https://v3.football.api-sports.io/players?league=${league.id}&season=${SEASON}&page=1`;
            const response = await fetch(url, {
                headers: { 
                    "x-rapidapi-key": API_KEY,
                    "x-rapidapi-host": "v3.football.api-sports.io"
                }
            });
            const data = await response.json();
            
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
                console.log(`⚠️ No data found for ${league.name}. API might be empty for this season.`);
            }
        } catch (e) {
            console.error(`❌ Error fetching ${league.name}:`, e);
        }
    }

    // SAVING AS 'player.json' (Singular) to match your repository file
    fs.writeFileSync('player.json', JSON.stringify(allPlayers, null, 2));
    console.log(`\n🎉 DONE! Saved ${allPlayers.length} players to player.json`);
}

fetchAll();
