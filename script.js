document.addEventListener('DOMContentLoaded', function() {
    
    // --- Получаем доступ ко всем нашим элементам на странице ---
    const onboardingFlow = document.getElementById('onboarding-flow');
    const mainApp = document.getElementById('main-app');
    const mainScreen = document.getElementById('main-screen');
    const progressScreen = document.getElementById('progress-screen');
    const successOverlay = document.getElementById('success-overlay');

    // --- БАЗА ДАННЫХ (на localStorage) ---
    let db = {
        onboardingCompleted: false,
        progress: {}, // Пример: { '2024-07-04': true }
        streaks: { current: 0, best: 0 },
        registrationDate: null
    };

    // --- Функции для работы с "Базой Данных" ---
    function loadDB() {
        const savedDB = localStorage.getItem('habitsAIDB');
        if (savedDB) {
            db = JSON.parse(savedDB);
        }
    }

    function saveDB() {
        localStorage.setItem('habitsAIDB', JSON.stringify(db));
    }

    // --- Функции для навигации и отображения ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.classList.add('active');
        }
    }

    function showFlow(flowId) {
        document.querySelectorAll('.flow-container').forEach(f => f.classList.remove('active'));
        const flowToShow = document.getElementById(flowId);
        if (flowToShow) {
            flowToShow.classList.add('active');
        }
    }

    // --- Функция отрисовки прогресса (с календарем) ---
    function renderProgress() {
        // Обновляем счетчики серий
        document.querySelector('.streaks-container .streak-item:nth-child(1) h3').textContent = `${db.streaks.current} 🔥`;
        document.querySelector('.streaks-container .streak-item:nth-child(2) h3').textContent = `${db.streaks.best} 🏆`;

        // Отрисовка календаря
        const calendarContainer = document.querySelector('.calendar-container');
        calendarContainer.innerHTML = ''; 

        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        const header = document.createElement('h3');
        header.textContent = `${monthNames[month]} ${year}`;
        calendarContainer.appendChild(header);

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        
        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekdays.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-name';
            dayEl.textContent = day;
            daysGrid.appendChild(dayEl);
        });
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const emptyDays = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < emptyDays; i++) {
            daysGrid.appendChild(document.createElement('div'));
        }
      
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-cell';
            dayEl.textContent = i;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (db.progress[dateStr]) {
                dayEl.classList.add('done');
            }
            if (i === today.getDate()) {
                dayEl.classList.add('today');
            }
            daysGrid.appendChild(dayEl);
        }
        
        calendarContainer.appendChild(daysGrid);
    }
    
    // --- ГЛАВНЫЙ ОБРАБОТЧИК ВСЕХ НАЖАТИЙ ---
    document.body.addEventListener('click', function(event) {
        const button = event.target;
        
        // Навигация по онбордингу
        if (button.dataset.next && button.closest('#onboarding-flow')) {
            showScreen(button.dataset.next);
        }
        
        // Завершение онбординга
        if (button.id === 'finish-onboarding-button') {
            db.onboardingCompleted = true;
            db.registrationDate = new Date().toISOString().split('T')[0];
            saveDB();
            showFlow('main-app');
            showScreen('main-screen');
        }

        // Переход на экран прогресса с главного экрана
        if (button.closest('[data-next="progress-screen"]')) {
            renderProgress();
            showScreen('progress-screen');
        }
        
        // Возврат на главный экран с экрана прогресса
        if (button.closest('[data-next="main-screen"]')) {
            showScreen('main-screen');
        }

        // --- ВОТ ОБРАБОТЧИК КНОПКИ "СДЕЛАЛ!" ---
        if (button.classList.contains('success-button')) {
            const today = new Date().toISOString().split('T')[0];
            
            // Защита от повторного нажатия
            if (db.progress[today]) return; 

            // Обновляем прогресс
            db.progress[today] = true;
            
            // Обновляем стрики
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (db.progress[yesterday]) {
                db.streaks.current += 1;
            } else {
                db.streaks.current = 1;
            }
            
            if (db.streaks.current > db.streaks.best) {
                db.streaks.best = db.streaks.current;
            }
            // Кнопка сброса прогресса (для тестирования)
if (button.id === 'reset-button') {
    // Запрашиваем подтверждение, чтобы не сбросить случайно
    const isConfirmed = confirm('Вы уверены, что хотите сбросить весь прогресс и начать заново?');
    if (isConfirmed) {
        localStorage.removeItem('habitsAIDB'); // Удаляем нашу базу данных
        location.reload(); // Перезагружаем страницу
    }
}
            
            saveDB();
            
            // Показываем анимацию победы
            successOverlay.classList.add('active');

            // Через 2 секунды скрываем анимацию и переходим на экран прогресса
            setTimeout(() => {
                successOverlay.classList.remove('active');
                renderProgress();
                showScreen('progress-screen');
            }, 2000);
        }
    });

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ПРИ ЗАПУСКЕ ---
    loadDB();
    if (db.onboardingCompleted) {
        showFlow('main-app');
        showScreen('main-screen');
    } else {
        showFlow('onboarding-flow');
        showScreen('welcome-screen');
    }
});
