import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, FileText, Type } from 'lucide-react';
import InputField from '../../components/form/input/InputField';
import SelectField from '../../components/form/input/SelectField';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/form/FileUpload';
import api from '../../services/api';

// 🟢 NEW: Import your custom notification hook
import { useNotification } from '../../context/NotificationContext';

const CreateExam = ({ config, setConfig, handleGenerate, loading }) => {
  const { showToast } = useNotification(); // Initialize notification context
  const [deptSops, setDeptSops] = useState([]);

  useEffect(() => {
    api.get('/hod/sops')
      .then(({ data }) => setDeptSops(data))
      .catch(err => console.error("Failed to load department SOPs", err));
  }, []);

  // 🟢 FIXED: Allow clearing the input (empty string) without forcing it to 0 immediately
  const handleCountChange = (field, value) => {
    if (value === '') {
      setConfig({ ...config, [field]: '' });
    } else {
      const cleanValue = Math.max(0, parseInt(value) || 0);
      setConfig({ ...config, [field]: cleanValue });
    }
  };

  // 🟢 NEW: Local validation interceptor
  const onLocalSubmit = (e) => {
    e.preventDefault();

    // 1. Validate Exam Name
    if (!config.name || config.name.trim() === '') {
        return showToast("Exam Name is required.", "error");
    }

    // 2. Validate Question Structure (At least 1 question total)
    const singleC = parseInt(config.singleCount) || 0;
    const multiC = parseInt(config.multipleCount) || 0;
    const tfC = parseInt(config.tfCount) || 0;
    const paraC = parseInt(config.paraCount) || 0;
    
    const totalQs = singleC + multiC + tfC + paraC;
    if (totalQs === 0) {
        return showToast("Please specify at least one question to generate.", "error");
    }

    // 3. Validate Source Material (Needs at least one source)
    const hasUploadedFile = config.files && config.files.length > 0;
    const hasExistingFile = config.existingFileId && config.existingFileId.trim() !== '';
    const hasText = config.additionalText && config.additionalText.trim() !== '';

    if (!hasUploadedFile && !hasExistingFile && !hasText) {
        return showToast("Please provide source material (Upload, Select, or Text).", "error");
    }

    // If all validations pass, pass the event up to the parent's handler
    handleGenerate(e);
  };

  return (
    // 🟢 FIXED: Replaced handleGenerate with the local validation wrapper
    <form onSubmit={onLocalSubmit} className="flex flex-col h-full overflow-hidden">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar py-2">
        
        <div className="bg-[var(--background)]/30 p-6 rounded-2xl border border-[var(--sys-glass-border)] flex flex-col gap-8 min-h-min">
          
          {/* 1. Exam Name */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block tracking-wider">
              Exam Details
            </label>
            <InputField 
              placeholder="e.g. Mid-Term React Assessment" 
              value={config.name} 
              onChange={e => setConfig({...config, name: e.target.value})} 
            />
          </div>
          
          {/* 2. Question Structure */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block tracking-wider">
              Question Structure (AI Generation)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputField type="number" label="Multiple Choice" min={0} value={config.multipleCount} onChange={e => handleCountChange('multipleCount', e.target.value)} />
                <InputField type="number" label="True / False" min={0} value={config.tfCount} onChange={e => handleCountChange('tfCount', e.target.value)} />
                <InputField type="number" label="Single Answer" min={0} value={config.singleCount} onChange={e => handleCountChange('singleCount', e.target.value)} />
                <InputField type="number" label="Paragraph" min={0} value={config.paraCount} onChange={e => handleCountChange('paraCount', e.target.value)} />
            </div>
          </div>

          {/* 3. Source Materials */}
          <div className="flex flex-col gap-6">
             <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--sys-glass-border)] pb-2">
               Source Material (Combine Multiple Sources)
             </label>
             
             {/* A. Upload New (Fixed height for drag area) */}
             <div className="space-y-2">
                <label className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Upload size={14}/> Upload New SOP (Optional)
                </label>
                {/* FileUpload handles its own internal scrolling if too many files */}
                <div className="min-h-[120px]"> 
                    <FileUpload onFilesSelected={(files) => setConfig({ ...config, files: files })} />
                </div>
             </div>

             {/* B. Select Existing (Dropdown expands automatically) */}
             <div className="space-y-2">
                <SelectField
                    label="Select Department SOP (Optional)"
                    icon={FileText}
                    options={deptSops.map(sop => ({ value: sop.id, label: sop.name }))}
                    value={deptSops.find(s => s.id === config.existingFileId) ? { value: config.existingFileId, label: deptSops.find(s => s.id === config.existingFileId).name } : null}
                    onChange={(selected) => setConfig({ ...config, existingFileId: selected ? selected.value : '' })}
                    placeholder="-- Select from Library --"
                    isClearable={true}
                />
             </div>

             {/* C. Additional Text */}
             <div className="space-y-2">
                <label className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Type size={14}/> Additional Text / Instructions (Optional)
                </label>
                <textarea 
                    className="w-full bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] h-32 resize-none leading-relaxed"
                    placeholder="Paste specific topics, instructions, or content here..."
                    value={config.additionalText || ""}
                    onChange={(e) => setConfig({ ...config, additionalText: e.target.value })}
                />
             </div>

          </div>

        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-4 mt-2 border-t border-[var(--sys-glass-border)] flex justify-end shrink-0">
        <Button type="submit" size="lg" isLoading={loading} icon={ArrowRight}>
          Generate Exam
        </Button>
      </div>
    </form>
  );
};

export default CreateExam;