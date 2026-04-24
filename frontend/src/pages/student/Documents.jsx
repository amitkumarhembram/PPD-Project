import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

const DOC_LABELS = {
  '10th_marksheet':   '10th Marksheet',
  '10th_certificate': '10th Certificate',
  '12th_marksheet':   '12th Marksheet',
  '12th_certificate': '12th Certificate',
  'ug_marksheet':     'UG Marksheet',
  'ug_certificate':   'UG Degree Certificate',
};

const Documents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null); // { url, type }

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents/me');
      setUploadedDocs(res.data);
    } catch (err) {
      // silent
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docType) {
      alert('Please select a document type and a file.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', docType);
      formData.append('file', file);
      await api.post('/documents', formData);
      setFile(null);
      setDocType('');
      // Reset file input
      const fileInput = document.getElementById('doc-file-input');
      if (fileInput) fileInput.value = '';
      await fetchDocs(); // refresh list
      alert('Document uploaded successfully');
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const docOptions = [
    { value: '10th_marksheet',   label: '10th Marksheet' },
    { value: '10th_certificate', label: '10th Certificate' },
    { value: '12th_marksheet',   label: '12th Marksheet' },
    { value: '12th_certificate', label: '12th Certificate' },
    { value: 'ug_marksheet',     label: 'UG Marksheet' },
    { value: 'ug_certificate',   label: 'UG Degree Certificate' },
  ];

  const uploadedTypes = uploadedDocs.map(d => d.type);
  const allTypes = docOptions.map(d => d.value);
  const remaining = allTypes.filter(t => !uploadedTypes.includes(t));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 text-left mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">Upload Documents</h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          Please upload clear, legible copies of your original documents
        </p>
      </div>

      {/* Uploaded docs status panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase tracking-widest text-sm text-on-surface">Uploaded Documents</h3>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${uploadedDocs.length === allTypes.length ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
            {uploadedDocs.length} / {allTypes.length}
          </span>
        </div>

        {docsLoading ? (
          <p className="text-xs text-secondary font-bold uppercase tracking-widest">Loading...</p>
        ) : uploadedDocs.length === 0 ? (
          <p className="text-xs text-secondary font-bold uppercase tracking-widest">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {uploadedDocs.map(doc => {
              const isImage = /\.(jpg|jpeg|png)$/i.test(doc.file_url);
              const fullUrl = doc.file_url; // relative path, proxied by Vite
              return (
                <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {isImage ? 'image' : 'picture_as_pdf'}
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface">{DOC_LABELS[doc.type] || doc.type}</p>
                      <p className="text-[10px] text-secondary font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
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

        {!docsLoading && remaining.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Still needed:</p>
            <div className="flex flex-wrap gap-2">
              {remaining.map(t => (
                <span key={t} className="px-2 py-1 bg-error/10 text-error text-[9px] font-bold uppercase tracking-widest rounded-full">{DOC_LABELS[t]}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Upload form */}
      <Card>
        <form onSubmit={handleUpload} className="space-y-8">
          <Select
            label="Document Type"
            required
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            options={docOptions}
          />

          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-widest">Select File</label>
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:bg-surface-container-low/50 transition-colors cursor-pointer relative group">
              <input
                id="doc-file-input"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.jpeg,.jpg,.png"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>
                <p className="text-sm font-bold text-on-surface uppercase">{file ? file.name : 'Click to select or drag and drop'}</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </Card>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={() => navigate('/enroll')}>Proceed to Enrollment</Button>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
              <p className="font-black uppercase tracking-widest text-sm text-on-surface">{previewDoc.label}</p>
              <button onClick={() => setPreviewDoc(null)} className="text-secondary hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-surface-container-low">
              {previewDoc.type === 'image' ? (
                <img src={previewDoc.url} alt={previewDoc.label} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <iframe src={previewDoc.url} title={previewDoc.label} className="w-full h-[70vh] rounded-lg border-0" />
              )}
            </div>
            <div className="px-6 py-3 border-t border-outline-variant/20 flex justify-end gap-3">
              <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Open in new tab</a>
              <button onClick={() => setPreviewDoc(null)} className="text-[10px] font-black uppercase tracking-widest text-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
