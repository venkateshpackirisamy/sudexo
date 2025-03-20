const bcrypt = require('bcrypt');
const saltRounds = 10;

// Function to hash a password
async function hashPassword(password) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(saltRounds);
    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    return 'error'
  }
}

// Function to verify a password
async function verifyPassword(inputPassword, storedHashedPassword) {
  try {
    // Compare the input password with the stored hashed password
    const match = await bcrypt.compare(inputPassword, storedHashedPassword);
    return match;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

module.exports =  {hashPassword,verifyPassword}

