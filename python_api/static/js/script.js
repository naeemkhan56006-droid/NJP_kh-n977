document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    loadJobs();
    loadStats();

    // Event Listeners
    setupModals();

    // Check for saved admin session
    if (localStorage.getItem('isAdmin') === 'true') {
        document.getElementById('navAdminLink').style.display = 'block';
    }
});

// State
let allJobs = [];
let isAdmin = false;

// View Management
function showView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById(`${viewName}View`).style.display = 'block';
    window.scrollTo(0, 0);

    if (viewName === 'admin') {
        loadAdminStats();
    } else if (viewName === 'employer') {
        loadCandidates();
    }
}

// Employer Logic
async function loadCandidates() {
    const tbody = document.getElementById('candidateTable');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Loading candidates...</td></tr>';

    try {
        const res = await fetch('/api/candidates');
        const apps = await res.json();

        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No candidates found yet.</td></tr>';
            return;
        }

        tbody.innerHTML = apps.map(app => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 16px;">
                    <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(app.name)}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(app.email)}</div>
                </td>
                <td style="padding: 16px;">
                    <div style="color: var(--primary); font-weight: 500;">${escapeHtml(app.job_title)}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">Applied: ${new Date(app.applied_at).toLocaleDateString()}</div>
                </td>
                <td style="padding: 16px;">
                    <span class="status-badge ${app.status.toLowerCase()}">${app.status}</span>
                </td>
                <td style="padding: 16px; text-align: right;">
                    <select onchange="updateStatus(${app.id}, this.value)" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); background: var(--surface); color: var(--text-main);">
                        <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                        <option value="Review" ${app.status === 'Review' ? 'selected' : ''}>Review</option>
                        <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>Interview</option>
                        <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>Offer</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error("Error loading candidates", e);
        tbody.innerHTML = '<tr><td colspan="4" style="color: red; text-align:center;">Error loading data</td></tr>';
    }
}

