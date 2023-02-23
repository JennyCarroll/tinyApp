const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

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
