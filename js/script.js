const form = document.getElementById('loginForm')
const passwordInput = document.getElementById('password')
const errorMessage = document.getElementById('errorMessage')
const content = document.getElementById('content')
const loginContainer = document.getElementById('loginContainer')

const correctHash = '$2b$12$S6JU1m.Jmot5PCvPBRvkp.u2qfK60.w5Rvp6BS96wRvr2PGKw8uA6'

form.addEventListener('submit', async event => {
	event.preventDefault()

	const enteredPassword = passwordInput.value

	try {
		const isMatch = await bcrypt.compare(enteredPassword, correctHash)

		if (isMatch) {
			content.style.display = 'block'
			loginContainer.remove()
		} else {
			errorMessage.style.display = 'block'
			passwordInput.value = ''
			passwordInput.focus()
		}
	} catch (err) {
		console.error('Ошибка сравнения пароля:', err)
	}
})
