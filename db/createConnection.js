const mongoose = require('mongoose')

const createConnection = (url, parameters) => {
	return mongoose.createConnection(url, { ...parameters })
}

module.exports = createConnection
