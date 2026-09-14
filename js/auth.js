// ====================================================================
// Authentication Module
// ====================================================================

const AuthManager = (() => {
    function init() {
        renderUserProfile();
        setupEventListeners();
    }

    function renderUserProfile() {
        // Read the currently stored user from localStorage via API helper
        const stored = localStorage.getItem('sm_current_user');
        const current = stored ? JSON.parse(stored) : SampleData.defaultUser;

        const nameEls = document.querySelectorAll('.user-name-display');
        const emailEls = document.querySelectorAll('.user-email-display');
        const deptEls = document.querySelectorAll('.user-dept-display');
        const avatarEls = document.querySelectorAll('.user-avatar-text');

        nameEls.forEach(el => el.textContent = current.name || 'Alex Morgan');
        emailEls.forEach(el => el.textContent = current.email || 'alex.morgan@university.edu');
        deptEls.forEach(el => el.textContent = (current.department || 'Computer Science') + ' • ' + (current.semester || 'Fall 2026'));

        const initials = (current.name || 'AM').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarEls.forEach(el => el.textContent = initials);

        // Populate settings form if open
        const nameInput = document.getElementById('settings-name');
        const emailInput = document.getElementById('settings-email');
        const deptInput = document.getElementById('settings-dept');
        const semInput = document.getElementById('settings-sem');

        if (nameInput) nameInput.value = current.name || '';
        if (emailInput) emailInput.value = current.email || '';
        if (deptInput) deptInput.value = current.department || '';
        if (semInput) semInput.value = current.semester || '';
    }

    function setupEventListeners() {
        // Switch between Login and Register tabs in Auth Modal
        const authTabs = document.querySelectorAll('.auth-tab-btn');
        authTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                authTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.tab;
                document.getElementById('login-form-pane').style.display = target === 'login' ? 'block' : 'none';
                document.getElementById('register-form-pane').style.display = target === 'register' ? 'block' : 'none';
            });
        });

        // Quick demo login fill
        const quickDemoBtn = document.getElementById('quick-demo-fill-btn');
        if (quickDemoBtn) {
            quickDemoBtn.addEventListener('click', () => {
                document.getElementById('login-email').value = 'alex.morgan@university.edu';
                document.getElementById('login-password').value = 'student123';
            });
        }

        // Login Submit
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value;

                try {
                    const res = await API.auth.login(email, password);
                    App.showToast(res.message || "Logged in successfully!", "success");
                    App.closeModal('auth-modal');
                    renderUserProfile();
                    App.refreshCurrentView();
                } catch (err) {
                    App.showToast(err.message || "Login failed", "error");
                }
            });
        }

        // Register Submit
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('reg-name').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const password = document.getElementById('reg-password').value;
                const department = document.getElementById('reg-department').value.trim();
                const semester = document.getElementById('reg-semester').value.trim();

                if (password.length < 6) {
                    App.showToast("Password must be at least 6 characters long", "error");
                    return;
                }

                try {
                    const res = await API.auth.register({ name, email, password, department, semester });
                    App.showToast("Registration successful! Welcome, " + name, "success");
                    App.closeModal('auth-modal');
                    renderUserProfile();
                    App.refreshCurrentView();
                } catch (err) {
                    App.showToast(err.message || "Registration failed", "error");
                }
            });
        }

        // Save Profile Settings Form
        const settingsForm = document.getElementById('profile-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('settings-name').value.trim();
                const department = document.getElementById('settings-dept').value.trim();
                const semester = document.getElementById('settings-sem').value.trim();

                try {
                    await API.auth.updateProfile({ name, department, semester });
                    App.showToast("Profile settings updated!", "success");
                    renderUserProfile();
                } catch (err) {
                    App.showToast(err.message || "Failed to update profile", "error");
                }
            });
        }

        // Logout
        const logoutBtns = document.querySelectorAll('.logout-trigger');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                API.auth.logout();
                App.showToast("Logged out successfully", "info");
                App.openModal('auth-modal');
            });
        });
    }

    return {
        init,
        renderUserProfile
    };
})();
