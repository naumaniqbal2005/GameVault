require('dotenv').config();
const { supabase } = require('../config/db');

const RAWG_BASE_URL = process.env.RAWG_BASE_URL;
const RAWG_API_KEY = process.env.RAWG_API_KEY;

async function getGamesFromRAWG() {
  console.log('Fetching games from RAWG API...');
  const response = await fetch(`${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&page_size=10`);
  const data = await response.json();
  console.log(`Fetched ${data.results.length} games from RAWG`);
  return data.results;
}

async function getOrCreateCategory(categoryName) {
  console.log(`Checking category: ${categoryName}`);

  // Check if category exists
  const { data: existingCategory, error: fetchError } = await supabase
    .from('categories')
    .select('*')
    .eq('CategoryName', categoryName)
    .single();

  if (existingCategory) {
    console.log(`Category "${categoryName}" already exists with ID: ${existingCategory.CategoryID}`);
    return existingCategory.CategoryID;
  }

  // Get max CategoryID
  const { data: maxIdData } = await supabase
    .from('categories')
    .select('CategoryID')
    .order('CategoryID', { ascending: false })
    .limit(1);

  const newCategoryId = maxIdData && maxIdData.length > 0 ? maxIdData[0].CategoryID + 1 : 1;

  // Create new category
  const { data: newCategory, error: insertError } = await supabase
    .from('categories')
    .insert({ CategoryID: newCategoryId, CategoryName: categoryName })
    .select();

  if (insertError) {
    console.error('Error creating category:', insertError);
    return null;
  }

  console.log(`Created category "${categoryName}" with ID: ${newCategoryId}`);
  return newCategoryId;
}

async function insertGame(game, categoryId) {
  console.log(`Inserting game: ${game.name}`);

  // Get max GameID
  const { data: maxIdData } = await supabase
    .from('games')
    .select('GameID')
    .order('GameID', { ascending: false })
    .limit(1);

  const newGameId = maxIdData && maxIdData.length > 0 ? maxIdData[0].GameID + 1 : 1;

  // Extract platform name
  const platform = game.platforms && game.platforms.length > 0
    ? game.platforms[0].platform.name
    : 'PC';

  // Extract genre name
  const genre = game.genres && game.genres.length > 0
    ? game.genres[0].name
    : 'General';

  const { data: newGame, error: insertError } = await supabase
    .from('games')
    .insert({
      GameID: newGameId,
      GameTitle: game.name,
      Platform: platform,
      Genre: genre,
      CategoryID: categoryId,
      PhysicalPrice: 59.99,
      DigitalRentalPrice: 9.99,
      Image: game.background_image || null
    })
    .select();

  if (insertError) {
    console.error('Error inserting game:', insertError);
    return null;
  }

  console.log(`✓ Inserted game "${game.name}" with ID: ${newGameId}`);
  return newGameId;
}

async function insertPhysicalCopies(gameId, count = 2) {
  console.log(`Inserting ${count} physical copies for game ID: ${gameId}`);

  // Get max CopyID
  const { data: maxIdData } = await supabase
    .from('physicalcopies')
    .select('CopyID')
    .order('CopyID', { ascending: false })
    .limit(1);

  let copyId = maxIdData && maxIdData.length > 0 ? maxIdData[0].CopyID + 1 : 1;

  for (let i = 0; i < count; i++) {
    const { error } = await supabase
      .from('physicalcopies')
      .insert({
        CopyID: copyId,
        GameID: gameId,
        CopyCondition: 'New',
        Availability: 'Available'
      });

    if (error) {
      console.error(`Error inserting physical copy ${copyId}:`, error);
    } else {
      console.log(`✓ Inserted physical copy ID: ${copyId}`);
    }
    copyId++;
  }
}

async function insertDigitalCopies(gameId, count = 2) {
  console.log(`Inserting ${count} digital copies for game ID: ${gameId}`);

  // Get max CopyID
  const { data: maxIdData } = await supabase
    .from('digitalcopies')
    .select('CopyID')
    .order('CopyID', { ascending: false })
    .limit(1);

  let copyId = maxIdData && maxIdData.length > 0 ? maxIdData[0].CopyID + 1 : 1;

  for (let i = 0; i < count; i++) {
    const { error } = await supabase
      .from('digitalcopies')
      .insert({
        CopyID: copyId,
        GameID: gameId,
        Availability: 'Available'
      });

    if (error) {
      console.error(`Error inserting digital copy ${copyId}:`, error);
    } else {
      console.log(`✓ Inserted digital copy ID: ${copyId}`);
    }
    copyId++;
  }
}

async function seedGames() {
  try {
    console.log('=== Starting Game Seeding ===\n');

    // Fetch games from RAWG
    const games = await getGamesFromRAWG();

    for (const game of games) {
      console.log(`\n--- Processing: ${game.name} ---`);

      // Get or create category (using first genre as category)
      const categoryName = game.genres && game.genres.length > 0 
        ? game.genres[0].name 
        : 'General';
      
      const categoryId = await getOrCreateCategory(categoryName);
      
      if (!categoryId) {
        console.error(`Skipping category creation for ${game.name}`);
        continue;
      }

      // Insert game
      const gameId = await insertGame(game, categoryId);
      
      if (!gameId) {
        console.error(`Skipping game insertion for ${game.name}`);
        continue;
      }

      // Insert physical copies
      await insertPhysicalCopies(gameId, 2);

      // Insert digital copies
      await insertDigitalCopies(gameId, 2);

      console.log(`✓ Completed seeding for: ${game.name}`);
    }

    console.log('\n=== Game Seeding Complete ===');
  } catch (error) {
    console.error('Error in seedGames:', error);
  }
}

seedGames();
