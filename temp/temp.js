// Calling the imports
const { app, port } = require("../app/app");
const fs = require("fs");
const jsdom = require("jsdom");

// Initialize PostgreSQL Database
const Sql = require("../db/postgre-sql");
const sql = new Sql();

// Create function to read and write temp
function readData() {
  const data = fs.readFileSync("./temp_desc.txt", { encoding: "utf8" });
  return data;
}

function writeData(temp_text) {
  const new_temp_text = temp_text.replace("'", "''");
  fs.writeFileSync("./temp_desc.txt", new_temp_text, { encoding: "utf8" });
}

app.listen(port, async () => {
  console.log(`Listening to Port: ${port}!`);
});


app.get("/", (req, res) => {
  try {
    res.status(200).send("Welcome to Our App!");
  } catch (error) {
    res.status(500).send("Server Error, will be back Shortly!");
  }
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
    const { query } = req.body || req.query;
    const searchList = await sql`SELECT * FROM scheme_table`;
    const resList = [];
    const resListIndex = 0;

    for (let index = 0; index < searchList.length; index++) {
      const element = array[index];
      if (element.content.toLowerCase().include(query.toLowerCase())) {
        resList[resListIndex] = element;
        resList[resListIndex].index = element.content
          .toLowerCase()
          .indexOf(query.toLowerCase());
        resListIndex = resListIndex + 1;
      }
    }

    if (resListIndex === 0) {
      res.status(303).send("Not Found!");
    } else {
      res.status(202).send(resList);
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

app.get("/schema/v1/:schema_id", async (req, res) => {
  try {
    const { schema_id } = req.params;
    const schema = sql`SELECT * FROM schemas WHERE schema_id = ${schema_id}`;
    if (typeof schema[0] !== "object") {
      res.status(303).send("No schema of such type");
    } else {
      res.status(202).send(schema);
    }
  } catch (error) {
    console.log(error);
    res.status(401).send(error);
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
