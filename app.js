require('express-async-errors')
require('dotenv').config()

const express = require('express')
const app = express()

// additional packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// database connection
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routers/authRoutes')
const userRouter = require('./routers/userRoutes')

// middleware
const NotFoundMiddleware = require('./middleware/not-found')
const ErrorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(
	rateLimiter({
		windowsMs: 15 * 60 * 1000,
		max: 60,
	})
)
app.use(helmet())
const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true,
}
app.use(cors(corsOptions))
app.use(xss())
app.use(mongoSanitize())

app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)

app.use(NotFoundMiddleware)
app.use(ErrorHandlerMiddleware)

const port = process.env.PORT || 5001

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URL)
		app.listen(port, () => {
			console.log(`Server is listening on port ${port}...`)
		})
	} catch (error) {
		console.log(error)
	}
}
start()
