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
  const recipe_info = await getRecipeInformation(recipe_id);
  if (isPreview) {
    return mappings.getRecipePreview(recipe_info.data, recipe_summary.data);
  }
  const recipe_summary = await getRecipeSummary(recipe_id);
  return mappings.getRecipeFullPreview(recipe_info.data, recipe_summary.data);
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
  const recipes = response.data;
  let recipesPreview = [];
  recipes.forEach(async (recipe) => {
    recipesPreview.push(await getRecipeDetailsById(recipe.data.id, true));
  });
  return recipes;
}

async function getRandomRecipes(amount) {
  return await axios.get(`${api_domain}/random`, {
    params: {
      number: amount,
      apiKey: process.env.spooncular_apiKey,
    },
  });
}

/**
 * EXPORTS
 */

exports.searchRecipe = searchRecipe;
exports.getRecipeDetailsById = getRecipeDetailsById;
exports.getRandomRecipes = getRandomRecipes;
