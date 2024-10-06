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
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT user_name FROM users").then((users) => {
      if (users.find((x) => x.user_name === req.session.username)) {
        req.username = req.session.username;
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
router.post('/toggle_favorite', async (req,res,next) => {
  try{
    
    // const user_id = req.body.username;
    const username = req.session.username;

    console.log(req.body);
    const is_favorite = req.body.isFavorite;
    const recipe_id = req.body.recipe_id;
    console.log(recipe_id);
    if (is_favorite){
      console.log("add to favorite");
      ans = await user_utils.markAsFavorite(username,recipe_id);
      if (!ans){
        res.send(409).send("already favorite");
      }
    }else{
      console.log("delete to favorite");
      await user_utils.delete_favorite(username, recipe_id);
    }
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
    const username = req.session.username;
    // const user_name = req.body.username;
    const recipes = await user_utils.getFavoriteRecipes(username, true);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});
router.post('/createRecipe', async (req,res,next) => {
  try{
    const username = req.session.username;
    // const user_name = req.body.recipe.user_name;
    const recipe = req.body.recipe
    await user_utils.addNewRecipes(username, recipe);
    res.status(201).send("recipe added");
  } catch(error){
    next(error); 
  }
});
router.get('/MyRecipes/preview', async (req,res,next) => {
  try{
    const username = req.session.username;
    // const user_name = req.body.username;
    recipes = await user_utils.getMyRecipesPreview(username);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});
// router.get('/MyRecipes/full_preview', async (req,res,next) => {
//   try{
//     const username = req.session.username;
//     // const user_name = req.body.username;
//     recipes = await user_utils.getMyRecipesFullPreview(username);
//     res.status(200).send(recipes);
//   } catch(error){
//     next(error); 
//   }
// });
// router.get('/favorites/full_preview', async (req,res,next) => {
//   try{
//     const username = req.session.username;
//     // const user_name = req.body.username;
//     let favorite_recipes = {};
//     const recipes = await user_utils.getFavoriteRecipes(username, false);
//     res.status(200).send(recipes);
//   } catch(error){
//     next(error); 
//   }
// });




module.exports = router;
