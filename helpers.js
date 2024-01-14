function generateRandomString() {
  const char = "abcdefghijklmnopqrstuvwxyz"
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char.charAt(randomIndex);
  }

  return randomString;
}

function getUserByEmail(email, users) {
  for (let u in users) {
    if (users[u].email === email) {
      return users[u];
    }
  }
  return null;
}

const isLoggedIn = function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
};

const urlsForUser = function(userId, urlDatabase) {
  const filteredUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase.hasOwnProperty(key) && urlDatabase[key].userID === userId) {
      filteredUrls[key] = urlDatabase[key];
    }
  }
  return filteredUrls;
}
  
  module.exports = {
    getUserByEmail,
    generateRandomString,
    urlsForUser,
    isLoggedIn
  }