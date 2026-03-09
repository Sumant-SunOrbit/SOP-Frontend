// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { Award, Download, CheckCircle, XCircle, MinusCircle, ArrowLeft, ShieldCheck, Loader } from 'lucide-react';
// import api from '../../services/api';
// import Button from '../../components/ui/Button';
// import { toast } from 'react-hot-toast';
// import { formatDate } from '../../utils/formatDate';

// const ExamResult = () => {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation(); 
  
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [downloadingCert, setDownloadingCert] = useState(false); // 🟢 NEW: Track download status

//   useEffect(() => {
//     api.get(`/user/attempts/${attemptId}`)
//       .then(({ data }) => setResult(data))
//       .catch(() => {
//           toast.error("Failed to load result.");
//           navigate('/dashboard');
//       })
//       .finally(() => setLoading(false));
//   }, [attemptId, navigate]);

//   if (loading) return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Analyzing Results...</div>;
//   if (!result) return null;

//   const exam = result.examId;
//   const questions = exam.questions || [];
//   const totalQ = questions.length;
  
//   let correct = 0;
//   let incorrect = 0;
//   let skipped = 0;

//   const attemptDetails = result.questionSet.reduce((acc, curr) => {
//       acc[curr.questionId.toString()] = curr;
//       return acc;
//   }, {});

//   questions.forEach((q) => {
//       const qAttempt = attemptDetails[q._id.toString()];
//       if (!qAttempt || qAttempt.isSkipped) skipped++;
//       else if (qAttempt.isCorrect) correct++;
//       else incorrect++;
//   });

//   const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
  
//   const timeTakenSecs = Math.floor((new Date(result.endTime) - new Date(result.startTime)) / 1000);
//   const m = Math.floor(timeTakenSecs / 60).toString().padStart(2, '0');
//   const s = (timeTakenSecs % 60).toString().padStart(2, '0');

//   // 🟢 UPDATED: Real PDF Download Logic
//   const downloadCertificate = async () => {
//       if (result.status !== 'Pass') return toast.error("Certificate only available for passing grades.");
      
//       setDownloadingCert(true);
//       toast.loading("Generating your certificate...", { id: "cert-toast" });

//       try {
//           // Tell axios we expect binary data (blob)
//           const response = await api.get(`/user/attempts/${attemptId}/certificate`, {
//               responseType: 'blob' 
//           });

//           // Extract filename from headers if possible, or fallback to default
//           const contentDisposition = response.headers['content-disposition'];
//           let filename = `${exam.name}_Certificate.pdf`;
//           if (contentDisposition) {
//               const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
//               if (filenameMatch && filenameMatch.length === 2) {
//                   filename = filenameMatch[1];
//               }
//           }

//           // Create a temporary URL for the Blob and trigger download
//           const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
//           const link = document.createElement('a');
//           link.href = url;
//           link.setAttribute('download', filename);
//           document.body.appendChild(link);
//           link.click();
          
//           // Cleanup
//           link.parentNode.removeChild(link);
//           window.URL.revokeObjectURL(url);
          
//           toast.success("Certificate Downloaded Successfully!", { id: "cert-toast" });
//       } catch (error) {
//           console.error("Download Error:", error);
//           toast.error("Failed to generate certificate. It might not be configured.", { id: "cert-toast" });
//       } finally {
//           setDownloadingCert(false);
//       }
//   };

//   return (
//     <div className="p-8 min-h-screen bg-[var(--background)] max-w-5xl mx-auto flex flex-col gap-8">
      
//       <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors w-fit font-bold text-sm">
//           <ArrowLeft size={16} /> Back to Dashboard
//       </button>

//       {/* --- TOP HEADER --- */}
//       <div>
//           <div className="flex items-center gap-3 mb-3">
//             <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${result.status === 'Pass' ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'}`}>
//                 {result.status === 'Pass' ? <CheckCircle size={14} /> : <XCircle size={14} />} 
//                 {result.status === 'Pass' ? 'Passed' : 'Failed'}
//             </span>
//           </div>
//           <h1 className="text-3xl font-black text-[var(--text)]">{exam.name}</h1>
//           <p className="text-sm text-[var(--text-muted)] mt-2 flex items-center gap-2">
//               <ShieldCheck size={16} /> {totalQ} Questions • Submitted {formatDate(result.endTime)}
//           </p>
//       </div>

//       {/* --- MAIN CARD (Certificate & Stats) --- */}
//       <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row gap-10">
          
