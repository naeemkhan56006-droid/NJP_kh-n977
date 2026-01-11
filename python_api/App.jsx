import React, { useState, useMemo } from 'react';
import './App.css'; 
import jobsData from './jobs.json';

// Note: Make sure your App.css has the styles I provided earlier.
// If not, this code uses inline styles as a backup to ensure the Black/Gold theme.

const App = () => {
  // --- States ---
  const [jobs] = useState(jobsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' or 'register'
  const [filters, setFilters] = useState({ category: "All", type: "All" });
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // --- Search & Filter Logic ---
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filters.category === "All" || job.category === filters.category;
      const matchesType = filters.type === "All" || job.type === filters.type;
      return matchesSearch && matchesCat && matchesType;
    });
  }, [searchTerm, filters, jobs]);

  // --- Pagination Logic ---
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const scrollToJobs = () => {
    const element = document.getElementById('job-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Inline Styles (Forced Theme) ---
  const gold = "#d4af37";
  const black = "#0a0a0a";

  return (
    <div style={{ backgroundColor: black, color: gold, minHeight: '100vh', fontFamily: 'serif' }}>
      
      {/* LUXURY NAVBAR */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 50px', backgroundColor: '#111', borderBottom: `1px solid ${gold}33`,
        position: 'sticky', top: 0, zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
          <div style={{ border: `2px solid ${gold}`, padding: '5px 12px', fontWeight: '900', fontSize: '24px' }}>N</div>
          <span style={{ letterSpacing: '5px', fontSize: '20px', fontWeight: 'bold' }}>NJP GLOBAL</span>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>
          <button onClick={scrollToJobs} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer' }}>JOBS</button>
          <button style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer' }}>POST OPPORTUNITY</button>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setAuthModal('login')} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', fontWeight: 'bold' }}>LOGIN</button>
          <button onClick={() => setAuthModal('register')} style={{ backgroundColor: gold, color: 'black', border: 'none', padding: '10px 25px', fontWeight: 'bold', cursor: 'pointer' }}>REGISTER</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ textAlign: 'center', padding: '120px 20px', background: 'linear-gradient(to bottom, #111, #0a0a0a)' }}>
        <h1 style={{ fontSize: '70px', color: 'white', marginBottom: '20px', letterSpacing: '-2px' }}>Elite Global <span style={{ color: gold }}>Careers</span></h1>
        <p style={{ letterSpacing: '5px', color: '#888', marginBottom: '40px' }}>THE GOLD STANDARD OF RECRUITMENT</p>
        
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', border: `1px solid ${gold}44`, backgroundColor: '#161616' }}>
          <input 
            type="text" 
            placeholder="Search Premium Positions..." 
            style={{ flex: 1, padding: '20px', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <button onClick={scrollToJobs} style={{ backgroundColor: gold, color: 'black', border: 'none', padding: '0 40px', fontWeight: '900', cursor: 'pointer' }}>FIND</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div id="job-section" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '50px', padding: '50px 20px' }}>
        
        {/* SIDEBAR FILTERS */}
        <aside style={{ borderLeft: `1px solid ${gold}33`, paddingLeft: '20px' }}>
          <h3 style={{ fontSize: '12px', letterSpacing: '3px', color: '#555', marginBottom: '20px' }}>CATEGORIES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {["All", "Tech", "Design", "Marketing", "Finance"].map(cat => (
              <button key={cat} onClick={() => {setFilters({...filters, category: cat}); setCurrentPage(1);}}
                style={{ background: 'none', border: 'none', color: filters.category === cat ? gold : '#555', textAlign: 'left', cursor: 'pointer', fontWeight: filters.category === cat ? 'bold' : 'normal', fontSize: '14px' }}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </aside>

        {/* JOB LISTINGS */}
        <main>
          <div style={{ marginBottom: '20px', fontSize: '12px', color: '#555', letterSpacing: '2px' }}>{filteredJobs.length} POSITIONS FOUND</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {currentJobs.map(job => (
              <div key={job.id} onClick={() => setSelectedJob(job)} className="job-card-hover"
                style={{ backgroundColor: '#111', padding: '30px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.3s' }}>
                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', border: `1px solid ${gold}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: gold }}>{job.company[0]}</div>
                  <div>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '22px' }}>{job.title}</h3>
                    <p style={{ color: '#555', fontSize: '12px', marginTop: '5px', letterSpacing: '1px' }}>{job.company.toUpperCase()} // {job.location.toUpperCase()}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{job.salary}</p>
                  <span style={{ fontSize: '10px', color: gold, border: `1px solid ${gold}44`, padding: '2px 8px', borderRadius: '2px' }}>{job.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '50px', fontSize: '12px', fontWeight: 'bold' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', opacity: currentPage === 1 ? 0.2 : 1 }}>PREV</button>
              <span style={{ color: 'white' }}>{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', opacity: currentPage === totalPages ? 0.2 : 1 }}>NEXT</button>
            </div>
          )}
        </main>
      </div>

      {/* LOGIN/REGISTER MODAL */}
      {authModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: '#111', border: `1px solid ${gold}`, padding: '50px', width: '400px', textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: '30px', letterSpacing: '5px' }}>{authModal.toUpperCase()}</h2>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {authModal === 'register' && <input type="text" placeholder="FULL NAME" style={{ padding: '15px', background: 'black', border: '1px solid #333', color: 'white', outline: 'none' }} />}
              <input type="email" placeholder="EMAIL ADDRESS" style={{ padding: '15px', background: 'black', border: '1px solid #333', color: 'white', outline: 'none' }} />
              <input type="password" placeholder="PASSWORD" style={{ padding: '15px', background: 'black', border: '1px solid #333', color: 'white', outline: 'none' }} />
              <button style={{ backgroundColor: gold, color: 'black', padding: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>CONTINUE</button>
            </form>
            <button onClick={() => setAuthModal(null)} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: '#111', border: `1px solid ${gold}`, padding: '60px', width: '100%', maxWidth: '800px', position: 'relative' }}>
            <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: gold, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontSize: '40px', color: 'white', marginBottom: '10px' }}>{selectedJob.title}</h2>
            <p style={{ color: gold, letterSpacing: '3px', fontWeight: 'bold', marginBottom: '40px' }}>{selectedJob.company.toUpperCase()} // {selectedJob.location.toUpperCase()}</p>
            <div style={{ color: '#aaa', lineHeight: '1.8', fontSize: '18px', marginBottom: '40px' }}>{selectedJob.desc}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #222', paddingTop: '30px' }}>
              <div><p style={{ fontSize: '10px', color: '#555' }}>REWARD</p><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedJob.salary}</p></div>
              <div><p style={{ fontSize: '10px', color: '#555' }}>TYPE</p><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedJob.type}</p></div>
            </div>
            <button style={{ width: '100%', backgroundColor: gold, color: 'black', padding: '20px', border: 'none', fontWeight: 'bold', fontSize: '18px', marginTop: '40px', cursor: 'pointer' }}>APPLY FOR THIS POSITION</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '80px', borderTop: '1px solid #111', fontSize: '10px', letterSpacing: '5px', color: '#333' }}>
        © 2026 NJP GLOBAL SYSTEMS // LUXURY CAREER PORTAL
      </footer>
    </div>
  );
};

export default App;
