// --- Импортируем нужные функции из Firebase ---
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    
    // Инициализируем Telegram и Firebase
    const tg = window.Telegram.WebApp;
    const firebaseApp = window.firebaseApp;
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    tg.expand();

    let userId = null;
    let db = { onboardingCompleted: false, progress: {}, streaks: { current: 0, best: 0 }, registrationDate: null };

    // --- Функции для работы с Firestore ---
    async function loadDB() {
        if (!userId) { console.error("User not authenticated"); return; }
        const docRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            db = docSnap.data();
        } else {
            await setDoc(docRef, db); // Создаем новый документ, если его нет
        }
    }

    async function saveDB() {
        if (!userId) { console.error("User not authenticated"); return; }
        await setDoc(doc(firestore, "users", userId), db);
    }

    // --- Функции навигации ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
    }

    function showFlow(flowId) {
        document.querySelectorAll('.flow-container').forEach(f => f.classList.remove('active'));
        document.getElementById(flowId)?.classList.add('active');
    }

    // --- Функция отрисовки прогресса ---
    function renderProgress() {
        document.querySelector('.streaks-container .streak-item:nth-child(1) h3').textContent = `${db.streaks.current} 🔥`;
        document.querySelector('.streaks-container .streak-item:nth-child(2) h3').textContent = `${db.streaks.best} 🏆`;
        const calendarContainer = document.querySelector('.calendar-container');
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
            const dayEl = document.createElement('div');
            dayEl.className = 'day-name'; dayEl.textContent = day; daysGrid.appendChild(dayEl);
        });
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const emptyDays = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < emptyDays; i++) { daysGrid.appendChild(document.createElement('div')); }
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-cell'; dayEl.textContent = i;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (db.progress[dateStr]) { dayEl.classList.add('done'); }
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) { dayEl.classList.add('today'); }
            daysGrid.appendChild(dayEl);
        }
        calendarContainer.appendChild(daysGrid);
    }

    // --- ГЛАВНЫЙ ОБРАБОТЧИК НАЖАТИЙ ---
    document.body.addEventListener('click', async function(event) {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.dataset.next) {
            const currentFlowId = button.closest('.flow-container').id;
            showFlow(currentFlowId);
            showScreen(button.dataset.next);
            if (button.dataset.next === 'progress-screen') renderProgress();
        }

        if (button.id === 'finish-onboarding-button') {
            db.onboardingCompleted = true;
            db.registrationDate = new Date().toISOString().split('T')[0];
            await saveDB();
            initAppUI();
        }

        if (button.classList.contains('success-button')) {
            const today = new Date().toISOString().split('T')[0];
            if (db.progress[today]) return;
            db.progress[today] = true;
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            db.streaks.current = db.progress[yesterday] ? db.streaks.current + 1 : 1;
            if (db.streaks.current > db.streaks.best) { db.streaks.best = db.streaks.current; }
            await saveDB();
            tg.HapticFeedback.notificationOccurred('success');
            document.getElementById('success-overlay').classList.add('active');
            setTimeout(() => {
                document.getElementById('success-overlay').classList.remove('active');
                renderProgress();
                showFlow('main-app');
                showScreen('progress-screen');
            }, 1800);
        }

        if (button.id === 'reset-button') {
            const isConfirmed = confirm('Вы уверены, что хотите сбросить весь прогресс?');
            if (isConfirmed) {
                db = { onboardingCompleted: false, progress: {}, streaks: { current: 0, best: 0 }, registrationDate: null };
                await saveDB();
                location.reload();
            }
        }
    });

    // --- Функция для отрисовки UI после загрузки данных ---
    function initAppUI() {
        if (db.onboardingCompleted) {
            showFlow('main-app');
            showScreen('main-screen');
        } else {
            showFlow('onboarding-flow');
            showScreen('welcome-screen');
        }
    }

    // --- АВТОРИЗАЦИЯ И ЗАПУСК ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            await loadDB();
            initAppUI();
        } else {
            try {
                const userCredential = await signInAnonymously(auth);
                userId = userCredential.user.uid;
                await loadDB();
                initAppUI();
            } catch (error) {
                console.error("Auth Error:", error);
                document.body.innerHTML = 'Ошибка авторизации. Попробуйте позже.';
            }
        }
    });
});
