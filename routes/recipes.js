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
    res.send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/try", async (req, res, next) => {
  try {
    const results = await recipes_utils.getTryRecipeInformation();
    res.status(200).send(results.data.results);
  } catch (error) {
    next(error);
  }
});
/**
 * This path creates a new table inside the database
 */
router.get("/createTable", async (req, res, next) => {
  try {
    const result = await recipes_utils.createTable();
    res.send(result);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
