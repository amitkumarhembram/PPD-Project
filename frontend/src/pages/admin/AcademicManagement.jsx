import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState('programs'); // 'programs', 'branches', 'catalog', 'curriculum'
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [programForm, setProgramForm] = useState({ id: null, name: '', level_id: 1 });
  const [branchForm, setBranchForm] = useState({ id: null, name: '', program_id: '', capacity: '' });
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', credits: 3 });
  const [curriculumForm, setCurriculumForm] = useState({ branch_id: '', subject_id: '', semester: 1 });

  // Filters for curriculum
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progRes, branchRes, subRes] = await Promise.all([
        api.get('/admin/programs'),
        api.get('/admin/branches'),
        api.get('/admin/subjects')
      ]);
      setPrograms(progRes.data);
      setBranches(branchRes.data);
      setSubjects(subRes.data);
    } catch (err) {
      alert('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculum = async () => {
      try {
          const query = new URLSearchParams();
          if (filterBranch) query.append('branchId', filterBranch);
          if (filterSemester) query.append('semester', filterSemester);
          const res = await api.get(`/admin/curriculum?${query.toString()}`);
          setCurriculum(res.data);
      } catch (e) {
          console.error(e);
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
      if (activeTab === 'curriculum') {
          fetchCurriculum();
      }
  }, [activeTab, filterBranch, filterSemester]);

  // --- Program Handlers ---
  const handleSaveProgram = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (programForm.id) await api.put(`/admin/programs/${programForm.id}`, programForm);
      else await api.post('/admin/programs', programForm);
      setShowProgramModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save program'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await api.delete(`/admin/programs/${id}`); fetchData(); } 
    catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  const openProgramModal = (prog = null) => {
    if (prog) setProgramForm({ id: prog.id, name: prog.name, level_id: prog.level_id });
    else setProgramForm({ id: null, name: '', level_id: 1 });
    setShowProgramModal(true);
  };

  // --- Branch Handlers ---
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!branchForm.program_id) return alert('Please select a program');
    setIsSubmitting(true);
    try {
      if (branchForm.id) await api.put(`/admin/branches/${branchForm.id}`, branchForm);
      else await api.post('/admin/branches', branchForm);
      setShowBranchModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save branch'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await api.delete(`/admin/branches/${id}`); fetchData(); } 
    catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  const openBranchModal = (br = null) => {
    if (br) setBranchForm({ id: br.id, name: br.name, program_id: br.program_id, capacity: br.capacity });
    else setBranchForm({ id: null, name: '', program_id: programs.length ? programs[0].id : '', capacity: 60 });
    setShowBranchModal(true);
  };

  // --- Subject Handlers ---
  const handleSaveSubject = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          await api.post('/admin/subjects', subjectForm);
          setShowSubjectModal(false);
          fetchData();
      } catch (err) { alert(err.response?.data?.error || 'Failed to save subject'); }
      finally { setIsSubmitting(false); }
  };

  const openSubjectModal = () => {
      setSubjectForm({ code: '', name: '', credits: 3 });
      setShowSubjectModal(true);
  };

  // --- Curriculum Handlers ---
  const handleSaveCurriculum = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          await api.post('/admin/curriculum', curriculumForm);
          setShowCurriculumModal(false);
          fetchCurriculum();
      } catch (err) { alert(err.response?.data?.error || 'Failed to assign subject'); }
      finally { setIsSubmitting(false); }
  }

  const handleDeleteCurriculum = async (id) => {
      if (!window.confirm('Remove this subject from the branch?')) return;
      try {
          await api.delete(`/admin/curriculum/${id}`);
          fetchCurriculum();
      } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  }

  const openCurriculumModal = () => {
      setCurriculumForm({ branch_id: branches.length ? branches[0].id : '', subject_id: subjects.length ? subjects[0].id : '', semester: 1 });
      setShowCurriculumModal(true);
  }

  if (loading) return <div className="p-8 text-center text-secondary font-bold tracking-widest uppercase">Loading Academic Data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Academic Setup</h1>
          <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
          <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
            Manage Programs, Branches, Subjects, and Curriculum
          </p>
        </div>
        
        <div className="flex bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline-variant/30 max-w-full overflow-x-auto">
          {['programs', 'branches', 'catalog', 'curriculum'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-secondary hover:text-on-surface'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'programs' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-end">
            <Button onClick={() => openProgramModal()} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span> Add Program
            </Button>
          </div>
          <Table headers={['ID', 'Program Name', 'Level', 'Actions']}>
            {programs.map(p => (
              <tr key={p.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">#{p.id}</td>
                <td className="px-6 py-4 font-black text-on-surface uppercase tracking-tight">{p.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold text-secondary uppercase tracking-widest">
                    {p.level_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openProgramModal(p)} className="text-primary hover:text-primary/80 font-bold uppercase text-[10px] tracking-widest transition-colors">Edit</button>
                  <button onClick={() => handleDeleteProgram(p.id)} className="text-error hover:text-error/80 font-bold uppercase text-[10px] tracking-widest transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-end">
            <Button onClick={() => openBranchModal()} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span> Add Branch
            </Button>
          </div>
          <Table headers={['ID', 'Branch Name', 'Program', 'Capacity', 'Actions']}>
            {branches.map(b => (
              <tr key={b.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">#{b.id}</td>
                <td className="px-6 py-4 font-black text-on-surface uppercase tracking-tight">{b.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{b.program_name}</span>
                     <span className="text-[9px] text-secondary font-bold uppercase tracking-widest">{b.level_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-on-surface">{b.capacity}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openBranchModal(b)} className="text-primary hover:text-primary/80 font-bold uppercase text-[10px] tracking-widest transition-colors">Edit</button>
                  <button onClick={() => handleDeleteBranch(b.id)} className="text-error hover:text-error/80 font-bold uppercase text-[10px] tracking-widest transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-end">
            <Button onClick={() => openSubjectModal()} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span> Add Subject to Catalog
            </Button>
          </div>
          <Table headers={['Code', 'Subject Name', 'Credits']}>
            {subjects.map(s => (
              <tr key={s.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">{s.code}</td>
                <td className="px-6 py-4 font-black text-on-surface uppercase tracking-tight">{s.name}</td>
                <td className="px-6 py-4 font-bold text-on-surface">{s.credits}</td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan="3" className="px-6 py-8 text-center text-secondary text-xs uppercase tracking-widest font-bold">No Subjects in Catalog</td></tr>
            )}
          </Table>
        </div>
      )}

      {activeTab === 'curriculum' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <div className="flex gap-4 items-center">
               <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="px-4 py-2 bg-surface-container border border-outline-variant/50 rounded-lg text-sm font-semibold uppercase tracking-widest outline-none">
                   <option value="">All Branches</option>
                   {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.program_name})</option>)}
               </select>
               <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="px-4 py-2 bg-surface-container border border-outline-variant/50 rounded-lg text-sm font-semibold uppercase tracking-widest outline-none">
                   <option value="">All Semesters</option>
                   {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
               </select>
            </div>
            <Button onClick={() => openCurriculumModal()} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span> Map Subject
            </Button>
          </div>
          
          <Table headers={['Branch', 'Semester', 'Subject Code', 'Subject Name', 'Actions']}>
            {curriculum.map(c => {
               const branch = branches.find(b => b.id === c.branch_id);
               return (
                <tr key={c.mapping_id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface uppercase tracking-tight">{branch ? `${branch.name} (${branch.program_name})` : c.branch_id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">Sem {c.semester}</td>
                    <td className="px-6 py-4 font-black text-on-surface uppercase tracking-tight">{c.code}</td>
                    <td className="px-6 py-4 font-semibold text-on-surface">{c.name}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteCurriculum(c.mapping_id)} className="text-error hover:text-error/80 font-bold uppercase text-[10px] tracking-widest transition-colors">Unmap</button>
                    </td>
                </tr>
               )
            })}
            {curriculum.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-secondary text-xs uppercase tracking-widest font-bold">No Mapped Subjects</td></tr>
            )}
          </Table>
        </div>
      )}

      {/* Program Modal */}
      {showProgramModal && (
         <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
               <h3 className="font-extrabold uppercase tracking-tight text-on-surface">{programForm.id ? 'Edit Program' : 'Add Program'}</h3>
               <button onClick={() => setShowProgramModal(false)} className="text-secondary hover:text-on-surface transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <form onSubmit={handleSaveProgram} className="p-6 space-y-5">
               <Input label="Program Name" required value={programForm.name} onChange={e => setProgramForm({...programForm, name: e.target.value})} placeholder="e.g. B.Tech" />
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1">Level</label>
                 <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold uppercase tracking-widest text-on-surface appearance-none cursor-pointer" value={programForm.level_id} onChange={e => setProgramForm({...programForm, level_id: parseInt(e.target.value)})}>
                   <option value={1}>Undergraduate (UG)</option>
                   <option value={2}>Postgraduate (PG)</option>
                 </select>
               </div>
               <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                  <Button variant="outline" type="button" onClick={() => setShowProgramModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Program'}</Button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Branch Modal */}
      {showBranchModal && (
         <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
               <h3 className="font-extrabold uppercase tracking-tight text-on-surface">{branchForm.id ? 'Edit Branch' : 'Add Branch'}</h3>
               <button onClick={() => setShowBranchModal(false)} className="text-secondary hover:text-on-surface transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <form onSubmit={handleSaveBranch} className="p-6 space-y-5">
               <Input label="Branch Name" required value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} placeholder="e.g. Computer Science" />
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1">Program</label>
                 <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold uppercase tracking-widest text-on-surface appearance-none cursor-pointer" value={branchForm.program_id} required onChange={e => setBranchForm({...branchForm, program_id: parseInt(e.target.value)})}>
                   <option value="" disabled>Select Program</option>
                   {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.level_name})</option>)}
                 </select>
               </div>
               <Input label="Capacity (Seats)" type="number" min="1" required value={branchForm.capacity} onChange={e => setBranchForm({...branchForm, capacity: parseInt(e.target.value) || ''})} />
               <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                  <Button variant="outline" type="button" onClick={() => setShowBranchModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Branch'}</Button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
         <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
               <h3 className="font-extrabold uppercase tracking-tight text-on-surface">Add Subject</h3>
               <button onClick={() => setShowSubjectModal(false)} className="text-secondary hover:text-on-surface transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <form onSubmit={handleSaveSubject} className="p-6 space-y-5">
               <Input label="Subject Code" required value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} placeholder="e.g. CS3102" />
               <Input label="Subject Name" required value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} placeholder="e.g. Deep Learning" />
               <Input label="Credits" type="number" min="1" required value={subjectForm.credits} onChange={e => setSubjectForm({...subjectForm, credits: parseInt(e.target.value) || 3})} />
               <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                  <Button variant="outline" type="button" onClick={() => setShowSubjectModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Subject'}</Button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Curriculum Mapping Modal */}
      {showCurriculumModal && (
         <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
               <h3 className="font-extrabold uppercase tracking-tight text-on-surface">Map Subject</h3>
               <button onClick={() => setShowCurriculumModal(false)} className="text-secondary hover:text-on-surface transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <form onSubmit={handleSaveCurriculum} className="p-6 space-y-5">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1">Branch</label>
                 <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold uppercase tracking-widest text-on-surface appearance-none cursor-pointer" value={curriculumForm.branch_id} required onChange={e => setCurriculumForm({...curriculumForm, branch_id: parseInt(e.target.value)})}>
                   <option value="" disabled>Select Branch</option>
                   {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.program_name})</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1">Semester</label>
                 <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold uppercase tracking-widest text-on-surface appearance-none cursor-pointer" value={curriculumForm.semester} required onChange={e => setCurriculumForm({...curriculumForm, semester: parseInt(e.target.value)})}>
                   {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1">Subject</label>
                 <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold uppercase tracking-widest text-on-surface appearance-none cursor-pointer" value={curriculumForm.subject_id} required onChange={e => setCurriculumForm({...curriculumForm, subject_id: parseInt(e.target.value)})}>
                   <option value="" disabled>Select Subject</option>
                   {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                 </select>
               </div>
               <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                  <Button variant="outline" type="button" onClick={() => setShowCurriculumModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Map Subject'}</Button>
               </div>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};

export default AcademicManagement;
