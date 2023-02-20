const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

//the response can contain HTML code, which would be rendered in the client browser.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Start the server by running node express_server.js in your terminal
// Visit http://localhost:8080/ in your browser and make sure you can see the Hello! response.
