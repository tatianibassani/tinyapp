const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'user2RandomID'
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$ot3mVXNF9Gjxmtyt3Zu7NeOktm1xIN8JnUl0zVUiFWTxpeyNoZKBS",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$ot3mVXNF9Gjxmtyt3Zu7NeOktm1xIN8JnUl0zVUiFWTxpeyNoZKBS",
  },
};

module.exports = {urlDatabase, users};