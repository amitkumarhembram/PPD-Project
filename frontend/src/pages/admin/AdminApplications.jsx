import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.post(`/admin/verify/${id}`, { status });
      fetchApplications();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Manage Applications</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Review and verify student enrollment requests
        </p>
      </div>

      {error ? (
        <div className="text-error">{error}</div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/30 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Applicant Profile</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading && applications.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-secondary">Loading applications...</td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-secondary">No applications found.</td></tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-surface-container-low/20 transition-colors group">
                      <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">#{app.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-on-surface uppercase tracking-tight">{app.name}</span>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{app.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-on-surface">
                        {app.class12_percentage ? `${app.class12_percentage}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="!px-3 !py-1.5 !text-[9px] flex items-center gap-1"
                            onClick={() => navigate(`/admin/students/${app.id}`)}
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            View
                          </Button>
                          <Button 
                            variant="primary" 
                            className="!px-4 !py-2 !text-[9px]"
                            onClick={() => handleVerify(app.id, 'VERIFIED')}
                            disabled={['VERIFIED', 'ENROLLED'].includes(app.status)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline"
                            className="!px-4 !py-2 !text-[9px] text-error border-error/50 hover:bg-error/10"
                            onClick={() => handleVerify(app.id, 'REJECTED')}
                            disabled={['REJECTED', 'ENROLLED'].includes(app.status)}
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
      )}
    </div>
  );
};

export default AdminApplications;
