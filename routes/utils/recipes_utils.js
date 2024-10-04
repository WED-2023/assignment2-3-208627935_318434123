const axios = require("axios");
const connection = require("./MySql");
const mappings = require("./mappings");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");

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
async function getRecipeFromDB(recipe_id, isPreview) {
  if (isPreview) {
    console.log("Preview");
    const recipe = await DButils.execQuery(
      `SELECT title, image_url, time_in_minutes, vegetarian, vegan, gluten_free from recipes where recipe_id='${recipe_id}'`
    );
    console.log(recipe);
    const likes = await DButils.execQuery(
      `SELECT likes from likes where recipe_id='${recipe_id}'`
    );
    console.log(likes);
    if (!likes) {
      likes = [{ likes: 0 }];
    }
    return {
      id: recipe_id,
      image: recipe[0].image_url,
      title: recipe[0].title,
      readyInMinutes: recipe[0].time_in_minutes,
      aggregateLikes: likes[0].likes,
      vegetarian: recipe[0].vegetarian,
      vegan: recipe[0].vegan,
      glutenFree: recipe[0].gluten_free,
    };
  } else {
    console.log("Full Details");
    const recipe = await DButils.execQuery(
      `SELECT * from recipes where recipe_id='${recipe_id}'`
    );
    console.log(recipe);
    const likes = await DButils.execQuery(
      `SELECT likes from likes where recipe_id='${recipe_id}'`
    );
    console.log(likes);
    if (!likes) {
      likes = [{ likes: 0 }];
    }

    // Fetch the ingredients for this recipe
    const ingredients = await getIngredientsByRecipeId(recipe_id);

    // Combine the recipe and ingredients into one object
    const recipeWithIngredients = {
      ...recipe["0"],
      likes: likes[0].likes,
      ingredients: ingredients, // Attach the ingredients here
    };

    return recipeWithIngredients;
  }
}
async function getIngredientsByRecipeId(recipeId) {
  const ingredients = await DButils.execQuery(
    `SELECT ingredient_name, amount, unit FROM recipes_ingredients WHERE recipe_id = ${recipeId}`
  );
  return ingredients.map((ingredient) => ({
    ingredient_name: ingredient.ingredient_name,
    amount: ingredient.amount,
    unit: ingredient.unit,
  }));
}

async function getRecipeDetailsById(recipe_id, isPreview) {
  const recipe_info = await getRecipeInformation(recipe_id);
  const recipeSummary = await getRecipeSummary(recipe_id);

  if (isPreview) {
    return mappings.getRecipePreview(recipe_info, recipeSummary);
  }

  return mappings.getRecipeFullPreview(recipe_info, recipeSummary);
}

/*
 * API CALLS
 */

async function getRecipeInformation(recipe_id) {
  const response = await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
  if (!response) {
    throw new Error("response !OK");
  }
  return response.data;
}

async function getRecipeSummary(recipe_id) {
  const response = await axios.get(`${api_domain}/${recipe_id}/summary`, {
    params: {
      apiKey: process.env.spooncular_apiKey,
    },
  });
  if (!response) {
    throw new Error("response !OK");
  }
  return response.data.summary;
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

  if (!recipes) {
    return [];
  }
  let recipesPreview = [];
  for (const recipe of recipes) {
    recipesPreview.push(await getRecipeDetailsById(recipe.id, true));
  }

  return recipesPreview;
}

async function getRandomRecipes(amount) {
  const randomRecipesResponse = await axios.get(`${api_domain}/random`, {
    params: {
      number: amount,
      apiKey: process.env.spooncular_apiKey,
    },
  });
  if (!randomRecipesResponse) {
    throw new Error("response !OK");
  }
  return randomRecipesResponse.data.recipes;
}

async function getRandomPreviews(recipes) {
  const addedSummary = await Promise.all(
    recipes.map(async (recipe) => {
      recipe.summary = await getRecipeSummary(recipe.id);
      return recipe;
    })
  );

  const recipesPreview = await Promise.all(
    addedSummary.map((recipe) => {
      return mappings.getRecipePreview(recipe, recipe.summary);
    })
  );

  return recipesPreview;
}

/**
 * EXPORTS
 */

exports.searchRecipe = searchRecipe;
exports.getRecipeDetailsById = getRecipeDetailsById;
exports.getRandomRecipes = getRandomRecipes;
exports.getRandomPreviews = getRandomPreviews;
exports.getRecipeFromDB = getRecipeFromDB;
