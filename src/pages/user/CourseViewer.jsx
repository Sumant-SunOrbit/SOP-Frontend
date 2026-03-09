import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, PlayCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/formatDate';

const AXIOS_BASE = api.defaults.baseURL || 'http://localhost:5002/api';
const SERVER_URL = AXIOS_BASE.replace(/\/api$/, '');

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePdf, setActivePdf] = useState(null);

  useEffect(() => {
    api.get(`/user/courses/${courseId}`)
      .then(({ data }) => {
          setEnrollment(data);
          if (data.courseId.sopFiles?.length > 0) setActivePdf(data.courseId.sopFiles[0]);
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleMarkComplete = async () => {
    try {
        await api.put(`/user/enrollments/${enrollment._id}/read`);
        toast.success("Materials marked as read!");
        
        const hasExams = enrollment.courseId?.linkedExams?.length > 0;
        const allExamsAttempted = enrollment.courseId?.linkedExams?.every(exam => exam.attemptCount > 0);
        
        setEnrollment(prev => ({ 
            ...prev, 
            isSopCompleted: true,
            isCourseFullyCompleted: !hasExams || allExamsAttempted
        }));
    } catch (e) { toast.error("Failed to update status"); }
  };

  const formatDateTime = (dateStr) => {
      return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  if (loading) return <div className="p-8 animate-pulse text-[var(--text-muted)] text-center">Loading Course Data...</div>;
  if (!enrollment) return <div className="p-8 text-center text-[var(--danger)]">Course not found.</div>;

  const course = enrollment.courseId;

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      
      <header className="h-16 bg-[var(--glass-surface)] border-b border-[var(--glass-border)] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-[var(--background)] rounded-full transition-colors">
                <ArrowLeft size={20} className="text-[var(--text)]" />
            </button>
            <h1 className="text-lg font-bold text-[var(--text)] tracking-tight">{course.title}</h1>
        </div>
        
        {!enrollment.isSopCompleted ? (
            <button 
                onClick={handleMarkComplete} 
                className="px-5 py-2 text-sm font-bold rounded-full transition-all flex items-center gap-2 text-[var(--sys-text-on-secondary)] hover:brightness-105 active:scale-95"
                style={{ background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' }}
            >
                <CheckCircle size={16} /> I have read all materials
            </button>
        ) : enrollment.isCourseFullyCompleted ? (
            <span className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-100/80 px-5 py-2 rounded-full border border-green-200">
                <CheckCircle size={16} /> Course Completed
            </span>
        ) : (
            <span className="flex items-center gap-2 text-sm font-bold text-yellow-700 bg-yellow-100/80 px-5 py-2 rounded-full border border-yellow-200">
                <Clock size={16} /> In Progress
            </span>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-[350px] bg-[var(--glass-surface)] border-r border-[var(--glass-border)] flex flex-col p-5 gap-8 overflow-y-auto">
            
            <div>
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Study Materials</h3>
                <div className="space-y-3">
                    {course.sopFiles?.map(file => (
                        <button 
                            key={file._id}
                            onClick={() => setActivePdf(file)}
                            className={`w-full text-left p-3.5 rounded-[16px] flex items-center gap-3 transition-colors border-2 ${
                                activePdf?._id === file._id 
                                    ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]' 
                                    : 'bg-[var(--background)] border-[var(--glass-border)] text-[var(--text)] hover:border-[var(--primary)]/30'
                            }`}
                        >
                            <FileText size={18} className="shrink-0" />
                            <span className="text-sm font-medium truncate">{file.filename}</span>
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-[var(--glass-border)]" />

            <div className={`transition-opacity duration-500 pb-10 ${enrollment.isSopCompleted ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale-[50%]'}`}>
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center justify-between">
                    Assigned Exams
                    {!enrollment.isSopCompleted && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">LOCKED</span>}
                </h3>
                
                <div className="space-y-4">
                    {course.linkedExams?.map(exam => {
                        
                        const now = new Date();
                        const start = exam.scheduledAt ? new Date(exam.scheduledAt) : null;
                        const end = exam.endScheduledAt ? new Date(exam.endScheduledAt) : null;
                        
                        let isAvailable = true;
                        let scheduleMsg = "Available Anytime";
                        let scheduleColor = "bg-gray-100 text-gray-600 border-gray-200";

                        if (start && end) {
                            if (now < start) {
                                isAvailable = false;
                                scheduleMsg = `Starts: ${formatDateTime(start)}`;
                                scheduleColor = "bg-blue-50 text-blue-700 border-blue-200";
                            } else if (now > end) {
                                isAvailable = false;
                                scheduleMsg = `Ended: ${formatDateTime(end)}`;
                                scheduleColor = "bg-red-50 text-red-700 border-red-200";
                            } else {
                                scheduleMsg = `Ends: ${formatDateTime(end)}`;
                                scheduleColor = "bg-green-50 text-green-700 border-green-200";
                            }
                        } else if (start) {
                            if (now < start) {
                                isAvailable = false;
                                scheduleMsg = `Starts: ${formatDateTime(start)}`;
                                scheduleColor = "bg-blue-50 text-blue-700 border-blue-200";
                            } else {
                                scheduleMsg = `Started: ${formatDate(start)}`;
                                scheduleColor = "bg-green-50 text-green-700 border-green-200";
                            }
                        } else if (end) {
                            if (now > end) {
                                isAvailable = false;
                                scheduleMsg = `Ended: ${formatDateTime(end)}`;
                                scheduleColor = "bg-red-50 text-red-700 border-red-200";
                            } else {
                                scheduleMsg = `Ends: ${formatDateTime(end)}`;
                                scheduleColor = "bg-green-50 text-green-700 border-green-200";
                            }
                        }

                        // 🟢 FIXED: Check attempt logic to enable the Review button
                        const maxAttemptsReached = exam.attemptCount >= 1; 
                        const canTakeExam = isAvailable && !maxAttemptsReached;

                        let buttonText = "Start Exam";
                        let buttonStyles = "text-[var(--sys-text-on-secondary)] border-transparent hover:brightness-105 active:scale-95";
                        let inlineStyles = { background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' };

                        if (!isAvailable && !maxAttemptsReached) {
                            buttonText = now < start ? "Not Yet Available" : "Exam Ended";
                            buttonStyles = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                            inlineStyles = {};
                        } else if (maxAttemptsReached) {
                            // 🟢 FIXED: Enable Review
                            buttonText = "Review Result"; 
                            buttonStyles = exam.examStatus === 'Passed' 
                                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200";
                            inlineStyles = {};
                        }

                        return (
                        <div key={exam._id} className="p-4 bg-[var(--background)] border border-[var(--glass-border)] rounded-[24px] flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                            
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-base font-bold text-[var(--text)] pr-2">{exam.name}</p>
                                    {exam.examStatus === 'Passed' && <CheckCircle size={20} className="text-green-500 shrink-0" />}
                                    {exam.examStatus === 'Failed' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
                                </div>
                                
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 mb-3 rounded text-[10px] font-bold border ${scheduleColor}`}>
                                    <Calendar size={12} /> {scheduleMsg}
                                </div>

                                <p className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Clock size={14}/> {exam.durationMinutes}m Time</span>
                                    <span>•</span>
                                    <span>{exam.totalMarks} Marks</span>
                                </p>
                                <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
                                    Attempts Used: <span className="font-bold text-[var(--text)]">{exam.attemptCount || 0} / 1</span>
                                </p>
                            </div>
                            
                            {/* 🟢 FIXED: Navigate to Review on click if maxAttemptsReached */}
                            <button 
                                onClick={() => {
                                    if (maxAttemptsReached) navigate(`/result/${exam.attemptId}`);
                                    else navigate(`/exam/${exam._id}`);
                                }}
                                disabled={!canTakeExam && !maxAttemptsReached}
                                className={`w-full py-3.5 rounded-full text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${buttonStyles}`}
                                style={inlineStyles}
                            >
                                {canTakeExam && <PlayCircle size={18} />}
                                {maxAttemptsReached && <FileText size={18} />}
                                {buttonText}
                            </button>

                        </div>
                    )})}
                </div>
            </div>

        </div>

        {/* Right Area - PDF Viewer */}
        <div className="flex-1 bg-gray-200 relative">
            {activePdf ? (
                <iframe 
                    src={`${SERVER_URL}${activePdf.url}#toolbar=0&navpanes=0&scrollbar=0`} 
                    title="PDF Viewer"
                    className="w-full h-full border-none shadow-inner"
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                    <FileText size={48} className="opacity-20 mb-4" />
                    <p className="font-medium">Select a document from the left to view</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;