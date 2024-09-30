var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
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
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

router.post("/register", async (req, res, next) => {
  try {
    let user = {
      username: req.body.username,
      password: req.body.password,
    }

    let users = await DButils.execQuery("SELECT user_name FROM users WHERE username = ?", [user.username]);
    if (users.length > 0) {
      throw { status: 409, message: "Username already taken" };
    }
    
    user_id = await getLargestUserId()+1;

    // Hash the password
    let hash_password = bcrypt.hashSync(
      user.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    // Insert the new user into the database
    await DButils.execQuery(
      `INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)`,
      [user_id, user.username, hash_password]

    );
    res.status(201).send({ message: "User successfully registered", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    // Check if the user exists and Check if the password is correct
    user_id, hased_password = await DButils.execQuery("SELECT user_id, password FROM users WHERE username = ?", [username]);
    if (!hased_password || !user_id || !bcrypt.compareSync(password, hased_password)) {
      return res.status(401).send("Username or Password incorrect");
    }

    // Return user_id upon successful login
    res.status(200).send({ message: "login was made successfully", user_id: user_id });
  } catch (error) {
    next(error);
  }
});

getLargestUserId = async function () {
  const query = 'SELECT IFNULL(MAX(user_id), 0) AS max_user_id FROM users';
  const result = await DButils.execQuery(query);
  return result[0]?.max_user_id || 0; 
  
}



module.exports = router;
