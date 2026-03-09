import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🟢 FIX: Added useNavigate
import { Image as ImageIcon, Layout, Type, Save, CheckCircle, ArrowLeft, SkipForward } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';

const getFileUrl = (id) => {
    const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') : '/api';
    return `${base}/files/${id}`;
};

const DesignCertificateStep = ({ examId, examName, setStep }) => {
  const navigate = useNavigate(); // 🟢 FIX: Initialize hook
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [config, setConfig] = useState({
    enabled: true,
    backgroundImageId: null,
    namePos: { x: 50, y: 40, color: '#000000', size: 32 },
    coursePos: { x: 50, y: 55, color: '#333333', size: 24 },
    datePos: { x: 30, y: 80, color: '#666666', size: 16 },
    scorePos: { x: 70, y: 80, color: '#666666', size: 16 },
  });

  const [activeTab, setActiveTab] = useState('namePos'); 

  useEffect(() => {
    if (!examId) return;
    api.get(`/hod/exams/${examId}`) 
      .then(({ data }) => {
          if (data.certificateConfig) {
              setConfig(prev => ({
                  ...prev,
                  ...data.certificateConfig,
                  enabled: data.certificateConfig.enabled !== false,
              }));
              if (data.certificateConfig.backgroundImageId) {
                  setPreviewUrl(getFileUrl(data.certificateConfig.backgroundImageId));
              }
          }
      })
      .catch(err => console.error("Fetch exam config failed", err));
  }, [examId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setConfig({ ...config, enabled: true });
    }
  };

  const updatePos = (field, key, value) => {
    setConfig({ ...config, [field]: { ...config[field], [key]: value } });
  };

  const handleFinish = async (skip = false) => {
    if (!skip && !previewUrl) return toast.error("Upload a template, or click Skip.");
    
    setSaving(true);
    try {
        if (!skip) {
            const formData = new FormData();
            formData.append('config', JSON.stringify(config));
            if (imageFile) formData.append('bgImage', imageFile);

            await api.put(`/hod/exams/${examId}/certificate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Certificate and Exam completely saved!");
        } else {
            toast.success("Exam Published without a custom certificate.");
        }
        navigate('/hod/exams'); // 🟢 FIX: Use react-router navigate instead of location.href
    } catch (e) {
        toast.error("Failed to save certificate.");
    } finally {
        setSaving(false);
    }
  };

  const tabs = [
    { id: 'namePos', label: 'Student Name', text: 'Soham Doe' },
    { id: 'coursePos', label: 'Exam Name', text: examName },
    { id: 'datePos', label: 'Date', text: new Date().toLocaleDateString() },
    { id: 'scorePos', label: 'Score', text: 'Score: 45/50' }
  ];

  return (
    <div className="flex h-full bg-[var(--background)] gap-6 overflow-hidden pb-4">
      <div className="flex-[2] bg-[#e5e7eb] rounded-2xl flex items-center justify-center relative overflow-hidden border border-[var(--sys-glass-border)]">
          <div className="relative shadow-xl bg-white aspect-[1.414] w-full max-w-2xl flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                  <img src={previewUrl} alt="Template" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              ) : (
                  <div className="text-gray-400 flex flex-col items-center gap-2">
                      <ImageIcon size={48} />
                      <p className="font-medium">No Background Uploaded</p>
                  </div>
              )}

              {previewUrl && tabs.map(tab => {
                  const pos = config[tab.id];
                  return (
                      <div key={tab.id} className={`absolute whitespace-nowrap px-2 py-1 border-2 transition-all ${activeTab === tab.id ? 'border-blue-500 bg-blue-500/10 z-10' : 'border-transparent hover:border-gray-300/50'}`}
                          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', color: pos.color, fontSize: `${pos.size}px`, fontWeight: 'bold' }}
                          onClick={() => setActiveTab(tab.id)} title="Click to edit">
                          {tab.text}
                      </div>
                  );
              })}
          </div>
      </div>

      <div className="w-[350px] bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[var(--glass-border)]">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Background Template</h3>
              <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[var(--primary)]/50 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] font-bold cursor-pointer hover:bg-[var(--primary)]/10 transition-colors">
                  <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageChange} />
                  {previewUrl ? 'Change Image' : 'Upload PNG/JPG'}
              </label>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Adjust Fields</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                  {tabs.map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${activeTab === tab.id ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--text-muted)] border-[var(--glass-border)]'}`}>
                          {tab.label}
                      </button>
                  ))}
              </div>
              <div className="space-y-4">
                  <div>
                      <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-1"><span>X Position</span><span>{config[activeTab].x}%</span></label>
                      <input type="range" min="0" max="100" value={config[activeTab].x} onChange={(e) => updatePos(activeTab, 'x', Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                      <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-1"><span>Y Position</span><span>{config[activeTab].y}%</span></label>
                      <input type="range" min="0" max="100" value={config[activeTab].y} onChange={(e) => updatePos(activeTab, 'y', Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                      <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-1"><span>Font Size</span><span>{config[activeTab].size}px</span></label>
                      <input type="range" min="10" max="100" value={config[activeTab].size} onChange={(e) => updatePos(activeTab, 'size', Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                      <input type="color" value={config[activeTab].color} onChange={(e) => updatePos(activeTab, 'color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                      <span className="text-xs font-bold text-[var(--text-muted)]">Text Color</span>
                  </div>
              </div>
          </div>

          <div className="p-5 border-t border-[var(--glass-border)] flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={() => handleFinish(false)} isLoading={saving} icon={CheckCircle}>Save & Publish Exam</Button>
              <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(3)} icon={ArrowLeft}>Back</Button>
                  <Button variant="ghost" className="flex-1 text-[var(--text-muted)]" onClick={() => handleFinish(true)} icon={SkipForward}>Skip</Button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DesignCertificateStep;