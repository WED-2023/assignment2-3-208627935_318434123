var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils =  require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const user_name = req.session.username;
    const recipeName = req.query.recipeName || '';
    const cuisine = req.query.cuisine || '';
    const diet = req.query.diet || '';
    const intolerance = req.query.intolerance || '';
    const number = req.query.number || 5;
    console.log(number)
    const searchRecipesResult = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    recipes = await recipes_utils.getRecipesWithFavorites(user_name, searchRecipesResult)
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const user_name = req.session.username;
    const amount = 3;
    const randomRecipes = await recipes_utils.getRandomRecipes(amount);
    const randomPreviews = await recipes_utils.getRandomPreviews(randomRecipes);
    recipes = await recipes_utils.getRecipesWithFavorites(user_name, randomPreviews)
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

router.get("/full_preview", async (req, res, next) => {
  let recipeFullPreview;
  try {
    const recipe_id = req.query.recipe_id;
    from_DB = await user_utils.checkIfRecipeExists(recipe_id);
    console.log("api is: ", from_DB);
    if (!from_DB){
      recipeFullPreview = await recipes_utils.getRecipeDetailsById(recipe_id, false);
    }
    else{
      recipeFullPreview = await recipes_utils.getRecipeFromDB(req.session.username, recipe_id, false)
    }
    res.status(200).send(recipeFullPreview);
  } catch (error) {
    next(error);
  }
});




module.exports = router;
