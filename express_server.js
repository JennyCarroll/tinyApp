// npm start
const express = require("express");
var cookieParser = require("cookie-parser");
const { json } = require("express");
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
// we can stack these app.use(express.json())
app.use(express.urlencoded({ extended: true })); //what you pass in to app.use is a callback and you could create your own and use next() within the body of the callback function to call the next middleware

function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 7);
  return result;
}

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "abc",
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
  // If the user is not logged in, redirect GET /urls/new to GET /login
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.redirect("/login");
  }
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
  // If the user is not logged in, POST /urls should respond with an HTML message that tells the user
  // why they cannot shorten URLs. Double check that in this case the URL is not added to the database.
  // *******
  const user = users[req.cookies["user_id"]];
  //this protects against invalid users or nonexistant user from trying to create a new url
  // To test your POST request, enter the following terminal command:curl -X POST -d "longURL=http://www.lighthouselabs.com" localhost:8080/urls
  if (!user) {
    return res.send(
      "<h6>You cannot shorten URLs because you are not logged in!</h6>"
    );
  }
  // Update your express server so that the id-longURL key-value pair are saved to the urlDatabase
  // when it receives a POST request to /urls
  let shortURL = generateRandomString();
  // console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  console.log("URLDatabase:", urlDatabase);
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
  // Ensure the GET /urls/:id page returns a relevant error message to the user if they are not logged in.
  if (!req.cookies["user_id"]) {
    return res.send("<h5>Cannot display short URL, please login :)</h5>");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.send("<h5>URL does not exist</h5>");
  }
  // ensure the GET /urls/:id page returns a relevant error message to the user if they do not own the URL.
  if (req.cookies["user_id"] !== url["userID"]) {
    return res.send("<h5>You can only edit your own urls!</h5>");
  }
  console.log("urlDatabase[req.params.id]:", urlDatabase[req.params.id]);
  console.log("req.params.id:", req.params.id);
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: url["longURL"],
  };
  res.render("urls_show", templateVars);
});

// Create a function named urlsForUser(id) which returns the URLs where the userID is equal
// to the id of the currently logged-in user. We will need to filter the entire list in the urlDatabase
// by comparing the userID in the urlDatabase with the logged-in user's ID from their cookie.
const urlsForUser = function (id) {
  let myURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userID"] === id) {
      myURLs[shortURL] = {
        longURL: urlDatabase[shortURL]["longURL"],
        userID: urlDatabase[shortURL]["userID"],
      };
    }
  }
  return myURLs;
};

//add another page to display URL in its shortened form, this is that endpoint
app.get("/urls", (req, res) => {
  // Return HTML with a relevant error message at GET /urls if the user is not logged in.
  if (!req.cookies["user_id"]) {
    return res.send("<h5>Cannot display URLs, please login :)</h5>");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlsForUser(req.cookies["user_id"]),
  };
  res.render("urls_index", templateVars);
});

//add the following route to handle shortURL requests and Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  // Implement a relevant HTML error message if the id does not exist at GET /u/:id.
  console.log("urlDatabase[req.params.id", urlDatabase[req.params.id]);
  if (!req.params.id || !urlDatabase[req.params.id]) {
    res.send(`<h6>Error, URL ${req.params.id} does not exist</h6>`);
  }
  const longURL = urlDatabase[req.params.id]["longURL"];
  if (longURL === undefined) {
    res.send(`<h6>Error, URL ${req.params.id} does not exist</h6>`);
  }
  res.redirect(longURL);
});

//add the following route to remove a URL resourse and redirect the client back to the urls_index page ("/urls").
app.post("/urls/:id/delete", (req, res) => {
  // should return a relevant error message if id does not exist
  if (!req.params.id) {
    return res.send(`<h6>Error, URL id not provided</h6>`);
  }
  // should return a relevant error message if the user is not logged in
  if (!req.cookies["user_id"]) {
    return res.send(`<h6>Error, you must log in to edit a URL</h6>`);
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.send(`<h6>Error, URL ${req.params.id} does not exist</h6>`);
  }
  // should return a relevant error message if the user does not own the URL
  if (req.cookies["user_id"] !== url["userID"]) {
    return res.send("<h5>You can only edit your own urls!</h5>");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
// Test your new delete route by entering the following curl command into your terminal: curl -X POST "http://localhost:8080/urls/9sm5xK/delete"

//Add a POST route that updates a URL resource; POST /urls/:id and have it update the value of your stored
// long URL based on the new value in req.body.
// the path needs to include a variable that contains the short URL, which is used as an ID to find that shortened URL's data.)
// Finally, redirect the client back to /urls.
app.post("/urls/:id", (req, res) => {
  // should return a relevant error message if id does not exist
  if (!req.params.id) {
    return res.send(`<h6>Error, URL id not provided</h6>`);
  }
  // should return a relevant error message if the user is not logged in
  if (!req.cookies["user_id"]) {
    return res.send(`<h6>Error, you must log in to edit a URL</h6>`);
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.send(`<h6>Error, URL ${req.params.id} does not exist</h6>`);
  }
  // should return a relevant error message if the user does not own the URL
  if (req.cookies["user_id"] !== url["userID"]) {
    return res.send("<h5>You can only edit your own urls!</h5>");
  }
  const id = req.params.id;
  const longURL = req.body.newLongURL;
  urlDatabase[id]["longURL"] = longURL;
  res.redirect("/urls");
});
//req.body holds the input from the form.  req.params is defined in the url token. res. is our response to the client

// Create a GET /login endpoint that responds with this new login form template.
app.get("/login", (req, res) => {
  // If the user is logged in, GET /login should redirect to GET /urls
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  // Update the POST /login endpoint to look up the email address (submitted via the login form)
  // in the user object.
  email = req.body.email;
  const user = getUserByEmail(email);
  if (!user) {
    // If a user with that e-mail cannot be found, return a response with a 403 status code.
    return res.status(400).send("Incorrect E-mail or password");
  }
  // If a user with that e-mail address is located, compare the password given in the form with the existing user's password.
  if (req.body.password !== user.password) {
    // If it does not match, return a response with a 403 status code.
    return res.status(400).send("Incorrect E-mail or password");
  }
  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Implement the /logout endpoint so that it clears the username cookie and redirects the
// user back to the /urls page. We suggest using the res.clearCookie function provided by Express,
// as mentioned in their API documentation
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Create a GET /register endpoint, which returns the registration template
app.get("/register", (req, res) => {
  // If the user is logged in, GET /register should redirect to GET /urls
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

// This function would take in an email as a parameter, and return either the entire user object
// or null if not found.
const getUserByEmail = function (email) {
  for (let user in users) {
    if (email === users[user]["email"]) {
      return users[user];
    }
  }
  return null;
};
// Create a POST /register endpoint. This endpoint should add a new user object to the global users object.
// The user object should include the user's id, email and password.
// After adding the user, set a user_id cookie containing the user's newly generated ID.
// Redirect the user to the /urls page.
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  // If email/password are empty, send back response with 400 status code
  // If someone tries to register with an email that already exists in users object,
  // send response back with 400 status code
  if (!email || !password) {
    return res.status(400).send("Please input username AND password");
  }
  if (getUserByEmail(email)) {
    return res.status(400).send("Account exists. Please login");
  }

  let newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password,
  };
  console.log("users:", users);
  res.cookie("user_id", newUserId); //set the cookie
  res.redirect("/urls"); //happy path post requests always end in a redirect
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
