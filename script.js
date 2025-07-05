document.addEventListener('DOMContentLoaded', () => {
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
    
    let userId = null;
    let dbData = {
        habits: [
            { id: 'h1', icon: '💧', text: 'Выпить стакан воды' },
            { id: 'h2', icon: '✍️', text: 'Определить главную задачу' },
            { id: 'h3', icon: '📖', text: 'Читать 1 страницу' }
        ],
        progress: {},
    };
    
    const habitListEl = document.getElementById('habit-list');
    const progressBarEl = document.getElementById('progress-bar');
    const progressLabelEl = document.getElementById('progress-label');

    function renderMainScreen() {
        habitListEl.innerHTML = '';
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
    
    function updateProgressBar() {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayProgress = dbData.progress[todayStr] || [];
        const totalHabits = dbData.habits.length;
        const doneHabits = todayProgress.length;
        const percentage = totalHabits > 0 ? (doneHabits / totalHabits) * 100 : 0;
        progressBarEl.style.width = `${percentage}%`;
        progressLabelEl.textContent = `Выполнено ${doneHabits} из ${totalHabits}`;
    }

    habitListEl.addEventListener('click', async (event) => {
        const habitItem = event.target.closest('.habit-item');
        if (!userId || !habitItem || habitItem.classList.contains('done')) return;
        
        tg.HapticFeedback.notificationOccurred('success');
        const habitId = habitItem.dataset.id;
        const todayStr = new Date().toISOString().split('T')[0];

        if (!dbData.progress[todayStr]) {
            dbData.progress[todayStr] = [];
        }
        dbData.progress[todayStr].push(habitId);
        
        habitItem.classList.add('done');
        updateProgressBar();
        
        // Обновляем только одно поле в Firestore для эффективности
        await firestore.collection('users').doc(userId).set({
            progress: dbData.progress
        }, { merge: true });
    });

    const initUI = () => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        renderMainScreen();
    };

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            userId = user.uid;
            const docRef = firestore.collection('users').doc(userId);
            try {
                const docSnap = await docRef.get();
                if (docSnap.exists()) {
                    dbData = { ...dbData, ...docSnap.data() };
                } else {
                    await docRef.set(dbData);
                }
            } catch (e) {
                console.error("Firestore read/write error:", e);
                document.body.innerHTML = "Ошибка подключения к базе данных.";
                return;
            }
            initUI();
        } else {
            try {
                await auth.signInAnonymously();
            } catch(e) {
                console.error("Auth error:", e);
                document.body.innerHTML = "Ошибка авторизации.";
            }
        }
    });
});