async function updateStatus(appId, newStatus) {
    try {
        const res = await fetch(`/api/applications/${appId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            showToast(`Status updated to ${newStatus}`, 'success');
            loadCandidates(); // Refresh to update badge
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error updating status', 'error');
    }
}

// API Calls
async function loadJobs(filters = {}) {
    const grid = document.getElementById('jobsGrid');

    // Show skeleton/loading state
    if (!allJobs.length) {
        grid.innerHTML = '<div class="loader">Loading opportunities...</div>';
    }

    try {
        let url = '/api/jobs';
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.type) params.append('job_type', filters.type); // Fixed key matching backend

        if (Array.from(params).length > 0) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const jobs = await response.json();
        allJobs = jobs;
        renderJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        grid.innerHTML = '<div class="error">Failed to load jobs. Please try again.</div>';
    }
}

async function loadStats() {
    // Mock stats for now, or fetch if API exists
    const stats = {
        active: 1240,
        new: 85,
        companies: 320
    };

    // Animate numbers
    animateValue('statTotal', 0, stats.active, 2000);
    animateValue('statNew', 0, stats.new, 2000);
    animateValue('statCompanies', 0, stats.companies, 2000);
}

// Rendering
function renderJobs(jobs) {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '';

    if (jobs.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>No jobs found</h3>
                <p class="text-muted">Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <div>
                <div class="job-header">
                    <div class="company-logo-placeholder">
                        ${job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="shareJob(${job.id})">
                        <i class="lucide-share-2"></i>
                    </button>
                </div>
                
                <h3 class="job-title">${job.title}</h3>
                <div class="job-company">
                    <i data-lucide="building-2" style="width: 16px"></i>
                    ${job.company}
                </div>
                
                <div class="job-tags">
                    <span class="tag tag-primary">${job.category || 'General'}</span>
                    <span class="tag tag-secondary">${job.job_type || 'Full-time'}</span>
                    <span class="tag tag-secondary">${job.location || 'Remote'}</span>
                </div>
            </div>

            <div class="job-footer">
                <span class="salary-tag">${job.salary || 'Negotiable'}</span>
                <button class="btn btn-primary btn-sm" onclick="openApplyModal(${job.id}, '${escapeHtml(job.title)}')">
                    Apply Now
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Re-run lucide icons
    if (window.lucide) lucide.createIcons();
}

// Search & Filter
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const typeSelect = document.getElementById('typeSelect');
    const searchBtn = document.getElementById('searchBtn');

    function executeSearch() {
        const filters = {
            search: searchInput.value,
            category: categorySelect.value,
            type: typeSelect.value
        };
        loadJobs(filters);
    }

    searchBtn.addEventListener('click', executeSearch);

    // Debounce input
    let timeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(executeSearch, 500);
    });

    categorySelect.addEventListener('change', executeSearch);
    typeSelect.addEventListener('change', executeSearch);
}

// Modals & Admin
function setupModals() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtns = document.querySelectorAll('.modal-close');

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllModals();
    });

    // Forms
    setupApplyForm();
    setupJobForm();
    setupAdminLogin();
}

function closeAllModals() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.querySelectorAll('.modal-content').forEach(el => el.style.display = 'none');
}

function openModal(modalId) {
    const overlay = document.getElementById('modalOverlay');
    closeAllModals(); // Hide others
    overlay.classList.add('active');
    document.getElementById(modalId).style.display = 'block';
}

function setupApplyForm() {
    const form = document.getElementById('applyForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        const jobId = form.dataset.jobId;
        const formData = {
            name: document.getElementById('applicantName').value,
            email: document.getElementById('applicantEmail').value
        };

        try {
            const res = await fetch(`/api/jobs/${jobId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast('Application submitted successfully!', 'success');
                closeAllModals();
                form.reset();
            } else {
                showToast('Failed to submit application.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error submitting application', 'error');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

function setupJobForm() {
    const form = document.getElementById('postJobForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('jobTitle').value,
            company: document.getElementById('jobCompany').value,
            category: document.getElementById('jobCategory').value,
            job_type: document.getElementById('jobType').value,
            location: document.getElementById('jobLocation').value,
            salary: document.getElementById('jobSalary').value,
            description: document.getElementById('jobDesc').value,
            deadline: new Date().toISOString() // Simple default
        };

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast('Job posted successfully!', 'success');
                closeAllModals();
                form.reset();
                loadJobs(); // Refresh user list
                loadAdminStats(); // Refresh admin list
            } else {
                showToast('Failed to post job.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error posting job', 'error');
        }
    });
}

function setupAdminLogin() {
    const btn = document.getElementById('adminLoginBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const pass = document.getElementById('adminPass').value;
        if (pass === 'admin123' || pass === 'njp123') { // Simple client-side auth
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            showToast('Welcome back, Admin!', 'success');
            closeAllModals();
            document.getElementById('navAdminLink').style.display = 'block';
            showView('admin');
        } else {
            showToast('Invalid access code', 'error');
        }
    });
}

function openApplyModal(jobId, jobTitle) {
    const titleEl = document.getElementById('modalJobTitle');
    const form = document.getElementById('applyForm');

    titleEl.textContent = `Apply for ${jobTitle}`;
    form.dataset.jobId = jobId;

    openModal('applyModalContent');
}

// Admin Utils
async function loadAdminStats() {
    try {
        const [jobsRes, appsRes] = await Promise.all([
            fetch('/api/jobs'),
            fetch('/api/applications')
        ]);

        const jobs = await jobsRes.json();
        const apps = await appsRes.json();

        document.getElementById('totalAdminJobs').textContent = jobs.length;
        document.getElementById('totalAdminApps').textContent = apps.length;

        // Render recent apps
        const tbody = document.getElementById('adminAppsTable');
        tbody.innerHTML = apps.slice(0, 10).map(app => `
            <tr>
                <td>${escapeHtml(app.name)}</td>
                <td>${escapeHtml(app.email)}</td>
                <td>Job #${app.job_id}</td>
                <td>${new Date(app.applied_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

    } catch (e) {
        console.error("Admin stats error", e);
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utils
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
