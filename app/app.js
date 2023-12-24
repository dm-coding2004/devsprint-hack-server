// Call all the Imports
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { isAuth } = require("../middleware/auth");

// Initialize the App
const app = express();

// Importing Middlewares

// Initializing Middlewares
app.use(express.json());
app.use(express.text());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "cdn.example.com"],
      // Add more directives as needed
    },
  })
);

app.use(helmet.frameguard({ action: "deny" })); // X-Frame-Options
app.use(helmet.noSniff()); // X-Content-Type-Options

app.use(cors());
app.use(cookieParser("ThisIsSecret"));
app.use("/user/v1", isAuth);

// Initializing Port
const port = process.env.PORT || 9000;

module.exports = { port, app };
