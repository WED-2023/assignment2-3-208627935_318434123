var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

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
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.status(200).send(results);
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
    const recipe_id = req.query.recipe_id;
    const results = await recipes_utils.getRecipeDetailsById(recipe_id, false);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});




module.exports = router;
