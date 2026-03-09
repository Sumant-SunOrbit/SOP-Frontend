import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, Download, UserPlus, Trash2, Plus } from 'lucide-react';
import api from '../../services/api';
// 🟢 IMPORT CUSTOM NOTIFICATION HOOK
import { useNotification } from '../../context/NotificationContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit

const BulkUserUpload = () => {
  const { showToast } = useNotification(); // Initialize hook

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manual'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Manual Form State
  const [manualUsers, setManualUsers] = useState([{ name: '', email: '', phone: '' }]);

  // ==========================================
  // UPLOAD VALIDATION
  // ==========================================
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const isValidType = validExtensions.some(ext => selected.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
        showToast("Please select a valid Excel (.xlsx, .xls) or CSV file.", "error");
        e.target.value = null;
        return;
    }

    if (selected.size > MAX_FILE_SIZE) {
        showToast("File is too large. Maximum allowed size is 5MB.", "error");
        e.target.value = null;
        return;
    }

    setFile(selected);
    setResult(null); 
  };

  const handleUpload = async () => {
      if (!file) return showToast("Please select a file first.", "error");
      
      setLoading(true);
      const formData = new FormData();
      formData.append('excelFile', file);

      try {
          const { data } = await api.post('/hod/users/bulk-upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          handleSuccessResponse(data);
          setFile(null); 
      } catch (error) {
          handleErrorResponse(error);
      } finally {
          setLoading(false);
      }
  };

  // ==========================================
  // MANUAL FORM VALIDATION
  // ==========================================
  const handleManualSubmit = async () => {
      const validUsers = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10,15}$/; 
      
      const formEmails = new Set(); 

      for (let i = 0; i < manualUsers.length; i++) {
          const u = manualUsers[i];
          const hasName = u.name.trim() !== '';
          const hasEmail = u.email.trim() !== '';
          const hasPhone = u.phone.trim() !== '';

          // Skip completely empty rows
          if (!hasName && !hasEmail && !hasPhone) continue;

          // Name Validation
          if (!hasName) return showToast(`Row ${i + 1}: Name is required.`, "error");
          if (u.name.trim().length < 2) return showToast(`Row ${i + 1}: Name must be at least 2 characters.`, "error");

          // Email Validation
          if (!hasEmail) return showToast(`Row ${i + 1}: Email is required.`, "error");
          const cleanEmail = u.email.trim().toLowerCase();
          if (!emailRegex.test(cleanEmail)) return showToast(`Row ${i + 1}: Invalid email format.`, "error");
          
          if (formEmails.has(cleanEmail)) {
              return showToast(`Row ${i + 1}: Duplicate email (${cleanEmail}) found in your list.`, "error");
          }
          formEmails.add(cleanEmail);
          
          // Phone Validation (Optional, but strictly formatted if provided)
          let finalPhone = "";
          if (hasPhone) {
              const cleanPhone = u.phone.replace(/[\s\-+()]/g, ''); 
              if (!phoneRegex.test(cleanPhone)) {
                  return showToast(`Row ${i + 1}: Phone number must be between 10 and 15 digits.`, "error");
              }
              finalPhone = cleanPhone;
          }

          validUsers.push({
              name: u.name.trim(),
              email: cleanEmail,
              phone: finalPhone
          });
      }
      
      if (validUsers.length === 0) {
          return showToast("Please provide at least one valid User with a Name and Email.", "error");
      }

      setLoading(true);
      try {
          const { data } = await api.post('/hod/users/bulk-upload', { users: validUsers });
          handleSuccessResponse(data);
          setManualUsers([{ name: '', email: '', phone: '' }]); 
      } catch (error) {
          handleErrorResponse(error);
      } finally {
          setLoading(false);
      }
  };

  const handleSuccessResponse = (data) => {
      setResult({
          success: true,
          message: data.message,
          total: data.totalFound,
          inserted: data.inserted,
          skipped: data.skipped
      });
      if (data.skipped > 0) {
          showToast(`Added ${data.inserted} users. Skipped ${data.skipped} duplicates.`, "success");
      } else {
          showToast("All users successfully imported!", "success");
      }
  };

  const handleErrorResponse = (error) => {
      const errorMsg = error.response?.data?.message || "Import failed.";
      showToast(errorMsg, "error");
      setResult({ success: false, message: errorMsg });
  };

  // ==========================================
  // ROW MANAGEMENT & TEMPLATE
  // ==========================================
  const addManualRow = () => setManualUsers([...manualUsers, { name: '', email: '', phone: '' }]);
  
  const removeManualRow = (index) => {
      if (manualUsers.length > 1) {
          setManualUsers(manualUsers.filter((_, i) => i !== index));
      } else {
          setManualUsers([{ name: '', email: '', phone: '' }]); 
      }
  };

  const updateManualUser = (index, field, value) => {
      const updated = [...manualUsers];
      updated[index][field] = value;
      setManualUsers(updated);
  };

  const downloadTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,Name,Email,Phone Number\nJohn Doe,john@example.com,9876543210\nJane Smith,jane@example.com,9876543211";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "User_Import_Template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="p-8 min-h-screen bg-[var(--background)] max-w-6xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)] tracking-tight">Import Users</h1>
            <p className="text-[var(--text-muted)] mt-1">Quickly add students to your department via file upload or manual entry.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left Column: Form & Upload Area */}
            <div className="lg:col-span-3 bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-6 md:p-8 shadow-sm">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8 border-b border-[var(--sys-glass-border)] pb-2">
                    <button
                        className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'upload' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                        onClick={() => { setActiveTab('upload'); setResult(null); }}
                    >
                        <FileSpreadsheet size={16} /> Import via File
                    </button>
                    <button
                        className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'manual' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                        onClick={() => { setActiveTab('manual'); setResult(null); }}
                    >
                        <UserPlus size={16} /> Manual Entry
                    </button>
                </div>

                {/* TAB 1: UPLOAD FILE */}
                {activeTab === 'upload' && (
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in">
                        <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-6">
                            <UploadCloud size={40} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-[var(--text)] mb-2">Upload Data File</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-6">Supports .xlsx, .xls, and .csv formats (Max 5MB).</p>

                        <label className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--primary)]/40 rounded-2xl bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 transition-colors cursor-pointer mb-6">
                            <UploadCloud size={32} className="text-[var(--primary)] mb-3" />
                            <span className="font-bold text-[var(--text)]">{file ? file.name : "Click to select a file"}</span>
                            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileChange} />
                        </label>

                        <button 
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full py-3.5 rounded-full text-sm font-bold text-[var(--sys-text-on-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            style={{ background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' }}
                        >
                            {loading ? <span className="animate-spin text-xl">⏳</span> : <UploadCloud size={18} />}
                            {loading ? 'Processing File...' : 'Import Users'}
                        </button>
                    </div>
                )}

                {/* TAB 2: MANUAL ENTRY */}
                {activeTab === 'manual' && (
                    <div className="animate-in fade-in">
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {manualUsers.map((u, index) => (
                                <div key={index} className="flex flex-col md:flex-row items-center gap-3 bg-[var(--background)]/50 p-4 rounded-xl border border-[var(--sys-glass-border)]">
                                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input 
                                            type="text" placeholder="Name *" required
                                            value={u.name} onChange={(e) => updateManualUser(index, 'name', e.target.value)}
                                            className="w-full bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                        />
                                        <input 
                                            type="email" placeholder="Email *" required
                                            value={u.email} onChange={(e) => updateManualUser(index, 'email', e.target.value)}
                                            className="w-full bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                        />
                                        <input 
                                            type="text" placeholder="Phone (Optional)" 
                                            value={u.phone} onChange={(e) => updateManualUser(index, 'phone', e.target.value)}
                                            className="w-full bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeManualRow(index)}
                                        className="p-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors"
                                        title="Remove User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-[var(--sys-glass-border)]">
                            <button 
                                onClick={addManualRow}
                                className="text-sm font-bold text-[var(--primary)] flex items-center gap-2 hover:underline"
                            >
                                <Plus size={16} /> Add Another Row
                            </button>

                            <button 
                                onClick={handleManualSubmit}
                                disabled={loading}
                                className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold text-[var(--sys-text-on-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                style={{ background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' }}
                            >
                                {loading ? <span className="animate-spin text-xl">⏳</span> : <UserPlus size={18} />}
                                {loading ? 'Saving...' : 'Save Users'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Instructions & Results */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-orange-500" size={20} /> Data Rules
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                        To ensure a successful import, provide the following fields. Duplicate emails will automatically be skipped.
                    </p>
                    
                    <div className="border border-[var(--sys-glass-border)] rounded-xl overflow-hidden mb-5">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[var(--background)] border-b border-[var(--sys-glass-border)]">
                                <tr>
                                    <th className="px-3 py-3 font-bold text-[var(--text)] border-r border-[var(--sys-glass-border)]">Name *</th>
                                    <th className="px-3 py-3 font-bold text-[var(--text)] border-r border-[var(--sys-glass-border)]">Email *</th>
                                    <th className="px-3 py-3 font-bold text-[var(--text)]">Phone</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--glass-surface)] text-[var(--text-muted)]">
                                <tr className="border-b border-[var(--sys-glass-border)]">
                                    <td className="px-3 py-2 border-r border-[var(--sys-glass-border)]">Rahul S.</td>
                                    <td className="px-3 py-2 border-r border-[var(--sys-glass-border)]">rahul@ex.com</td>
                                    <td className="px-3 py-2">9876543210</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2 border-r border-[var(--sys-glass-border)]">Priya P.</td>
                                    <td className="px-3 py-2 border-r border-[var(--sys-glass-border)]">priya@ex.com</td>
                                    <td className="px-3 py-2">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {activeTab === 'upload' && (
                        <button onClick={downloadTemplate} className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-2">
                            <Download size={16} /> Download CSV Template
                        </button>
                    )}
                </div>

                {/* Results Card */}
                {result && (
                    <div className={`border rounded-[24px] p-6 shadow-sm animate-in slide-in-from-right-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {result.success ? <CheckCircle2 className="text-green-600" size={24} /> : <AlertTriangle className="text-red-600" size={24} />}
                            <h3 className={`font-bold text-lg ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? 'Import Complete' : 'Import Failed'}
                            </h3>
                        </div>
                        <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
                        
                        {result.success && (
                            <ul className="mt-3 text-sm text-green-800 font-medium space-y-1">
                                <li>• Records Processed: {result.total}</li>
                                <li>• Successfully Added: {result.inserted}</li>
                                <li>• Skipped (Duplicates): {result.skipped}</li>
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default BulkUserUpload;