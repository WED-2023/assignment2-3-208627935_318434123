const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");


async function in_favorites(recipe_id){
  try {
    const result = await DButils.execQuery(
      `SELECT * FROM favorite_recipes WHERE recipe_id = ${recipe_id}`
    );

    // Ensure result.rows is defined and is an array
    if (result.length > 0) {
      console.log(`Recipe with id ${recipe_id} exists`);
      return true; // Recipe exists
    } else {
      console.log(`Recipe with id ${recipe_id} does not exist`);
      return false; // Recipe doesn't exist
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    throw error;
  }
}

async function checkIfRecipeExists(recipe_id) {
  try {
    const result = await DButils.execQuery(
      `SELECT * FROM recipes WHERE recipe_id = ${recipe_id}`
    );
    console.log("Query result:", result);

    // Ensure result.rows is defined and is an array
    if (result.length > 0) {
      console.log(`Recipe with id ${recipe_id} exists`);
      return true; // Recipe exists
    } else {
      console.log(`Recipe with id ${recipe_id} does not exist`);
      return false; // Recipe doesn't exist
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    throw error;
  }
}
async function delete_favorite(user_name, recipe_id){

  query = `DELETE FROM favorite_recipes 
        WHERE user_name = '${user_name}' 
          AND recipe_id = ${recipe_id};`

  await DButils.execQuery(query);
}
async function markAsFavorite(user_id, recipe_id) {
  const exists = await checkIfRecipeExists(recipe_id);
  api_or_not = !exists;
  query = `INSERT INTO favorite_recipes (user_name, recipe_id, api) 
               VALUES ('${user_id}', ${recipe_id}, ${api_or_not})`;
  await DButils.execQuery(query);
}

async function getFavoriteRecipes(user_id, fullOrPreview) {
  let recipes = [];
  console.log(
    `SELECT recipe_id, api from favorite_recipes where user_name='${user_id}'`
  );

  const results = await DButils.execQuery(
    `SELECT recipe_id, api from favorite_recipes where user_name='${user_id}'`
  );
  console.log(results);
  // Separate the recipes into two lists
  const apiTrue = results.filter((recipe) => recipe.api === 1);
  const apiFalse = results.filter((recipe) => recipe.api === 0);
  const recipesFromAPIPromises = apiTrue.map((recipe) =>
    recipes_utils.getRecipeDetailsById(recipe.recipe_id, fullOrPreview)
  );

  const recipesFromDBPromises = apiFalse.map((recipe) =>
    recipes_utils.getRecipeFromDB(recipe.recipe_id, fullOrPreview)
  );

  // Wait for all promises to resolve for apiFalse
  const recipesFromDB = await Promise.all(recipesFromDBPromises);
  const recipesFromAPI = await Promise.all(recipesFromAPIPromises);
  console.log("recipes from db", recipesFromDB);

  const allRecipes = [...recipesFromDB, ...recipesFromAPI];
  return allRecipes;
}
async function getMyRecipesFullPreview(user_id) {
  let recipes = [];
  const recipesIds = await getRecipesIdsByUser(user_id);

  for (const row of recipesIds) {
    const recipeId = row.recipe_id;
    // Fetch each recipe and await the result
    const recipe = await recipes_utils.getRecipeFromDB(recipeId, false);
    recipes.push(recipe);
  }
  console.log("all recipes: ", recipes);
  return recipes;
}

async function getMyRecipesPreview(user_id) {
  let recipes = [];
  const recipesIds = await getRecipesIdsByUser(user_id);

  for (const row of recipesIds) {
    const recipeId = row.recipe_id;

    // Fetch each recipe and await the result
    const recipe = await recipes_utils.getRecipeFromDB(recipeId, true);
    recipes.push(recipe);
  }
  console.log("all recipes: ", recipes);
  return recipes;
}

async function addNewRecipes(user_id, recipe) {
  console.log(recipe);

  console.log("start new recipe");
  const recipe_id = await getLargestRecipeId();

  console.log("got max id: ", recipe_id);

  await addToRecipes(recipe_id, recipe);
  await addToMyRecipes(recipe_id, recipe);
  await addIngredients(recipe_id, recipe);
  await addToLikes(recipe_id);
}
async function getRecipesIdsByUser(user_id) {
  console.log(user_id);
  const recipesIds = await DButils.execQuery(
    `select recipe_id from my_recipes where user_name='${user_id}'`
  );
  console.log(recipesIds);
  return recipesIds;
}

const getLargestRecipeId = async function () {
  const query =
    "SELECT IFNULL(MAX(recipe_id), 0) AS max_recipe_id FROM recipes";
  const result = await DButils.execQuery(query);
  return result[0]?.max_recipe_id + 1 || 0 + 1;
};

const addToRecipes = async function (recipe_id, recipe) {
  const recipes_query = `INSERT INTO recipes (recipe_id, title, time_in_minutes, image_url, vegetarian, vegan, gluten_free, summary, instructions, servings) 
  VALUES (${recipe_id}, '${recipe.title}', ${recipe.time}, '${recipe.image}', ${recipe.vegetarian}, ${recipe.vegan}, ${recipe.gluten_free}, '${recipe.summary}', '${recipe.instructions}', ${recipe.servings})`;
  await DButils.execQuery(recipes_query);
  console.log("add to recipes");
};

const addToMyRecipes = async function (recipe_id, recipe) {
  query = `INSERT INTO my_recipes (user_name, recipe_id) 
  VALUES ('${recipe.user_name}', ${recipe_id})`;
  await DButils.execQuery(query);
  console.log("add to my recipes");
};
const addIngredients = async function (recipe_id, recipe) {
  for (const ingredient of recipe.ingredients) {
    const ingredient_query = `INSERT INTO recipes_ingredients (recipe_id, ingredient_name, amount, unit) 
    VALUES (${recipe_id}, '${ingredient.ingredient_name}', ${ingredient.amount}, '${ingredient.unit}')`;

    // Execute the query
    await DButils.execQuery(ingredient_query);
  }
  console.log("add ingredients");
};
const addToLikes = async function (recipe_id) {
  likes_query = `INSERT INTO likes (recipe_id, likes) 
  VALUES (${recipe_id}, ${0})`;
  await DButils.execQuery(likes_query);
  console.log("add to likes");
};
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addNewRecipes = addNewRecipes;
exports.getMyRecipesPreview = getMyRecipesPreview;
exports.getMyRecipesFullPreview = getMyRecipesFullPreview;
exports.checkIfRecipeExists = checkIfRecipeExists;
exports.in_favorites = in_favorites;
exports.delete_favorite = delete_favorite;
