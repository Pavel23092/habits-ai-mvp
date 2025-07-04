document.addEventListener('DOMContentLoaded', function() {
    
    const onboardingFlow = document.getElementById('onboarding-flow');
    const mainApp = document.getElementById('main-app');

    // Показываем онбординг или главное приложение в зависимости от того, пройдена ли регистрация
    // Пока мы имитируем это, всегда начиная с онбординга
    onboardingFlow.style.display = 'block';

    // --- Логика навигации по онбордингу ---
    const navigationButtons = document.querySelectorAll('[data-next]');
    navigationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentScreen = document.querySelector('#onboarding-flow .screen.active');
            const nextScreenId = button.dataset.next;
            const nextScreen = document.getElementById(nextScreenId);
            
            if (currentScreen && nextScreen) {
                currentScreen.classList.remove('active');
                nextScreen.classList.add('active');
            }
        });
    });

    // --- Логика перехода к главному приложению ---
    const finishOnboardingButton = document.getElementById('finish-onboarding-button');
    finishOnboardingButton.addEventListener('click', function() {
        onboardingFlow.style.display = 'none';
        mainApp.style.display = 'block';
        document.getElementById('main-screen').classList.add('active');
    });

    // --- Логика навигации в главном приложении ---
    const progressButton = document.getElementById('progress-button');
    const backButton = document.getElementById('back-button');
    const mainScreen = document.getElementById('main-screen');
    const progressScreen = document.getElementById('progress-screen');

    progressButton.addEventListener('click', function() {
        mainScreen.classList.remove('active');
        progressScreen.classList.add('active');
    });

    backButton.addEventListener('click', function() {
        progressScreen.classList.remove('active');
        mainScreen.classList.add('active');
    });

});
