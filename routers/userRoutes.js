const express = require('express')
const {
	getAllUsers,
	updateUserState,
	deleteUser,
} = require('../controllers/userController')
const { authenticateUser } = require('../middleware/authentication')

const router = express.Router()
router.route('/').get(authenticateUser, getAllUsers)
router.route('/:id').patch(updateUserState).delete(deleteUser)

module.exports = router
