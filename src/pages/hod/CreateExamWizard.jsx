import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { toast } from 'react-hot-toast';
import api from '../../services/api';

// Imports
import CreateExam from './CreateExam';
import VerifyEdit from './VerifyEdit';
import ScheduleExam from './ScheduleExam';
import DesignCertificateStep from './DesignCertificateStep'; 

const CreateExamWizard = () => {
  const location = useLocation(); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdExam, setCreatedExam] = useState(null); 

  // --- STATE ---
  const [config, setConfig] = useState({
    name: '', 
    singleCount: 0, 
    multipleCount: 0, 
    tfCount: 0, 
    paraCount: 0, 
    files: [], 
    existingFileId: '', 
    additionalText: ''
  });
  
  const [questions, setQuestions] = useState([]);
  const [schedule, setSchedule] = useState({ date: '', endDate: '', duration: 30, passingMarks: 40 });

  useEffect(() => {
    const initializeFromRedirect = async () => {
        if (location.state && location.state.examId) {
            setLoading(true);
            try {
                const examRes = await api.get(`/hod/exams/${location.state.examId}`);
                setCreatedExam(examRes.data);
                
                setConfig(prev => ({ 
                    ...prev, 
                    name: location.state.examName || examRes.data.name 
                }));
                
                const qRes = await api.get(`/hod/exams/${location.state.examId}/questions`); 
                setQuestions(qRes.data || []); 
                
                setStep(2);
            } catch (error) {
                toast.error("Failed to load generated exam details");
            } finally {
                setLoading(false);
            }
        }
    };

    initializeFromRedirect();
  }, [location.state]);

  // --- LOGIC ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!config.name) return toast.error("Exam Name is required");
    if (config.files.length === 0 && !config.existingFileId && !config.additionalText) {
        return toast.error("Please provide a PDF or Text instructions");
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('name', config.name);
    formData.append('singleCount', config.singleCount);
    formData.append('multipleCount', config.multipleCount);
    formData.append('tfCount', config.tfCount);
    formData.append('paraCount', config.paraCount);
    
    if (config.files.length > 0) formData.append('pdfFile', config.files[0]);
    if (config.existingFileId) formData.append('existingFileId', config.existingFileId);
    if (config.additionalText) formData.append('additionalText', config.additionalText);

    try {
      const { data } = await api.post('/hod/exams', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCreatedExam(data.exam);
      
      const qRes = await api.get(`/hod/exams/${data.exam._id}/questions`); 
      setQuestions(qRes.data || []); 
      
      setStep(2);
      toast.success("Exam Draft Created!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate exam");
    }
    setLoading(false);
  };

  const handleUpdateQuestion = async (index, field, value) => {
    if (!createdExam) return;
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
    
    try {
        await api.put(`/hod/exams/${createdExam._id}/questions`, {
            action: 'edit', questionId: updated[index]._id, questionData: { [field]: value }
        });
    } catch (e) { console.error("Auto-save failed", e); }
  };

  const handleOptionChange = async (qIndex, oIndex, field, value) => {
    if (!createdExam) return;
    const updated = [...questions];
    updated[qIndex].options[oIndex][field] = value;
    setQuestions(updated);
    
    try {
        await api.put(`/hod/exams/${createdExam._id}/questions`, {
            action: 'edit', questionId: updated[qIndex]._id, questionData: { options: updated[qIndex].options }
        });
    } catch (e) { console.error("Option save failed", e); }
  };

  const handleDeleteQuestion = async (index) => {
    if(!window.confirm("Remove question?")) return;
    try {
      await api.put(`/hod/exams/${createdExam._id}/questions`, { 
          action: 'delete', questionId: questions[index]._id 
      });
      setQuestions(questions.filter((_, i) => i !== index));
      toast.success("Deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

  // const handleAddQuestion = async (type) => {
  //   let newQData = { 
  //       questionText: "New Question", type, marks: type === 'paragraph' ? 5 : 1, difficulty: 'Medium', courseId: createdExam?._id 
  //   };
  //   if (type === 'true_false') {
  //       newQData.options = [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }];
  //   } else if (type === 'paragraph') { 
  //       newQData.correctAnswerText = "Answer Key"; newQData.options = []; 
  //   } else {
  //       newQData.options = [{ text: "Option 1", isCorrect: true }, { text: "Option 2", isCorrect: false }];
  //   }

  //   try {
  //       await api.put(`/hod/exams/${createdExam._id}/questions`, { action: 'add', questionData: newQData });
  //       const qRes = await api.get(`/hod/exams/${createdExam._id}/questions`); 
        
  //       let updatedList = qRes.data || [];
  //       if (updatedList.length > 0) {
  //           const newlyAddedQuestion = updatedList.pop(); 
  //           updatedList.unshift(newlyAddedQuestion);      
  //       }
        
  //       setQuestions(updatedList);
  //       toast.success("Added to Top");
  //   } catch (e) { 
  //       toast.error("Add failed"); 
  //   }
  // };

 const handleAddQuestion = async (type) => {
    let newQData = { 
        questionText: "New Question", type, marks: type === 'paragraph' ? 5 : 1, difficulty: 'Medium', courseId: createdExam?._id 
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
        await api.put(`/hod/exams/${createdExam._id}/questions`, { action: 'add', questionData: newQData });
        
        // 2. Fetch fresh data
        const qRes = await api.get(`/hod/exams/${createdExam._id}/questions`); 
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
    setLoading(true);
    try {
      await api.put(`/hod/exams/${createdExam._id}`, {
        scheduledAt: schedule.date || null, 
        endScheduledAt: schedule.endDate || null,
        durationMinutes: schedule.duration, 
        passingMarks: schedule.passingMarks, 
        isActive: true, 
        name: config.name 
      });
      toast.success("Schedule Saved! Optional: Design Certificate");
      setStep(4); 
    } catch (err) { toast.error("Publish failed"); }
    setLoading(false);
  };

  if (loading) {
      return (
          <div className="h-full w-full flex items-center justify-center bg-[var(--background)]">
              <div className="animate-pulse text-[var(--text-muted)] text-lg font-bold">
                  Loading Generated Exam Data...
              </div>
          </div>
      )
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-6xl bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] px-6 py-4 shadow-xl flex flex-col h-full">
        
        {/* Wizard Header */}
        <div className="mb-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">
                {step === 1 && "Create Exam"} 
                {step === 2 && "Verify Questions"} 
                {step === 3 && "Schedule & Passing Marks"}
                {step === 4 && "Optional: Certificate"}
            </h2>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${step >= i ? 'bg-[var(--primary)]' : 'bg-[var(--glass-border)]'}`} />
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative border-t border-[var(--sys-glass-border)] pt-4">
            {step === 1 && <CreateExam config={config} setConfig={setConfig} handleGenerate={handleGenerate} loading={loading} />}
            
            {step === 2 && <VerifyEdit 
                questions={questions} 
                setStep={setStep} 
                handleUpdateQuestion={handleUpdateQuestion} 
                handleOptionChange={handleOptionChange} 
                handleDeleteQuestion={handleDeleteQuestion} 
                handleAddQuestion={handleAddQuestion} 
                examName={config.name}
                setExamName={(name) => setConfig({...config, name})}
            />}
            
            {/* 🟢 FIXED: `questions={questions}` perfectly bound */}
            {step === 3 && <ScheduleExam 
                schedule={schedule} 
                setSchedule={setSchedule} 
                handlePublish={handlePublish} 
                setStep={setStep} 
                loading={loading} 
                config={config} 
                questions={questions} 
            />}
            
            {step === 4 && <DesignCertificateStep examId={createdExam?._id} examName={config.name} setStep={setStep} />}
        </div>

      </div>
    </div>
  );
};

export default CreateExamWizard;