// Call all the Imports
// Initialize PostgreSQL Database
const Sql = require("../db/postgre-sql");
const sql = new Sql();

async function isAuth(req, res, next) {
  try {
    const { user_id } = req.signedCookies;
    if (user_id !== undefined && user_id !== "undefined") {
      // console.log("Using Cookies!");
      next();
    } else {
      // console.log("Getting User_id!");
      const { email_id } = req.body;
      const { user_id } = (
        await sql`SELECT user_id from users WHERE email_id = ${email_id}`
      )[0] || { user_id: undefined };
      // console.log(user_id);
      req.signedCookies = { user_id: user_id };
      if (user_id === undefined) {
        next();
      } else {
        res.cookie("user_id", user_id, { signed: true });
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

module.exports = { isAuth };
