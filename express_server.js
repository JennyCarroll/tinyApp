// npm start
const express = require("express");
var cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

//middleware always runs when you hit the server with a request
// When our browser submits a POST request, the data in the request body is sent as a Buffer.
// While this data type is great for transmitting data, it's not readable for us humans.
// To make this data readable, we will need to use another piece of middleware which will translate,
// or parse the body. This feature is part of Express.
app.use(express.urlencoded({ extended: true })); //what you pass in to app.use is a callback and you could create your own and use next() within the body of the callback function to call the next middleware

function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 7);
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//here is one endpoint
app.get("/", (req, res) => {
  res.send("Hello!");
});

//add an additional endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// http//:

//new get route to show the form
// The GET /urls/new route needs to be defined before the GET /urls/:id route.
// Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition,
// any calls to /urls/new will be handled by app.get("/urls/:id", ...)
// because Express will think that new is a route parameter.
// A good rule of thumb to follow is that routes should be ordered from most specific to least specific.
app.get("/urls/new", (req, res) => {
  const templateVars = {
    // Update all endpoints that currently pass a username value to the templates to pass the entire user
    // object to the template instead.
    // username: req.cookies["username"],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});
// When we navigate to /urls/new in our browser, our browser makes a GET request to our newly created route.
// Our sever responds by finding urls_new template, generating the HTML, and sending it back to the browser.
// The browser then renders this HTML.

// The body-parser library will convert the request body from a Buffer into string that we can read.
// It will then add the data to the req(request) object under the key body.
// (If you find that req.body is undefined, it may be that the body-parser middleware is not being run correctly.)
app.post("/urls", (req, res) => {
  // Update your express server so that the id-longURL key-value pair are saved to the urlDatabase
  // when it receives a POST request to /urls
  let shortURL = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  // Update your express server so that when it receives a POST request to /urls it responds with
  // a redirection to /urls/:id.
  res.redirect(`/urls/${shortURL}`);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
// the data in the input field will be avaialbe to us in the req.body.longURL variable,
// which we can store in our urlDatabase object.
// (Later we'll store these URLs in a real database, but for now we're focusing on the communication between server and client.)

//route handler for /urls that renders using our template and template variable object
// The : in front of id indicates that id is a route parameter. This means that the value in
// this part of the url will be available in the req.params object.
app.get("/urls/:id", (req, res) => {
  console.log(req);
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

//add another page to display URL in its shortened form, this is that endpoint
app.get("/urls", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//add the following route to handle shortURL requests and Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!req.params.id || longURL === undefined) {
    res.send("URL doesn't exit");
  }
  res.redirect(longURL);
});

//add the following route to remove a URL resourse and redirect the client back to the urls_index page ("/urls").
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
// Test your new delete route by entering the following curl command into your terminal: curl -X POST "http://localhost:8080/urls/9sm5xK/delete"

//Add a POST route that updates a URL resource; POST /urls/:id and have it update the value of your stored
// long URL based on the new value in req.body.
// the path needs to include a variable that contains the short URL, which is used as an ID to find that shortened URL's data.)
// Finally, redirect the client back to /urls.
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.newLongURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});
//req.body holds the input from the form.  req.params is defined in the url token. res. is our response to the client

//Add an endpoint to handle a POST to /login in your Express server.
// It should set a cookie named username to the value submitted in the request body via the login form.
// After our server has set the cookie it should redirect the browser back to the /urls page.
app.post("/login", (req, res) => {
  // res.cookie("username", req.body.username);
  //now that we have the name from the form and have created a cookie we can use req.cookies["username"] to access it
  res.redirect("/urls");
});

// Implement the /logout endpoint so that it clears the username cookie and redirects the
// user back to the /urls page. We suggest using the res.clearCookie function provided by Express,
// as mentioned in their API documentation
app.post("/logout", (req, res) => {
  // res.clearCookie("username");
  res.redirect("/urls");
});

//Create a GET /register endpoint, which returns the registration template
app.get("/register", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

// Create a POST /register endpoint. This endpoint should add a new user object to the global users object.
// The user object should include the user's id, email and password.
// After adding the user, set a user_id cookie containing the user's newly generated ID.
// Redirect the user to the /urls page.
app.post("/register", (req, res) => {
  let newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password,
  };
  console.log("users:", users);
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
});

//the response can contain HTML code, which would be rendered in the client browser.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Start the server by running node express_server.js in your terminal
// Visit http://localhost:8080/ in your browser and make sure you can see the Hello! response.
// Notice the external link we've included in the <head> tag; this stylesheet is from Bootstrap,
// one of the most popular CSS frameworks around. We'll use it in our app so that we have some basic CSS
// styling available to us. We've also included a number of <script> tags at the bottom of our <body>;
// these javascript files are required by some of the components in Bootstrap.

// http://localhost:8080/urls
