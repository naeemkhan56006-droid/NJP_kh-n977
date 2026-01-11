/**
 * NJP Global - Core Application Script
 * Handles: Real-time Search, View Switching, Job Grid Rendering
 * Dependencies: auth.js, admin.js (loaded previously)
 */

const App = {
    state: {
        jobs: [],
        filters: { search: '' },
        view: 'user'
    },

    init() {
        // Ensure Lucide icons are rendered initially
        if (window.lucide) window.lucide.createIcons();

        this.cacheDOM();
        this.bindEvents();
        this.fetchJobs();

        // Expose App for Admin.js to call
        window.App = this;
    },

    cacheDOM() {
        this.dom = {
            viewSections: document.querySelectorAll('.view-section'),
            jobsGrid: document.getElementById('jobsGrid'),
            searchInput: document.getElementById('searchInput'),
            overlay: document.getElementById('modalOverlay'),
        };
    },

    bindEvents() {
        // Real-time Search
        if (this.dom.searchInput) {
            this.dom.searchInput.addEventListener('input', (e) => {
                this.state.filters.search = e.target.value;
                this.renderJobsList();
            });
        }

        // Global Overlay Click
        if (this.dom.overlay) {
            this.dom.overlay.addEventListener('click', () => window.closeAllModals());
        }
    },

    async fetchJobs() {
        try {
            const res = await fetch('/api/jobs');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            this.state.jobs = data;
            this.renderJobsList();
        } catch (e) {
            console.error("Failed to fetch jobs:", e);
            if (this.dom.jobsGrid) {
                this.dom.jobsGrid.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted)">Unable to load opportunities at this time.</div>`;
            }
        }
    },

    renderJobsList() {
        if (!this.dom.jobsGrid) return;

        const term = this.state.filters.search.toLowerCase();
        const filtered = this.state.jobs.filter(job =>
            (job.title && job.title.toLowerCase().includes(term)) ||
            (job.company && job.company.toLowerCase().includes(term))
        );

        if (filtered.length === 0) {
            this.dom.jobsGrid.innerHTML = `<div style="text-align:center; grid-column:1/-1; padding:20px;">No matches found</div>`;
            return;
        }

        this.dom.jobsGrid.innerHTML = filtered.map(job => `
            <div class="job-card fade-in">
                <div class="job-header">
                    <div class="company-logo-placeholder">${job.company ? job.company.charAt(0).toUpperCase() : 'N'}</div>
                    <div>
                        <h3 class="job-title">${escapeHtml(job.title)}</h3>
                        <div class="job-company">
                            <i data-lucide="building-2" style="width:14px"></i> ${escapeHtml(job.company)}
                        </div>
                    </div>
                </div>
                
                <div class="job-tags">
                    <span class="tag tag-primary">
                        <i data-lucide="briefcase" style="width:12px"></i> ${escapeHtml(job.category || 'Professional')}
                    </span>
                    <span class="tag tag-secondary">
                        <i data-lucide="clock" style="width:12px"></i> ${escapeHtml(job.job_type || 'Full-time')}
                    </span>
                    <span class="tag tag-secondary">
                         ${escapeHtml(job.location || 'Remote')}
                    </span>
                </div>

                <div class="job-footer">
                    <span class="salary-tag">${escapeHtml(job.salary || 'Negotiable')}</span>
                    <button class="btn btn-primary btn-sm" onclick="openApplyModal('${job.id}')">Apply Now</button>
                </div>
            </div>
        `).join('');

        // Refresh icons for new elements
        if (window.lucide) window.lucide.createIcons();
    }
};

// --- Global Utilities (Used by auth.js, admin.js, index.html) ---

window.showView = (viewName) => {
    App.state.view = viewName;
    document.querySelectorAll('.view-section').forEach(el => {
        if (el.id === `${viewName}View`) {
            el.style.display = 'block';
            el.classList.add('fade-in'); // Add animation if CSS supports it
        } else {
            el.style.display = 'none';
        }
    });
    window.scrollTo(0, 0);
};

window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');

    if (modal && overlay) {
        window.closeAllModals(); // Close trigger

        overlay.style.display = 'block';
        modal.style.display = 'block';

        // Small delay to allow display:block to apply before adding class for transition
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            modal.classList.add('active');
        });
    } else {
        console.error("Modal not found:", modalId);
    }
};

window.closeAllModals = () => {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 300);
    }

    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => { if (modal) modal.style.display = 'none'; }, 300);
    });
};

// Simple ID safe HTML escaping
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

window.openApplyModal = (jobId) => {
    // Placeholder for Apply Modal Logic if not in auth.js
    // Just opening the modal for now as requested
    // If apply logic is needed, it can be added here
    console.log("Applying for", jobId);
    alert("Application feature coming soon in this modular update!");
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());