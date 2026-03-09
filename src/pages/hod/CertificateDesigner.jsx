import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 🟢 useNavigate imported
import { ArrowLeft, Save, Image as ImageIcon, Layout, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';

// Safe URL generator for files
const getFileUrl = (id) => {
    const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') : '/api';
    return `${base}/files/${id}`;
};

const CertificateDesigner = () => {
  const { examId } = useParams();
  const navigate = useNavigate(); // 🟢 Setup navigation

  const [examName, setExamName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [config, setConfig] = useState({
    enabled: false,
    backgroundImageId: null,
    namePos: { x: 50, y: 40, color: '#000000', size: 32 },
    coursePos: { x: 50, y: 55, color: '#333333', size: 24 },
    datePos: { x: 30, y: 80, color: '#666666', size: 16 },
    scorePos: { x: 70, y: 80, color: '#666666', size: 16 },
  });

  const [activeTab, setActiveTab] = useState('namePos'); 

  useEffect(() => {
    api.get(`/hod/exams/${examId}`) 
      .then(({ data }) => {
          setExamName(data.name);
          if (data.certificateConfig) {
              setConfig(prev => ({
                  ...prev,
                  ...data.certificateConfig,
                  enabled: data.certificateConfig.enabled === true,
              }));
              if (data.certificateConfig.backgroundImageId) {
                  setPreviewUrl(getFileUrl(data.certificateConfig.backgroundImageId));
              }
          }
      })
      .catch(() => toast.error("Failed to load exam details"))
      .finally(() => setLoading(false));
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

  const handleSave = async () => {
    if (config.enabled && !previewUrl) {
        return toast.error("Please upload a background image first.");
    }

    setSaving(true);
    try {
        const formData = new FormData();
        formData.append('config', JSON.stringify(config));
        if (imageFile) {
            formData.append('bgImage', imageFile); 
        }

        await api.put(`/hod/exams/${examId}/certificate`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success("Certificate template saved successfully!");
        navigate('/hod/exams'); // 🟢 REACT ROUTER REDIRECT
    } catch (e) {
        toast.error("Failed to save certificate.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Designer...</div>;

  const tabs = [
    { id: 'namePos', label: 'Student Name', text: 'Soham Doe' },
    { id: 'coursePos', label: 'Exam Name', text: examName },
    { id: 'datePos', label: 'Date', text: new Date().toLocaleDateString() },
    { id: 'scorePos', label: 'Score', text: 'Score: 45/50' }
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      <header className="h-16 bg-[var(--glass-surface)] border-b border-[var(--glass-border)] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hod/exams')} className="p-2 hover:bg-[var(--background)] rounded-full transition-colors">
                <ArrowLeft size={20} className="text-[var(--text)]" />
            </button>
            <div>
                <h1 className="text-lg font-bold text-[var(--text)] leading-tight">Design Certificate</h1>
                <p className="text-xs text-[var(--text-muted)]">For: {examName}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={config.enabled} 
                    onChange={e => setConfig({...config, enabled: e.target.checked})}
                    className="w-4 h-4 accent-[var(--primary)]"
                />
                Enable Custom Certificate
            </label>
            <Button onClick={handleSave} isLoading={saving} icon={Save}>Save Design</Button>
        </div>
      </header>

      <div className={`flex-1 flex overflow-hidden ${!config.enabled && 'opacity-50 pointer-events-none grayscale-[50%]'}`}>
        <div className="flex-[2] bg-[#e5e7eb] p-8 flex items-center justify-center overflow-auto relative custom-scrollbar">
            <div className="relative shadow-2xl bg-white aspect-[1.414] w-full max-w-4xl border border-gray-300 flex items-center justify-center overflow-hidden">
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
                        <div key={tab.id}
                            className={`absolute whitespace-nowrap px-2 py-1 border-2 transition-all ${activeTab === tab.id ? 'border-blue-500 bg-blue-500/10 z-10' : 'border-transparent hover:border-gray-300/50'}`}
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', color: pos.color, fontSize: `${pos.size}px`, fontWeight: 'bold' }}
                            onClick={() => setActiveTab(tab.id)} title="Click to edit">
                            {tab.text}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="w-[400px] bg-[var(--glass-surface)] border-l border-[var(--glass-border)] flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-[var(--glass-border)]">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2"><ImageIcon size={16}/> Background Template</h3>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[var(--primary)]/50 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] font-bold cursor-pointer hover:bg-[var(--primary)]/10 transition-colors">
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageChange} />
                    {previewUrl ? 'Change Template Image' : 'Upload PNG/JPG'}
                </label>
            </div>
            <div className="p-6 flex-1">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2"><Layout size={16}/> Configure Fields</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${activeTab === tab.id ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--text-muted)] border-[var(--glass-border)] hover:border-[var(--primary)]/50'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="space-y-6 bg-[var(--background)] p-5 rounded-2xl border border-[var(--glass-border)]">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-[var(--text)] flex items-center gap-2"><Type size={16}/> Adjust {tabs.find(t=>t.id===activeTab).label}</h4>
                    </div>
                    <div>
                        <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2"><span>X Position (Horizontal)</span><span>{config[activeTab].x}%</span></label>
                        <input type="range" min="0" max="100" value={config[activeTab].x} onChange={(e) => updatePos(activeTab, 'x', Number(e.target.value))} className="w-full accent-[var(--primary)]" />
                    </div>
                    <div>
                        <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2"><span>Y Position (Vertical)</span><span>{config[activeTab].y}%</span></label>
                        <input type="range" min="0" max="100" value={config[activeTab].y} onChange={(e) => updatePos(activeTab, 'y', Number(e.target.value))} className="w-full accent-[var(--primary)]" />
                    </div>
                    <div>
                        <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2"><span>Font Size</span><span>{config[activeTab].size}px</span></label>
                        <input type="range" min="10" max="100" value={config[activeTab].size} onChange={(e) => updatePos(activeTab, 'size', Number(e.target.value))} className="w-full accent-purple-500" />
                    </div>
                    <div>
                        <label className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2"><span>Text Color</span><span className="uppercase">{config[activeTab].color}</span></label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={config[activeTab].color} onChange={(e) => updatePos(activeTab, 'color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none p-0" />
                            <input type="text" value={config[activeTab].color} onChange={(e) => updatePos(activeTab, 'color', e.target.value)} className="flex-1 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm outline-none uppercase font-mono" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDesigner;