document.addEventListener('DOMContentLoaded', function() {
    const onboardingFlow = document.getElementById('onboarding-flow');
    const mainApp = document.getElementById('main-app');
    
    // --- БАЗА ДАННЫХ (на localStorage) ---
    let db = {
        onboardingCompleted: false,
        progress: {}, // { '2024-07-04': true }
        streaks: { current: 0, best: 0 }
    };

    // --- Функции для работы с базой данных ---
    function loadDB() {
        const savedDB = localStorage.getItem('habitsAIDB');
        if (savedDB) {
            db = JSON.parse(savedDB);
        }
    }

    function saveDB() {
        localStorage.setItem('habitsAIDB', JSON.stringify(db));
    }

    // --- Функции для отображения ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function showFlow(flowId) {
        document.querySelectorAll('.flow-container').forEach(f => f.classList.remove('active'));
        document.getElementById(flowId).classList.add('active');
    }
    
    function renderProgress() {
        // Обновляем счетчики серий
        document.querySelector('.streaks-container .streak-item:nth-child(1) h3').textContent = `${db.streaks.current} 🔥`;
        document.querySelector('.streaks-container .streak-item:nth-child(2) h3').textContent = `${db.streaks.best} 🏆`;
        // Здесь в будущем будет отрисовка календаря
    }
    
    // --- Обработчики Кнопок ---
    document.body.addEventListener('click', function(event) {
        const button = event.target;
        
        // Навигация по онбордингу
        if (button.dataset.next && button.closest('#onboarding-flow')) {
            showScreen(button.dataset.next);
        }

        // Завершение онбординга
        if (button.id === 'finish-onboarding-button') {
            db.onboardingCompleted = true;
            saveDB();
            showFlow('main-app');
            showScreen('main-screen');
        }

        // Переход на экран прогресса
        if (button.dataset.next === 'progress-screen') {
            renderProgress();
            showScreen('progress-screen');
        }
        
        // Возврат на главный экран
        if (button.dataset.next === 'main-screen') {
            showScreen('main-screen');
        }

        // Кнопка "СДЕЛАЛ!"
        if (button.classList.contains('success-button')) {
            const today = new Date().toISOString().split('T')[0]; // '2024-07-04'
            
            if (!db.progress[today]) {
                db.progress[today] = true;
                
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (db.progress[yesterday]) {
                    db.streaks.current += 1; // Продолжаем серию
                } else {
                    db.streaks.current = 1; // Начинаем новую
                }
                
                if (db.streaks.current > db.streaks.best) {
                    db.streaks.best = db.streaks.current;
                }
                
                saveDB();
                
                // Показываем обновленный прогресс
                renderProgress();
                showScreen('progress-screen');
                
                // Добавляем эффект!
                button.textContent = '🎉 Отлично!';
                setTimeout(() => { button.textContent = '✅ Сделал!'; }, 2000);
            }
        }
    });

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
    loadDB();
    if (db.onboardingCompleted) {
        showFlow('main-app');
        showScreen('main-screen');
    } else {
        showFlow('onboarding-flow');
        showScreen('welcome-screen');
    }
});
