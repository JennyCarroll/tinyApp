//Function - takes in an email and returns either the entire user object or null if not found
const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (email === database[user]["email"]) {
      return database[user];
    }
  }
  return null;
};

//Function - renerate random string
function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 7);
  return result;
}

//Function - returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function (id, urlDatabase) {
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
