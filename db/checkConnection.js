const mongoose = require('mongoose')

const checkDBConnection = async (connection) => {
	connection.on(`error`, console.error.bind(console, `connection error:`))
	connection.once(`open`, function () {
		console.log(`MongoDB connected on `)
	})
}

module.exports = checkDBConnection
