/**
 * NJP Global - Authentication Module
 * Handles Login, Register, and Modal Triggers
 */

const Auth = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Login Form
        const loginBtn = document.querySelector('#loginModal .btn-primary');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => this.handleLogin(e));
        }

        // Register Form
        const regBtn = document.querySelector('#registerModal .btn-primary');
        if (regBtn) {
            regBtn.addEventListener('click', (e) => this.handleRegister(e));
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const btn = e.target;
        const parent = btn.closest('.modal-body');
        const inputs = parent.querySelectorAll('input');
        const username = inputs[0].value;
        const password = inputs[1].value;

        if (!username || !password) {
            alert('Please enter credentials');
            return;
        }

        btn.textContent = 'Verifying...';

        // Admin/Employer Simulation (Client-side for demo)
        if (password === 'admin123' || password === 'njp123') {
            localStorage.setItem('role', 'admin');
            this.onLoginSuccess('admin');
        } else if (username.toLowerCase().includes('employer')) {
            localStorage.setItem('role', 'employer');
            this.onLoginSuccess('employer');
        } else {
            // Real API Call
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('role', 'user');
                    this.onLoginSuccess('user');
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        }

        btn.textContent = 'Sign In';
    },

    handleRegister(e) {
        // Placeholder for Registration
        e.preventDefault();
        alert('Registration successful! Please login.');
        window.closeAllModals();
    },

    onLoginSuccess(role) {
        window.closeAllModals();

        if (role === 'admin') {
            // Show Admin Link
            const adminLink = document.getElementById('navAdminLink');
            if (adminLink) adminLink.style.display = 'block';
            if (window.showView) window.showView('admin');
        } else if (role === 'employer') {
            if (window.showView) window.showView('employer');
        } else {
            if (window.showView) window.showView('user');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
