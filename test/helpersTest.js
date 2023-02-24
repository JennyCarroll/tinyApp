const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testUsers = {
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

describe("getUserByEmail()", function () {
  it("should return a user with valid email", function () {
    assert.deepEqual(
      getUserByEmail("user@example.com", testUsers),
      testUsers.userRandomID
    );
  });
  it("should return null if a user is not in the database", function () {
    assert.strictEqual(getUserByEmail("jenny@telus.com", testUsers), null);
  });
});

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

describe("urlsForUser()", function () {
  it("should return an object of URLs that correspond with the user", function () {
    assert.deepEqual(urlsForUser("aJ48lW", urlDatabase), {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
    });
  });
  it("should return an empty object otherwise", function () {
    assert.deepEqual(urlsForUser("g456rg", urlDatabase), {});
  });
});
