import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Enrollment = () => {
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eligibility, setEligibility] = useState(null);
  const [appStatus, setAppStatus] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [appFetching, setAppFetching] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const appRes = await api.get('/application/me');
        setEligibility(appRes.data.highest_qualification || null);
        setAppStatus(appRes.data.status || null);
        
        try {
          const enrollRes = await api.get('/enrollment/me');
          setEnrollment(enrollRes.data);
        } catch(e) {}
        
        const progRes = await api.get('/programs');
        setPrograms(progRes.data);
      } catch (err) {
        setEligibility(null);
      } finally {
        setAppFetching(false);
      }
    };
    init();
  }, []);

  const handleProgramSelect = async (progId) => {
    setSelectedProgram(progId);
    setSelectedBranch(null);
    try {
      const res = await api.get(`/programs/${progId}/branches`);
      setBranches(res.data);
    } catch (err) {
      setError('Failed to fetch branches');
    }
  };

  const handleEnroll = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      await api.post('/enrollment', { branch_id: selectedBranch });
      alert('Enrollment successful');
      window.location.reload(); // Refresh to catch the new state
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to enroll in branch.');
    } finally {
      setLoading(false);
    }
  };

  if (appFetching) {
    return <div className="p-8 text-center text-secondary font-bold uppercase tracking-widest">Loading...</div>;
  }

  let lockReason = null;
  if (!eligibility || eligibility === '10th' || appStatus !== 'VERIFIED') {
    if (!eligibility) {
       lockReason = 'You have not submitted your profile or your qualification was not recorded. Please complete your profile first.';
    } else if (appStatus === 'DRAFT') {
       lockReason = 'Your profile is incomplete or has not been submitted for verification yet. Please submit your profile for admin verification.';
    } else if (appStatus === 'SUBMITTED') {
       lockReason = 'Your profile is currently under review by the administration. You will be able to enroll once it is verified.';
    } else if (appStatus === 'REJECTED') {
       lockReason = 'Your profile was rejected during verification. Please update your details as per the admin remarks.';
    } else if (eligibility === '10th') {
       lockReason = 'Your highest qualification is 10th grade. Enrollment requires at least 12th grade or higher.';
    }
  }

  const filteredPrograms = programs.filter(prog => 
    eligibility === '12th' ? prog.level_id === 1 : true
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1 text-left mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Select Program</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Choose a discipline to start your academic journey
        </p>
      </div>

      {enrollment ? (
        <Card className="p-8 border-green-500/30 bg-green-50">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-green-600 text-4xl mt-1">check_circle</span>
            <div>
              <h3 className="font-extrabold uppercase tracking-widest text-lg text-green-700 mb-2">Enrollment Completed</h3>
              <p className="text-sm text-green-800 font-medium leading-relaxed">
                You have successfully enrolled in <strong>{enrollment.program}</strong> - <strong>{enrollment.branch}</strong>.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-200">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-800">
                  Status: {enrollment.status}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {lockReason && (
            <Card className="p-8 border-error/20 bg-error/5">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-error text-3xl mt-1">block</span>
                <div>
                  <h3 className="font-extrabold uppercase tracking-widest text-base text-error mb-2">Not Eligible for Enrollment</h3>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{lockReason}</p>
                  {['DRAFT', 'REJECTED'].includes(appStatus) && (
                    <a href="/profile" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                      → Go to My Profile
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}

          {error && <div className="p-3 bg-error/10 border border-error/50 rounded-lg text-error text-sm text-center font-medium">{error}</div>}
          {success && <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm text-center font-medium">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrograms.map(prog => (
              <Card key={prog.id} onClick={() => handleProgramSelect(prog.id)} className={`cursor-pointer transition-all hover:border-primary ${selectedProgram === prog.id ? 'ring-2 ring-primary border-primary' : ''}`}>
                 <div className="flex justify-between items-center">
                   <div>
                      <h3 className="font-black uppercase tracking-tight text-on-surface text-lg">{prog.name}</h3>
                      <p className="text-[10px] uppercase font-bold text-secondary mt-1">{prog.level_id === 1 ? 'Undergraduate' : 'Postgraduate'}</p>
                   </div>
                   {selectedProgram === prog.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                 </div>
              </Card>
            ))}
          </div>

          {selectedProgram && branches.length > 0 && (
            <div className="mt-12 space-y-6">
               <h3 className="text-lg font-extrabold tracking-widest text-on-surface uppercase">Select Branch</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {branches.map(br => (
                   <Card key={br.id} onClick={() => setSelectedBranch(br.id)} className={`cursor-pointer transition-all hover:border-primary ${selectedBranch === br.id ? 'ring-2 ring-primary border-primary' : ''}`}>
                     <div className="flex justify-between items-start mb-4">
                       <h4 className="font-black uppercase tracking-tight text-on-surface">{br.name}</h4>
                       {br.available_seats !== undefined && (
                         <span className="px-2 py-1 bg-surface-container-highest rounded text-[9px] font-bold uppercase tracking-widest text-secondary">
                            Available: {br.available_seats}
                         </span>
                       )}
                     </div>
                     {br.capacity !== undefined && (
                       <p className="text-secondary text-xs font-bold uppercase tracking-widest">Capacity: {br.capacity}</p>
                     )}
                     {br.fee_per_semester && (
                       <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-secondary">Fee: ₹{br.fee_per_semester}</span>
                       </div>
                     )}
                   </Card>
                 ))}
               </div>

               <div className="flex justify-end pt-6">
                 {lockReason ? (
                    <Button disabled={true} className="opacity-50 cursor-not-allowed">Profile Verification Required</Button>
                 ) : (
                    <Button onClick={handleEnroll} disabled={!selectedBranch || loading}>{loading ? 'Loading...' : 'Confirm Enrollment'}</Button>
                 )}
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Enrollment;
