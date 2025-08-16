const form = document.getElementById('loginForm')
const passwordInput = document.getElementById('password')
const errorMessage = document.getElementById('errorMessage')
const content = document.getElementById('content')
const loginContainer = document.getElementById('loginContainer')
const matrixCanvas = document.getElementById('matrixCanvas')
const matrixBackground = document.getElementById('matrixBackground')

const correctHash = '$2b$12$S6JU1m.Jmot5PCvPBRvkp.u2qfK60.w5Rvp6BS96wRvr2PGKw8uA6'
let attempts = 0

// Matrix Rain effect
function startMatrixRain() {
	const ctx = matrixCanvas.getContext('2d')
	matrixCanvas.height = window.innerHeight
	matrixCanvas.width = window.innerWidth

	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'
	const fontSize = 14
	const columns = matrixCanvas.width / fontSize
	const drops = Array(Math.floor(columns)).fill(1)

	function draw() {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
		ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height)
		ctx.fillStyle = '#ff0000'
		ctx.font = `${fontSize}px monospace`

		for (let i = 0; i < drops.length; i++) {
			const text = chars.charAt(Math.floor(Math.random() * chars.length))
			const x = i * fontSize
			const y = drops[i] * fontSize

			ctx.fillText(text, x, y)

			if (y > matrixCanvas.height && Math.random() > 0.975) {
				drops[i] = 0
			}
			drops[i]++
		}
	}

	matrixCanvas.style.display = 'block'
	matrixBackground.style.display = 'block'
	loginContainer.style.display = 'none'
	setInterval(draw, 33)
}

// Resize canvas on window resize for responsiveness
window.addEventListener('resize', () => {
	matrixCanvas.height = window.innerHeight
	matrixCanvas.width = window.innerWidth
})

form.addEventListener('submit', async event => {
	event.preventDefault()

	const enteredPassword = passwordInput.value

	try {
		const isMatch = await bcrypt.compare(enteredPassword, correctHash)

		if (isMatch) {
			content.style.display = 'block'
			loginContainer.remove()
			matrixCanvas.style.display = 'none'
			matrixBackground.style.display = 'none'
			attempts = 0 // Reset attempts on successful login
		} else {
			attempts++
			errorMessage.style.display = 'block'
			passwordInput.value = ''
			passwordInput.focus()

			if (attempts >= 2) {
				startMatrixRain()
			}
		}
	} catch (err) {
		console.error('Ошибка сравнения пароля:', err)
	}
})
