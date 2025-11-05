// js/ui.js

window.showToast = (msg) => {
    const body = document.getElementById('toast-body');
    body.textContent = msg;
    new bootstrap.Toast(document.getElementById('liveToast')).show();
};

window.applyTheme = (theme) => {
    document.body.setAttribute('data-theme', theme);
    setTheme(theme);
    showToast(`Tema: ${theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : theme === 'blue' ? 'Mavi' : 'Yeşil'}`);
    // renderGoals() YOK → kartlar bozulmaz!
};

window.renderGoals = () => {
    const goals = getGoals();
    const list = document.getElementById('goal-list');
    list.innerHTML = '';

    const pinned = goals.filter(g => g.pinned);
    const normal = goals.filter(g => !g.pinned);
    const sorted = [...pinned, ...normal];

    if (sorted.length === 0) {
        list.innerHTML = '<div class="col-12 text-center py-5"><h4 class="text-white text-shadow">Henüz hedef eklenmedi.</h4></div>';
        return;
    }

    sorted.forEach(goal => {
        const col = document.createElement('div');
        col.className = 'col-lg-6';
        
        // Her hedefin kendi teması var!
        const goalTheme = goal.theme || 'light';

        col.innerHTML = `
            <div class="goal-card h-100 ${goal.pinned ? 'pinned' : ''}" data-goal-theme="${goalTheme}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title mb-0 fs-5">${goal.name} <small class="text-muted">(${goal.category})</small></h5>
                        <div>
                            <button class="btn btn-sm btn-outline-warning pin-btn" data-id="${goal.id}">
                                <i class="bi ${goal.pinned ? 'bi-pin-fill' : 'bi-pin'}"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${goal.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${goal.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="card-text text-muted small mb-3">${goal.description}</p>
                    <div class="progress mb-3">
                        <div class="progress-bar" style="width: ${goal.progress}%;"></div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="fw-bold">${goal.progress}% ${goal.completed ? 'Tamamlandı' : ''}</small>
                        <input type="range" class="form-range progress-slider" style="width: 140px;" 
                               min="0" max="100" value="${goal.progress}" data-id="${goal.id}">
                    </div>
                </div>
            </div>`;
        list.appendChild(col);
    });

    // İlerleme
    document.querySelectorAll('.progress-slider').forEach(s => {
        s.oninput = (e) => {
            const id = +e.target.dataset.id;
            const p = +e.target.value;
            updateGoal(id, { progress: p, completed: p === 100 });
            renderGoals();
            showToast(`İlerleme: %${p}`);
        };
    });

    // SİLME: DIREK SİL
    document.querySelectorAll('.delete-btn').forEach(b => {
        b.onclick = () => {
            const id = +b.dataset.id;
            deleteGoal(id);
            renderGoals();
            showToast('Hedef silindi');
        };
    });

    // Düzenle
    document.querySelectorAll('.edit-btn').forEach(b => {
        b.onclick = () => openEditModal(getGoals().find(g => g.id === +b.dataset.id));
    });

    // Sabitle
    document.querySelectorAll('.pin-btn').forEach(b => {
        b.onclick = () => {
            const id = +b.dataset.id;
            const pinned = togglePin(id);
            renderGoals();
            showToast(pinned ? 'Sabitlendi' : 'Sabitleme kaldırıldı');
        };
    });

    // HER HEDEFİN KENDİ TEMASINA GÖRE RENK
    document.querySelectorAll('[data-goal-theme]').forEach(card => {
        const theme = card.dataset.goalTheme;
        applyGoalTheme(card, theme);
    });
};

function applyGoalTheme(card, theme) {
    const styles = {
        light: { bg: '#ffffff', border: '#dee2e6', text: '#212529', muted: '#6c757d', progress: '#0d6efd' },
        dark:  { bg: '#212529', border: '#495057', text: '#f8f9fa', muted: '#adb5bd', progress: '#0dcaf0' },
        blue:  { bg: '#e3f2fd', border: '#0d6efd', text: '#0d47a1', muted: '#1976d2', progress: '#0d6efd' },
        green: { bg: '#e8f5e9', border: '#198754', text: '#1b5e20', muted: '#2e7d32', progress: '#198754' }
    };

    const s = styles[theme] || styles.light;
    card.style.backgroundColor = s.bg;
    card.style.borderColor = s.border;
    card.style.color = s.text;
    card.querySelectorAll('.text-muted').forEach(el => el.style.color = s.muted);
    card.querySelector('.progress-bar').style.backgroundColor = s.progress;
}

// Düzenleme Modal
window.openEditModal = (goal) => {
    const modal = `
        <div class="modal fade" id="editModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content goal-card border-0">
                    <div class="modal-header border-0">
                        <h5 class="modal-title">Hedefi Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="text" id="edit-name" class="form-control form-control-lg mb-3" value="${goal.name}">
                        <input type="text" id="edit-category" class="form-control form-control-lg mb-3" value="${goal.category}">
                        <textarea id="edit-desc" class="form-control form-control-lg" rows="3">${goal.description}</textarea>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                        <button type="button" class="btn btn-primary" id="save-edit">Kaydet</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
    const m = new bootstrap.Modal('#editModal');
    m.show();

    document.getElementById('save-edit').onclick = () => {
        const updated = {
            name: document.getElementById('edit-name').value.trim(),
            category: document.getElementById('edit-category').value.trim(),
            description: document.getElementById('edit-desc').value.trim()
        };
        if (!updated.name || !updated.category || !updated.description) {
            showToast('Tüm alanlar doldurulmalı!');
            return;
        }
        updateGoal(goal.id, updated);
        m.hide();
        renderGoals();
        showToast('Güncellendi');
    };

    document.getElementById('editModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('editModal').remove();
    });
};