import React, { useState, useMemo } from 'react';
import jobsData from './jobs.json';

const NJPGlobalFinal = () => {
  // States
  const [jobs] = useState(jobsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' or 'register'
  const [filters, setFilters] = useState({ category: "All", type: "All" });
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Logic: Filter and Pagination
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filters.category === "All" || job.category === filters.category;
      const matchesType = filters.type === "All" || job.type === filters.type;
      return matchesSearch && matchesCat && matchesType;
    });
  }, [searchTerm, filters, jobs]);

  const currentJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const scrollToJobs = () => document.getElementById('job-section').scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4af37] font-sans selection:bg-[#d4af37] selection:text-black">
      
      {/* LUXURY NAVBAR */}
      <nav className="bg-[#111] border-b border-[#d4af37]/20 px-8 py-5 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="border-2 border-[#d4af37] w-10 h-10 flex items-center justify-center rounded-sm font-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">N</div>
          <span className="text-2xl font-serif tracking-widest uppercase">NJP Global</span>
        </div>
        
        <div className="hidden md:flex gap-8 items-center font-medium text-[10px] tracking-[0.3em] uppercase">
          <button onClick={scrollToJobs} className="hover:text-white transition">Jobs</button>
          <button className="hover:text-white transition">Post Opportunity</button>
          <button className="hover:text-white transition">Contact</button>
        </div>

        <div className="flex gap-4 items-center">
          <button onClick={() => setAuthModal('login')} className="text-[#d4af37] hover:text-white text-xs font-bold uppercase tracking-widest">Login</button>
          <button onClick={() => setAuthModal('register')} className="bg-[#d4af37] text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">Register</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="py-32 px-6 text-center">
        <h2 className="text-6xl md:text-8xl font-serif mb-8 text-white leading-tight animate-in fade-in slide-in-from-bottom duration-700">The Gold Standard <br/> <span className="text-[#d4af37]">of Careers</span></h2>
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-2 p-2 bg-[#161616] border border-[#d4af37]/20 shadow-2xl">
          <input 
            type="text" 
            placeholder="Search Global Positions..." 
            className="flex-1 bg-transparent px-6 py-4 outline-none text-white placeholder:text-gray-700 text-lg"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <button onClick={scrollToJobs} className="bg-[#d4af37] text-black px-12 py-4 font-black uppercase text-sm hover:bg-white transition-all">Search</button>
        </div>
      </header>

      <div id="job-section" className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 p-8 mb-20">
        {/* SIDEBAR */}
        <aside className="md:col-span-3 space-y-12">
          <div className="border-l-2 border-[#d4af37]/40 pl-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 text-gray-500">Categories</h3>
            <div className="flex flex-col gap-5 items-start">
              {["All", "Tech", "Design", "Marketing", "Finance"].map(cat => (
                <button key={cat} onClick={() => {setFilters({...filters, category: cat}); setCurrentPage(1);}}
                  className={`text-xs uppercase tracking-[0.2em] transition-all hover:translate-x-2 ${filters.category === cat ? 'text-[#d4af37] font-black' : 'text-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* JOB FEED */}
        <main className="md:col-span-9 space-y-6">
          {currentJobs.map(job => (
            <div key={job.id} onClick={() => setSelectedJob(job)} className="group bg-[#111] border border-white/5 p-10 flex flex-col md:flex-row justify-between items-center hover:border-[#d4af37]/40 transition-all cursor-pointer shadow-xl">
              <div className="flex gap-8 items-center">
                <div className="w-20 h-20 border border-[#d4af37]/10 flex items-center justify-center text-3xl font-serif text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                  {job.company[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#d4af37] transition-colors uppercase tracking-tighter">{job.title}</h3>
                  <p className="text-gray-600 tracking-[0.2em] text-xs mt-1 uppercase">{job.company} // {job.location}</p>
                </div>
              </div>
              <div className="mt-6 md:mt-0 text-right flex flex-col items-end">
                <p className="text-[#d4af37] font-serif text-2xl mb-3">{job.salary}</p>
                <span className="text-[9px] border border-gray-800 px-4 py-1 tracking-[0.3em] uppercase text-gray-500 group-hover:border-[#d4af37]">Explore</span>
              </div>
            </div>
          ))}

          {/* PAGINATION */}
          <div className="flex justify-center gap-10 mt-16 pt-10 border-t border-white/5 font-black text-[10px] tracking-[0.4em]">
            <button onClick={() => setCurrentPage(p => p-1)} disabled={currentPage===1} className="disabled:opacity-20 hover:text-white">PREV</button>
            <span className="text-white underline underline-offset-8 decoration-[#d4af37]">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p+1)} disabled={currentPage===totalPages} className="disabled:opacity-20 hover:text-white">NEXT</button>
          </div>
        </main>
      </div>

      {/* MODALS: JOB DETAIL, LOGIN, REGISTER */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#111] border border-[#d4af37] w-full max-w-2xl p-12 relative animate-in zoom-in duration-300">
            <button onClick={() => setSelectedJob(null)} className="absolute top-8 right-8 text-[#d4af37] hover:text-white text-xl">✕</button>
            <h2 className="text-5xl font-serif text-white mb-4 uppercase">{selectedJob.title}</h2>
            <p className="text-[#d4af37] tracking-[0.3em] font-bold mb-10 text-xs">{selectedJob.company} // GLOBAL HQ</p>
            <p className="text-gray-400 leading-loose text-lg mb-10">{selectedJob.desc}</p>
            <button className="w-full bg-[#d4af37] text-black py-5 font-black uppercase tracking-[0.4em] hover:bg-white transition-all">Apply for position</button>
          </div>
        </div>
      )}

      {authModal && (
        <div className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#111] border border-[#d4af37]/30 w-full max-w-md p-12 relative shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <button onClick={() => setAuthModal(null)} className="absolute top-8 right-8 text-gray-600 hover:text-[#d4af37]">✕</button>
            
            <h2 className="text-3xl font-serif text-white mb-8 text-center uppercase tracking-widest">
              {authModal === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {authModal === 'register' && (
                <input type="text" placeholder="FULL NAME" className="w-full bg-black border border-white/10 p-4 outline-none focus:border-[#d4af37] transition text-white placeholder:text-gray-800 text-xs tracking-widest" />
              )}
              <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-black border border-white/10 p-4 outline-none focus:border-[#d4af37] transition text-white placeholder:text-gray-800 text-xs tracking-widest" />
              <input type="password" placeholder="PASSWORD" className="w-full bg-black border border-white/10 p-4 outline-none focus:border-[#d4af37] transition text-white placeholder:text-gray-800 text-xs tracking-widest" />
              
              <button className="w-full bg-[#d4af37] text-black py-4 font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition-all">
                {authModal === 'login' ? 'Secure Login' : 'Sign Up Now'}
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] tracking-widest text-gray-600">
              {authModal === 'login' ? "DON'T HAVE AN ACCOUNT?" : "ALREADY A MEMBER?"} 
              <button onClick={() => setAuthModal(authModal === 'login' ? 'register' : 'login')} className="ml-2 text-[#d4af37] font-black hover:underline underline-offset-4 tracking-normal uppercase">
                {authModal === 'login' ? 'Create one' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      )}

      <footer className="py-20 border-t border-white/5 text-center bg-black">
        <p className="text-[10px] tracking-[1em] text-gray-700 uppercase">NJP Global Luxury Systems — Est. 2026</p>
      </footer>
    </div>
  );
};

export default NJPGlobalFinal;
