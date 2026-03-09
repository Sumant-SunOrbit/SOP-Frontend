// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '../../utils/formatDate';
// import { FileQuestion, Lock, PlayCircle, CheckCircle2, XCircle, RefreshCw, Clock, Calendar, AlertCircle } from 'lucide-react';
// import api from '../../services/api';
// import { toast } from 'react-hot-toast';

// const MyExams = () => {
//   const navigate = useNavigate();
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('All');

//   useEffect(() => {
//     api.get('/user/my-exams')
//       .then(({ data }) => setExams(data))
//       .catch(() => toast.error("Failed to load your exams"))
//       .finally(() => setLoading(false));
//   }, []);

//   // 🟢 Filter Logic based on Active Tab
//   const filteredExams = exams.filter(exam => {
//     if (activeTab === 'All') return true;
//     if (activeTab === 'Pending') return ['Pending', 'In Progress'].includes(exam.status);
//     if (activeTab === 'Completed') return ['Passed', 'Failed'].includes(exam.status);
//     return true;
//   });

//   if (loading) {
//     return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading Your Exams...</div>;
//   }

//   // Helper to format short date times
//   const formatDateTime = (dateStr) => {
//       return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
//   };

//   return (
//     <div className="p-8 min-h-screen bg-[var(--background)] max-w-7xl mx-auto">
      
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-semibold text-[var(--text)] tracking-tight">My Exams</h1>
//         <p className="text-[var(--text-muted)] mt-1">View and take all your assigned exams here.</p>
//       </div>

//       {/* Sleek Tabs */}
//       <div className="flex flex-wrap gap-3 mb-8 border-b border-[var(--sys-glass-border)] pb-6">
//         {['All', 'Pending', 'Completed'].map(tab => (
//             <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
//                     activeTab === tab 
//                         ? 'bg-[var(--text)] text-[var(--background)] shadow-md' 
//                         : 'bg-[var(--glass-surface)] text-[var(--text-muted)] border border-[var(--sys-glass-border)] hover:border-[var(--primary)]'
//                 }`}
//             >
//                 {tab}
//             </button>
//         ))}
//       </div>

//       {/* Exam Grid */}
//       {filteredExams.length === 0 ? (
//           <div className="text-center py-20 bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] text-[var(--text-muted)]">
//               <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
//               <p>No exams found in this category.</p>
//           </div>
//       ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//               {filteredExams.map(exam => {
                  
//                   // 🟢 SCHEDULING LOGIC EVALUATION (Conditions 1 to 4)
//                   const now = new Date();
//                   const start = exam.scheduledAt ? new Date(exam.scheduledAt) : null;
//                   const end = exam.endScheduledAt ? new Date(exam.endScheduledAt) : null;
                  
//                   let isAvailable = true;
//                   let scheduleMsg = "Available Anytime";
//                   let scheduleColor = "bg-gray-100 text-gray-600 border-gray-200";

//                   if (start && end) {
//                       if (now < start) {
//                           isAvailable = false;
//                           scheduleMsg = `Starts: ${formatDateTime(start)}`;
//                           scheduleColor = "bg-blue-50 text-blue-700 border-blue-200";
//                       } else if (now > end) {
//                           isAvailable = false;
//                           scheduleMsg = `Ended: ${formatDateTime(end)}`;
//                           scheduleColor = "bg-red-50 text-red-700 border-red-200";
//                       } else {
//                           scheduleMsg = `Ends: ${formatDateTime(end)}`;
//                           scheduleColor = "bg-green-50 text-green-700 border-green-200";
//                       }
//                   } else if (start) {
//                       if (now < start) {
//                           isAvailable = false;
//                           scheduleMsg = `Starts: ${formatDateTime(start)}`;
//                           scheduleColor = "bg-blue-50 text-blue-700 border-blue-200";
//                       } else {
//                           scheduleMsg = `Started: ${formatDate(start)}`;
//                           scheduleColor = "bg-green-50 text-green-700 border-green-200";
//                       }
//                   } else if (end) {
//                       if (now > end) {
//                           isAvailable = false;
//                           scheduleMsg = `Ended: ${formatDateTime(end)}`;
//                           scheduleColor = "bg-red-50 text-red-700 border-red-200";
//                       } else {
//                           scheduleMsg = `Ends: ${formatDateTime(end)}`;
//                           scheduleColor = "bg-green-50 text-green-700 border-green-200";
//                       }
//                   }

//                   // 🟢 Determine Button State
//                   const maxAttemptsReached = exam.attemptCount >= 1; 
//                   const isLockedBySOP = exam.isLocked;
//                   const canTakeExam = isAvailable && !isLockedBySOP && (!maxAttemptsReached || exam.status === 'In Progress');

