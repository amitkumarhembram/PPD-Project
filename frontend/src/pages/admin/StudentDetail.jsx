import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';

const DOC_LABELS = {
  '10th_marksheet':   '10th Marksheet',
  '10th_certificate': '10th Certificate',
  '12th_marksheet':   '12th Marksheet',
  '12th_certificate': '12th Certificate',
  'ug_marksheet':     'UG Marksheet',
  'ug_certificate':   'UG Degree Certificate',
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-on-surface">{value || '—'}</p>
  </div>
);

const Section = ({ icon, title, children }) => (
  <div className="space-y-4">
    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary border-b border-outline-variant/20 pb-2">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchStudent = () => {
    api.get(`/admin/students/${id}`)
       .then(res => setStudent(res.data))
       .catch(err => setError(err.response?.data?.error || err.message));
  };

  useEffect(() => { fetchStudent(); }, [id]);

  const handleVerify = async (status) => {
    setVerifying(true);
    try {
      await api.post(`/admin/verify/${id}`, { status });
      fetchStudent();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setVerifying(false);
    }
  };

  if (error) return (
    <div className="p-8 text-center">
      <span className="material-symbols-outlined text-error text-4xl">error</span>
      <p className="text-error font-bold mt-2">{error}</p>
    </div>
  );

  if (!student) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        <p className="text-sm font-bold text-secondary uppercase tracking-widest">Loading student details...</p>
      </div>
    </div>
  );

  const ad = student.academic_details;
  const fd = student.family_details;
  const currentAddr = (student.address && student.address.type === 'current') ? student.address : null;
  // address might be the first one; let's handle both cases
  const addresses = student.addresses || (student.address ? [student.address] : []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="space-y-1 text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Student Profile</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Verification and academic record analysis
        </p>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <Avatar
            url={student.profile_photo_url}
            name={student.name}
            size="xl"
            shape="circle"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight truncate">{student.name}</h2>
            <p className="text-secondary text-sm mt-0.5">{student.email}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <StatusBadge status={student.status} />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Application ID: #{student.id}</span>
              {student.highest_qualification && (
                <span className="px-2 py-0.5 bg-surface-container-low text-[10px] font-bold text-secondary uppercase tracking-widest rounded-full">
                  {student.highest_qualification}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Verify / Reject Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-on-surface">Application Decision</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="!text-error !border-error/50 hover:!bg-error/10 flex items-center gap-2"
              onClick={() => handleVerify('REJECTED')}
              disabled={verifying || ['REJECTED', 'ENROLLED'].includes(student.status)}
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Reject
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => handleVerify('VERIFIED')}
              disabled={verifying || ['VERIFIED', 'ENROLLED'].includes(student.status)}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {verifying ? 'Updating...' : 'Verify Application'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Personal Details */}
      <Card className="p-6">
        <Section icon="person" title="Personal Details">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            <Field label="Gender" value={student.gender} />
            <Field label="Phone" value={student.phone} />
            <Field label="Highest Qualification" value={student.highest_qualification} />
            <Field label="Status" value={student.status} />
            <Field label="Registered On" value={student.created_at ? new Date(student.created_at).toLocaleDateString('en-IN') : null} />
          </div>
        </Section>
      </Card>

      {/* Identity */}
      <Card className="p-6">
        <Section icon="badge" title="Identity Verification">
          <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-secondary text-2xl">credit_card</span>
            <div>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Aadhaar Number</p>
              <p className="text-base font-black text-on-surface tracking-[0.2em] mt-1">
                {student.aadhar_number
                  ? `XXXX-XXXX-${String(student.aadhar_number).slice(-4)}`
                  : 'Not provided'}
              </p>
            </div>
          </div>
        </Section>
      </Card>

      {/* Family Details */}
      {fd && (
        <Card className="p-6">
          <Section icon="family_restroom" title="Family Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[['Father', fd.father_name, fd.father_phone], ['Mother', fd.mother_name, fd.mother_phone], ['Guardian', fd.guardian_name, fd.guardian_phone]].map(([label, name, phone]) => (
                <div key={label} className="p-4 bg-surface-container-low rounded-xl">
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-2">{label}</p>
                  <p className="text-sm font-bold text-on-surface">{name || '—'}</p>
                  {phone && <p className="text-xs text-secondary mt-1">{phone}</p>}
                </div>
              ))}
            </div>
          </Section>
        </Card>
      )}

      {/* Address */}
      {student.address && (
        <Card className="p-6">
          <Section icon="location_on" title="Address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-2">Address</p>
                <p className="text-sm font-bold text-on-surface">{[student.address.village, student.address.district, student.address.state].filter(Boolean).join(', ') || '—'}</p>
                {student.address.pincode && <p className="text-xs text-secondary mt-1">PIN: {student.address.pincode}</p>}
              </div>
            </div>
          </Section>
        </Card>
      )}

      {/* Academic Records */}
      {ad && (
        <Card className="p-6">
          <Section icon="school" title="Academic Records">
            <div className="space-y-3">
              {[
                ['Class 10', ad.class10_board, ad.class10_percentage, ad.class10_school, ad.class10_passing_year],
                ['Class 12', ad.class12_board, ad.class12_percentage, ad.class12_school, ad.class12_passing_year],
                ...(ad.ug_university ? [['Undergraduate', ad.ug_university, ad.ug_percentage, ad.ug_college, ad.ug_passing_year]] : [])
              ].map(([label, board, pct, school, year]) => (
                <div key={label} className="flex items-start gap-4 pl-4 border-l-2 border-primary/30 py-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-on-surface mt-0.5">{board || '—'}{pct ? ` — ${pct}%` : ''}</p>
                    {school && <p className="text-xs text-secondary mt-0.5">{school}{year ? `, ${year}` : ''}</p>}
                  </div>
                  {pct && (
                    <div className="text-right">
                      <span className="text-lg font-black text-primary">{Number(pct).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </Card>
      )}

      {/* Documents */}
      <Card className="p-6">
        <Section icon="folder_open" title={`Uploaded Documents (${student.documents?.length || 0})`}>
          {(!student.documents || student.documents.length === 0) ? (
            <p className="text-sm text-secondary font-medium">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {student.documents.map(doc => {
                const isImage = /\.(jpg|jpeg|png)$/i.test(doc.file_url);
                const fullUrl = doc.file_url; // relative path, proxied by Vite
                return (
                  <div key={doc.id} className="flex items-center justify-between py-2.5 px-4 bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        {isImage ? 'image' : 'picture_as_pdf'}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface">{DOC_LABELS[doc.type] || doc.type}</p>
                        <p className="text-[10px] text-secondary">{new Date(doc.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewDoc({ url: fullUrl, type: isImage ? 'image' : 'pdf', label: DOC_LABELS[doc.type] || doc.type })}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                      >
                        Preview
                      </button>
                      <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </Card>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <p className="font-black uppercase tracking-widest text-sm text-gray-900">{previewDoc.label}</p>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50">
              {previewDoc.type === 'image'
                ? <img src={previewDoc.url} alt={previewDoc.label} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                : <iframe src={previewDoc.url} title={previewDoc.label} className="w-full h-[70vh] rounded-lg border-0" />
              }
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-4">
              <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Open in new tab</a>
              <button onClick={() => setPreviewDoc(null)} className="text-[10px] font-black uppercase tracking-widest text-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
