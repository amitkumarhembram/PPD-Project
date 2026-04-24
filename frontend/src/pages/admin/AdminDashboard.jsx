import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';

// ── Tiny inline SVG sparkline chart ─────────────────────────────────────────
const SparklineChart = ({ data }) => {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-secondary text-[10px] font-bold uppercase tracking-widest">
        No data yet
      </div>
    );
  }

  const counts = data.map(d => d.count);
  const maxVal = Math.max(...counts, 1);
  const W = 700;
  const H = 200;

  // Build SVG path points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.count / maxVal) * H * 0.85;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100, 150].map(y => (
        <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#f5f5f5" strokeWidth="1" />
      ))}
      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
      ))}
    </svg>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-xl text-error font-bold text-sm">
      <span className="material-symbols-outlined">error</span> {error}
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        <p className="text-sm font-bold text-secondary uppercase tracking-widest">Loading dashboard...</p>
      </div>
    </div>
  );

  const breakdown = stats.application_status_breakdown || {};
  const totalForChart = Math.max(stats.total_applications, 1);
  const enrolledPct = ((breakdown.ENROLLED || 0) / totalForChart * 100).toFixed(0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page title ─────────────────────────────────────────────────────── */}
      <div className="space-y-1 text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Dashboard Overview</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} — Admission Cycle
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Total Applications */}
        <Card className="flex items-center justify-between group cursor-default shadow-lg border-outline-variant/10 p-6 md:p-8">
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Total Applications</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">{stats.total_applications}</h2>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-surface-container flex items-center justify-center text-secondary group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-2xl md:text-3xl">description</span>
          </div>
        </Card>

        {/* Pending Verifications — highlighted */}
        <Card className="flex items-center justify-between group cursor-default shadow-lg border-primary-fixed/30 p-6 md:p-8">
          <div>
            <p className="text-[10px] font-bold text-primary-fixed uppercase tracking-widest mb-3">Pending Verifications</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-primary">{stats.pending_verifications}</h2>
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse"></div>
            </div>
            {stats.pending_verifications > 0 && (
              <p className="text-[10px] text-primary font-black mt-1 uppercase tracking-widest">Review required</p>
            )}
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl primary-gradient flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-2xl md:text-3xl">pending_actions</span>
          </div>
        </Card>

        {/* Total Enrolled */}
        <Card className="flex items-center justify-between group cursor-default shadow-lg border-outline-variant/10 p-6 md:p-8">
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Total Enrolled</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">{stats.total_enrolled}</h2>
            <p className="text-[10px] text-secondary mt-1 font-bold uppercase tracking-widest">{enrolledPct}% Capacity</p>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl md:text-3xl">how_to_reg</span>
          </div>
        </Card>
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registrations Over Time — full-width left */}
        <Card className="lg:col-span-2 p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-on-surface uppercase">Registrations Over Time</h3>
              <div className="h-0.5 w-12 bg-primary/30 rounded-full"></div>
            </div>
            <span className="px-4 py-1.5 bg-surface-container-low text-[9px] md:text-[10px] font-black rounded-full text-secondary uppercase tracking-widest">All Time</span>
          </div>
          <div className="relative h-48 md:h-64 w-full">
            <SparklineChart data={stats.registrations_over_time} />
          </div>
          <div className="flex justify-between mt-4 px-1 text-[9px] font-black text-secondary tracking-[0.2em] uppercase">
            {stats.registrations_over_time?.slice(-7).map((d, i) => (
              <span key={i}>{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit' })}</span>
            ))}
          </div>
        </Card>

        {/* Application Pipeline donut */}
        <Card className="p-6 md:p-8 flex flex-col">
          <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-on-surface uppercase mb-8 md:mb-10">Application Pipeline</h3>
          <div className="flex-grow flex items-center justify-center relative py-4">
            <svg className="w-36 h-36 md:w-48 md:h-48 transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
              {totalForChart > 0 && (
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor"
                  strokeDasharray={`${((breakdown.ENROLLED || 0) / totalForChart * 100).toFixed(1)}, 100`}
                  strokeLinecap="round" strokeWidth="3.5" />
              )}
              {totalForChart > 0 && (
                <path className="text-primary-fixed" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor"
                  strokeDasharray={`${((breakdown.VERIFIED || 0) / totalForChart * 100).toFixed(1)}, 100`}
                  strokeDashoffset={`-${((breakdown.ENROLLED || 0) / totalForChart * 100).toFixed(1)}`}
                  strokeLinecap="round" strokeWidth="3.5" />
              )}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-black text-on-surface tracking-tighter">{stats.total_applications}</span>
              <span className="text-[9px] md:text-[10px] text-secondary font-black uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-6 md:mt-8 space-y-4">
            {[
              { label: 'Enrolled',  val: breakdown.ENROLLED  || 0, color: 'bg-primary' },
              { label: 'Verified',  val: breakdown.VERIFIED  || 0, color: 'bg-primary-fixed' },
              { label: 'Submitted', val: breakdown.SUBMITTED || 0, color: 'bg-surface-container-highest' },
              { label: 'Rejected',  val: breakdown.REJECTED  || 0, color: 'bg-error/40' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2 text-secondary">
                  <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div> {label}
                </span>
                <span className="text-on-surface">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Capacity Tracker */}
        <Card className="p-6 md:p-8">
          <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-on-surface uppercase mb-8 md:mb-10">Branch Capacity Tracker</h3>
          <div className="space-y-8 md:space-y-10">
            {(stats.branch_enrollments || []).map((br, idx) => {
              const pct = Math.min((br.enrolled / br.capacity) * 100, 100);
              const isFull = pct >= 100;
              return (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                    <span className="text-on-surface">{br.branch_name}</span>
                    <span className={isFull ? 'text-primary-fixed' : 'text-secondary'}>{br.enrolled} / {br.capacity}{isFull ? ' (FULL)' : ''}</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden border border-outline-variant/10">
                    <div className={`h-full rounded-full transition-all duration-700 ${isFull ? 'primary-gradient' : 'bg-primary'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Needs Attention */}
        <Card className="overflow-hidden flex flex-col p-0">
          <div className="p-6 md:p-8 pb-4">
            <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-on-surface uppercase mb-1">Needs Attention</h3>
            <p className="text-[9px] md:text-[10px] text-secondary font-bold uppercase tracking-widest">Students awaiting verification</p>
          </div>
          <div className="flex-1 overflow-auto">
            {(stats.needs_attention || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <span className="material-symbols-outlined text-4xl text-secondary mb-3">check_circle</span>
                <p className="text-sm font-bold text-secondary uppercase tracking-widest">All caught up!</p>
                <p className="text-[10px] text-secondary mt-1">No pending applications right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {(stats.needs_attention || []).map((student) => {
                  const initials = student.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                  const isFirst = stats.needs_attention.indexOf(student) === 0;
                  return (
                    <div
                      key={student.id}
                      className="px-6 md:px-8 py-4 md:py-5 flex items-center justify-between group hover:bg-surface-container-low/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border shadow-sm ${isFirst ? 'bg-primary-fixed/20 text-primary border-primary-fixed/30' : 'bg-surface-container-highest text-secondary border-outline-variant/30'}`}>
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-on-surface uppercase tracking-tight">{student.name}</span>
                          <span className="text-[9px] text-secondary font-bold uppercase tracking-widest">
                            {new Date(student.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <button
                        className="bg-primary text-white hover:bg-primary/90 px-5 py-2 rounded-lg transition-all duration-300 font-black uppercase tracking-widest text-[10px] shadow-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/admin/students/${student.id}`); }}
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
