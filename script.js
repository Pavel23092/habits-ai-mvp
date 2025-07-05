document.addEventListener('DOMContentLoaded', async () => {
    // --- Инициализация Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyBpaUjpnrH2QfLlK1QSr_KGeCJEt_U0OBU",
        authDomain: "habits-ai-mvp.firebaseapp.com",
        projectId: "habits-ai-mvp",
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const firestore = firebase.firestore();

    // --- Инициализация Telegram Web App ---
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // --- Глобальные переменные ---
    let userId = null;
    let dbData = {};

    // --- Функции для навигации ---
    const showFlow = (flowId) => {
        document.querySelectorAll('.flow-container').forEach(f => f.style.display = 'none');
        document.getElementById(flowId).style.display = 'flex';
    };
    const showScreen = (screenId) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
    };

    // --- Функция отрисовки прогресса ---
    function renderProgress() {
        document.getElementById('current-streak').innerHTML = `${dbData.streaks.current} 🔥`;
        document.getElementById('best-streak').innerHTML = `${dbData.streaks.best} 🏆`;
        
        const calendarContainer = document.getElementById('calendar-container');
        calendarContainer.innerHTML = '';
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const header = document.createElement('h3');
        header.textContent = `${["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"][month]} ${year}`;
        calendarContainer.appendChild(header);
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
            const dayEl = document.createElement('div'); dayEl.className = 'day-name'; dayEl.textContent = day; daysGrid.appendChild(dayEl);
        });
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const emptyDays = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < emptyDays; i++) { daysGrid.appendChild(document.createElement('div')); }
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div'); dayEl.className = 'day-cell'; dayEl.textContent = i;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (dbData.progress[dateStr]) { dayEl.classList.add('done'); }
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) { dayEl.classList.add('today'); }
            daysGrid.appendChild(dayEl);
        }
        calendarContainer.appendChild(daysGrid);
    }

    // --- Обработчик всех кликов ---
    document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.dataset.next) { showScreen(button.dataset.next); }
        if (button.dataset.target) { showScreen(button.dataset.target); }

        if (button.id === 'finish-onboarding-button') {
            dbData.onboardingCompleted = true;
            await firestore.collection('users').doc(userId).set(dbData);
            initUI();
        }
        if (button.id === 'done-button') {
            const today = new Date().toISOString().split('T')[0];
            if (dbData.progress[today]) return;
            dbData.progress[today] = true;
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            dbData.streaks.current = dbData.progress[yesterday] ? dbData.streaks.current + 1 : 1;
            if (dbData.streaks.current > dbData.streaks.best) { dbData.streaks.best = dbData.streaks.current; }
            await firestore.collection('users').doc(userId).update(dbData);
            tg.HapticFeedback.notificationOccurred('success');
            document.getElementById('success-overlay').classList.add('active');
            setTimeout(() => {
                document.getElementById('success-overlay').classList.remove('active');
                renderProgress();
                showScreen('progress-screen');
            }, 1800);
        }
        if (button.id === 'reset-button') {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
                const newDb = { onboardingCompleted: false, progress: {}, streaks: { current: 0, best: 0 } };
                await firestore.collection('users').doc(userId).set(newDb);
                location.reload();
            }
        }
    });

    // --- Функция для отрисовки UI после загрузки данных ---
    const initUI = () => {
        document.getElementById('loader').style.display = 'none';
        if (dbData.onboardingCompleted) {
            showFlow('main-app');
            showScreen('main-screen');
        } else {
            showFlow('onboarding-flow');
            showScreen('welcome-screen');
        }
    };

    // --- Авторизация и запуск ---
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            userId = user.uid;
            const docRef = firestore.collection('users').doc(userId);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                dbData = docSnap.data();
            } else {
                await docRef.set({ onboardingCompleted: false, progress: {}, streaks: { current: 0, best: 0 } });
                dbData = { onboardingCompleted: false, progress: {}, streaks: { current: 0, best: 0 } };
            }
            initUI();
        } else {
            await auth.signInAnonymously();
        }
    });
});
