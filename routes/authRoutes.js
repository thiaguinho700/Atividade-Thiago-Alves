/*const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')

// Rota para registrar novos usuarios

router.post('/register',authController.register)

// rota para login

router.post('/login',authController.login);

module.exports = router;
*/
const upload = require("../routes/authController")

require("dotenv").config()
const express = require('express');
const router = express.Router();
const authController = require('../routes/authController');


// Route for registering new users
router.post('/register', upload.upload.single('image') ,authController.register);

// Route for logging in users
router.post('/login', authController.login);

module.exports = router;