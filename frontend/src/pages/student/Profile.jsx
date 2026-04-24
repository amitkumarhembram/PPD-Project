import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';

// ─── Document types required based on highest qualification ─────────────────
const REQUIRED_DOCS = {
  '12th':          ['aadhar_card', '10th_marksheet', '10th_certificate', '12th_marksheet', '12th_certificate'],
  'Diploma':       ['aadhar_card', '10th_marksheet', '10th_certificate', '12th_marksheet', '12th_certificate'],
  'Undergraduate': ['aadhar_card', '10th_marksheet', '10th_certificate', '12th_marksheet', '12th_certificate', 'ug_marksheet', 'ug_certificate'],
  'Postgraduate':  ['aadhar_card', '10th_marksheet', '10th_certificate', '12th_marksheet', '12th_certificate', 'ug_marksheet', 'ug_certificate'],
};

const DOC_LABELS = {
  aadhar_card:      'Aadhaar Card Photocopy',
  '10th_marksheet': '10th Marksheet',
  '10th_certificate':'10th Certificate',
  '12th_marksheet': '12th Marksheet',
  '12th_certificate':'12th Certificate',
  ug_marksheet:     'UG Marksheet',
  ug_certificate:   'UG Degree Certificate',
};

// ─── Mini inline upload widget ───────────────────────────────────────────────
const DocUpload = ({ docType, uploadedDocs, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const uploaded = uploadedDocs[docType];

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('type', docType);
      const res = await api.post('/documents', fd);
      onUploaded(docType, res.data.document);
    } catch (err) {
      alert(`Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${uploaded ? 'border-green-500/30 bg-green-50/50' : 'border-dashed border-outline-variant/50 bg-surface-container-low/30'}`}>
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined text-[20px] ${uploaded ? 'text-green-600' : 'text-secondary'}`}>
          {uploaded ? 'check_circle' : 'upload_file'}
        </span>
        <div>
          <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{DOC_LABELS[docType]}</p>
          {uploaded && <p className="text-[10px] text-green-600 font-bold">Uploaded ✓</p>}
        </div>
      </div>
      <label className="cursor-pointer flex-shrink-0">
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${uploaded ? 'bg-surface-container text-secondary hover:bg-surface-variant' : 'bg-primary text-white hover:bg-primary/90'}`}>
          {uploading ? '...' : uploaded ? 'Replace' : 'Upload'}
        </span>
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
};

