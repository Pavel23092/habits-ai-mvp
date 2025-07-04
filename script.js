// Ждем, пока вся страница загрузится
document.addEventListener('DOMContentLoaded', function() {

    // Находим наши элементы на странице
    const welcomeScreen = document.getElementById('welcome-screen');
    const goalScreen = document.getElementById('goal-screen');
    const startButton = document.getElementById('start-button');

    // Добавляем "слушателя" на кнопку: что делать, когда на нее нажмут
    startButton.addEventListener('click', function() {
        // Убираем класс 'active' у приветственного экрана (он скроется)
        welcomeScreen.classList.remove('active');
        
        // Добавляем класс 'active' экрану с целью (он появится)
        goalScreen.classList.add('active');
    });

});
