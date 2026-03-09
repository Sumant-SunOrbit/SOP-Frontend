// import React, { useState, useEffect } from 'react';
// import GlassTable, { TableRow, TableCell } from '../../components/ui/GlassTable';
// import InputField from '../../components/form/input/InputField';
// import Button from '../../components/ui/Button';
// import FileUpload from '../../components/form/FileUpload'; 
// import { Plus, Briefcase, FileText, Edit2, ExternalLink, Trash2 } from 'lucide-react';
// import api from '../../services/api';
// import { toast } from 'react-hot-toast';
// import { motion } from 'framer-motion';

// // Dynamic Server URL Helper to construct PDF links
// const AXIOS_BASE = api.defaults.baseURL || 'http://localhost:5001';
// const SERVER_URL = AXIOS_BASE.replace(/\/api$/, ''); 

// const ManageDepartments = () => {
//   const [departments, setDepartments] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Form State
//   const [formData, setFormData] = useState({ name: '', description: '' });
//   const [selectedFiles, setSelectedFiles] = useState([]); // NEW files to upload
  
//   // Edit Mode State
//   const [existingFiles, setExistingFiles] = useState([]); // Files currently in DB
//   const [filesToDelete, setFilesToDelete] = useState([]); // IDs of files to remove

//   useEffect(() => { fetchDepartments(); }, []);

//   const fetchDepartments = async () => {
//     try {                        
//       const { data } = await api.get('/admin/departments');
//       setDepartments(data);
//     } catch (error) { toast.error('Failed to load departments'); } 
//   };

//   const handleEdit = (dept) => {
//     setFormData({ name: dept.name, description: dept.description });
//     setEditId(dept._id);
    
//     // Load existing files so user can see them
//     setExistingFiles(dept.sopFiles || []);
//     setFilesToDelete([]); // Reset deletion queue
//     setSelectedFiles([]); // Reset new upload queue
    
//     setShowForm(true);
//   };

//   const handleDeleteDepartment = async (id) => {
//     if (!window.confirm("Are you sure? This will delete all SOPs and data for this department.")) return;
//     try {
//       await api.delete(`/admin/departments/${id}`);
//       setDepartments(departments.filter(d => d._id !== id));
//       toast.success("Department deleted");
//     } catch (error) {
//       toast.error("Failed to delete department");
//     }
//   };

//   // Mark an existing file for deletion
//   const removeExistingFile = (fileId) => {
//     setFilesToDelete([...filesToDelete, fileId]); // Add to delete queue
//     setExistingFiles(existingFiles.filter(f => f.fileId !== fileId)); // Remove from UI
//   };

//   const resetForm = () => {
//     setFormData({ name: '', description: '' });
//     setSelectedFiles([]);
//     setExistingFiles([]);
//     setFilesToDelete([]);
//     setEditId(null);
//     setShowForm(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const dataToSend = new FormData();
//     dataToSend.append('name', formData.name);
//     dataToSend.append('description', formData.description);
    
//     // 1. Send New Files (Loop through array and append same field name 'sopFiles')
//     selectedFiles.forEach((file) => {
//       dataToSend.append('sopFiles', file);
//     });

//     // 2. Send IDs of files to DELETE (only if editing)
//     if (filesToDelete.length > 0) {
//       dataToSend.append('filesToDelete', JSON.stringify(filesToDelete));
//     }

//     try {
//       const config = { headers: { 'Content-Type': 'multipart/form-data' } };

//       if (editId) {
//         await api.put(`/admin/departments/${editId}`, dataToSend, config); 
//         toast.success('Department updated');
//       } else {
//         await api.post('/admin/departments', dataToSend, config);
//         toast.success('Department created!');
//       }
//       fetchDepartments();
//       resetForm();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Operation failed');
//     }
//     setIsSubmitting(false);
//   };

//   return (
//     <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 p-8">
//       <main className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-semibold text-[var(--text)]">Departments</h1>
//           <Button onClick={() => { resetForm(); setShowForm(!showForm); }} icon={Plus}>
//             {showForm ? 'Close Form' : 'Add Department'}
//           </Button>
//         </div>

//         {showForm && (
//           <motion.div 
//             initial={{ opacity: 0, height: 0 }} 
//             animate={{ opacity: 1, height: 'auto' }}
//             className="glass-card p-8 mb-8 overflow-hidden"
//           >
//             <h3 className="text-xl font-bold mb-6 text-[var(--text)]">
//               {editId ? 'Edit Department' : 'New Department'}
//             </h3>
//             <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
//               <InputField 
//                 label="Department Name" icon={Briefcase} 
//                 value={formData.name}
//                 onChange={(e) => setFormData({...formData, name: e.target.value})}
//               />
//               <InputField 
//                 label="Description" icon={FileText} 
//                 value={formData.description}
//                 onChange={(e) => setFormData({...formData, description: e.target.value})}
//               />
              
