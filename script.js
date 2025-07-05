document.addEventListener('DOMContentLoaded', () => {
    // Убираем экран загрузки и сразу показываем онбординг
    document.getElementById('loader').style.display = 'none';
    document.getElementById('onboarding-flow').style.display = 'flex';
    document.getElementById('welcome-screen').classList.add('active');

    // Простая навигация для теста, без баз данных
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button && button.dataset.next) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(button.dataset.next).classList.add('active');
        }
    });
});
