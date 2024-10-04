const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

async function markAsFavorite(user_id, recipe_id) {
  await DButils.execQuery(
    `insert into Favorite_recipes values ('${user_id}',${recipe_id})`
  );
}

async function getFavoriteRecipes(userId) {
  let recipes = [];
  let recipe;
  const queryResults = await DButils.execQuery(
    `SELECT recipe_id, api FROM favorite_recipes WHERE user_id = '${userId}'`
  );
  for (const result of queryResults) {
    const recipeId = result.recipe_id;
    if (result.api) {
      recipe = await recipes_utils.getRecipeDetailsById(recipeId, true);
    } else {
      recipe = await DButils.execQuery(
        `SELECT * FROM recipes WHERE recipes_id = '${recipeId}'`
      );
    }
  }

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
