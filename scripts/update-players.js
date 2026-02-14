const fs = require('fs');

const API_KEY = process.env.API_KEY; 

const LEAGUES = [
    { id: 39, name: "Premier League", season: 2025 },
    { id: 140, name: "La Liga", season: 2025 },
    { id: 78, name: "Bundesliga", season: 2025 },
    { id: 135, name: "Serie A", season: 2025 },
    { id: 61, name: "Ligue 1", season: 2025 },
    { id: 292, name: "K League 1", season: 2026 },
    { id: 253, name: "Major League Soccer", season: 2026 }
];

async function fetchAll() {
    let allPlayers = [];

    if (!API_KEY) {
        console.error("❌ API_KEY is missing from GitHub Secrets.");
        process.exit(1);
    }

    for (const league of LEAGUES) {
        console.log(`Fetching ${league.name}...`);
        try {
            const url = `https://v3.football.api-sports.io/players?league=${league.id}&season=${league.season}&page=1`;
            const response = await fetch(url, {
                headers: { 
                    "x-rapidapi-key": API_KEY,
                    "x-rapidapi-host": "v3.football.api-sports.io"
                }
            });
            const data = await response.json();

            if (data.response && data.response.length > 0) {
                const mapped = data.response.map(item => {
                    // FIX: This 'stats' constant safely checks for the statistics array
                    const stats = item.statistics?.[0]; 
                    return {
                        name: item.player.name,
                        // If stats or team is missing, it defaults to 'Unknown'
                        club: stats?.team?.name || "Unknown Club",
                        league: league.name,
                        nationality: item.player.nationality,
                        position: stats?.games?.position || "Unknown",
                        age: item.player.age || 0
                    };
                });
                allPlayers = [...allPlayers, ...mapped];
                console.log(`✅ Added ${mapped.length} players from ${league.name}`);
            }
            // Wait to respect API rate limits
            await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
            console.error(`❌ Error fetching ${league.name}:`, e.message);
        }
    }

    // Save to player.json
    fs.writeFileSync('player.json', JSON.stringify(allPlayers, null, 2));
    console.log(`\n🎉 DONE! Saved ${allPlayers.length} players to player.json`);
}

fetchAll();
