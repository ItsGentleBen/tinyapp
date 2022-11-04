//Function to check is an email is already registered
const getUserByEmail = (userEmail, database) => {
  for (let user in database) {
    if (database[user].email === userEmail) {
      return user;
    }
  } return null;
};

//Function to generate a random 6 character string for URL
const generateRandomString = () => {
  let randomString = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString;
};

//Function that returns the urls of currently logged in user
const urlsForUser = (id, database) => {
  let userURLs = {};
  for (const url in database) {
    if (database[url].userID === id) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser};