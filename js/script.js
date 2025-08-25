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

document.addEventListener('DOMContentLoaded', function () {
	// Инициализация Supabase клиента
	const SUPABASE_URL = 'https://eyhanthbvtfisucxctso.supabase.co'
	const SUPABASE_ANON_KEY =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aGFudGhidnRmaXN1Y3hjdHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjYxMDQsImV4cCI6MjA3MDk0MjEwNH0.aM4wHWRbRyLn0xEJGoqnK7U_OCO5YWexZkQwQ8MfvaE'
	const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

	// Функция для сохранения билета в localStorage
	function saveTicketToLocalStorage(ticket) {
		const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
		tickets.push(ticket)
		localStorage.setItem('tickets', JSON.stringify(tickets))
		console.log('Билет сохранен в localStorage:', ticket)
	}

	// Заглушка для loadStoredTickets, если не определена
	window.loadStoredTickets =
		window.loadStoredTickets ||
		function () {
			const tickets = JSON.parse(localStorage.getItem('tickets') || '[]')
			console.log('loadStoredTickets: Билеты из localStorage:', tickets)
			// Предполагается, что здесь обновляется интерфейс (например, список билетов)
			// Добавьте код для отображения билетов, если он известен
			const ticketList = document.getElementById('ticketList') // Замените на ваш элемент
			if (ticketList) {
				ticketList.innerHTML = tickets
					.map(
						ticket => `
            <div class="ticket">
              <p>${ticket.transportType} ${ticket.route} (${ticket.additionalNumber || ''})${ticket.ticketNumber}</p>
              <p>Дата: ${ticket.time}</p>
              <p>Цена: ${ticket.price}</p>
              <p>Код: ${ticket.verificationCode}</p>
            </div>
          `,
					)
					.join('')
			}
		}

	document.getElementById('ticketForm').addEventListener('submit', async function (event) {
		event.preventDefault()
		console.log('Форма отправлена на устройстве:', navigator.userAgent)

		const transportType = document.querySelector('input[name="transportType"]:checked')?.value
		const ticketNumber = document.getElementById('ticketNumber').value
		const additionalNumber = document.getElementById('additionalNumber').value || ''
		const route = document.getElementById('route').value
		const time = document.getElementById('time').value
		const price = document.getElementById('price').value
		const verificationCode = document.getElementById('verificationCode').value

		// Проверка валидности данных
		if (!transportType) {
			alert('Выберите тип транспорта')
			console.log('Ошибка: Тип транспорта не выбран')
			return
		}
		if (!ticketNumber || !route) {
			alert('Заполните обязательные поля: Номер билета и Маршрут')
			console.log('Ошибка: Обязательные поля пусты', { ticketNumber, route })
			return
		}

		// Проверка уникальности в bus_data
		const { data: existing, error: selectError } = await supabase
			.from('bus_data')
			.select('id')
			.eq('number', ticketNumber)
			.eq('additional', additionalNumber || '')
			.eq('transport', route)

		if (selectError) {
			alert('Ошибка при проверке данных: ' + selectError.message)
			console.error('Ошибка проверки уникальности:', selectError)
			return
		}

		// Если запись не существует, сохраняем в bus_data
		if (existing.length === 0) {
			const { error } = await supabase.from('bus_data').insert([
				{
					transport: route,
					additional: additionalNumber || null,
					number: ticketNumber,
					transport_type: transportType,
				},
			])
			if (error) {
				alert('Ошибка при сохранении в базу данных: ' + error.message)
				console.error('Ошибка сохранения в bus_data:', error)
				return
			}
			console.log('Запись добавлена в bus_data:', {
				transport: route,
				additional: additionalNumber,
				number: ticketNumber,
				transport_type: transportType,
			})
		} else {
			console.log('Запись уже существует:', { ticketNumber, additionalNumber, route })
		}

		// Форматирование времени для localStorage
		const dateObj = new Date(time)
		const formattedDate =
			('0' + dateObj.getDate()).slice(-2) +
			'.' +
			('0' + (dateObj.getMonth() + 1)).slice(-2) +
			'.' +
			dateObj.getFullYear().toString().slice(-2)
		const formattedTime = ('0' + dateObj.getHours()).slice(-2) + ':' + ('0' + dateObj.getMinutes()).slice(-2)
		const formattedDateTime = formattedDate + ' ' + formattedTime

		const fullTicketCode = additionalNumber ? `(${additionalNumber})${ticketNumber}` : ticketNumber

		// Сохранение билета в localStorage
		saveTicketToLocalStorage({
			transportType,
			ticketNumber,
			additionalNumber,
			route,
			time: formattedDateTime,
			price,
			verificationCode,
			createdAt: Date.now(),
		})

		// Безопасный вызов loadStoredTickets
		if (typeof window.loadStoredTickets === 'function') {
			window.loadStoredTickets()
		} else {
			console.warn('loadStoredTickets не определена, используется заглушка')
		}

		// Закрытие модального окна
		try {
			const myModal = bootstrap.Modal.getInstance(document.getElementById('addTicketModal'))
			if (myModal) {
				myModal.hide()
			} else {
				console.warn('Модальное окно addTicketModal не найдено')
			}
		} catch (error) {
			console.error('Ошибка при закрытии модального окна:', error)
		}

		// Сброс формы
		document.getElementById('ticketForm').reset()
		console.log('Форма сброшена')
	})
})
