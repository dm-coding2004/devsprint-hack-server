// Getting all the imports
const { app, port } = require("./app/app");
const jsdom = require("jsdom");
const fs = require("fs");

// Initialize PostgreSQL Database
const Sql = require("./db/postgre-sql");
const sql = new Sql();

// Listening to port
app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.get("/user/v1", async (req, res) => {
  try {
    const { email_id } = req.body;
    const { user_id } = req.signedCookies;
    if (user_id === undefined) {
      res.status(404).send("No User Found!");
    } else {
      const user =
        await sql`SELECT * FROM users WHERE user_id = ${user_id} AND email_id = ${email_id}`;
      if (user.length === 0) {
        res.status(404).send("No User Found!");
      } else {
        res.status(200).send(user);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post("/user/v1", async (req, res) => {
  try {
    const { email_id } = req.body;
    const check = await sql`SELECT 1 FROM users WHERE email_id = ${email_id}`;
    if (check.length !== 0) {
      res.status(409).send("User Already Exists!");
    } else {
      const user =
        await sql`INSERT INTO users (email_id) VALUES(${email_id}) RETURNING *`;
      res.cookie("user_id", user[0].user_id, { signed: true });
      res.status(201).send(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// app.put("/user/v1", async (req, res) => {
//   try {
//     const { email_id } = req.params || req.body;
//     const { user_id } = req.body;
//     const { updateList } = req.body;
//     const updateQuery = "SET";

//     for (let index = 0; index < updateList.length; index++) {
//       const element = array[index];
//       updateQuery = `${updateQuery} ${element.name} = ${element.update}`;
//       if (index + 1 !== updateList.length) {
//         updateQuery = `${updateQuery}, `;
//       }
//     }
//     const user = await sql`UPDATE user_details ${updateList}
//       FROM users WHERE user_details.user_id =
//       (SELECT user_id FROM users WHERE email_id = ${email_id})
//       RETURNING *`;
//     console.log(user);
//     res.status(201).send(user);
//   } catch (error) {
//     console.log(error);
//     res.status(401).send(error);
//   }
// });

app.get("/search/v1", async (req, res) => {
  try {
    // console.log(req.body);
    const query1 = req.body;
    const query = {
      scheme_cat: query1.scheme_cat,
      gender_cat: query1.gender,
      region: query1.region,
    };
    // console.log("Got it!!");
    // const searchList =
    //   await sql`SELECT * FROM scheme_metadata RIGHT JOIN scheme_table ON scheme_id = scheme_table.id WHERE scheme_metadata.gender_cat = 'any' `;
    const searchList =
      await sql`SELECT * FROM scheme_table AS st LEFT JOIN scheme_metadata AS sm ON st.id = sm.scheme_id`;
    const resListIndex = searchList.length;

    if (resListIndex === 0) {
      res.status(303).send("Not Found!");
      console.log("Not Found!");
    } else {
      res.status(202).send(searchList);
      // console.log(searchList);
    }
  } catch (error) {
    console.log(error);
    res.status(401).send(error);
  }
});

app.get("/getnames", async (req, res) => {
  try {
    const result =
      await sql`SELECT scheme_name, scheme_sname, id FROM scheme_table ORDER BY id;`;
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.get("/scheme/v1/:scheme_id", async (req, res) => {
  try {
    const { scheme_id } = req.params;
    const result = await sql`SELECT * FROM scheme_table LEFT JOIN 
      scheme_metadata ON scheme_table.id = scheme_metadata.scheme_id WHERE
        scheme_sname = ${scheme_id}`;
    if (typeof result[0] !== "object") {
      res.status(303).send("No schemes found!!");
    } else {
      res.status(202).send(result[0]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post("/feedback/v1/:email_id", async (req, res) => {
  try {
    const { email_id } = req.params;
    const { user_id } = req.query || req.body;
    const { feedback_msg } = req.body;
    const feedback = sql`INSERT INTO feedback (feedback_msg, user_id) VALUES(${feedback_msg}, 
      ${
        user_id !== undefined
          ? user_id
          : `(SELECT user_id FROM users WHERE email_id = ${email_id})`
      }) 
      RETURNING *`;
    if (typeof feedback[0] !== "object") {
      res.status(303).send("No schema checkout found!");
    } else {
      res.status(202).send(feedback);
    }
  } catch (error) {
    console.log(error);
    res.status(401).send(error);
  }
});
