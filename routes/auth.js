var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


router.post("/register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      password: req.body.password,
    };
    let users = [];
    users = await DButils.execQuery("SELECT user_name from users");
    console.log(users)
    if (!user_details.username || !user_details.password)
      throw { status: 400, message: "missing variables, bad request!" };
    if (users.find((x) => x.user_name === user_details.username))
      throw { status: 409, message: "Username taken" };

    // add the new username
    let hash_password = bcrypt.hashSync(user_details.password, parseInt(process.env.bcrypt_saltRounds));

    const result = await DButils.execQuery(
      `INSERT INTO users (user_name, password) VALUES ('${user_details.username}','${hash_password}')`
    );
    console.log(result)
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    let user_details = {
      username: req.body.username,
      password: req.body.password,
    };
    console.log(user_details);
    // check that username exists
    const users = await DButils.execQuery(`SELECT user_name FROM users`);
    console.log(users);
    if (!user_details.password || !users.find((x) => x.user_name === user_details.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE user_name = '${user_details.username}'`
      )
    )[0];
    console.log(user)
    if (!bcrypt.compareSync(user_details.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Generate JWT Token
    const token = jwt.sign(
      { username: user_details.username }, // Payload
      process.env.SECRET_KEY, // Secret key
      { expiresIn: '1h' } // Options, e.g., token expires in 1 hour
    );

    // TODO still not sure this is being set properly
    // Send the token as a cookie
    res.cookie('authToken', token, { httpOnly: true, secure: true }); // Secure: true, only sends over HTTPS

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
