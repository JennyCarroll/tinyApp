const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

// When our browser submits a POST request, the data in the request body is sent as a Buffer.
// While this data type is great for transmitting data, it's not readable for us humans.
// To make this data readable, we will need to use another piece of middleware which will translate,
// or parse the body. This feature is part of Express.
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 7);
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//here is one endpoint
app.get("/", (req, res) => {
  res.send("Hello!");
});

//add an additional endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//new get route to show the form
// The GET /urls/new route needs to be defined before the GET /urls/:id route.
// Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition,
// any calls to /urls/new will be handled by app.get("/urls/:id", ...)
// because Express will think that new is a route parameter.
// A good rule of thumb to follow is that routes should be ordered from most specific to least specific.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// When we navigate to /urls/new in our browser, our browser makes a GET request to our newly created route.
// Our sever responds by finding urls_new template, generating the HTML, and sending it back to the browser.
// The browser then renders this HTML.

// The body-parser library will convert the request body from a Buffer into string that we can read.
// It will then add the data to the req(request) object under the key body.
// (If you find that req.body is undefined, it may be that the body-parser middleware is not being run correctly.)
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
// the data in the input field will be avaialbe to us in the req.body.longURL variable,
// which we can store in our urlDatabase object.
// (Later we'll store these URLs in a real database, but for now we're focusing on the communication between server and client.)

//route handler for /urls that renders using our template and template variable object
// The : in front of id indicates that id is a route parameter. This means that the value in
// this part of the url will be available in the req.params object.
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

//add another page to display URL in its shortened form, this is that endpoint
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//the response can contain HTML code, which would be rendered in the client browser.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}!`);
// });

// Start the server by running node express_server.js in your terminal
// Visit http://localhost:8080/ in your browser and make sure you can see the Hello! response.
// Notice the external link we've included in the <head> tag; this stylesheet is from Bootstrap,
// one of the most popular CSS frameworks around. We'll use it in our app so that we have some basic CSS
// styling available to us. We've also included a number of <script> tags at the bottom of our <body>;
// these javascript files are required by some of the components in Bootstrap.

// http://localhost:8080/urls
