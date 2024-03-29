const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const { json } = require("express");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const { urlDatabase, users } = require("./database");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const app = express();
app.use(
  cookieSession({
    name: "session",
    keys: ["Ariel", "is", "a", "dog"],
  })
);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(methodOverride("_method"));
const PORT = 8080;

//GET / endpoint: if user is not logged in, redirect to login
app.get("/", (req, res) => {
  const user = users[req.session["user_id"]];
  // If user is logged in, redirect to /login
  if (!user) {
    res.redirect("/login");
  }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET /login endpoint: if no one is logged in, renders the urls_login template
app.get("/login", (req, res) => {
  // If user is logged in, redirect to /urls
  const user = users[req.session["user_id"]];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

//POST /login endpoint: if they are a user + password matches, set user_id cookie
// with matching user's ID, then redirect to /urls
app.post("/login", (req, res) => {
  // look up the email address (submitted via the login form) in the user object
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if (!user) {
    // If user with that e-mail not found, return a 403 status code.
    return res.status(400).send("Incorrect E-mail or password");
  }
  //keep the below line here
  const checkPassword = bcrypt.compareSync(req.body.password, user.password);
  // If user with that e-mail, compare the password with existing password, if it does not match, return a 403 status code
  if (!checkPassword) {
    return res.status(400).send("Incorrect E-mail or password");
  }
  // res.cookie("user_id", user.id);
  req.session["user_id"] = user.id;
  res.redirect("/urls");
});

//GET /register endpoint: if no one is logged in, renders the urls_register template
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  // If the user is logged in, redirect to GET /urls
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("urls_register", templateVars);
});

//POST /register endpoint: if password and email are filled in and email is a new email,
// adds a new user object to the global users object, sets a cookie, redirects to /urls
app.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // If email/password are empty or already exist, send back response with 400 status code
  if (!email || !password) {
    return res.status(400).send("Please input username AND password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Account exists. Please login");
  }
  users[newUserId] = {
    id: newUserId,
    email,
    password: hashedPassword,
  };
  req.session["user_id"] = newUserId;
  res.redirect("/urls");
});

//GET /urls/new route: if the user is logged in, render urls_new
app.get("/urls/new", (req, res) => {
  // If the user is not logged in, redirect to /login
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = {
    // pass the entire user object to the template
    user: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//GET /urls/:id route handler: if they are logged in, the id exists and they own it, render urls_show
app.get("/urls/:id", (req, res) => {
  const cookie = req.session["user_id"];
  const id = req.params.id;
  const url = urlDatabase[id];
  //returns relevant error message to the user if they are not logged in
  if (!cookie) {
    return res
      .status(404)
      .send("<h5>Cannot display short URL, please login :)</h5>");
  }
  //returns relevant error message to the user if URL does not exist
  if (!url) {
    return res
      .status(404)
      .send("<h5>no URL with provided id in our database</h5>");
  }
  //returns relevant error message to the user if they do not own the URL
  if (cookie !== url["userID"]) {
    return res.status(400).send("<h5>You can only edit your own urls!</h5>");
  }
  const templateVars = {
    user: users[cookie],
    id,
    longURL: url["longURL"],
  };
  res.render("urls_show", templateVars);
});

//PUT /urls/:id endpoint: update the value of stored long URL based on the new value submitted in the form
// Finally, redirect the client back to /urls.
app.put("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.newLongURL;
  const cookie = req.session["user_id"];
  const url = urlDatabase[id];
  // return relevant error message if the user is not logged in
  if (!cookie) {
    return res
      .status(400)
      .send(`<h6>Error, you must log in to edit a URL</h6>`);
  }
  //return relevant error if no URL id is provided
  if (!longURL) {
    return res.status(404).send(`<h6>Error, URL not provided</h6>`);
  }
  // return relevant error message if id does not exist
  if (!url) {
    return res.status(404).send(`<h6>Error, URL ${id} does not exist</h6>`);
  }
  // return relevant error message if the user does not own the URL
  if (cookie !== url["userID"]) {
    return res.status(400).send("<h5>You can only edit your own urls!</h5>");
  }
  urlDatabase[id]["longURL"] = longURL;
  res.redirect("/urls");
});

//DELETE /urls/:id/delete endpoint: remove a URL resourse and redirect to /urls
app.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const cookie = req.session["user_id"];
  //return relevant error message if id does not exist
  if (!id) {
    return res.status(404).send(`<h6>Error, URL id not provided</h6>`);
  }
  //return relevant error message if the user is not logged in
  if (!cookie) {
    return res
      .status(400)
      .send(`<h6>Error, you must log in to edit a URL</h6>`);
  }
  const url = urlDatabase[id];
  if (!url) {
    return res.status(404).send(`<h6>Error, URL ${id} does not exist</h6>`);
  }
  //return relevant error message if the user does not own the URL
  if (cookie !== url["userID"]) {
    return res.status(400).send("<h5>You can only edit your own urls!</h5>");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

//GET /u/:id endpoint: if id exists and longURL is defined redirect to the longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id] === undefined) {
    res.status(404).send(`<h6>Error, URL ${id} does not exist</h6>`);
  }
  const longURL = urlDatabase[id]["longURL"];
  // if URL for the given ID does not exist, it should return HTML with a relevant error message.
  //relevant HTML error message if the id does not exist at GET /u/:id.
  if (!id || !urlDatabase[id]) {
    res.status(404).send(`<h6>Error, URL ${id} does not exist</h6>`);
  }
  if (longURL === undefined) {
    res.status(404).send(`<h6>Error, URL ${id} does not exist</h6>`);
  }
  res.redirect(longURL);
});

//GET /urls endpoint: if user is logged in, render urls_index
app.get("/urls", (req, res) => {
  const cookie = req.session["user_id"];
  // return HTML with a relevant error message at if the user is not logged in
  if (!cookie) {
    return res
      .status(400)
      .send("<h5>Cannot display URLs, please login :)</h5>");
  }
  const templateVars = {
    user: users[cookie],
    urls: urlsForUser(cookie, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

//POST /urls endpoint: if user is logged in, save the id-longURL key-value pair to the urlDatabase
// then redirect to /urls/:id
app.post("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  const shortURL = generateRandomString();
  // If the user is not logged in, respond with an HTML message that tells the user to log in
  if (!user) {
    return res
      .status(400)
      .send("<h6>You cannot shorten URLs because you are not logged in!</h6>");
  }
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  res.redirect(`/urls/${shortURL}`);
});

//POST /logout endpoint: clears the username cookie and redirects to /login
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
