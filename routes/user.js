var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const mappings = require("./utils/mappings")
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    // const user_name = req.session.user_name;
    const user_id = req.body.username;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites/preview', async (req,res,next) => {
  try{
    // const user_name = req.session.user_name;
    const user_name = req.body.username;
    let favorite_recipes = {};
    const recipes = await user_utils.getFavoriteRecipes(user_name, true);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});
router.post('/createRecipe', async (req,res,next) => {
  try{
    // const user_name = req.session.user_name;
    const user_name = req.body.recipe.user_name;
    const recipe = req.body.recipe
    await user_utils.addNewRecipes(user_name, recipe);
    res.status(201).send("recipe added");
  } catch(error){
    next(error); 
  }
});
router.get('/MyRecipes/preview', async (req,res,next) => {
  try{
    // const user_name = req.session.user_name;
    const user_name = req.body.username;
    recipes = await user_utils.getMyRecipesPreview(user_name);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});
router.get('/MyRecipes/full_preview', async (req,res,next) => {
  try{
    // const user_name = req.session.user_name;
    const user_name = req.body.username;
    recipes = await user_utils.getMyRecipesFullPreview(user_name);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});
router.get('/favorites/full_preview', async (req,res,next) => {
  try{
    // const user_name = req.session.user_name;
    const user_name = req.body.username;
    let favorite_recipes = {};
    const recipes = await user_utils.getFavoriteRecipes(user_name, false);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});




module.exports = router;
