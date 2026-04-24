import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Table from '../../components/ui/Table';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/students')
      .then(res => setStudents(res.data))
      .catch(() => alert('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-secondary font-bold tracking-widest uppercase">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="space-y-1 text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Enrolled Students</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Directory of students who completed admission — {students.length} total
        </p>
      </div>

      <Table headers={['Name', 'Email', 'Program', 'Branch', 'Actions']}>
        {students.map(s => (
          <tr key={s.id} className="hover:bg-surface-container-lowest/50 transition-colors">
            <td className="px-6 py-4 font-bold text-on-surface uppercase tracking-tight">{s.name}</td>
            <td className="px-6 py-4 text-on-surface-variant font-semibold text-sm">{s.email}</td>
            <td className="px-6 py-4">
              {s.program_name
                ? <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{s.program_name}</span>
                : <span className="text-xs text-secondary">—</span>}
            </td>
            <td className="px-6 py-4">
              {s.branch_name
                ? <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{s.branch_name}</span>
                : <span className="text-xs text-secondary">—</span>}
            </td>
            <td className="px-6 py-4 text-right">
              <button
                onClick={() => navigate(`/admin/students/${s.id}`)}
                className="text-primary font-bold uppercase text-[10px] tracking-widest hover:text-primary/70 transition-colors"
              >
                View
              </button>
            </td>
          </tr>
        ))}
        {students.length === 0 && (
          <tr>
            <td colSpan="5" className="px-6 py-12 text-center">
              <span className="material-symbols-outlined text-secondary/40 text-4xl block mb-2">groups</span>
              <p className="text-secondary font-bold tracking-widest uppercase text-xs">No enrolled students yet</p>
              <p className="text-secondary/60 text-xs mt-1">Students appear here once they complete enrollment</p>
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};

export default AdminStudents;
