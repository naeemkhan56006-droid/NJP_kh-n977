document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    loadJobs();
    loadStats();
    
    // Event Listeners
    setupSearch();
    setupModals();
});

// State
let allJobs = [];

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

// Modals
function setupModals() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtns = document.querySelectorAll('.modal-close');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.classList.remove('active');
        });
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });

    // Form Submission
    const form = document.getElementById('applyForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                alert('Application submitted successfully!');
                overlay.classList.remove('active');
                form.reset();
            } else {
                alert('Failed to submit application.');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting application');
        }
    });
}

function openApplyModal(jobId, jobTitle) {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalJobTitle');
    const form = document.getElementById('applyForm');
    
    titleEl.textContent = `Apply for ${jobTitle}`;
    form.dataset.jobId = jobId;
    
    overlay.classList.add('active');
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
