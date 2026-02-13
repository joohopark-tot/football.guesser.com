const fs = require('fs');

const API_KEY = process.env.API_KEY; 
const SEASON = 2025; // Use 2025 for now to ensure full squad data
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

    for (const league of LEAGUES) {
        console.log(`Fetching ${league.name}...`);
        try {
            const response = await fetch(`https://v3.football.api-sports.io/players?league=${league.id}&season=${SEASON}`, {
                headers: { "x-rapidapi-key": API_KEY }
            });
            const data = await response.json();

            if (data.response) {
                const mapped = data.response.map(item => ({
                    name: item.player.name,
                    club: item.statistics[0].team.name,
                    league: league.name,
                    nationality: item.player.nationality,
                    position: item.player.statistics[0].games.position,
                    age: item.player.age
                }));
                allPlayers = [...allPlayers, ...mapped];
            }
            // Sleep for 1 second to stay within API rate limits
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`Error fetching ${league.name}:`, e);
        }
    }

    fs.writeFileSync('players.json', JSON.stringify(allPlayers, null, 2));
    console.log(`Done! Saved ${allPlayers.length} players to players.json`);
}

fetchAll();
