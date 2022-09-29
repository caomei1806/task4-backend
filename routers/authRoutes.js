const express = require('express')
const { register, login, logout } = require('../controllers/authController')
const { authenticateUser } = require('../middleware/authentication')

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').delete(authenticateUser, logout)

module.exports = router
