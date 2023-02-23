//Function - takes in an email and returns either the entire user object or null if not found
// const testUsers = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };

const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (email === database[user]["email"]) {
      return database[user];
    }
  }
  return null;
};

module.exports = { getUserByEmail };
