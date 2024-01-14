//Generates a random string to be used as a key
function generateRandomString() {
  const char = "abcdefghijklmnopqrstuvwxyz"
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char.charAt(randomIndex);
  }

  return randomString;
}

//Search for a user by email
function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

//Check if the user is logged in, if not, redirect to login page
const isLoggedIn = function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
};

//Return the URLs for the userId
const urlsForUser = function(userId, urlDatabase) {
  const filteredUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase.hasOwnProperty(key) && urlDatabase[key].userID === userId) {
      filteredUrls[key] = urlDatabase[key];
    }
  }
  return filteredUrls;
}

//Render the main page passing the right parameters
const renderUrls = function(req, res, users, urlDatabase) {
  let userUrls = urlsForUser(req.session.user_id, urlDatabase);

  const templateVars = { 
    urls: userUrls,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
}
  
  module.exports = {
    getUserByEmail,
    generateRandomString,
    isLoggedIn,
    renderUrls
  }