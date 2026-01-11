import React, { useState, useMemo } from 'react';
import jobsData from './jobs.json';

const NJPGlobalPro = () => {
  const [jobs] = useState(jobsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({ category: "All", type: "All" });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  // 1. Logic: Filter Jobs based on Search and Sidebar
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filters.category === "All" || job.category === filters.category;
      const matchesType = filters.type === "All" || job.type === filters.type;
      return matchesSearch && matchesCat && matchesType;
    });
  }, [searchTerm, filters, jobs]);

  // 2. Logic: Pagination calculation
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900">
      {/* HEADER SECTION */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-white font-black">N</div>
          <span className="text-xl font-black text-blue-900 tracking-tight">NJP GLOBAL</span>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">Employer Login</button>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 p-6">
        
        {/* SIDEBAR FILTERS (3 Cols) */}
        <aside className="md:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-slate-800 border-b pb-2">Categories</h3>
            <div className="flex flex-col gap-2">
              {["All", "Tech", "Design", "Marketing", "Finance"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setFilters({...filters, category: cat}); setCurrentPage(1); }}
                  className={`text-left px-4 py-2 rounded-xl transition ${filters.category === cat ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'}`}
                > {cat} </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-slate-800 border-b pb-2">Job Type</h3>
            <div className="flex flex-col gap-2">
              {["All", "Full-time", "Remote", "Contract"].map(type => (
                <button 
                  key={type}
                  onClick={() => { setFilters({...filters, type}); setCurrentPage(1); }}
                  className={`text-left px-4 py-2 rounded-xl transition ${filters.type === type ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100'}`}
                > {type} </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN JOB FEED (9 Cols) */}
        <main className="md:col-span-9 space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search job titles or companies..." 
              className="w-full p-5 pl-14 bg-white rounded-2xl shadow-sm border-2 border-transparent focus:border-blue-500 outline-none transition"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <span className="absolute left-5 top-5 text-xl">🔍</span>
          </div>

          <div className="space-y-4">
            {currentJobs.map(job => (
              <div 
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    {job.company[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-blue-600">{job.title}</h3>
                    <p className="text-slate-500">{job.company} • {job.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black">{job.salary}</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded text-slate-500">{job.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION BUTTONS */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-6 py-2 bg-white border rounded-full disabled:opacity-30 hover:bg-slate-50 font-bold"
              >Previous</button>
              <span className="font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-6 py-2 bg-white border rounded-full disabled:opacity-30 hover:bg-slate-50 font-bold"
              >Next</button>
            </div>
          )}
        </main>
      </div>

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 text-2xl">✕</button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">{selectedJob.company[0]}</div>
              <div>
                <h2 className="text-3xl font-black">{selectedJob.title}</h2>
                <p className="text-blue-600 font-bold text-lg">{selectedJob.company}</p>
              </div>
            </div>
            <div className="space-y-4 text-slate-600">
              <p className="text-lg leading-relaxed">{selectedJob.desc}</p>
              <div className="flex gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex-1">
                  <p className="text-xs uppercase font-bold text-slate-400">Salary Range</p>
                  <p className="text-xl font-bold text-slate-900">{selectedJob.salary}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex-1">
                  <p className="text-xs uppercase font-bold text-slate-400">Location</p>
                  <p className="text-xl font-bold text-slate-900">{selectedJob.location}</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white mt-8 py-4 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Apply Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NJPGlobalPro;
