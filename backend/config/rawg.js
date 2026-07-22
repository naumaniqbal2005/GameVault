require('dotenv').config();

const RAWG_BASE_URL = process.env.RAWG_BASE_URL;
const RAWG_API_KEY = process.env.RAWG_API_KEY;
if (!RAWG_API_KEY){
    throw('RAWG_API_KEY is not defined')
}
async function getGames() {
  const response = await fetch(`${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}`);
  const data = await response.json();
  console.log('Total games:', data.count);
  console.log('Results length:', data.results.length);
  console.log('Sample game:', JSON.stringify(data.results[0], null, 2));
  return data;
}

getGames();