//           {/* Left: Certificate Graphic */}
//           <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[var(--background)] rounded-[20px] border border-[var(--glass-border)]">
//               <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
//                   <Award size={48} />
//               </div>
//               <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
//                   {result.status === 'Pass' ? 'Congratulations!' : 'Keep Trying!'}
//               </h2>
//               <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
//                   {result.status === 'Pass' 
//                     ? 'You have successfully completed the exam and earned your certificate!' 
//                     : 'You did not meet the passing criteria this time. Review the material and try again.'}
//               </p>
//               <Button 
//                   onClick={downloadCertificate} 
//                   icon={downloadingCert ? Loader : Download} 
//                   disabled={result.status !== 'Pass' || downloadingCert}
//                   className={result.status === 'Pass' ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
//               >
//                   {downloadingCert ? 'Generating...' : 'Download Certificate'}
//               </Button>
//           </div>

//           {/* Right: Stats Grid */}
//           <div className="flex-[1.5] grid grid-cols-2 lg:grid-cols-4 gap-6 content-center">
              
//               <div className="flex flex-col gap-2 border-l-2 border-[var(--glass-border)] pl-4">
//                   <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Accuracy</span>
//                   <div className="flex items-center gap-3">
//                       {/* Simple CSS Donut Chart */}
//                       <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" 
//                            style={{ background: `conic-gradient(var(--primary) ${accuracy}%, var(--glass-border) ${accuracy}%)` }}>
//                           <div className="absolute inset-1 bg-[var(--glass-surface)] rounded-full"></div>
//                       </div>
//                       <span className="text-2xl font-black text-[var(--text)]">{accuracy}%</span>
//                   </div>
//               </div>

//               <div className="flex flex-col gap-2 border-l-2 border-[var(--glass-border)] pl-4">
//                   <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Score</span>
//                   <div className="flex items-end gap-1">
//                       <span className="text-3xl font-black text-[var(--success)]">{result.score}</span>
//                       <span className="text-sm font-bold text-[var(--text-muted)] mb-1">/ {exam.totalMarks || totalQ}</span>
//                   </div>
//               </div>

//               <div className="flex flex-col gap-2 border-l-2 border-[var(--glass-border)] pl-4">
//                   <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Attempts</span>
//                   <span className="text-3xl font-black text-[var(--text)]">{result.attemptNumber}</span>
//               </div>

//               <div className="flex flex-col gap-2 border-l-2 border-[var(--glass-border)] pl-4">
//                   <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Avg. Time</span>
//                   <span className="text-3xl font-black text-[var(--text)]">{m}:{s}</span>
//               </div>

//           </div>
//       </div>

//       {/* --- QUESTION PALETTE BREAKDOWN --- */}
//       <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[24px] p-8 shadow-sm">
          
//           <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-bold">
//               <div className="flex items-center gap-2 text-[var(--success)]">
//                   <div className="w-3 h-3 bg-[var(--success)] rounded-sm"></div> Correct {correct} • {accuracy}%
//               </div>
//               <div className="flex items-center gap-2 text-[var(--danger)]">
//                   <div className="w-3 h-3 bg-[var(--danger)] rounded-sm"></div> Incorrect {incorrect} • {Math.round((incorrect/totalQ)*100)}%
//               </div>
//               <div className="flex items-center gap-2 text-[var(--text-muted)]">
//                   <div className="w-3 h-3 bg-gray-300 rounded-sm"></div> Skipped {skipped} • {Math.round((skipped/totalQ)*100)}%
//               </div>
//           </div>

//           <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
//               {questions.map((q, i) => {
//                   const qAttempt = attemptDetails[q._id.toString()];
                  
//                   let bgColor = "bg-gray-100 text-gray-500 border-gray-200"; // Skipped
//                   let Icon = MinusCircle;
//                   let iconColor = "text-gray-400";

//                   if (qAttempt && !qAttempt.isSkipped) {
//                       if (qAttempt.isCorrect) {
//                           bgColor = "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
//                           Icon = CheckCircle;
//                           iconColor = "text-green-500";
//                       } else {
//                           bgColor = "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
//                           Icon = XCircle;
//                           iconColor = "text-red-500";
//                       }
//                   }

//                   return (
//                       <div key={q._id} className={`relative flex items-center justify-center aspect-square rounded-xl border-2 text-lg font-black cursor-pointer transition-colors ${bgColor}`}>
//                           {i + 1}
//                           <div className="absolute -top-2 -right-2 bg-white rounded-full">
//                               <Icon size={16} className={`fill-current ${iconColor} bg-white rounded-full`} />
//                           </div>
//                       </div>
//                   );
//               })}
//           </div>
//       </div>

//     </div>
//   );
// };

