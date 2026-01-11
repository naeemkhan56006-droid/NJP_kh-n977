import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import jobsData from './jobs.json';

const App = () => {
  const [jobs] = useState(jobsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' or 'register'
  const [filters, setFilters] = useState({ category: "All", type: "All" });
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Filter Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filters.category === "All" || job.category === filters.category;
      const matchesType = filters.type === "All" || job.type === filters.type;
      return matchesSearch && matchesCat && matchesType;
    });
  }, [searchTerm, filters, jobs]);

  const currentJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const gold = "#d4af37";

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      
      {/* NAVBAR */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 60px', backgroundColor: '#111', borderBottom: `1px solid ${gold}33`,
        position: 'sticky', top: 0, zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
          <div style={{ border: `2px solid ${gold}`, padding: '5px 12px', fontWeight: '900', fontSize: '24px', color: gold }}>N</div>
          <span style={{ letterSpacing: '5px', fontSize: '20px', fontWeight: 'bold', color: gold }}>NJP GLOBAL</span>
        </div>
        
        <div style={{ display: 'flex', gap: '25px' }}>
          <button onClick={() => setAuthModal('login')} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>LOGIN</button>
          <button onClick={() => setAuthModal('register')} className="btn-gold" style={{ border: 'none', padding: '10px 25px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px' }}>REGISTER</button>
        </div>
      </nav>

      {/* HERO */}
      <header style={{ textAlign: 'center', padding: '100px 20px', borderBottom: '1px solid #111' }}>
        <h1 style={{ fontSize: '65px', color: 'white', marginBottom: '10px', fontFamily: 'Playfair Display' }}>Premium <span style={{ color: gold }}>Careers</span></h1>
        <p style={{ letterSpacing: '6px', color: '#666', marginBottom: '40px', fontSize: '12px' }}>THE GOLD STANDARD OF RECRUITMENT</p>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', backgroundColor: '#161616', border: '1px solid #333' }}>
          <input 
            type="text" 
            placeholder="Search Positions..." 
            style={{ flex: 1, padding: '18px', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <button style={{ backgroundColor: gold, border: 'none', padding: '0 30px', fontWeight: 'bold', cursor: 'pointer' }}>FIND</button>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px', padding: '60px 20px' }}>
        
        {/* SIDEBAR */}
        <aside>
          <h3 style={{ fontSize: '11px', letterSpacing: '3px', color: '#444', marginBottom: '30px' }}>FILTER BY INDUSTRY</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {["All", "Tech", "Design", "Marketing", "Finance"].map(cat => (
              <button key={cat} onClick={() => {setFilters({...filters, category: cat}); setCurrentPage(1);}}
                style={{ background: 'none', border: 'none', color: filters.category === cat ? gold : '#555', textAlign: 'left', cursor: 'pointer', transition: '0.3s', fontSize: '14px', borderLeft: filters.category === cat ? `2px solid ${gold}` : '2px solid transparent', paddingLeft: '10px' }}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </aside>

        {/* FEED */}
        <main>
          <div style={{ display: 'grid', gap: '15px' }}>
            {currentJobs.map(job => (
              <div key={job.id} onClick={() => setSelectedJob(job)} className="job-card-wrapper"
                style={{ backgroundColor: '#111', padding: '30px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '20px', letterSpacing: '1px' }}>{job.title}</h3>
                  <p style={{ color: '#555', fontSize: '12px', marginTop: '5px' }}>{job.company} // {job.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: gold }}>{job.salary}</p>
                  <span style={{ fontSize: '10px', color: '#444' }}>{job.type.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '50px' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', opacity: currentPage === 1 ? 0.2 : 1 }}>PREV</button>
            <span style={{ color: 'white', fontSize: '12px' }}>0{currentPage} / 0{totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', opacity: currentPage === totalPages ? 0.2 : 1 }}>NEXT</button>
          </div>
        </main>
      </div>

      {/* AUTH MODAL */}
      {authModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111', border: `1px solid ${gold}`, padding: '50px', width: '380px', textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: '30px', letterSpacing: '4px' }}>{authModal.toUpperCase()}</h2>
            <input type="email" placeholder="EMAIL ADDRESS" style={{ width: '100%', padding: '15px', background: 'black', border: '1px solid #333', color: 'white', marginBottom: '15px', outline: 'none' }} />
            <input type="password" placeholder="PASSWORD" style={{ width: '100%', padding: '15px', background: 'black', border: '1px solid #333', color: 'white', marginBottom: '25px', outline: 'none' }} />
            <button className="btn-gold" style={{ width: '100%', padding: '15px', border: 'none', fontWeight: 'bold' }}>CONTINUE</button>
            <button onClick={() => setAuthModal(null)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111', border: `1px solid ${gold}`, padding: '60px', maxWidth: '700px', width: '100%', position: 'relative' }}>
            <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: gold, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <h2 style={{ color: 'white', fontSize: '35px', margin: 0 }}>{selectedJob.title}</h2>
            <p style={{ color: gold, letterSpacing: '3px', fontWeight: 'bold', margin: '15px 0 40px' }}>{selectedJob.company} // {selectedJob.location}</p>
            <p style={{ color: '#888', lineHeight: '1.8' }}>{selectedJob.desc}</p>
            <div style={{ display: 'flex', gap: '40px', marginTop: '40px', borderTop: '1px solid #222', paddingTop: '30px' }}>
              <div><p style={{ fontSize: '10px', color: '#444' }}>SALARY</p><p style={{ fontWeight: 'bold' }}>{selectedJob.salary}</p></div>
              <div><p style={{ fontSize: '10px', color: '#444' }}>TYPE</p><p style={{ fontWeight: 'bold' }}>{selectedJob.type}</p></div>
            </div>
            <button className="btn-gold" style={{ width: '100%', padding: '20px', border: 'none', fontWeight: 'bold', marginTop: '40px' }}>APPLY FOR POSITION</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
