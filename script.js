document.addEventListener('DOMContentLoaded', async () => {
    // --- Конфигурация Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyBpaUjpnrH2QfLlK1QSr_KGeCJEt_U0OBU",
        authDomain: "habits-ai-mvp.firebaseapp.com",
        projectId: "habits-ai-mvp",
    };

    // --- Инициализация сервисов ---
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // --- Глобальные переменные ---
    let userId = null;
    // Наша новая структура данных по умолчанию
    let dbData = {
        habits: [
            { id: 'h1', icon: '💧', text: 'Выпить стакан воды после пробуждения' },
            { id: 'h2', icon: '✍️', text: 'Определить главную задачу дня' },
            { id: 'h3', icon: '📖', text: 'Читать 1 страницу перед сном' }
        ],
        progress: {}, // Пример: { '2024-07-06': ['h1', 'h3'] }
    };
    
    const habitListEl = document.getElementById('habit-list');
    const progressBarEl = document.getElementById('progress-bar');
    const progressLabelEl = document.getElementById('progress-label');

    // --- Функция отрисовки главного экрана ---
    function renderMainScreen() {
        habitListEl.innerHTML = ''; // Очищаем список
        const todayStr = new Date().toISOString().split('T')[0];
        const todayProgress = dbData.progress[todayStr] || [];

        dbData.habits.forEach(habit => {
            const isDone = todayProgress.includes(habit.id);
            const li = document.createElement('li');
            li.className = `habit-item ${isDone ? 'done' : ''}`;
            li.dataset.id = habit.id;
            li.innerHTML = `
                <div class="icon">${habit.icon}</div>
                <div class="text">${habit.text}</div>
                <div class="checkbox"></div>
            `;
            habitListEl.appendChild(li);
        });
        updateProgressBar();
    }
    
    // --- Функция обновления прогресс-бара ---
    function updateProgressBar() {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayProgress = dbData.progress[todayStr] || [];
        const totalHabits = dbData.habits.length;
        const doneHabits = todayProgress.length;
        
        const percentage = totalHabits > 0 ? (doneHabits / totalHabits) * 100 : 0;
        progressBarEl.style.width = `${percentage}%`;
        progressLabelEl.textContent = `Выполнено ${doneHabits} из ${totalHabits}`;
    }

    // --- Обработчик кликов по списку привычек ---
    habitListEl.addEventListener('click', async (event) => {
        const habitItem = event.target.closest('.habit-item');
        if (habitItem && !habitItem.classList.contains('done')) {
            const habitId = habitItem.dataset.id;
            const todayStr = new Date().toISOString().split('T')[0];

            // Обновляем локальные данные
            if (!dbData.progress[todayStr]) {
                dbData.progress[todayStr] = [];
            }
            dbData.progress[todayStr].push(habitId);
            
            // Визуальное обновление и сохранение
            habitItem.classList.add('done');
            updateProgressBar();
            tg.HapticFeedback.notificationOccurred('success');
            await firestore.collection('users').doc(userId).update({
                [`progress.${todayStr}`]: dbData.progress[todayStr]
            });
        }
    });

    // --- Функция инициализации UI ---
    function initUI() {
        document.getElementById('loader').style.display = 'none';
        showFlow('main-app');
        renderMainScreen();
    }

    // --- Авторизация и запуск ---
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            userId = user.uid;
            const docRef = firestore.collection('users').doc(userId);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                // Загружаем данные пользователя, если они есть
                const userData = docSnap.data();
                // Объединяем, чтобы сохранить стандартные привычки, если у пользователя их нет
                dbData = { ...dbData, ...userData };
            } else {
                // Создаем новый документ для нового пользователя
                await docRef.set(dbData);
            }
            initUI();
        } else {
            await auth.signInAnonymously();
        }
    });
});