//                   let buttonText = "Start Exam";
//                   if (isLockedBySOP) buttonText = "Locked by SOP";
//                   else if (!isAvailable) buttonText = now < start ? "Not Yet Available" : "Exam Ended";
//                   else if (exam.status === 'In Progress') buttonText = "Resume Exam";
//                   else if (exam.status === 'Passed') buttonText = "Passed"; 
//                   else if (exam.status === 'Failed') buttonText = "Failed (Max Attempts)";
//                   else if (maxAttemptsReached) buttonText = "Attempted";

//                   return (
//                   <div key={exam.examId} className="bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-6 flex flex-col shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                      
//                       {/* Top Status Badge */}
//                       <div className="flex justify-between items-start mb-5">
//                           <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--sys-glass-border)]">
//                               {exam.source}
//                           </span>
                          
//                           {exam.status === 'Passed' && <CheckCircle2 className="text-green-500" size={24} />}
//                           {exam.status === 'Failed' && <XCircle className="text-red-500" size={24} />}
//                           {exam.status === 'In Progress' && <RefreshCw className="text-orange-500 animate-spin-slow" size={24} />}
//                       </div>

//                       <div className="flex-1">
//                           <h3 className="text-xl font-bold text-[var(--text)] leading-snug mb-4 pr-4">
//                               {exam.name}
//                           </h3>
                          
//                           <div className="space-y-2.5 text-sm text-[var(--text-muted)] font-medium">
                              
//                               {/* Dynamic Schedule Pill */}
//                               <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${scheduleColor}`}>
//                                   <Calendar size={14} /> {scheduleMsg}
//                               </div>

//                               <div className="flex items-center gap-4 mt-2">
//                                 <p className="flex items-center gap-1.5">
//                                     <Clock size={16} className="opacity-70" /> {exam.durationMinutes} Mins
//                                 </p>
//                                 <p className="flex items-center gap-1.5">
//                                     <FileQuestion size={16} className="opacity-70" /> {exam.totalMarks} Marks
//                                 </p>
//                               </div>
//                               <p className="flex items-center gap-2 text-xs pt-3 opacity-70 border-t border-[var(--sys-glass-border)] mt-3">
//                                   Passing Score: {exam.passingMarks} • Your Best: <span className="font-bold text-[var(--text)]">{exam.bestScore}</span>
//                               </p>
//                           </div>
//                       </div>

//                       {/* Action Button Area */}
//                       <div className="mt-6 pt-5">
//                           {isLockedBySOP ? (
//                               <div className="flex items-center gap-3 text-orange-700 bg-orange-50 p-4 rounded-[16px] border border-orange-200">
//                                   <Lock size={20} className="shrink-0" />
//                                   <div className="text-sm">
//                                       <p className="font-bold">Exam Locked</p>
//                                       <button onClick={() => navigate(`/course/${exam.courseId}`)} className="underline font-semibold text-orange-800 hover:text-orange-900 mt-0.5">
//                                           Read SOP to unlock
//                                       </button>
//                                   </div>
//                               </div>
//                           ) : (
//                               <button 
//                                   onClick={() => navigate(`/exam/${exam.examId}`)}
//                                   disabled={!canTakeExam}
//                                   className={`w-full py-3.5 rounded-full text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
//                                       !canTakeExam 
//                                       ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
//                                       : exam.status === 'In Progress'
//                                       ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
//                                       : exam.status === 'Passed'
//                                       ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
//                                       : 'text-[var(--sys-text-on-secondary)] border-transparent hover:brightness-105 active:scale-95'
//                                   }`}
//                                   style={canTakeExam && exam.status !== 'In Progress' && exam.status !== 'Passed' ? { 
//                                       background: 'var(--sys-pill-gradient)', 
//                                       boxShadow: 'var(--sys-pill-shadow)' 
//                                   } : {}}
//                               >
//                                   {canTakeExam && exam.status !== 'In Progress' && exam.status !== 'Passed' && <PlayCircle size={18} />}
//                                   {buttonText}
//                               </button>
//                           )}
//                       </div>
//                   </div>
//               )})}
//           </div>
//       )}
//     </div>
//   );
// };

