const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");




async function checkIfRecipeExists(recipe_id) {
  try {
    const result = await DButils.execQuery(`SELECT * FROM recipes WHERE recipe_id = ${recipe_id}`);
    console.log('Query result:', result);
    
    // Ensure result.rows is defined and is an array
    if (result.length > 0) {
      console.log(`Recipe with id ${recipe_id} exists`);
      return true; // Recipe exists
    } else {
      console.log(`Recipe with id ${recipe_id} does not exist`);
      return false; // Recipe doesn't exist
    }
  } catch (error) {
    console.error('Error querying the database:', error);
    throw error;
  }
}



async function markAsFavorite(user_id, recipe_id) {
  const exists = await checkIfRecipeExists(recipe_id);
  api_or_not = !exists;
  query = `INSERT INTO favorite_recipes (user_name, recipe_id, api) 
               VALUES ('${user_id}', ${recipe_id}, ${api_or_not})`;
  await DButils.execQuery(
    query
  );
}

async function getFavoriteRecipes(user_id) {
  let recipes = [];
  const recipesIds = await DButils.execQuery(
    `SELECT recipe_id from favorite_recipes where user_name='${user_id}'`
  );
  recipesIds.forEach(async (recipeId) => {
    recipes.push(await recipes_utils.getRecipeDetailsById(recipeId, true));
  });
  return recipes;
}

async function getMyRecipes(user_id) {
  let recipes = [];
  let recipe;
  const { recipesIds, isAPI } = await DButils.execQuery(
    `select recipe_id from my_recipes where user_id='${user_id}'`
  );
  recipesIds.forEach(async (recipeId) => {
    if (isAPI) {
    // TODO understand what I get from DB
      recipe = await DButils.execQuery(
        `select * from recipes where recipes_id='${recipeId}'`
      );
    } else {
      recipe = await recipes_utils.getRecipeDetailsById(recipeId, true);
    }
    recipes.push(recipe);
  });
  return recipes;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
