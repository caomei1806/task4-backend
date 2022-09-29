const User = require('../models/User')
const Token = require('../models/Token')

const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
	attachCookiesToResponse,
	createTokenUser,
	createJWT,
} = require('../utils')
const crypto = require('crypto')

const register = async (req, res) => {
	const { email, name, password } = req.body

	const emailAlreadyExists = await User.findOne({ email })
	if (emailAlreadyExists) {
		throw new CustomError.BadRequestError('Email already exists')
	}

	const temporaryUser = new User({
		name,
		email,
		password,
	})

	const accessTokenUser = createTokenUser(temporaryUser)

	// create initial token for new user
	const jwtAccessToken = createJWT({ payload: { accessTokenUser } })
	console.log(jwtAccessToken)

	// verification info that is passed into email verification system
	const verifyInfo = {
		jwtAccessToken,
		userEmail: email,
		userName: name,
	}

	const user = await User.create({
		name,
		email,
		password,
		accessToken: jwtAccessToken,
	})

	res.status(StatusCodes.CREATED).json({ user })
}
const login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		throw new CustomError.BadRequestError('Please provide email and password')
	}
	const user = await User.findOne({ email })

	if (!user) {
		throw new CustomError.UnauthenticatedError('Invalid Credentials')
	}
	const isPasswordCorrect = await user.comparePassword(password)
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError('Invalid Credentials')
	}
	if (user.blocked) {
		throw new CustomError.UnauthenticatedError('Account blocked')
	}
	const tokenUser = createTokenUser(user)

	let refreshToken = ''

	const existingToken = await Token.findOne({ user: user._id })
	if (existingToken) {
		const { isValid } = existingToken
		if (!isValid) {
			throw new CustomError.UnauthenticatedError('Invalid credentials')
		}
		refreshToken = existingToken.refreshToken
		attachCookiesToResponse({ res, user: tokenUser, refreshToken })
		res.status(StatusCodes.OK).json({ user: tokenUser })
		return
	}

	refreshToken = crypto.randomBytes(40).toString('hex')
	const userAgent = req.headers['user-agent']
	const ip = req.ip
	const userToken = { refreshToken, ip, userAgent, user: user._id }

	await Token.create(userToken)
	attachCookiesToResponse({ res, user: tokenUser, refreshToken })

	res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
	console.log('pre logout')
	// delete existing token for user
	await Token.findOneAndDelete({ user: req.user.userId })

	// make all existing tokens stored in cookies expire
	res.cookie('accessToken', 'logout', {
		httpOnly: true,
		expires: new Date(Date.now()),
	})
	res.cookie('refreshToken', 'logout', {
		httpOnly: true,
		expires: new Date(Date.now()),
	})
	res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

module.exports = {
	register,
	login,
	logout,
}