// export default MyExams;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { FileQuestion, Lock, PlayCircle, CheckCircle2, XCircle, RefreshCw, Clock, Calendar, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const MyExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    api.get('/user/my-exams')
      .then(({ data }) => setExams(data))
      .catch(() => toast.error("Failed to load your exams"))
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = exams.filter(exam => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return ['Pending', 'In Progress'].includes(exam.status);
    if (activeTab === 'Completed') return ['Passed', 'Failed'].includes(exam.status);
    return true;
  });

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading Your Exams...</div>;
  }

  const formatDateTime = (dateStr) => {
      return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-8 min-h-screen bg-[var(--background)] max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text)] tracking-tight">My Exams</h1>
        <p className="text-[var(--text-muted)] mt-1">View and take all your assigned exams here.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8 border-b border-[var(--sys-glass-border)] pb-6">
        {['All', 'Pending', 'Completed'].map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab 
                        ? 'bg-[var(--text)] text-[var(--background)] shadow-md' 
                        : 'bg-[var(--glass-surface)] text-[var(--text-muted)] border border-[var(--sys-glass-border)] hover:border-[var(--primary)]'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {filteredExams.length === 0 ? (
          <div className="text-center py-20 bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] text-[var(--text-muted)]">
              <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No exams found in this category.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredExams.map(exam => {
                  
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

                  // 🟢 Determine Button State and Review Logic
                  const maxAttemptsReached = exam.attemptCount >= 1; 
                  const isLockedBySOP = exam.isLocked;
                  const canTakeExam = isAvailable && !isLockedBySOP && !maxAttemptsReached;

                  let buttonText = "Start Exam";
                  if (isLockedBySOP) buttonText = "Locked by SOP";
                  else if (!isAvailable && !maxAttemptsReached) buttonText = now < start ? "Not Yet Available" : "Exam Ended";
                  else if (maxAttemptsReached) buttonText = "Review Result"; // 🟢 Changed text for review

                  return (
                  <div key={exam.examId} className="bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-6 flex flex-col shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                      
                      <div className="flex justify-between items-start mb-5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--sys-glass-border)]">
                              {exam.source}
                          </span>
                          
                          {exam.status === 'Passed' && <CheckCircle2 className="text-green-500" size={24} />}
                          {exam.status === 'Failed' && <XCircle className="text-red-500" size={24} />}
                          {exam.status === 'In Progress' && <RefreshCw className="text-orange-500 animate-spin-slow" size={24} />}
                      </div>

                      <div className="flex-1">
                          <h3 className="text-xl font-bold text-[var(--text)] leading-snug mb-4 pr-4">
                              {exam.name}
                          </h3>
                          
                          <div className="space-y-2.5 text-sm text-[var(--text-muted)] font-medium">
                              
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${scheduleColor}`}>
                                  <Calendar size={14} /> {scheduleMsg}
                              </div>

                              <div className="flex items-center gap-4 mt-2">
                                <p className="flex items-center gap-1.5">
                                    <Clock size={16} className="opacity-70" /> {exam.durationMinutes} Mins
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <FileQuestion size={16} className="opacity-70" /> {exam.totalMarks} Marks
                                </p>
                              </div>
                              <p className="flex items-center gap-2 text-xs pt-3 opacity-70 border-t border-[var(--sys-glass-border)] mt-3">
                                  Passing Score: {exam.passingMarks} • Your Best: <span className="font-bold text-[var(--text)]">{exam.bestScore}</span>
                              </p>
                          </div>
                      </div>

                      <div className="mt-6 pt-5">
                          {isLockedBySOP ? (
                              <div className="flex items-center gap-3 text-orange-700 bg-orange-50 p-4 rounded-[16px] border border-orange-200">
                                  <Lock size={20} className="shrink-0" />
                                  <div className="text-sm">
                                      <p className="font-bold">Exam Locked</p>
                                      <button onClick={() => navigate(`/course/${exam.courseId}`)} className="underline font-semibold text-orange-800 hover:text-orange-900 mt-0.5">
                                          Read SOP to unlock
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              // 🟢 Route dynamically based on maxAttemptsReached
                              <button 
                                  onClick={() => {
                                      if (maxAttemptsReached) navigate(`/result/${exam.attemptId}`);
                                      else navigate(`/exam/${exam.examId}`);
                                  }}
                                  disabled={(!canTakeExam && !maxAttemptsReached) || isLockedBySOP}
                                  className={`w-full py-3.5 rounded-full text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                      isLockedBySOP || (!isAvailable && !maxAttemptsReached)
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                      : maxAttemptsReached 
                                      ? (exam.status === 'Passed' ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200')
                                      : 'text-[var(--sys-text-on-secondary)] border-transparent hover:brightness-105 active:scale-95'
                                  }`}
                                  style={canTakeExam ? { 
                                      background: 'var(--sys-pill-gradient)', 
                                      boxShadow: 'var(--sys-pill-shadow)' 
                                  } : {}}
                              >
                                  {canTakeExam && <PlayCircle size={18} />}
                                  {maxAttemptsReached && <FileText size={18} />}
                                  {buttonText}
                              </button>
                          )}
                      </div>
                  </div>
              )})}
          </div>
      )}
    </div>
  );
};

export default MyExams;