// export default ExamResult;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Minus, ArrowLeft, Clock, Award, Download } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast'; // Import for notifications

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false); // 🟢 NEW: Track download state
  const [selectedQIdx, setSelectedQIdx] = useState(0);

  useEffect(() => {
    api.get(`/user/attempts/${attemptId}`)
      .then(({ data }) => setResultData(data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  // 🟢 NEW: Function to handle certificate download
  const handleDownloadCertificate = async () => {
      setDownloading(true);
      const toastId = toast.loading("Generating your certificate...");
      
      try {
          const response = await api.get(`/user/attempts/${attemptId}/certificate`, {
              responseType: 'blob' // Essential for handling binary file data
          });
          
          // Create a temporary URL for the downloaded blob and trigger a click
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${resultData.examId.name}_Certificate.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          
          toast.success("Certificate downloaded successfully!", { id: toastId });
      } catch (error) {
          toast.error("Certificate not configured or available for this exam.", { id: toastId });
      } finally {
          setDownloading(false);
      }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading Result...</div>;
  if (!resultData || !resultData.examId) return <div className="p-10 text-center text-red-500">Result not found.</div>;

  const exam = resultData.examId;
  const questions = exam.questions || [];
  const attempt = resultData;
  const questionSet = attempt.questionSet || [];

  // --- Calculations ---
  const totalQ = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  questionSet.forEach(q => {
      if (q.isSkipped) skippedCount++;
      else if (q.isCorrect) correctCount++;
      else incorrectCount++;
  });

  const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
  const avgTimeSecs = totalQ > 0 ? Math.round((attempt.timeTakenSeconds || 0) / totalQ) : 0;
  
  const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getQuestionStatus = (qId) => {
      const ans = questionSet.find(a => String(a.questionId) === String(qId));
      if (!ans || ans.isSkipped) return 'skipped';
      return ans.isCorrect ? 'correct' : 'incorrect';
  };

  const selectedQuestion = questions[selectedQIdx];
  const selectedStatus = getQuestionStatus(selectedQuestion?._id);
  const selectedUserAnswers = questionSet.find(a => String(a.questionId) === String(selectedQuestion?._id))?.userSelectedOptions || [];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 🟢 FIXED: Top Header Row with dynamic Certificate Download Button */}
        <div className="flex justify-between items-center mb-2">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {attempt.status === 'Pass' && (
                <button 
                    onClick={handleDownloadCertificate}
                    disabled={downloading}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-[#c2912d] hover:bg-[#a67c25] px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                    <Download size={16} />
                    {downloading ? 'Downloading...' : 'Download Certificate'}
                </button>
            )}
        </div>

        {/* TOP CARD: Summary Stats */}
        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border border-gray-100">
            <div className="flex-1">
                {/* 🟢 FIXED: Dynamic Pass/Fail Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${
                    attempt.status === 'Pass' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                    {attempt.status === 'Pass' ? <Check size={14} /> : <X size={14} />} 
                    {attempt.status === 'Pass' ? 'Passed' : 'Failed'}
                </div>
                
                <h1 className="text-2xl font-black text-gray-900 mb-2">{exam.name}</h1>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-8">
                    <span className="flex items-center gap-1"><FileQuestionIcon size={14}/> {totalQ} Questions</span>
                    <span>•</span>
                    <span>Started Date {new Date(attempt.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>

                <div className="flex flex-wrap gap-8 items-center">
                    {/* Accuracy Donut */}
                    <div className="flex flex-col items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accuracy</span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#F59E0B ${accuracy}%, #F3F4F6 0)` }}>
                                <div className="w-7 h-7 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xl font-black text-gray-900">{accuracy}%</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                    {/* Course Completion Donut */}
                    <div className="flex flex-col items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#10B981 100%, #F3F4F6 0)` }}>
                                <div className="w-7 h-7 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xl font-black text-gray-900">100%</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                    {/* Attempts */}
                    <div className="flex flex-col items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attempts</span>
                        <span className="text-xl font-black text-gray-900 pl-1">{attempt.attemptNumber}</span>
                    </div>
                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

                    {/* Avg Time */}
                    <div className="flex flex-col items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Time / Qs</span>
                        <span className="text-xl font-black text-gray-900 pl-1">{formatTime(avgTimeSecs)}</span>
                    </div>
                </div>
            </div>

            {/* Right Side Graphic */}
            <div className={`w-full md:w-64 aspect-video rounded-2xl border flex items-center justify-center overflow-hidden relative ${
                attempt.status === 'Pass' ? 'bg-green-50 border-green-100 text-green-300' : 'bg-red-50 border-red-100 text-red-300'
            }`}>
                <div className={`absolute inset-0 bg-gradient-to-tr to-transparent ${attempt.status === 'Pass' ? 'from-green-100' : 'from-red-100'}`}></div>
                <Award size={64} className="relative z-10" />
            </div>
        </div>

        {/* MIDDLE CARD: Question Palette & Review Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            
            {/* Palette Grid */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 mb-8">
                {questions.map((q, i) => {
                    const status = getQuestionStatus(q._id);
                    const isSelected = selectedQIdx === i;
                    
                    let badgeColor = "bg-gray-400";
                    let Icon = Minus;
                    if (status === 'correct') { badgeColor = "bg-[#10B981]"; Icon = Check; }
                    else if (status === 'incorrect') { badgeColor = "bg-[#EF4444]"; Icon = X; }

                    return (
                        <button 
                            key={i}
                            onClick={() => setSelectedQIdx(i)}
                            className={`relative w-12 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                                isSelected ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {i + 1}
                            <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-sm flex items-center justify-center text-white shadow-sm ${badgeColor}`}>
                                <Icon size={10} strokeWidth={4} />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-600 mb-10 pb-8 border-b border-gray-100">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#10B981]"></div> Correct <span className="opacity-50 font-medium pl-1">{correctCount} Qs</span></span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#EF4444]"></div> Incorrect <span className="opacity-50 font-medium pl-1">{incorrectCount} Qs</span></span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gray-400"></div> Skipped <span className="opacity-50 font-medium pl-1">{skippedCount} Qs</span></span>
            </div>

            {/* Detail Section */}
            {selectedQuestion && (
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-6 md:p-8 relative">
                    
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                        <span className="font-black text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                            <span className="w-4 h-4 bg-gray-900 text-white rounded-sm flex items-center justify-center text-[10px]">?</span>
                            Question {selectedQIdx + 1}
                        </span>

                        <span className={`font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                            selectedStatus === 'correct' ? 'bg-green-100 text-green-700 border border-green-200' :
                            selectedStatus === 'incorrect' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-gray-200 text-gray-700 border border-gray-300'
                        }`}>
                            {selectedStatus === 'correct' && <Check size={16} />}
                            {selectedStatus === 'incorrect' && <X size={16} />}
                            {selectedStatus === 'skipped' && <Minus size={16} />}
                            <span className="capitalize">{selectedStatus}</span>
                        </span>

                        <span className="ml-auto text-gray-500 font-semibold border border-gray-200 bg-white px-3 py-1.5 rounded-lg capitalize">
                            {selectedQuestion.type.replace('_', ' ')}
                        </span>
                        
                     
<span className="text-gray-500 font-semibold flex items-center gap-1.5">
    <Clock size={16} /> 
    {formatTime(questionSet.find(a => String(a.questionId) === String(selectedQuestion?._id))?.timeSpentSeconds || 0)}
</span>
                        <span className="text-yellow-600 font-bold flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            <Award size={16} /> {selectedQuestion.marks} Point{selectedQuestion.marks > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-xl font-bold text-gray-900 mb-6">{selectedQuestion.questionText}</h3>

                    {/* Options/Answers Review */}
                    <div className="space-y-3">
                        {selectedQuestion.type === 'paragraph' ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Answer</p>
                                    <div className={`p-4 rounded-xl border ${selectedUserAnswers[0] ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200 text-red-500 italic'}`}>
                                        {selectedUserAnswers[0] || "Skipped (No answer provided)"}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Model Answer / AI Reference</p>
                                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                                        {selectedQuestion.correctAnswerText || "No model answer provided."}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            selectedQuestion.options.map((opt, i) => {
                                const isUserChoice = selectedUserAnswers.includes(opt.text);
                                const isCorrectAnswer = opt.isCorrect;

                                let optionStyle = "bg-white border-gray-200 text-gray-700"; // Default
                                let IconToRender = null;

                                if (isCorrectAnswer && isUserChoice) {
                                    optionStyle = "bg-green-50 border-green-500 text-green-800 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]";
                                    IconToRender = <Check size={20} className="text-green-500" />;
                                } else if (isUserChoice && !isCorrectAnswer) {
                                    optionStyle = "bg-red-50 border-red-500 text-red-800 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]";
                                    IconToRender = <X size={20} className="text-red-500" />;
                                } else if (isCorrectAnswer && !isUserChoice) {
                                    optionStyle = "bg-white border-green-500 text-green-700 border-[2px] border-dashed";
                                    IconToRender = <Check size={20} className="text-green-500 opacity-50" />;
                                }

                                return (
                                    <div key={i} className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${optionStyle}`}>
                                        <span className="font-semibold">{opt.text}</span>
                                        {IconToRender && <div className="shrink-0">{IconToRender}</div>}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

// SVG helper for the tiny icon in the meta row
const FileQuestionIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="10" cy="13" r="2" />
        <path d="m11.4 14.4 3.6 3.6" />
    </svg>
);

export default ExamResult;