//function to check is an email is already registered
const getUserByEmail = (userEmail, users) => {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return user;
    }
  } return null;
};

module.exports = { getUserByEmail, }