function renderProgress() {
    // Обновляем счетчики серий
    document.querySelector('.streaks-container .streak-item:nth-child(1) h3').textContent = `${db.streaks.current} 🔥`;
    document.querySelector('.streaks-container .streak-item:nth-child(2) h3').textContent = `${db.streaks.best} 🏆`;

    // --- НОВАЯ ЛОГИКА: Отрисовка календаря ---
    const calendarContainer = document.querySelector('.calendar-container');
    calendarContainer.innerHTML = ''; // Очищаем старый календарь

    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    const header = document.createElement('h3');
    header.textContent = `${monthNames[month]} ${year}`;
    calendarContainer.appendChild(header);

    const daysGrid = document.createElement('div');
    daysGrid.className = 'days-grid';
    
    // Добавляем дни недели
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'day-name';
        dayEl.textContent = day;
        daysGrid.appendChild(dayEl);
    });
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const emptyDays = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Коррекция для начала с Пн

    // Добавляем пустые ячейки для выравнивания
    for (let i = 0; i < emptyDays; i++) {
        daysGrid.appendChild(document.createElement('div'));
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day-cell';
        dayEl.textContent = i;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (db.progress[dateStr]) {
            dayEl.classList.add('done'); // День выполнен
        }
        if (i === today.getDate()) {
            dayEl.classList.add('today'); // Сегодняшний день
        }
        daysGrid.appendChild(dayEl);
    }
    
    calendarContainer.appendChild(daysGrid);
}
/* Стили для календаря */
.calendar-container h3 {
    font-size: 20px;
    margin-bottom: 20px;
}
.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
}
.day-name {
    font-weight: bold;
    color: #888;
    font-size: 14px;
}
.day-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    border-radius: 50%; /* Делаем дни круглыми */
}
.day-cell.done {
    background-color: #4CD964; /* Зеленый цвет успеха */
    color: white;
}
.day-cell.today {
    border: 2px solid #50A8EB; /* Синяя обводка для сегодня */
}
