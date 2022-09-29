const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const Token = require('../models/Token')
const { CustomAPIError } = require('../errors')
const getAllUsers = async (req, res) => {
	const users = await User.find({})

	res.status(StatusCodes.OK).json({ users, usersCount: users.length })
}
const updateUserState = async (req, res) => {
	const { id: userId } = req.params
	const { manageStatus } = req.body

	const user = await User.findOne({ _id: userId })
	if (!user) {
		throw new CustomAPIError.BadRequestError('User doesnt exist')
	}
	switch (manageStatus) {
		case 'unblock':
			user.blocked = false
			break
		case 'block':
			user.blocked = true
			break
		default:
			break
	}
	user.save()

	res.status(StatusCodes.OK).json({ user })
}
const deleteUser = async (req, res) => {
	const { id: userId } = req.params

	await User.findOneAndDelete({ _id: userId })
	await Token.findOneAndDelete({ user: userId })

	res.status(StatusCodes.OK).json({ msg: 'User deleted' })
}

module.exports = { getAllUsers, updateUserState, deleteUser }
