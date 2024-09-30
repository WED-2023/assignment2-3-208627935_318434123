const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

async function markAsFavorite(user_id, recipe_id) {
  await DButils.execQuery(
    `insert into Favorite_recipes values ('${user_id}',${recipe_id})`
  );
}

async function getFavoriteRecipes(user_id) {
  let recipes = [];
  const recipesIds = await DButils.execQuery(
    `select recipe_id from favorite_recipes where user_id='${user_id}'`
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
