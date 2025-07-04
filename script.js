document.addEventListener('DOMContentLoaded', function() {
    const onboardingFlow = document.getElementById('onboarding-flow');
    const mainApp = document.getElementById('main-app');

    // --- Функция для навигации ---
    function navigate(flowContainerId, nextScreenId) {
        // Скрываем все контейнеры
        document.querySelectorAll('.flow-container').forEach(c => c.classList.remove('active'));
        // Скрываем все экраны внутри всех контейнеров
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        // Показываем нужный контейнер и экран
        const targetFlow = document.getElementById(flowContainerId);
        const targetScreen = document.getElementById(nextScreenId);
        if (targetFlow && targetScreen) {
            targetFlow.classList.add('active');
            targetScreen.classList.add('active');
        }
    }

    // --- Обработчики кнопок ---
    document.body.addEventListener('click', function(event) {
        // Навигация по 'data-next'
        if (event.target.dataset.next) {
            const currentFlow = event.target.closest('.flow-container');
            navigate(currentFlow.id, event.target.dataset.next);
        }
        
        // Завершение онбординга
        if (event.target.id === 'finish-onboarding-button') {
            // В будущем здесь будет сохранение в localStorage
            navigate('main-app', 'main-screen');
        }
    });

    // --- Инициализация ---
    // В будущем здесь будет проверка, пройден ли онбординг
    navigate('onboarding-flow', 'welcome-screen');
});
