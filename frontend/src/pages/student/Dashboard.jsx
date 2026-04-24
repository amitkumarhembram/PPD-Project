import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';

const Dashboard = () => {
  const [appStatus, setAppStatus] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [subjects, setSubjects] = useState([]);
  
  const token = localStorage.getItem("sres_token");
  let user = {};
  if (token && token !== 'undefined') {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (err) {}
  }

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const appRes = await api.get('/application/me');
        setAppStatus(appRes.data.status);
        
        try {
          const enrollRes = await api.get('/enrollment/me');
          if (enrollRes.data) {
              setEnrollment(enrollRes.data);
              
              if (enrollRes.data.status === 'APPROVED' || enrollRes.data.status === 'PENDING') {
                  const subRes = await api.get('/student/subjects');
                  setSubjects(subRes.data);
              }
          } else {
              setEnrollment({ status: 'NONE' });
          }
        } catch {
          setEnrollment({ status: 'NONE' });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 text-left mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Welcome Back</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Manage your admission and academic progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-4 space-y-6">
          <Card>
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Profile</span>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Name</p>
                <p className="text-lg font-bold text-on-surface uppercase tracking-tight">{user.name}</p>
              </div>
              <div className="pt-4 border-t border-outline-variant/30">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Email</p>
                <p className="text-base font-semibold text-on-surface-variant break-all">{user.email}</p>
              </div>
              {enrollment?.status === 'APPROVED' && (
                <div className="pt-4 border-t border-outline-variant/30">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Current Academic Profile</p>
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight">{enrollment.program} - {enrollment.branch}</p>
                  <span className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] rounded">Semester {enrollment.current_semester}</span>
                </div>
              )}
            </div>
          </Card>
          <div className="primary-gradient p-8 rounded-xl text-white shadow-xl">
            <p className="text-lg font-medium leading-relaxed italic opacity-95">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
          </div>
        </section>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xs font-bold tracking-widest text-secondary uppercase mb-4">Application Status</h2>
              <div className="flex items-center gap-3">
                {appStatus ? (
                  <StatusBadge status={appStatus} />
                ) : (
                  <span className="text-3xl font-black tracking-tighter text-secondary/40 uppercase animate-pulse">Loading</span>
                )}
              </div>
            </Card>
            <Card>
              <h2 className="text-xs font-bold tracking-widest text-secondary uppercase mb-4">Enrollment Status</h2>
              <div className="flex items-center gap-3">
                {enrollment ? (
                  <StatusBadge status={enrollment.status} />
                ) : (
                  <span className="text-3xl font-black tracking-tighter text-secondary/40 uppercase animate-pulse">Loading</span>
                )}
              </div>
            </Card>
          </div>

          {enrollment && (enrollment.status === 'APPROVED' || enrollment.status === 'PENDING') ? (
              <section className="animate-in fade-in zoom-in-95 duration-300">
                  <Card>
                      <h2 className="text-xs font-bold tracking-widest text-secondary uppercase mb-4">My Subjects (Semester {enrollment.current_semester})</h2>
                      <Table headers={['Code', 'Subject Name', 'Credits']}>
                          {subjects.map(s => (
                              <tr key={s.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                  <td className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">{s.code}</td>
                                  <td className="px-6 py-4 font-black text-on-surface uppercase tracking-tight">{s.name}</td>
                                  <td className="px-6 py-4 font-bold text-on-surface">{s.credits}</td>
                              </tr>
                          ))}
                          {subjects.length === 0 && (
                              <tr><td colSpan="3" className="px-6 py-8 text-center text-secondary text-xs uppercase tracking-widest font-bold">No subjects allocated for this semester yet.</td></tr>
                          )}
                      </Table>
                  </Card>
              </section>
          ) : (
              <section className="bg-surface-container-low/50 p-8 rounded-xl ghost-border">
                 <h2 className="text-xs font-bold tracking-[0.2em] text-on-surface uppercase mb-8 text-center md:text-left">Quick Actions</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <Link to="/profile" className="flex flex-col items-center sm:items-start p-6 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                     <div className="w-12 h-12 rounded-lg primary-gradient flex items-center justify-center text-white shadow-md mb-4 group-hover:-translate-y-1 transition-transform">
                       <span className="material-symbols-outlined">person</span>
                     </div>
                     <span className="text-xs font-black text-on-surface uppercase tracking-widest text-center sm:text-left">Update Profile</span>
                   </Link>
                   <Link to="/enroll" className="flex flex-col items-center sm:items-start p-6 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                     <div className="w-12 h-12 rounded-lg primary-gradient flex items-center justify-center text-white shadow-md mb-4 group-hover:-translate-y-1 transition-transform">
                       <span className="material-symbols-outlined">school</span>
                     </div>
                     <span className="text-xs font-black text-on-surface uppercase tracking-widest text-center sm:text-left">Select Program</span>
                   </Link>
                 </div>
              </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
