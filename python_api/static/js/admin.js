/**
 * NJP Global - Admin & Employer Module
 * Handles 'Post Job', Candidate Tracking, and Dashboard Logic
 */

const Admin = {
    init() {
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        // Post Job Button
        const postBtn = document.getElementById('postJobBtn');
        if (postBtn) {
            postBtn.addEventListener('click', () => this.handlePostJob());
        }
    },

    checkAuth() {
        const role = localStorage.getItem('role');
        const adminLink = document.getElementById('navAdminLink');
        if (role === 'admin' && adminLink) {
            adminLink.style.display = 'block';
        }
    },

    async handlePostJob() {
        const titleEl = document.getElementById('postJobTitle');
        const companyEl = document.getElementById('postJobCompany');
        const catEl = document.getElementById('postJobCategory');
        const salaryEl = document.getElementById('postJobSalary');
        const descEl = document.getElementById('postJobDesc');
        const btn = document.getElementById('postJobBtn');

        if (!titleEl.value || !companyEl.value) {
            alert('Title and Company are required');
            return;
        }

        const jobData = {
            title: titleEl.value,
            company: companyEl.value,
            category: catEl.value,
            salary: salaryEl.value,
            description: descEl.value,
            job_type: 'Full-time', // Default
            location: 'Remote' // Default
        };

        btn.textContent = 'Posting...';
        btn.disabled = true;

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });

            if (res.ok) {
                alert('Job Posted Successfully!');

                // Clear Form
                titleEl.value = '';
                companyEl.value = '';
                salaryEl.value = '';
                descEl.value = '';

                window.closeAllModals();

                // Refresh Grid
                if (window.App && window.App.fetchJobs) {
                    window.App.fetchJobs();
                }
            } else {
                alert('Failed to post job');
            }
        } catch (e) {
            console.error(e);
            alert('Error posting job');
        } finally {
            btn.textContent = 'Submit Job';
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
