const axios = require("axios");
const connection = require("./MySql");
const mappings = require("./mappings");
const api_domain = "https://api.spoonacular.com/recipes";

//@TODO CHECK ALL API CALLS, NOTHING IS CHECK. MAYBE RESPONSE.DATA.RESULTS?

// my_recipes = server.getUserRecipes(user_id)
// search_recipes = server.getRecipesByDemand(............, amount)
// user_last_recipes = server.getUserLastRecipe(recipe_id, user_id) bonus
// server.register(user_name, first_name, last_name, country, password, mail)
// server.login(user_name, password)
// server.addFavorite(user_id, recipe_id)
// server.addUserRecipe(user_if, recipe_id)
// server.addSeen(user_id, recipe_id) bonus

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info
 */

/**
 * UTILS
 */

async function getRecipeDetailsById(recipe_id, isPreview) {
  const responseInfo = await getRecipeInformation(recipe_id);
  if (!responseInfo) {
    throw new Error(`response !OK: ${responseInfo}`);
  }
  const recipeInfo = responseInfo.data;
  if (isPreview) {
    const responseSummary = await getRecipeSummary(recipe_id);
    if (!responseSummary) {
      throw new Error(`response !OK: ${responseSummary}`);
    }
    const recipeSummary = responseSummary.data;
    return mappings.getRecipePreview(recipeInfo, recipeSummary);
  }

  return mappings.getRecipeFullPreview(recipeInfo);
}

/*
 * API CALLS
 */

async function getRecipeInformation(recipe_id) {
  return await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
}

async function getRecipeSummary(recipe_id) {
  return await axios.get(`${api_domain}/${recipe_id}/summary`, {
    params: {
      apiKey: process.env.spooncular_apiKey,
    },
  });
}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
  const params = {
    query: recipeName,
    cuisine: cuisine,
    diet: diet,
    intolerances: intolerance,
    number: number,
    apiKey: process.env.spooncular_apiKey,
  };
  const response = await axios.get(`${api_domain}/complexSearch`, { params });
  if (!response) {
    throw new Error("response !OK");
  }
  const recipes = response.data.results;
  let recipesPreview = [];
  for (const recipe of recipes) {
    recipesPreview.push(await getRecipeDetailsById(recipe.id, true));
  }
  // TODO add isFavorite to each recipe
  return recipes;
}

async function getRandomRecipes(amount) {
  let randomRecipes = [];
  const randomRecipesResponse = await axios.get(`${api_domain}/random`, {
    params: {
      number: amount,
      apiKey: process.env.spooncular_apiKey,
    },
  });

  if (!randomRecipesResponse) {
    throw new Error(`response !OK: ${randomRecipesResponse}`);
  }
  const randomRecipesInfo = randomRecipesResponse.data.recipes;
  for (const recipeInfo of randomRecipesInfo) {
    const responseSummary = await getRecipeSummary(recipeInfo.id);

    if (!responseSummary) {
      throw new Error(`response !OK: ${responseSummary}`);
    }

    const recipeSummary = responseSummary.data;
    const recipePreview = await mappings.getRecipePreview(recipeInfo, recipeSummary);
    randomRecipes.push(recipePreview);
  }
  return randomRecipes;
}

/**
 * EXPORTS
 */

exports.searchRecipe = searchRecipe;
exports.getRecipeDetailsById = getRecipeDetailsById;
exports.getRandomRecipes = getRandomRecipes;
