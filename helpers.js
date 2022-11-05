const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
       return database[key];
    }
  }
  return undefined;
};

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(7);
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      Object.assign(userUrls, {[key]:urlDatabase[key]});
    }
  }

  return userUrls;
};

const isLoggedIn = function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  isLoggedIn
}