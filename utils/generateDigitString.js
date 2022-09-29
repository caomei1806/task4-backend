// generates random string with emplied length
const generateDigitString = (myLength) => {
	const chars = '1234567890'
	const randomArray = Array.from(
		{ length: myLength },
		(v, k) => chars[Math.floor(Math.random() * chars.length)]
	)

	const randomString = randomArray.join('')
	return randomString
}
module.exports = generateDigitString
