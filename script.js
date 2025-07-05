document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. ВАШИ КЛЮЧИ SUPABASE ---
    // Замените эти строчки на ваши реальные ключи из настроек API в Supabase
    const SUPABASE_URL = 'https://exfcofrrcbnutfbaiclh.supabase.co'; // ВАШ URL
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZmNvZnJyY2JudXRmYmFpY2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjI2OTMsImV4cCI6MjA2NzI5ODY5M30.0g9uNsjiMCN7-O7rbYwL8pqhBnzIXQwfsNyJvrcn5ek'; // ВАШ КЛЮЧ

    // --- 2. Инициализация всех сервисов ---
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const tg = window.Telegram.WebApp;
    tg.expand();

    // --- 3. Глобальные переменные ---
    // Получаем уникальный ID пользователя из Telegram
    const userId = tg.initDataUnsafe?.user?.id || `test_user_${Math.random()}`; 
    let dbData = {
        habits: [
            { id: 'h1', icon: '💧', text: 'Выпить стакан воды' },
            { id: 'h2', icon: '✍️', text: 'Определить главную задачу' },
            { id: 'h3', icon: '📖', text: 'Читать 1 страницу' }
        ],
        progress: {},
    };
    
    // Получаем доступ к элементам на странице
    const habitListEl = document.getElementById('habit-list');
    const progressBarEl = document.getElementById('progress-bar');
    const progressLabelEl = document.getElementById('progress-label');

    // --- 4. Функции для отрисовки интерфейса ---
    function renderMainScreen() {
        habitListEl.innerHTML = '';
        const todayStr = new Date().toISOString().split('T')[0];
        const todayProgress = dbData.progress[todayStr] || [];

        dbData.habits.forEach(habit => {
            const isDone = todayProgress.includes(habit.id);
            const li = document.createElement('li');
            li.className = `habit-item ${isDone ? 'done' : ''}`;
            li.dataset.id = habit.id;
            li.innerHTML = `<div class="icon">${habit.icon}</div><div class="text">${habit.text}</div><div class="checkbox"></div>`;
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

    // --- 5. Обработчик кликов по списку привычек ---
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
        
        const { error } = await supabase
            .from('users')
            .upsert({ id: userId, data: dbData });
        
        if (error) console.error("Ошибка сохранения в Supabase:", error);
    });

    // --- 6. Главная функция запуска приложения ---
    async function main() {
        // Показываем загрузчик, пока идет работа с базой
        document.getElementById('loader').style.display = 'flex';

        const { data, error } = await supabase
            .from('users')
            .select('data')
            .eq('id', userId)
            .single();

        if (data && data.data) {
            dbData = { ...dbData, ...data.data };
        } else if (error && error.code !== 'PGRST116') { // PGRST116 - это "строка не найдена", это не ошибка
            console.error(error);
            document.getElementById('loader').innerHTML = "<p>Ошибка подключения к базе данных.</p>";
            return;
        }
        
        // Убираем загрузчик и показываем приложение
        document.getElementById('loader').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        renderMainScreen();
    }

    // Запускаем все!
    main();
});