//               {/* --- EXISTING FILES SECTION (Only in Edit Mode) --- */}
//               {editId && existingFiles.length > 0 && (
//                 <div className="space-y-2 mb-4">
//                   <label className="text-sm font-medium text-[var(--text-muted)] ml-1">Current SOPs</label>
//                   <div className="grid gap-2">
//                     {existingFiles.map((file, i) => (
//                       <div key={file.fileId || i} className="flex items-center justify-between p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl">
//                         <div className="flex items-center gap-2">
//                             <FileText className="w-4 h-4 text-[var(--primary)]" />
//                             <span className="text-sm text-[var(--text)]">{file.name}</span>
//                         </div>
//                         <button 
//                           type="button" 
//                           onClick={() => removeExistingFile(file.fileId)}
//                           className="text-[var(--danger)] hover:bg-[var(--danger)]/10 p-1 rounded-full transition-colors"
//                           title="Delete this file"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-[var(--text-muted)] ml-1">
//                   {editId ? "Add New SOPs (PDF)" : "Upload SOPs (PDF)"}
//                 </label>
//                 <FileUpload onFilesSelected={setSelectedFiles} />
//               </div>

//               <div className="pt-4 flex gap-3">
//                 <Button type="submit" isLoading={isSubmitting}>
//                   {editId ? 'Update Department' : 'Create Department'}
//                 </Button>
//                 <Button variant="secondary" type="button" onClick={resetForm}>Cancel</Button>
//               </div>
//             </form>
//           </motion.div>
//         )}

//         <div className="glass-card overflow-hidden">
//           <GlassTable headers={['Department Name', 'Description', 'SOP Files', 'Actions']}>
//             {departments.map((dept, idx) => (
//               <TableRow key={dept._id} delay={idx * 0.05}>
//                 <TableCell className="font-semibold text-[var(--text)]">{dept.name}</TableCell>
//                 <TableCell className="text-[var(--text-muted)]">{dept.description}</TableCell>
                
//                 <TableCell>
//                   {dept.sopFiles?.length > 0 ? (
//                     <div className="flex flex-col gap-2">
//                       {dept.sopFiles.map((file, i) => (
//                         <a 
//                           key={i}
//                           href={`${SERVER_URL}${file.url}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--sys-glass-border)] hover:border-[var(--primary)] group transition-all"
//                         >
//                           <svg 
//                               xmlns="http://www.w3.org/2000/svg" 
//                               viewBox="0 -960 960 960" 
//                               fill="currentColor"
//                               className="w-5 h-5 text-[var(--secondary)] group-hover:text-[var(--primary)] shrink-0"
//                           >
//                               <path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/>
//                           </svg>
//                           <span className="text-xs font-medium text-[var(--text)] truncate max-w-[150px]">
//                             {file.name}
//                           </span>
//                           <ExternalLink className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
//                         </a>
//                       ))}
//                     </div>
//                   ) : (
//                     <span className="text-[var(--text-muted)] text-xs italic pl-2">No SOPs Uploaded</span>
//                   )}
//                 </TableCell>

//                 <TableCell>
//                   <div className="flex justify-center gap-2 w-full">
//                     <button onClick={() => handleEdit(dept)} className="p-2 text-[var(--primary)] hover:bg-[var(--glass-border)] rounded-lg transition-colors">
//                       <Edit2 className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => handleDeleteDepartment(dept._id)} className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </GlassTable>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default ManageDepartments;


