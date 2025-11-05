// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getTheme());
    renderGoals();

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            const theme = btn.dataset.theme;
            setTheme(theme);  // Sadece tema kaydet
            showToast(`Tema: ${theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : theme === 'blue' ? 'Mavi' : 'Yeşil'}`);
            // renderGoals() YOK → kartlar eski rengini korur!
        };
    });

    document.getElementById('goal-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('goal-name').value.trim();
        const category = document.getElementById('goal-category').value.trim();
        const description = document.getElementById('goal-description').value.trim();
        const currentTheme = getTheme(); // ŞU ANDAKİ TEMA!

        if (!name || !category || !description) {
            showToast('Tüm alanlar doldurulmalı!');
            return;
        }

        addGoal({
            id: Date.now(),
            name, category, description,
            progress: 0, completed: false, pinned: false,
            theme: currentTheme  // EKLENDİĞİ ANDAKİ TEMA!
        });

        renderGoals();
        e.target.reset();
        showToast('Hedef eklendi!');
    };
});