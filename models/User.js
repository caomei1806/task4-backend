const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide name'],
		minlength: 3,
		maxlength: 50,
	},
	email: {
		type: String,
		unique: true,
		required: [true, 'Please provide email'],
		validate: {
			message: 'Please provide valid email',
			validator: validator.isEmail,
		},
	},
	password: {
		type: String,
		required: [true, 'Please provide password'],
		minlength: 1,
	},
	blocked: {
		type: Boolean,
		default: false,
	},
	accessToken: {
		type: String,
	},
	registration_time: {
		type: Date,
		default: Date.now,
	},
	login_time: {
		type: Date,
	},
})
UserSchema.pre('save', async function () {
	// in order to not hash the password every time we update user
	// you break the functionality if the password is not modified
	if (!this.isModified('password')) return
	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})
UserSchema.methods.comparePassword = async function (candidatePassword) {
	const isMatching = await bcrypt.compare(candidatePassword, this.password)
	return isMatching
}
module.exports = mongoose.model('User', UserSchema)
