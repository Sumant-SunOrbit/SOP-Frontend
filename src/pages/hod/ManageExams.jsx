import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Users, AlertCircle, ArrowLeft, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

import GlassTable, { TableRow, TableCell } from '../../components/ui/GlassTable';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination'; 
import FilterBar from '../../components/ui/FilterBar';   
import api from '../../services/api';

import VerifyEdit from './VerifyEdit';
import ScheduleExam from './ScheduleExam';
import { formatDate } from '../../utils/formatDate';

const ManageExams = () => {
  const navigate = useNavigate(); 
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    search: '',
    startDate: '',
    endDate: '',
    minDuration: '',  
    minQuestions: '', 
    limit: 10,
    page: 1
  };
  const [filters, setFilters] = useState(initialFilters);
  const [paginationInfo, setPaginationInfo] = useState({ totalPages: 1 });

  const [editingExam, setEditingExam] = useState(null); 
  const [editStep, setEditStep] = useState(1); 
  const [questions, setQuestions] = useState([]);
  
  const [schedule, setSchedule] = useState({ date: '', endDate: '', duration: 30, passingMarks: 40 });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchExams = async () => {
    setLoading(true);
    try {
        const queryParams = new URLSearchParams({
            search: filters.search,
            startDate: filters.startDate,
            endDate: filters.endDate,
            minDuration: filters.minDuration,   
            minQuestions: filters.minQuestions, 
            limit: filters.limit,
            page: filters.page
        }).toString();

        const { data } = await api.get(`/hod/exams?${queryParams}`);
        
        if (data.exams) {
            setExams(data.exams);
            setPaginationInfo({ totalPages: data.pagination.pages });
        } else {
            setExams([]);
        }
    } catch (e) {
        toast.error("Failed to load exams");
    } finally {
        setLoading(false);
    }
  };

  const handleResetFilters = () => {
      setFilters(initialFilters);
      toast.success("Filters reset");
  };

  const handleEditClick = async (exam) => {
    setEditingExam(exam);
    setSchedule({ 
        date: exam.scheduledAt ? new Date(exam.scheduledAt).toISOString().slice(0, 16) : '', 
        endDate: exam.endScheduledAt ? new Date(exam.endScheduledAt).toISOString().slice(0, 16) : '', 
        duration: exam.durationMinutes || 30,
        passingMarks: exam.passingMarks || 40 
    });
    setEditStep(1);
    try {
        const res = await api.get(`/hod/exams/${exam._id}/questions`);
        setQuestions(res.data || []);
    } catch (e) { toast.error("Failed to load questions"); }
  };

  const handleUpdateQuestion = async (index, field, value) => {
    if (!editingExam) return;
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
    try { await api.put(`/hod/exams/${editingExam._id}/questions`, { action: 'edit', questionId: updated[index]._id, questionData: { [field]: value } }); } catch (e) {}
  };

  const handleOptionChange = async (qIndex, oIndex, field, value) => {
    if (!editingExam) return;
    const updated = [...questions];
    updated[qIndex].options[oIndex][field] = value;
    setQuestions(updated);
    try { await api.put(`/hod/exams/${editingExam._id}/questions`, { action: 'edit', questionId: updated[qIndex]._id, questionData: { options: updated[qIndex].options } }); } catch (e) {}
  };

  const handleDeleteQuestion = async (index) => {
    if(!window.confirm("Remove question?")) return;
    try {
      await api.put(`/hod/exams/${editingExam._id}/questions`, { action: 'delete', questionId: questions[index]._id });
      setQuestions(questions.filter((_, i) => i !== index));
      toast.success("Deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

//   const handleAddQuestion = async (type) => {
//     let newQData = { questionText: "New Question", type, marks: type === 'paragraph' ? 5 : 1, difficulty: 'Medium', courseId: editingExam?._id };
//     if (type === 'true_false') newQData.options = [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }];
//     else if (type === 'paragraph') { newQData.correctAnswerText = "Answer Key"; newQData.options = []; }
//     else newQData.options = [{ text: "Option 1", isCorrect: true }, { text: "Option 2", isCorrect: false }];

//     try {
//         await api.put(`/hod/exams/${editingExam._id}/questions`, { action: 'add', questionData: newQData });
//         const qRes = await api.get(`/hod/exams/${editingExam._id}/questions`); 
//         setQuestions(qRes.data);
//         toast.success("Added");
//     } catch (e) { toast.error("Add failed"); }
//   };

    const handleAddQuestion = async (type) => {
    let newQData = { 
        questionText: "New Question", type, marks: type === 'paragraph' ? 5 : 1, difficulty: 'Medium', courseId: editingExam?._id 
    };
    
    if (type === 'true_false') {
        newQData.options = [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }];
    } else if (type === 'paragraph') { 
        newQData.correctAnswerText = "Answer Key"; newQData.options = []; 
    } else {
        newQData.options = [{ text: "Option 1", isCorrect: true }, { text: "Option 2", isCorrect: false }];
    }

    try {
        // 1. Save to database
        await api.put(`/hod/exams/${editingExam._id}/questions`, { action: 'add', questionData: newQData });
        
        // 2. Fetch fresh data
        const qRes = await api.get(`/hod/exams/${editingExam._id}/questions`); 
        const backendQuestions = qRes.data || [];
        
        // 3. Identify ONLY the newly created questions
        const currentIds = new Set(questions.map(q => String(q._id)));
        const newQuestions = backendQuestions.filter(bq => !currentIds.has(String(bq._id)));
        
        // 4. Update existing questions with fresh backend data, but strictly PRESERVE current visual order
        const updatedExisting = questions.map(localQ => {
            const freshQ = backendQuestions.find(bq => String(bq._id) === String(localQ._id));
            return freshQ || localQ;
        });
        
        // 5. Merge: Force new questions to the absolute top (Index 0)
        setQuestions([...newQuestions, ...updatedExisting]);
        toast.success("Added to Top");
    } catch (e) { 
        toast.error("Add failed"); 
    }
  };

const handlePublish = async () => {
    setUpdateLoading(true);
    try {
      await api.put(`/hod/exams/${editingExam._id}`, { 
          scheduledAt: schedule.date || null, 
          endScheduledAt: schedule.endDate || null, 
          durationMinutes: schedule.duration, 
          passingMarks: schedule.passingMarks,
          name: editingExam.name 
      });
      
      toast.success("Exam details saved! Redirecting to Certificate Designer...");
      navigate(`/hod/exam/${editingExam._id}/certificate`);
      setEditingExam(null);

    } catch (err) { toast.error("Update failed"); }
    setUpdateLoading(false);
  };

  const handleSetStep = (newStep) => {
      if (newStep === 1) setEditingExam(null); 
      if (newStep === 3) setEditStep(2);       
      if (newStep === 2) setEditStep(1);       
  };

  // ==========================================
  // RENDER: EDIT MODE
  // ==========================================
  if (editingExam) {
      return (
         <div className="p-8 min-h-screen bg-[var(--background)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-[var(--text)]">Editing: {editingExam.name}</h1>
            </div>
            <div className="flex-1 bg-[var(--glass-surface)] p-6 rounded-[24px] border border-[var(--glass-border)] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
                {editStep === 1 && (
                    <VerifyEdit 
                        questions={questions} 
                        setStep={handleSetStep} 
                        handleUpdateQuestion={handleUpdateQuestion} 
                        handleOptionChange={handleOptionChange} 
                        handleDeleteQuestion={handleDeleteQuestion} 
                        handleAddQuestion={handleAddQuestion} 
                        examName={editingExam.name} 
                        setExamName={(newName) => setEditingExam({ ...editingExam, name: newName })}
                    />
                )}
                {/* 🟢 FIXED: `questions={questions}` perfectly bound for editing path too */}
                {editStep === 2 && (
                    <ScheduleExam 
                        schedule={schedule} 
                        setSchedule={setSchedule} 
                        handlePublish={handlePublish} 
                        setStep={handleSetStep} 
                        loading={updateLoading} 
                        config={{ name: editingExam.name }} 
                        questions={questions}
                    />
                )}
            </div>
         </div>
      );
  }

  // ==========================================
  // RENDER: LIST MODE
  // ==========================================
  return (
    <div className="p-8 min-h-screen bg-[var(--background)]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Manage Exams</h1>
      </div>

      <FilterBar 
        type="Exams"
        filters={filters}
        setFilters={setFilters}
        onRefresh={fetchExams}
        onReset={handleResetFilters}
        loading={loading}
        showDateFilter={true}
        showDurationFilter={true}
        showQuestionCountFilter={true}
        showDeptFilter={false} 
      />

      {loading ? (
          <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">Loading Exams...</div>
      ) : exams.length === 0 ? (
          <div className="text-center py-16 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl text-[var(--text-muted)]">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No exams found matching filters.</p>
          </div>
      ) : (
          <>
            <GlassTable headers={['Exam Name', 'Date', 'Duration', 'Questions', 'Actions']}>
                {exams.map((exam, i) => (
                <TableRow key={exam._id} delay={i * 0.05}>
                    <TableCell className="font-bold text-[var(--text)] w-[25%] text-left pl-4">
                        {exam.name}
                    </TableCell>
                    <TableCell className="w-[20%] text-center">
                        {exam.scheduledAt ? formatDate(exam.scheduledAt) : <span className="text-[var(--text-muted)] italic">Any Time</span>}
                    </TableCell>
                    <TableCell className="w-[15%] text-center">{exam.durationMinutes} mins</TableCell>
                    <TableCell className="w-[15%] text-center">{exam.questions?.length || 0}</TableCell>
                    <TableCell className="w-[30%] text-center">
                        <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" icon={Users} onClick={() => navigate('/hod/assign/exam')} title="Assign"></Button>
                            <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleEditClick(exam)} title="Edit Questions"></Button>
                            <Button size="sm" variant="secondary" icon={Award} onClick={() => navigate(`/hod/exam/${exam._id}/certificate`)} title="Design Certificate"></Button>
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

export default ManageExams;