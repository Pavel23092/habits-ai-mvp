document.addEventListener('DOMContentLoaded', function() {
    
    // Находим все кнопки, у которых есть атрибут 'data-next'
    const navigationButtons = document.querySelectorAll('[data-next]');
    
    // Проходимся по каждой кнопке
    navigationButtons.forEach(button => {
        
        // Добавляем каждой кнопке "слушателя" на клик
        button.addEventListener('click', function() {
            
            // Находим текущий активный экран
            const currentScreen = document.querySelector('.screen.active');
            
            // Получаем ID следующего экрана из атрибута 'data-next' кнопки
            const nextScreenId = button.dataset.next;
            const nextScreen = document.getElementById(nextScreenId);
            
            if (currentScreen && nextScreen) {
                // Скрываем текущий экран
                currentScreen.classList.remove('active');
                // Показываем следующий
                nextScreen.classList.add('active');
            }
            
        });
    });
});
