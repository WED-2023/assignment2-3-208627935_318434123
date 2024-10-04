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
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const searchRecipesResult = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.status(200).send(searchRecipesResult);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    console.log("trying")
    const amount = 3;
    const results = await recipes_utils.getRandomRecipes(amount);
    console.log("got results", results)
    const previews = await recipes_utils.getRandomPreviews(results.data.recipes);
    console.log("previews are: ", previews)
    res.status(200).send(previews);
  } catch (error) {
    next(error);
  }
});


router.get("/information", async (req, res, next) => {
  try {
    const recipe_id = req.query.recipeId;
    const results = await recipes_utils.getRecipeDetailsById(recipe_id, false);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/full_preview", async (req, res, next) => {
  try {
    const recipe_id = req.query.recipe_id;
    from_DB = await user_utils.checkIfRecipeExists(recipe_id);
    console.log("api is: ", from_DB);
    if (!from_DB){
      results = await recipes_utils.getRecipeDetailsById(recipe_id, false);
      if (results.data.status === 'failure'){
        res.status(400).send("bad request");
      }
    }
    else{
      results = await recipes_utils.getRecipeFromDB(recipe_id, false)
    }
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});




module.exports = router;
