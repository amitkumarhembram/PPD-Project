import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/enrollments${filter ? `?status=${filter}` : ''}`);
      setEnrollments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, [filter]);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/admin/enrollments/${id}`, { status });
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update enrollment');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Enrollments</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Approve or reject student enrollment requests
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filter === s ? 'bg-primary text-white border-primary' : 'border-outline-variant/50 text-secondary hover:border-primary hover:text-primary'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/30 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Program / Branch</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-secondary">Loading...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-secondary">No enrollments found.</td></tr>
              ) : (
                enrollments.map(e => (
                  <tr key={e.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">#{e.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface uppercase tracking-tight">{e.student_name}</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{e.student_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface">{e.program}</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{e.branch}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-secondary font-medium">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="primary"
                          className="!px-4 !py-2 !text-[9px]"
                          onClick={() => handleAction(e.id, 'APPROVED')}
                          disabled={e.status === 'APPROVED'}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="!px-4 !py-2 !text-[9px] text-error border-error/50 hover:bg-error/10"
                          onClick={() => handleAction(e.id, 'REJECTED')}
                          disabled={e.status === 'REJECTED'}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminEnrollments;
