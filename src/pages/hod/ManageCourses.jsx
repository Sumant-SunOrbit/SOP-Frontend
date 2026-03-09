import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link as LinkIcon, FileText, Upload, Edit, Trash2, AlertCircle, Users, ExternalLink, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import GlassTable, { TableRow, TableCell } from '../../components/ui/GlassTable';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/form/FileUpload';
import MultiSelect from '../../components/form/input/MultiSelect'; 
import Pagination from '../../components/ui/Pagination'; 
import FilterBar from '../../components/ui/FilterBar'; 
import api from '../../services/api';

import { useNotification } from '../../context/NotificationContext';

const AXIOS_BASE = api.defaults.baseURL || 'http://localhost:5001';
const SERVER_URL = AXIOS_BASE.replace(/\/api$/, '');

const ManageCourses = () => {
  const navigate = useNavigate(); 
  const { showToast } = useNotification(); 
  
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]); 
  const [deptSops, setDeptSops] = useState([]); 
  
  const initialFilters = { search: '', startDate: '', endDate: '', limit: 10, page: 1 };
  const [filters, setFilters] = useState(initialFilters);
  const [paginationInfo, setPaginationInfo] = useState({ totalPages: 1 });

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [editId, setEditId] = useState(null);

  const [createMode, setCreateMode] = useState('link'); // 'link' | 'generate'

  const [form, setForm] = useState({ 
      title: '', 
      description: '', 
      linkedExamIds: [], 
      existingFileIds: [], 
      files: [],
      examTitle: '',
      singleCount: 0,
      multipleCount: 0,
      tfCount: 0,
      paraCount: 0,
      additionalText: ''
  });

  const formRef = useRef(null);

  useEffect(() => {
    const fetchResources = async () => {
        try {
            const [examRes, sopRes] = await Promise.all([
                api.get('/hod/exams').catch(() => ({ data: [] })),
                api.get('/hod/sops').catch(() => ({ data: [] }))
            ]);
            const fetchedExams = examRes.data.exams || examRes.data;
            setExams(Array.isArray(fetchedExams) ? fetchedExams : []);
            setDeptSops(Array.isArray(sopRes.data) ? sopRes.data : []);
        } catch (e) { console.error("Resource load error", e); }
    };
    fetchResources();
  }, []);

  useEffect(() => { 
      fetchCourses(); 
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (showForm && formRef.current) {
      const timeout = setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250); 
      return () => clearTimeout(timeout);
    }
  }, [showForm, editId, createMode]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const { data } = await api.get(`/hod/courses?${queryParams}`);
        
        if (data.courses) {
            setCourses(data.courses);
            setPaginationInfo({ totalPages: data.pagination.pages });
        } else {
            setCourses(Array.isArray(data) ? data : []);
        }
    } catch (e) { 
        showToast("Failed to load courses.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
      setFilters(initialFilters);
      showToast("Filters reset", "success");
  };

  const resetForm = () => {
    setForm({ 
        title: '', description: '', linkedExamIds: [], existingFileIds: [], files: [],
        examTitle: '', singleCount: 0, multipleCount: 0, tfCount: 0, paraCount: 0, additionalText: ''
    });
    setCreateMode('link');
    setEditId(null);
    setShowForm(false);
  };

  const handleCountChange = (field, value) => {
    // Allow the state to hold an empty string if the user clears the input
    if (value === '') {
      setForm({ ...form, [field]: '' });
    } else {
      const cleanValue = Math.max(0, parseInt(value) || 0);
      setForm({ ...form, [field]: cleanValue });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || form.title.trim() === '') return showToast("Course Title is required.", "error");
    if (!form.description || form.description.trim() === '') return showToast("Course Description is required.", "error");
    if (form.files.length === 0 && form.existingFileIds.length === 0) return showToast("Please provide at least one SOP file.", "error");

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('existingFileIds', JSON.stringify(form.existingFileIds || []));
    
    if (form.files && form.files.length > 0) {
        form.files.forEach(file => { formData.append('pdfFiles', file); });
    }

    if (!editId && createMode === 'generate') {
        if (!form.examTitle || form.examTitle.trim() === '') return showToast("Exam Title is required to generate.", "error");
        
        // 🟢 FIXED: Sanitize any empty strings back to 0 before doing math or submitting
        const singleC = parseInt(form.singleCount) || 0;
        const multiC = parseInt(form.multipleCount) || 0;
        const tfC = parseInt(form.tfCount) || 0;
        const paraC = parseInt(form.paraCount) || 0;

        const totalQs = singleC + multiC + tfC + paraC;
        if (totalQs === 0) return showToast("Please specify at least one question to generate.", "error");

        formData.append('generateExam', 'true');
        formData.append('examTitle', form.examTitle.trim());
        formData.append('singleCount', singleC);
        formData.append('multipleCount', multiC);
        formData.append('tfCount', tfC);
        formData.append('paraCount', paraC);
        if (form.additionalText) formData.append('additionalText', form.additionalText.trim());
        
        showToast("Generating Course & AI Exam... Please wait.", "info");
    } else {
        formData.append('linkedExamIds', JSON.stringify(form.linkedExamIds || []));
    }

    setIsSubmitting(true);
    try {
      if (editId) {
          await api.put(`/hod/courses/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          showToast("Course Updated Successfully", "success");
          resetForm();
          fetchCourses(); 
      } else {
          const { data } = await api.post('/hod/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          
          if (createMode === 'generate') {
              showToast("Course & Exam Generated! Redirecting to Verify...", "success");
              const linkedExams = data.linkedExams || [];
              const generatedExamId = linkedExams[linkedExams.length - 1]; 

              if (generatedExamId) {
                  setTimeout(() => {
                      navigate('/hod/create-exam', { 
                          state: { 
                              examId: generatedExamId, 
                              examName: form.examTitle 
                          } 
                      });
                  }, 1500);
              } else {
                  resetForm();
                  fetchCourses();
              }
          } else {
              showToast("Course Created Successfully", "success");
              resetForm();
              fetchCourses(); 
          }
      }
    } catch (e) { 
      showToast(e.response?.data?.message || "Failed to process request", "error"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleEditClick = (course) => {
      const safeExamIds = (course.linkedExams || []).map(ex => String(ex._id || ex)).filter(Boolean);
      const safeSopIds = (course.sopFiles || []).map(f => String(f.fileId?._id || f.fileId)).filter(Boolean);

      setForm({
          ...form,
          title: course.title || '',
          description: course.description || '',
          linkedExamIds: safeExamIds,
          existingFileIds: safeSopIds, 
          files: []
      });
      setEditId(course._id);
      setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
      if (!window.confirm("Are you sure you want to delete this course?")) return;
      try {
          await api.delete(`/hod/courses/${id}`);
          showToast("Course Deleted", "success");
          fetchCourses();
      } catch (e) { showToast("Failed to delete course", "error"); }
  };

  const allSopsMap = new Map();
  (deptSops || []).forEach(sop => { if (sop.id) allSopsMap.set(String(sop.id), sop.name); });
  courses.forEach(c => {
    (c.sopFiles || []).forEach(f => {
      const idStr = String(f.fileId?._id || f.fileId);
      if (idStr && idStr !== 'undefined' && !allSopsMap.has(idStr)) allSopsMap.set(idStr, f.filename || "Unknown File");
    });
  });

  const sopOptions = (deptSops || []).map(sop => ({ value: String(sop.id), label: sop.name }));
  const examOptions = (exams || []).map(ex => ({ value: String(ex._id), label: ex.name }));
  const resolveSopName = (id) => allSopsMap.get(String(id)) || "Unknown File";
  const resolveExamName = (id) => {
      const match = exams.find(e => String(e._id) === String(id));
      return match ? match.name : "Unknown Exam";
  };
  const selectedSops = (form.existingFileIds || []).map(id => ({ value: String(id), label: resolveSopName(id) }));
  const selectedExams = (form.linkedExamIds || []).map(id => ({ value: String(id), label: resolveExamName(id) }));

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--background)]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-[var(--text)]">Courses & SOPs</h1>
        <Button onClick={() => showForm ? resetForm() : setShowForm(true)} icon={showForm ? X : Plus}>
            {showForm ? 'Cancel' : 'Add Course'}
        </Button>
      </div>

      {showForm && (
        <motion.div 
          ref={formRef} 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[var(--glass-surface)] p-5 md:p-8 rounded-[24px] border border-[var(--sys-glass-border)] mb-8 shadow-sm scroll-mt-6"
        >
          {editId ? (
              <h2 className="text-xl font-bold text-[var(--text)] mb-6">Edit Course</h2>
          ) : (
              <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b border-[var(--sys-glass-border)] pb-2">
                <button
                    type="button"
                    className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${createMode === 'link' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                    onClick={() => setCreateMode('link')}
                >
                    <LinkIcon size={16} /> Create Course & Link Exam
                </button>
                <button
                    type="button"
                    className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${createMode === 'generate' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                    onClick={() => setCreateMode('generate')}
                >
                    <Zap size={16} /> Create Course & Generate Exam
                </button>
              </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate className="space-y-8 w-full">
            {/* COMMON FIELDS: Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <InputField label="Course Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <InputField label="Description *" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            
            {/* 🟢 FIXED: SOP Uploading is now vertically stacked full-width to prevent empty gaps */}
            <div className="flex flex-col gap-6 w-full">
                <div className="w-full">
                    <MultiSelect
                    id="sop-select" label="Append Existing SOPs *" startIcon={<FileText size={16} />}
                    placeholder="Search and select SOPs..." options={sopOptions} value={selectedSops}
                    onChange={(selected) => setForm({ ...form, existingFileIds: selected ? selected.map(s => s.value) : [] })}
                    />
                </div>
                <div className="w-full space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Upload size={14}/> Upload New SOP PDFs
                    </label>
                    <div className="w-full">
                        <FileUpload onFilesSelected={(files) => setForm({...form, files})} />
                    </div>
                </div>
            </div>

            {/* TAB 1: LINK EXAM */}
            {(editId || createMode === 'link') && (
                <div className="pt-6 border-t border-[var(--sys-glass-border)] w-full">
                    <MultiSelect
                    id="exam-select" label="Add Exams (Optional)" startIcon={<LinkIcon size={16} />}
                    placeholder="Search and add existing exams..." options={examOptions} value={selectedExams}
                    onChange={(selected) => setForm({ ...form, linkedExamIds: selected ? selected.map(s => s.value) : [] })}
                    />
                </div>
            )}

            {/* TAB 2: GENERATE EXAM */}
            {!editId && createMode === 'generate' && (
                <div className="bg-[var(--background)]/50 p-6 md:p-8 rounded-[20px] border border-[var(--sys-glass-border)] space-y-8 animate-in fade-in w-full">
                    
                    {/* 🟢 FIXED: Exam Title takes full width of the container */}
                    <div className="w-full">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 block tracking-wider">
                            Exam Details
                        </label>
                        <InputField label="Exam Title *" placeholder="e.g. Generated Exam for Course" value={form.examTitle} onChange={e => setForm({...form, examTitle: e.target.value})} />
                    </div>
                    
                    <div className="w-full">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 block tracking-wider">
                            Question Structure (AI Generation)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <InputField type="number" label="Multiple Choice" min={0} value={form.multipleCount} onChange={e => handleCountChange('multipleCount', e.target.value)} />
                            <InputField type="number" label="True / False" min={0} value={form.tfCount} onChange={e => handleCountChange('tfCount', e.target.value)} />
                            <InputField type="number" label="Single Answer" min={0} value={form.singleCount} onChange={e => handleCountChange('singleCount', e.target.value)} />
                            <InputField type="number" label="Paragraph" min={0} value={form.paraCount} onChange={e => handleCountChange('paraCount', e.target.value)} />
                        </div>
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <FileText size={14}/> Additional Text / Instructions (Optional)
                        </label>
                        <textarea 
                            className="w-full bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] min-h-[120px] resize-y leading-relaxed"
                            placeholder="Paste specific topics or instructions to help guide the AI..."
                            value={form.additionalText}
                            onChange={(e) => setForm({ ...form, additionalText: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-6 flex justify-end border-t border-[var(--sys-glass-border)] gap-3 w-full">
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {editId ? 'Update Course' : (createMode === 'generate' ? 'Generate AI Exam & Course' : 'Create Course')}
                </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* FILTERS & TABLE SECTION */}
      <FilterBar 
        type="Courses"
        filters={filters}
        setFilters={setFilters}
        onRefresh={fetchCourses}
        onReset={handleResetFilters}
        loading={isLoading}
        showDateFilter={true} 
        showDeptFilter={false} 
      />

      {isLoading ? (
          <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">Loading Courses...</div>
      ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-2xl text-[var(--text-muted)]">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No courses found matching filters.</p>
          </div>
      ) : (
          <>
            <GlassTable headers={['Course Title', 'SOP Files', 'Linked Exams', 'Actions']}>
                {courses.map((c, i) => (
                <TableRow key={c._id} delay={i * 0.05}>
                    <TableCell className="font-bold text-[var(--text)] w-[25%] text-left pl-4">
                        {c.title}
                    </TableCell>
                    
                    <TableCell className="w-[30%] text-center">
                        <div className="flex flex-col items-center gap-2">
                            {c.sopFiles?.map(f => (
                                <a 
                                    key={f._id}
                                    href={`${SERVER_URL}${f.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--sys-glass-border)] hover:border-[var(--primary)] group transition-all w-full"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 -960 960 960" 
                                        fill="currentColor"
                                        className="w-6 h-6 text-[var(--secondary)] group-hover:text-[var(--primary)] shrink-0"
                                    >
                                        <path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/>
                                    </svg>
                                    <span className="text-xs font-medium text-[var(--text)] truncate flex-1 text-left" title={f.filename}>
                                        {f.filename}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                                </a>
                            ))}
                            {(!c.sopFiles || c.sopFiles.length === 0) && <span className="text-xs text-[var(--text-muted)] italic">No Files</span>}
                        </div>
                    </TableCell>
                    
                    <TableCell className="w-[25%] text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                            {c.linkedExams?.map(ex => (
                                <span key={ex._id} className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-md">
                                    {ex.name}
                                </span>
                            ))}
                            {(!c.linkedExams || c.linkedExams.length === 0) && <span className="text-xs text-[var(--text-muted)] italic">None</span>}
                        </div>
                    </TableCell>
                    
                    <TableCell className="w-[20%] text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline" icon={Users} onClick={() => navigate('/hod/assign/course')}>Assign</Button>
                            <button onClick={() => handleEditClick(c)} title="Edit" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteClick(c._id)} title="Delete" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </TableCell>
                </TableRow>
                ))}
            </GlassTable>

            <Pagination 
                currentPage={filters.page} 
                totalPages={paginationInfo.totalPages} 
                onPageChange={(page) => setFilters({ ...filters, page })} 
            />
          </>
      )}
    </div>
  );
};

export default ManageCourses;