// ─── Main Form ───────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // uploadedDocs: { docType: documentObject }
  const [uploadedDocs, setUploadedDocs] = useState({});

  const emptyForm = {
    name: '', email: '',
    dob: '', gender: '', phone: '', aadhar_number: '',
    highest_qualification: '',
    status: 'DRAFT',
    family_details: {
      father_name: '', father_phone: '',
      mother_name: '', mother_phone: '',
      guardian_name: '', guardian_phone: ''
    },
    current_address:   { state: '', district: '', pincode: '', village: '' },
    permanent_address: { state: '', district: '', pincode: '', village: '' },
    academic_details: {
      class10_board: '', class10_percentage: '', class10_passing_year: '', class10_school: '',
      class12_board: '', class12_percentage: '', class12_passing_year: '', class12_school: '',
      ug_university: '', ug_percentage: '', ug_passing_year: '', ug_college: ''
    }
  };

  const [formData, setFormData] = useState(emptyForm);

  // ── Load profile + docs + Cache ─────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, docsRes] = await Promise.all([
          api.get('/application/me/full').catch(() => null),
          api.get('/documents/me').catch(() => ({ data: [] })),
        ]);

        let serverData = null;
        if (appRes?.data) {
          const data = appRes.data;
          serverData = {
            ...emptyForm,
            name: data.name || '',
            email: data.email || '',
            dob: data.dob || '',
            gender: data.gender || '',
            phone: data.phone || '',
            aadhar_number: data.aadhar_number || '',
            profile_photo_url: data.profile_photo_url || '',
            highest_qualification: data.highest_qualification || '',
            status: data.status || 'DRAFT',
            family_details:   data.family_details   || emptyForm.family_details,
            current_address:  data.current_address  || emptyForm.current_address,
            permanent_address: data.permanent_address || emptyForm.permanent_address,
            academic_details: data.academic_details || emptyForm.academic_details,
          };
          setFormData(serverData);
        }

        // Apply Local Cache if status is DRAFT (Safety Net)
        if (!serverData || serverData.status === 'DRAFT') {
           const cached = localStorage.getItem('sres_profile_draft');
           if (cached) {
              try {
                 const parsed = JSON.parse(cached);
                 setFormData(prev => ({ ...prev, ...parsed }));
              } catch (e) {}
           }
        }

        if (docsRes?.data?.length) {
          const map = {};
          docsRes.data.forEach(doc => { map[doc.type] = doc; });
          setUploadedDocs(map);
        }
      } catch (err) {
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  // Save to Cache on every change (Throttle implicitly by React state batching)
  useEffect(() => {
    if (formData && !fetching) {
      const { status, ...rest } = formData;
      if (status === 'DRAFT') {
        localStorage.setItem('sres_profile_draft', JSON.stringify(formData));
      }
    }
  }, [formData, fetching]);

  const handleDocUploaded = (type, doc) => setUploadedDocs(prev => ({ ...prev, [type]: doc }));

  const requiredDocs = REQUIRED_DOCS[formData.highest_qualification] || [];

  const isProfileComplete = () => {
    if (!formData.highest_qualification || !formData.dob || !formData.gender || !formData.phone || !formData.aadhar_number) return false;
    if (String(formData.phone).trim().length < 10 || String(formData.aadhar_number).trim().length < 12) return false;
    if (!formData.family_details.father_name?.trim() || !formData.family_details.mother_name?.trim()) return false;
    if (!formData.current_address.state?.trim() || !formData.current_address.district?.trim() || !formData.current_address.pincode?.trim()) return false;
    if (!formData.academic_details.class10_board?.trim() || !formData.academic_details.class10_percentage || !formData.academic_details.class10_passing_year) return false;
    if (!formData.academic_details.class12_board?.trim() || !formData.academic_details.class12_percentage || !formData.academic_details.class12_passing_year) return false;
    const missingDocs = requiredDocs.filter(t => !uploadedDocs[t]);
    if (missingDocs.length > 0) return false;
    return true;
  };

  const handleSubmitForVerification = async () => {
    if (!isProfileComplete()) {
      alert("Please complete all required fields and upload all required documents before submitting for verification.");
      return;
    }
    setLoading(true);
    try {
      await handleSaveProfile(false); // save first
      await api.post('/application/submit');
      alert('Profile submitted for admin verification successfully!');
      setFormData(p => ({ ...p, status: 'SUBMITTED' }));
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (showAlert = true) => {
    setLoading(true);
    try {
      // Sanitize: convert all empty strings to null so the DB doesn't
      // throw type-mismatch errors (e.g. date: "")
      const orNull = (v) => (v === '' || v === undefined ? null : v);

      const payload = {
        name:                   orNull(formData.name),
        email:                  orNull(formData.email),
        dob:                    orNull(formData.dob),
        gender:                 orNull(formData.gender),
        phone:                  formData.phone   ? String(formData.phone)   : null,
        aadhar_number:          formData.aadhar_number ? String(formData.aadhar_number) : null,
        profile_photo_url:      orNull(formData.profile_photo_url),
        highest_qualification:  orNull(formData.highest_qualification),
        family_details: formData.family_details,
        addresses: [
          { type: 'current',   ...formData.current_address },
          { type: 'permanent', ...formData.permanent_address }
        ],
        academic_details: {
          class10_board:        orNull(formData.academic_details.class10_board),
          class10_percentage:   formData.academic_details.class10_percentage   ? Number(formData.academic_details.class10_percentage)   : null,
          class10_passing_year: formData.academic_details.class10_passing_year ? Number(formData.academic_details.class10_passing_year) : null,
          class10_school:       orNull(formData.academic_details.class10_school),
          class12_board:        orNull(formData.academic_details.class12_board),
          class12_percentage:   formData.academic_details.class12_percentage   ? Number(formData.academic_details.class12_percentage)   : null,
          class12_passing_year: formData.academic_details.class12_passing_year ? Number(formData.academic_details.class12_passing_year) : null,
          class12_school:       orNull(formData.academic_details.class12_school),
          ug_university:        orNull(formData.academic_details.ug_university),
          ug_percentage:        formData.academic_details.ug_percentage        ? Number(formData.academic_details.ug_percentage)        : null,
          ug_passing_year:      formData.academic_details.ug_passing_year      ? Number(formData.academic_details.ug_passing_year)      : null,
          ug_college:           orNull(formData.academic_details.ug_college),
        }
      };
      await api.put('/application/me', payload);
      localStorage.removeItem('sres_profile_draft');
      if (showAlert) {
         alert('Profile saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Saving failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-sm font-bold text-secondary uppercase tracking-widest">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12">
      <div className="space-y-1 text-left hidden md:block mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">My Profile</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Manage your personal and academic details
        </p>
      </div>

      <Card className="p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <form onSubmit={e => e.preventDefault()} className="space-y-12">
          
          {/* SECTION: PERSONAL */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 text-primary font-black uppercase tracking-widest border-b border-primary/20 pb-3">
              <span className="material-symbols-outlined">person</span> Personal Details
            </h3>
            <div className="flex items-center gap-6 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
              <Avatar url={formData.profile_photo_url} name="" size="xl" shape="circle" />
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface mb-2">Profile Photo</p>
                <label className="cursor-pointer flex items-center gap-3 px-4 py-3 border-2 border-dashed border-outline-variant rounded-xl hover:bg-background transition-colors group w-fit">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">cloud_upload</span>
                  <span className="text-sm font-bold text-on-surface uppercase">
                    {formData.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    try {
                      const fd = new FormData();
                      fd.append('photo', f);
                      const res = await api.post('/application/photo', fd);
                      setFormData(p => ({ ...p, profile_photo_url: res.data.profile_photo_url }));
                    } catch (err) {
                      alert('Photo upload failed: ' + (err.response?.data?.error || err.message));
                    }
                  }} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name & Email */}
              <Input type="text" label="Full Name" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
              <Input type="email" label="Email Address" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />

              <div className="md:col-span-2">
                <Select required label="Highest Qualification" options={['12th', 'Diploma', 'Undergraduate', 'Postgraduate']}
                  value={formData.highest_qualification}
                  onChange={e => setFormData(p => ({ ...p, highest_qualification: e.target.value }))} />
              </div>
              <Input required type="date" label="Date of Birth" value={formData.dob} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} />
              <Select required label="Gender" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))} />
              <Input required type="tel" label="Phone Number" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
              <Input required type="text" label="Aadhaar Number (12 digits)" value={formData.aadhar_number} onChange={e => setFormData(p => ({ ...p, aadhar_number: e.target.value }))} />
            </div>

            {formData.highest_qualification && (
              <div className="space-y-2 mt-4 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/30">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface mb-2">Aadhaar Card Photocopy</p>
                <DocUpload docType="aadhar_card" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} />
              </div>
            )}
          </section>

          {/* SECTION: FAMILY */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 text-primary font-black uppercase tracking-widest border-b border-primary/20 pb-3">
              <span className="material-symbols-outlined">family_restroom</span> Family Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input required type="text" label="Father Name"  value={formData.family_details.father_name}  onChange={e => setFormData(p => ({ ...p, family_details: { ...p.family_details, father_name: e.target.value } }))} />
              <Input type="tel"  label="Father Phone" value={formData.family_details.father_phone} onChange={e => setFormData(p => ({ ...p, family_details: { ...p.family_details, father_phone: e.target.value } }))} />
              <Input required type="text" label="Mother Name"  value={formData.family_details.mother_name}  onChange={e => setFormData(p => ({ ...p, family_details: { ...p.family_details, mother_name: e.target.value } }))} />
              <Input type="tel"  label="Mother Phone" value={formData.family_details.mother_phone} onChange={e => setFormData(p => ({ ...p, family_details: { ...p.family_details, mother_phone: e.target.value } }))} />
            </div>
          </section>

          {/* SECTION: ADDRESS */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 text-primary font-black uppercase tracking-widest border-b border-primary/20 pb-3">
              <span className="material-symbols-outlined">home</span> Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-4">
                <h4 className="text-secondary font-bold text-xs uppercase tracking-widest mb-4 border-b border-outline-variant/30 pb-2">Current Address</h4>
                <Input required type="text" label="State"    value={formData.current_address.state}    onChange={e => setFormData(p => ({ ...p, current_address: { ...p.current_address, state: e.target.value } }))} />
                <Input required type="text" label="District" value={formData.current_address.district} onChange={e => setFormData(p => ({ ...p, current_address: { ...p.current_address, district: e.target.value } }))} />
                <Input required type="text" label="Pincode"  value={formData.current_address.pincode}  onChange={e => setFormData(p => ({ ...p, current_address: { ...p.current_address, pincode: e.target.value } }))} />
                <Input type="text" label="City / Town / Village"  value={formData.current_address.village}  onChange={e => setFormData(p => ({ ...p, current_address: { ...p.current_address, village: e.target.value } }))} />
              </div>
              <div className="space-y-4">
                <h4 className="text-secondary font-bold text-xs uppercase tracking-widest mb-4 border-b border-outline-variant/30 pb-2">Permanent Address</h4>
                <Input type="text" label="State"    value={formData.permanent_address.state}    onChange={e => setFormData(p => ({ ...p, permanent_address: { ...p.permanent_address, state: e.target.value } }))} />
                <Input type="text" label="District" value={formData.permanent_address.district} onChange={e => setFormData(p => ({ ...p, permanent_address: { ...p.permanent_address, district: e.target.value } }))} />
                <Input type="text" label="Pincode"  value={formData.permanent_address.pincode}  onChange={e => setFormData(p => ({ ...p, permanent_address: { ...p.permanent_address, pincode: e.target.value } }))} />
                <Input type="text" label="City / Town / Village"  value={formData.permanent_address.village}  onChange={e => setFormData(p => ({ ...p, permanent_address: { ...p.permanent_address, village: e.target.value } }))} />
              </div>
            </div>
          </section>

          {/* SECTION: ACADEMIC */}
          <section className="space-y-6">
            <h3 className="flex items-center gap-2 text-primary font-black uppercase tracking-widest border-b border-primary/20 pb-3">
              <span className="material-symbols-outlined">school</span> Academic Records
            </h3>

            {/* Class 10 */}
            <div className="space-y-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
              <h4 className="text-on-surface font-black text-sm uppercase tracking-widest border-b border-outline-variant/30 pb-2">Class 10</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input required type="text"   label="Board"        value={formData.academic_details.class10_board}        onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class10_board: e.target.value } }))} />
                <Input required type="number" label="Percentage"   value={formData.academic_details.class10_percentage}   onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class10_percentage: e.target.value } }))} />
                <Input required type="number" label="Passing Year" value={formData.academic_details.class10_passing_year} onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class10_passing_year: e.target.value } }))} />
                <Input type="text"   label="School"       value={formData.academic_details.class10_school}       onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class10_school: e.target.value } }))} />
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-1"><DocUpload docType="10th_marksheet" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} /></div>
                <div className="flex-1"><DocUpload docType="10th_certificate" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} /></div>
              </div>
            </div>

            {/* Class 12 */}
            <div className="space-y-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
              <h4 className="text-on-surface font-black text-sm uppercase tracking-widest border-b border-outline-variant/30 pb-2">Class 12</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input required type="text"   label="Board"        value={formData.academic_details.class12_board}        onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class12_board: e.target.value } }))} />
                <Input required type="number" label="Percentage"   value={formData.academic_details.class12_percentage}   onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class12_percentage: e.target.value } }))} />
                <Input required type="number" label="Passing Year" value={formData.academic_details.class12_passing_year} onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class12_passing_year: e.target.value } }))} />
                <Input type="text"   label="School"       value={formData.academic_details.class12_school}       onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, class12_school: e.target.value } }))} />
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-1"><DocUpload docType="12th_marksheet" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} /></div>
                <div className="flex-1"><DocUpload docType="12th_certificate" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} /></div>
              </div>
            </div>

            {/* UG Conditional */}
            {(formData.highest_qualification === 'Undergraduate' || formData.highest_qualification === 'Postgraduate') && (
              <div className="space-y-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
                <h4 className="text-on-surface font-black text-sm uppercase tracking-widest border-b border-outline-variant/30 pb-2">Undergraduate Degree</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input type="text"   label="University"   value={formData.academic_details.ug_university}   onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, ug_university: e.target.value } }))} />
                  <Input type="number" label="Percentage"   value={formData.academic_details.ug_percentage}   onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, ug_percentage: e.target.value } }))} />
                  <Input type="number" label="Passing Year" value={formData.academic_details.ug_passing_year} onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, ug_passing_year: e.target.value } }))} />
                  <Input type="text"   label="College"      value={formData.academic_details.ug_college}      onChange={e => setFormData(p => ({ ...p, academic_details: { ...p.academic_details, ug_college: e.target.value } }))} />
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="flex-1"><DocUpload docType="ug_marksheet" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} /></div>
                  <div className="flex-1"><DocUpload docType="ug_certificate" uploadedDocs={uploadedDocs} onUploaded={handleDocUploaded} /></div>
                </div>
              </div>
            )}
          </section>

          {/* FOOTER ACTIONS */}
          <div className="pt-8 mt-12 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30 p-4 rounded-xl">
            {formData.status === 'VERIFIED' ? (
              <div className="flex items-center gap-2 text-green-600 font-bold uppercase text-xs tracking-widest">
                <span className="material-symbols-outlined">verified</span> Verified by Admin
              </div>
            ) : formData.status === 'SUBMITTED' ? (
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                <span className="material-symbols-outlined">hourglass_empty</span> Pending Verification
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitForVerification}
                disabled={loading || !isProfileComplete()}
                title={!isProfileComplete() ? "Complete profile to submit" : ""}
                className="px-6 py-3 text-sm flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            )}

            <Button
              type="button"
              onClick={() => handleSaveProfile(true)}
              disabled={loading}
              className="px-8 py-3 text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
