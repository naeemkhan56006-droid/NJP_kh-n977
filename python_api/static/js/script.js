/**
 * NJP Global - Executive Script
 * Fixes: Null ClassList Error, Search Functionality, View Switching
 */

const App = {
    state: {
        jobs: [],
        filters: { search: '' },
        view: 'user'
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.fetchJobs();
    },

    cacheDOM() {
        this.dom = {
            viewSections: document.querySelectorAll('.view-section'),
            jobsGrid: document.getElementById('jobsGrid'),
            searchInput: document.getElementById('searchInput'),
            overlay: document.getElementById('modalOverlay'),
            candidateTable: document.getElementById('candidateTable')
        };
    },

    bindEvents() {
        // Search Filter Logic
        if (this.dom.searchInput) {
            this.dom.searchInput.addEventListener('input', (e) => {
                this.state.filters.search = e.target.value;
                this.renderJobsList();
            });
        }

        // Close modal on overlay click
        if (this.dom.overlay) {
            this.dom.overlay.addEventListener('click', () => window.closeAllModals());
        }
    },

    async fetchJobs() {
        try {
            const res = await fetch('/api/jobs');
            const data = await res.json();
            this.state.jobs = data;
            this.renderJobsList();
        } catch (e) {
            console.error("Failed to fetch jobs:", e);
        }
    },

    renderJobsList() {
        if (!this.dom.jobsGrid) return;

        const filtered = this.state.jobs.filter(job =>
            job.title.toLowerCase().includes(this.state.filters.search.toLowerCase()) ||
            job.company.toLowerCase().includes(this.state.filters.search.toLowerCase())
        );

        this.dom.jobsGrid.innerHTML = filtered.map(job => `
            <div class="job-card">
                <h3 class="job-title">${job.title}</h3>
                <div class="job-company">${job.company}</div>
                <div class="job-tags">
                    <span class="tag">${job.category || 'Professional'}</span>
                    <span class="tag">${job.job_type || 'Full-time'}</span>
                </div>
                <div class="job-footer">
                    <span class="salary-tag">${job.salary || 'Negotiable'}</span>
                    <button class="btn btn-primary btn-sm">Apply Now</button>
                </div>
            </div>
        `).join('');
    }
};

// --- Global Functions (Bridging HTML to Logic) ---

window.showView = (viewName) => {
    App.state.view = viewName;
    document.querySelectorAll('.view-section').forEach(el => {
        el.style.display = el.id === `${viewName}View` ? 'block' : 'none';
    });
};

window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');

    if (modal && overlay) {
        window.closeAllModals(); // Close any open ones first
        overlay.style.display = 'block';
        modal.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('active');
            modal.classList.add('active');
        }, 10);
    } else {
        console.error("Modal or Overlay not found:", modalId);
    }
};

window.closeAllModals = () => {
    // 1. Overlay
    const overlay = document.getElementById('modalOverlay');
    if (overlay && overlay.classList) {
        overlay.classList.remove('active');
        setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 300);
    }

    // 2. Modals (Strict Loop as Requested)
    const modals = document.querySelectorAll('.modal-content');
    if (modals) {
        modals.forEach(modal => {
            if (modal && modal.classList) {
                modal.classList.remove('active');
                setTimeout(() => { if (modal) modal.style.display = 'none'; }, 300);
            }
        });
    }
};

// Initialize the App
document.addEventListener('DOMContentLoaded', () => App.init());