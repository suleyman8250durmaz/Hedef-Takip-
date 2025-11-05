// js/storage.js
const STORAGE_KEY = 'goals';
const THEME_KEY = 'theme';

window.getGoals = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
window.saveGoals = (goals) => localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));

window.addGoal = (goal) => {
    const goals = getGoals();
    goals.push(goal);
    saveGoals(goals);
};

window.updateGoal = (id, updates) => {
    const goals = getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx !== -1) {
        goals[idx] = { ...goals[idx], ...updates };
        saveGoals(goals);
        return goals[idx];
    }
    return null;
};

window.deleteGoal = (id) => saveGoals(getGoals().filter(g => g.id !== id));

window.togglePin = (id) => {
    const goals = getGoals();
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.pinned = !goal.pinned;
        saveGoals(goals);
        return goal.pinned;
    }
    return false;
};

window.getTheme = () => localStorage.getItem(THEME_KEY) || 'light';
window.setTheme = (t) => localStorage.setItem(THEME_KEY, t);