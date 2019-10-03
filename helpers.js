const generateRandomString = function() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const findUser = function(email, users) {
  for( let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined
}

const validateEmptyInputs = function(email, password) {
  if (email === "" || password === ""){
    return "error email or password cant be empty"
  }
}

module.exports = {findUser, generateRandomString, validateEmptyInputs};