import React, { useState, useEffect, useRef } from 'react';
import GlassTable, { TableRow, TableCell } from '../../components/ui/GlassTable';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/form/FileUpload'; 
import { Plus, Briefcase, FileText, Edit2, ExternalLink, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { motion } from 'framer-motion';

// 🟢 NEW: Import our custom notification hook
import { useNotification } from '../../context/NotificationContext';

// Dynamic Server URL Helper to construct PDF links
const AXIOS_BASE = api.defaults.baseURL || 'http://localhost:5001';
const SERVER_URL = AXIOS_BASE.replace(/\/api$/, ''); 

const ManageDepartments = () => {
  // 🟢 NEW: Initialize custom notification
  const { showToast } = useNotification();

  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]); 
  
  // Edit Mode State
  const [existingFiles, setExistingFiles] = useState([]); 
  const [filesToDelete, setFilesToDelete] = useState([]); 

  // Ref to target the form container for scrolling
  const formRef = useRef(null);

  useEffect(() => { fetchDepartments(); }, []);

  // Robust Scroll Logic
  useEffect(() => {
    if (showForm && formRef.current) {
      const timeout = setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250); 
      return () => clearTimeout(timeout);
    }
  }, [showForm, editId]);

  const fetchDepartments = async () => {
    try {                        
      const { data } = await api.get('/admin/departments');
      setDepartments(data);
    } catch (error) { 
      showToast('Failed to load departments. Please check your connection.', 'error'); 
    } 
  };

  const handleEdit = (dept) => {
    setFormData({ name: dept.name, description: dept.description });
    setEditId(dept._id);
    
    setExistingFiles(dept.sopFiles || []);
    setFilesToDelete([]); 
    setSelectedFiles([]); 
    
    setShowForm(true);
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure? This will delete all SOPs and data for this department.")) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      setDepartments(departments.filter(d => d._id !== id));
      showToast("Department successfully deleted.", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete department.", "error");
    }
  };

  const removeExistingFile = (fileId) => {
    setFilesToDelete([...filesToDelete, fileId]); 
    setExistingFiles(existingFiles.filter(f => f.fileId !== fileId)); 
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedFiles([]);
    setExistingFiles([]);
    setFilesToDelete([]);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict Validations
    if (!formData.name || formData.name.trim() === '') {
      showToast("Department Name is required.", "error");
      return; 
    }
    
    if (!formData.description || formData.description.trim() === '') {
      showToast("Department Description is required.", "error");
      return; 
    }

    if (selectedFiles.length === 0 && (!editId || existingFiles.length === 0)) {
      showToast("Please upload at least one SOP (PDF) file.", "error");
      return; 
    }

    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name.trim());
    dataToSend.append('description', formData.description.trim());
    
    selectedFiles.forEach((file) => {
      dataToSend.append('sopFiles', file);
    });

    if (filesToDelete.length > 0) {
      dataToSend.append('filesToDelete', JSON.stringify(filesToDelete));
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editId) {
        await api.put(`/admin/departments/${editId}`, dataToSend, config); 
        showToast('Department updated successfully!', 'success');
      } else {
        await api.post('/admin/departments', dataToSend, config);
        showToast('New department created successfully!', 'success');
      }
      fetchDepartments();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 p-8">
      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Departments</h1>
          
          <Button 
            onClick={() => { resetForm(); setShowForm(!showForm); }} 
            icon={showForm ? X : Plus}
          >
            {showForm ? 'Cancel' : 'Add Department'}
          </Button>
        </div>

        {showForm && (
          <motion.div 
            ref={formRef} 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-8 mb-8 overflow-hidden scroll-mt-6" 
          >
            <h3 className="text-xl font-bold mb-6 text-[var(--text)]">
              {editId ? 'Edit Department' : 'New Department'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <InputField 
                label="Department Name *" icon={Briefcase} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <InputField 
                label="Description *" icon={FileText} 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              
              {editId && existingFiles.length > 0 && (
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-[var(--text-muted)] ml-1">Current SOPs</label>
                  <div className="grid gap-2">
                    {existingFiles.map((file, i) => (
                      <div key={file.fileId || i} className="flex items-center justify-between p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[var(--primary)]" />
                            <span className="text-sm text-[var(--text)]">{file.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeExistingFile(file.fileId)}
                          className="text-[var(--danger)] hover:bg-[var(--danger)]/10 p-1 rounded-full transition-colors"
                          title="Delete this file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] ml-1">
                  {editId ? "Add New SOPs (PDF) *" : "Upload SOPs (PDF) *"}
                </label>
                <FileUpload onFilesSelected={setSelectedFiles} />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>
                  {editId ? 'Update Department' : 'Create Department'}
                </Button>
                <Button variant="secondary" type="button" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="glass-card overflow-hidden">
          <GlassTable headers={['Department Name', 'Description', 'SOP Files', 'Actions']}>
            {departments.map((dept, idx) => (
              <TableRow key={dept._id} delay={idx * 0.05}>
                <TableCell className="font-semibold text-[var(--text)]">{dept.name}</TableCell>
                <TableCell className="text-[var(--text-muted)]">{dept.description}</TableCell>
                
                <TableCell>
                  {dept.sopFiles?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {dept.sopFiles.map((file, i) => (
                        <a 
                          key={i}
                          href={`${SERVER_URL}${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--sys-glass-border)] hover:border-[var(--primary)] group transition-all"
                        >
                          <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 -960 960 960" 
                              fill="currentColor"
                              className="w-5 h-5 text-[var(--secondary)] group-hover:text-[var(--primary)] shrink-0"
                          >
                              <path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/>
                          </svg>
                          <span className="text-xs font-medium text-[var(--text)] truncate max-w-[150px]">
                            {file.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--text-muted)] text-xs italic pl-2">No SOPs Uploaded</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2 w-full">
                    <button onClick={() => handleEdit(dept)} className="p-2 text-[var(--primary)] hover:bg-[var(--glass-border)] rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteDepartment(dept._id)} className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </GlassTable>
        </div>
      </main>
    </div>
  );
};

export default ManageDepartments;