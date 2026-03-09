// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Sun, Bell, User as UserIcon, AlertTriangle, Loader, ShieldAlert, PlayCircle, Maximize, WifiOff, UploadCloud, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from '../../services/api';

// const TestEngine = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
  
//   const [exam, setExam] = useState(null);
//   const [attemptId, setAttemptId] = useState(null);
//   const [currentIdx, setCurrentIdx] = useState(0);
//   const [answers, setAnswers] = useState({}); 
//   const [reviewMarked, setReviewMarked] = useState(new Set()); 
//   const [timeLeft, setTimeLeft] = useState(0); 
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [disruptionWarnings, setDisruptionWarnings] = useState(0);
  
//   const [hasStarted, setHasStarted] = useState(false);
//   const [cameraActive, setCameraActive] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(true); 

//   const [isOffline, setIsOffline] = useState(!navigator.onLine);
//   const [isWaitingToSubmit, setIsWaitingToSubmit] = useState(false);

//   const videoRef = useRef(null);
//   const mediaStreamRef = useRef(null); // 🟢 FIX: Keep a persistent reference to the camera stream
//   const answersRef = useRef({}); 
//   const lastDisruptionTime = useRef(0);
  
//   const isWaitingToSubmitRef = useRef(false);
//   const submitReasonRef = useRef("Manual");

//   useEffect(() => {
//       answersRef.current = answers;
//   }, [answers]);

//   // --- 0. OFFLINE / ONLINE DETECTOR ---
//   useEffect(() => {
//       const handleOffline = () => {
//           setIsOffline(true);
//           toast.error("Internet connection lost. You can continue, but do not close the tab.", { duration: 5000 });
//       };

//       const handleOnline = () => {
//           setIsOffline(false);
//           toast.success("Internet connection restored!");
          
//           if (isWaitingToSubmitRef.current) {
//               forceSubmit(submitReasonRef.current);
//           }
//       };

//       window.addEventListener('offline', handleOffline);
//       window.addEventListener('online', handleOnline);

//       return () => {
//           window.removeEventListener('offline', handleOffline);
//           window.removeEventListener('online', handleOnline);
//       };
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // --- 1. INITIALIZATION & RESUME LOGIC ---
//   useEffect(() => {
//     const fetchExamData = async () => {
//         try {
//             const { data } = await api.get(`/user/exams/${examId}/start`);
//             setExam(data);
//             setAttemptId(data.attemptId);
//             setTimeLeft(data.timeLeftSeconds);

//             if (data.existingAnswers && data.existingAnswers.length > 0) {
//                 const restored = {};
//                 data.existingAnswers.forEach(ans => {
//                     restored[ans.questionId] = ans.userSelectedOptions;
//                 });
//                 setAnswers(restored);
//             }
//         } catch (e) {
//             toast.error(e.response?.data?.message || "Failed to load exam");
//             navigate('/dashboard');
//         }
//     };
//     fetchExamData();

//     // 🟢 Initialize Camera and save stream to mediaStreamRef
//     navigator.mediaDevices.getUserMedia({ video: true })
//         .then(stream => { 
//             setCameraActive(true);
//             mediaStreamRef.current = stream; // Save stream globally
//             if (videoRef.current) {
//                 videoRef.current.srcObject = stream; 
//             }
//         })
//         .catch(() => toast.error("Camera access is strictly required for proctoring!", { duration: 5000 }));

//     return () => {
//         stopCamera();
//         if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
//     };
//   }, [examId, navigate]);

//   // 🟢 FIX: Re-attach the video stream to the new video element when the screen switches
//   useEffect(() => {
//       if (hasStarted && videoRef.current && mediaStreamRef.current) {
//           videoRef.current.srcObject = mediaStreamRef.current;
//       }
//   }, [hasStarted]);

//   // 🟢 Helper to explicitly stop camera tracks
//   const stopCamera = () => {
//     if (mediaStreamRef.current) {
//         const tracks = mediaStreamRef.current.getTracks();
//         tracks.forEach(track => track.stop());
//         mediaStreamRef.current = null;
//     }
//     if (videoRef.current) {
//         videoRef.current.srcObject = null;
//     }
//   };

//   // --- 2. USER-INITIATED START ---
//   const handleUserStart = async () => {
//       if (!cameraActive) {
//           toast.error("Please allow camera access to start the exam.");
//           return;
//       }
//       if (!exam || !exam.questions || exam.questions.length === 0) {
//           toast.error("This exam has no questions. Please contact your HOD.");
//           return;
//       }
      
//       try {
//           if (document.documentElement.requestFullscreen) {
//               await document.documentElement.requestFullscreen();
//           } else if (document.documentElement.webkitRequestFullscreen) {
//               await document.documentElement.webkitRequestFullscreen();
//           }
//           setIsFullscreen(true);
//       } catch (e) {
//           console.warn("Fullscreen blocked by browser, but continuing anyway.");
//       }
      
//       setHasStarted(true); 
//   };

//   const returnToFullscreen = async () => {
//       try {
//           if (document.documentElement.requestFullscreen) {
//               await document.documentElement.requestFullscreen();
//           } else if (document.documentElement.webkitRequestFullscreen) {
//               await document.documentElement.webkitRequestFullscreen();
//           }
//           setIsFullscreen(true);
//       } catch (e) {
//           toast.error("Failed to enter fullscreen. Please try again.");
//       }
//   };

//   // --- 3. SUBMISSION ---
//   const forceSubmit = async (reason = "Manual") => {
//       if (isSubmitting) return; 

//       if (!navigator.onLine) {
//           isWaitingToSubmitRef.current = true;
//           submitReasonRef.current = reason;
//           setIsWaitingToSubmit(true);
//           toast.error("You are offline. Please reconnect to internet to submit.");
//           return; 
//       }

//       setIsSubmitting(true);
//       setIsWaitingToSubmit(false);

//       try {
//         const { data } = await api.post(`/user/attempts/${attemptId}/submit`, { 
//             finalAnswers: answersRef.current,
//             isAutoSubmit: reason !== "Manual" && reason !== "User Completed",
//             reason
//         });
        
//         // 🟢 Stop camera explicitly before navigating away
//         stopCamera();
        
//         if (document.fullscreenElement) await document.exitFullscreen().catch(()=>{});
//         navigate(`/result/${data.attemptId}`, { replace: true }); 
//       } catch (e) {
//         toast.error("Submission failed. Progress was saved locally.");
//         setIsSubmitting(false);
//       }
//   };

//   const handleManualSubmit = () => {
//     if (window.confirm("Are you sure you want to finish and submit the exam?")) {
//         forceSubmit("User Completed");
//     }
//   };

//   // --- 4. DISRUPTION TRACKING ---
//   useEffect(() => {
//       if (!hasStarted) return;

//       const handleDisruption = () => {
//           const now = Date.now();
//           if (now - lastDisruptionTime.current < 1500) return; 
          
//           const isCurrentlyFullscreen = !!document.fullscreenElement;
//           const isTabHidden = document.hidden;
          
//           setIsFullscreen(isCurrentlyFullscreen);

//           let reason = "";
//           if (!isCurrentlyFullscreen) reason = "Not enabling full screen.";
//           if (isTabHidden) reason = "Switched browser tabs.";

//           if (!isCurrentlyFullscreen || isTabHidden) {
//               lastDisruptionTime.current = now;

//               setDisruptionWarnings(prev => {
//                   const newWarn = prev + 1;
                  
//                   if (newWarn > 2) { 
//                       toast.error("Exam terminated due to multiple disruptions.");
//                       forceSubmit(reason); 
//                   } else {
//                       toast.error(`Warning ${newWarn}/2: ${reason} Rule violated!`, { duration: 5000 });
//                   }
//                   return newWarn;
//               });
//           }
//       };

//       document.addEventListener('fullscreenchange', handleDisruption);
//       document.addEventListener('visibilitychange', handleDisruption);

//       return () => {
//           document.removeEventListener('fullscreenchange', handleDisruption);
//           document.removeEventListener('visibilitychange', handleDisruption);
//       };
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hasStarted, attemptId]); 


//   // --- 5. TIMER LOGIC ---
//   useEffect(() => {
//     if (!hasStarted || !isFullscreen || isWaitingToSubmit) return; 
    
//     if (!exam || timeLeft <= 0) {
//         if (exam && timeLeft <= 0 && !isSubmitting) {
//             forceSubmit("Timeout");
//         }
//         return;
//     }
//     const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
//     return () => clearInterval(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hasStarted, isFullscreen, exam, timeLeft, isSubmitting, isWaitingToSubmit]);


//   // --- 6. AUTO-SAVE & NAVIGATION ACTIONS ---
//   const triggerAutoSave = async (qId, updatedAnswers) => {
//       if (!attemptId || isOffline) return; 
//       try {
//           await api.put(`/user/attempts/${attemptId}/save`, {
//               questionId: qId,
//               answers: updatedAnswers,
//               timeLeftSeconds: timeLeft
//           });
//       } catch (e) { console.error("Auto-save failed", e); }
//   };

//   const handleOptionSelect = (qId, optionText, type) => {
//     setAnswers(prev => {
//         let updatedAns = [];
//         if (type === 'multiple') {
//             const currentAns = prev[qId] || [];
//             if (currentAns.includes(optionText)) updatedAns = currentAns.filter(t => t !== optionText);
//             else updatedAns = [...currentAns, optionText];
//         } else {
//             updatedAns = [optionText]; 
//         }
//         triggerAutoSave(qId, updatedAns);
//         return { ...prev, [qId]: updatedAns };
//     });
//   };

//   const toggleReviewMark = (qId) => {
//       setReviewMarked(prev => {
//           const newSet = new Set(prev);
//           if (newSet.has(qId)) newSet.delete(qId);
//           else newSet.add(qId);
//           return newSet;
//       });
//   };

//   const handleNavigation = (direction) => {
//       if (exam && exam.questions[currentIdx]) {
//           const qId = exam.questions[currentIdx]._id;
//           triggerAutoSave(qId, answers[qId] || []);
//       }
//       if (direction === 'next' && currentIdx < exam.questions.length - 1) setCurrentIdx(i => i + 1);
//       if (direction === 'prev' && currentIdx > 0) setCurrentIdx(i => i - 1);
//   };



//   // ============================================================
//   // RENDER: PRE-START GATEWAY
//   // ============================================================
//   if (!hasStarted) {
//       return (
//           <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] p-6 text-center select-none relative">
              
//               <div className="absolute top-6 left-6 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-gray-300 shadow-md flex items-center justify-center">
//                  {!cameraActive && <Camera className="text-gray-500 w-8 h-8 animate-pulse" />}
//                  <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive ? 'hidden' : ''}`} />
//               </div>

//               {!exam ? (
//                   <Loader className="animate-spin text-blue-500 w-12 h-12 mb-4"/>
//               ) : (
//                   <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-200 max-w-lg w-full animate-in zoom-in-95 duration-300">
//                       <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
//                           <ShieldAlert size={40} />
//                       </div>
//                       <h1 className="text-3xl font-black text-gray-900 mb-2">{exam.name}</h1>
//                       <p className="text-gray-500 font-medium mb-8">
//                           Duration: {exam.durationMinutes} Minutes • {exam.questions.length} Questions
//                       </p>
                      
//                       <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left mb-8">
//                           <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
//                               <AlertTriangle size={18} /> Important Rules
//                           </h4>
//                           <ul className="text-sm text-orange-700 space-y-2 list-disc pl-5 font-medium">
//                               <li>This exam requires <b>Fullscreen Mode</b>.</li>
//                               <li>Your camera light will remain on for security.</li>
//                               <li>Leaving fullscreen or switching tabs will result in automatic submission.</li>
//                           </ul>
//                       </div>

//                       <button 
//                           onClick={handleUserStart}
//                           disabled={!cameraActive || exam.questions.length === 0}
//                           className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-3"
//                       >
//                           {cameraActive ? <PlayCircle size={24} /> : <Loader className="animate-spin" size={24} />}
//                           {exam.questions.length === 0 ? "No Questions Found" : cameraActive ? "I Agree, Start Exam" : "Waiting for Camera..."}
//                       </button>
//                       <button onClick={() => navigate('/dashboard')} className="mt-4 text-gray-500 font-bold hover:text-gray-800 text-sm">Cancel & Go Back</button>
//                   </div>
//               )}
//           </div>
//       );
//   }

//   // ============================================================
//   // RENDER: OFFLINE SUBMIT LOCK
//   // ============================================================
//   if (isWaitingToSubmit) {
//       return (
//           <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center animate-in fade-in duration-200">
//               <UploadCloud size={80} className="text-orange-500 mb-6 animate-pulse" />
//               <h2 className="text-4xl font-black mb-4">Waiting for Connection...</h2>
//               <p className="text-lg text-gray-300 max-w-lg mb-8">
//                   Your exam has ended, but you are currently offline. <br/><br/>
//                   All your answers are safely stored. <b>Do not close this tab!</b> Connect to the internet, and your exam will submit automatically.
//               </p>
//               <div className="flex items-center gap-3 text-orange-400 font-bold bg-orange-500/10 px-6 py-3 rounded-full border border-orange-500/20">
//                   <Loader className="animate-spin" size={20} /> Looking for internet...
//               </div>
//           </div>
//       );
//   }

//   // ============================================================
//   // RENDER: FULLSCREEN LOCK OVERLAY
//   // ============================================================
//   if (hasStarted && !isFullscreen && !isSubmitting) {
//       return (
//           <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center animate-in fade-in duration-200">
//               <AlertTriangle size={80} className="text-red-500 mb-6" />
//               <h2 className="text-4xl font-black mb-4">Exam Paused</h2>
//               <p className="text-lg text-gray-300 max-w-lg mb-8">
//                   You have left fullscreen mode or switched tabs, which violates the exam rules. <br/><br/>
//                   <span className="text-red-400 font-bold">Warning {disruptionWarnings} of 2.</span> <br/>
//                   If you exceed 2 warnings, your exam will automatically submit.
//               </p>
//               <button 
//                   onClick={returnToFullscreen}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-colors shadow-lg"
//               >
//                   <Maximize size={24} />
//                   Return to Fullscreen
//               </button>
//           </div>
//       );
//   }

//   // ============================================================
//   // RENDER: EXAM ENGINE
//   // ============================================================
//   const question = exam?.questions ? exam.questions[currentIdx] : null;
//   const qId = question?._id;
  
//   if (!question) {
//       return (
//           <div className="flex flex-col items-center justify-center h-screen bg-[#F9FAFB]">
//               <AlertTriangle className="text-red-500 mb-4" size={48} />
//               <h2 className="text-xl font-bold">Error Loading Question</h2>
//               <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 underline">Return to Dashboard</button>
//           </div>
//       );
//   }
  
//   const formatTime = (secs) => {
//       const h = Math.floor(secs / 3600);
//       const m = Math.floor((secs % 3600) / 60);
//       const s = secs % 60;
//       return { h, m, s };
//   };
//   const timeObj = formatTime(timeLeft);

//   return (
//     <div className="flex flex-col h-screen bg-[#F9FAFB] select-none relative">
      
//       {/* 🟢 FLOATING CAMERA FEED (Active Exam) */}
//       <div className="absolute top-4 left-4 z-40 w-36 h-28 bg-black rounded-xl overflow-hidden border-[3px] border-white shadow-xl pointer-events-none">
//           <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
//           <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
//               <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> REC
//           </div>
//       </div>

//       {/* OFFLINE BANNER */}
//       {isOffline && (
//           <div className="bg-red-500 text-white text-center py-2 text-sm font-bold flex justify-center items-center gap-2 shadow-md z-50">
//               <WifiOff size={16} /> No Internet Connection. You can continue answering. Do not close this tab.
//           </div>
//       )}

//       {/* TOP BAR */}
//       <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 pl-48 shrink-0 shadow-sm">
//         <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold border border-yellow-200">
//                 <span className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></span>
//                 In Progress
//             </div>
//             <h1 className="text-xl font-bold text-gray-900">{exam.name}</h1>
//         </div>
        
//         <div className="flex items-center gap-4">
//             {disruptionWarnings > 0 && (
//                 <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-200">
//                     <AlertTriangle size={14}/> Warnings: {disruptionWarnings}/2
//                 </span>
//             )}
//             <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
//                 <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center"><UserIcon size={20} className="text-gray-500"/></div>
//                 <div>
//                     <p className="text-sm font-bold text-gray-900 leading-tight">Student</p>
//                 </div>
//             </div>
//         </div>
//       </header>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex overflow-hidden">
        
//         {/* Left Area (Question) */}
//         <div className="flex-1 flex flex-col p-10 overflow-y-auto">
//             <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                
//                 <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
//                     <h2 className="text-2xl font-black text-gray-900">Question {currentIdx + 1}</h2>
//                     <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
//                         {currentIdx + 1} of {exam.questions.length}
//                     </span>
//                 </div>

//                 <h3 className="text-xl font-bold text-gray-800 leading-relaxed mb-8">
//                     {question.questionText}
//                 </h3>

//                 <div className="space-y-4 flex-1">
//                     {question.type === 'paragraph' ? (
//                         <textarea 
//                             className="w-full h-48 p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 focus:border-blue-500 outline-none resize-none font-medium transition-colors"
//                             placeholder="Type your answer here... (Auto-saves as you type)"
//                             value={(answers[qId] && answers[qId][0]) || ''}
//                             onChange={(e) => {
//                                 setAnswers(prev => ({...prev, [qId]: [e.target.value]}));
//                                 triggerAutoSave(qId, [e.target.value]);
//                             }}
//                         />
//                     ) : (
//                         question.options.map((opt, i) => {
//                             const isSelected = (answers[qId] || []).includes(opt.text);
//                             return (
//                                 <button 
//                                     key={i}
//                                     onClick={() => handleOptionSelect(qId, opt.text, question.type)}
//                                     className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
//                                         isSelected 
//                                         ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' 
//                                         : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     <span className="font-semibold text-base">{opt.text}</span>
//                                 </button>
//                             )
//                         })
//                     )}
//                 </div>

//                 <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-200">
//                     <button 
//                         onClick={() => toggleReviewMark(qId)}
//                         className={`text-sm font-bold px-6 py-3 rounded-xl border-2 transition-colors ${
//                             reviewMarked.has(qId) 
//                             ? 'border-orange-500 text-orange-600 bg-orange-50' 
//                             : 'border-gray-200 text-gray-600 hover:bg-gray-100'
//                         }`}
//                     >
//                         {reviewMarked.has(qId) ? 'Unmark Review' : 'Mark for Review'}
//                     </button>
                    
//                     <div className="flex gap-3">
//                         <button 
//                             disabled={currentIdx === 0}
//                             onClick={() => handleNavigation('prev')}
//                             className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
//                         >
//                             Previous
//                         </button>
                        
//                         {currentIdx === exam.questions.length - 1 ? (
//                              <button 
//                                 onClick={handleManualSubmit}
//                                 disabled={isSubmitting || isWaitingToSubmit}
//                                 className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-colors flex items-center gap-2 disabled:bg-gray-400"
//                             >
//                                 {(isSubmitting || isWaitingToSubmit) && <Loader className="animate-spin w-4 h-4" />}
//                                 Submit Exam
//                             </button>
//                         ) : (
//                             <button 
//                                 onClick={() => handleNavigation('next')}
//                                 className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
//                             >
//                                 Next Question
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>

//         {/* Right Sidebar (Timer & Palette) */}
//         <div className="w-[360px] bg-white border-l border-gray-200 flex flex-col p-6 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
//             <div className="mb-10">
//                 <h4 className="text-sm font-bold text-gray-500 mb-4 tracking-wide uppercase">Remaining Time</h4>
//                 <div className="flex justify-between gap-3">
//                     {Object.entries(timeObj).map(([unit, val], i) => (
//                         <div key={i} className="flex-1 flex flex-col items-center">
//                             <div className="w-full aspect-square bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl font-black text-yellow-700 border border-yellow-200 shadow-sm">
//                                 {String(val).padStart(2, '0')}
//                             </div>
//                             <span className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">{unit === 'h' ? 'Hrs' : unit === 'm' ? 'Min' : 'Sec'}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <hr className="border-gray-200 mb-8" />

//             <div className="flex-1 flex flex-col min-h-0">
//                 <h4 className="text-sm font-bold text-gray-500 mb-4 tracking-wide uppercase">Question Palette</h4>
//                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
//                     <div className="grid grid-cols-5 gap-3">
//                         {exam.questions.map((q, i) => {
//                             const isAnswered = answers[q._id] && answers[q._id].length > 0;
//                             const isReview = reviewMarked.has(q._id);
                            
//                             let bgColor = "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"; 
//                             if (isReview) bgColor = "bg-red-300 border-red-400 text-red-900"; 
//                             else if (isAnswered) bgColor = "bg-green-300 border-green-400 text-green-900"; 
                            
//                             if (currentIdx === i) bgColor += " ring-4 ring-blue-500/30"; 

//                             return (
//                                 <button key={q._id} onClick={() => { handleNavigation('next'); setCurrentIdx(i); }} className={`aspect-square rounded-full border-2 text-sm font-black transition-all ${bgColor}`}>
//                                     {i + 1}
//                                 </button>
//                             );
//                         })}
//                     </div>
//                 </div>
                
//                 {/* Palette Legend */}
//                 <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs font-bold text-gray-500">
//                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-300 border border-green-400"></div> Answered</div>
//                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div> Not Answered</div>
//                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-300 border border-red-400"></div> Marked Review</div>
//                 </div>
//             </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default TestEngine;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sun, Bell, User as UserIcon, AlertTriangle, Loader, ShieldAlert, PlayCircle, Maximize, WifiOff, UploadCloud, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const TestEngine = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [reviewMarked, setReviewMarked] = useState(new Set()); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disruptionWarnings, setDisruptionWarnings] = useState(0);
  
  // 🟢 NEW: State to track time spent per question
  const [questionTimeTracker, setQuestionTimeTracker] = useState({});
  
  const [hasStarted, setHasStarted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); 

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isWaitingToSubmit, setIsWaitingToSubmit] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null); 
  const answersRef = useRef({}); 
  const timeTrackerRef = useRef({}); // 🟢 Store ref for submit function
  const lastDisruptionTime = useRef(0);
  
  const isWaitingToSubmitRef = useRef(false);
  const submitReasonRef = useRef("Manual");

  useEffect(() => {
      answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
      timeTrackerRef.current = questionTimeTracker;
  }, [questionTimeTracker]);

  // --- 0. OFFLINE / ONLINE DETECTOR ---
  useEffect(() => {
      const handleOffline = () => {
          setIsOffline(true);
          toast.error("Internet connection lost. You can continue, but do not close the tab.", { duration: 5000 });
      };

      const handleOnline = () => {
          setIsOffline(false);
          toast.success("Internet connection restored!");
          
          if (isWaitingToSubmitRef.current) {
              forceSubmit(submitReasonRef.current);
          }
      };

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      return () => {
          window.removeEventListener('offline', handleOffline);
          window.removeEventListener('online', handleOnline);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 1. INITIALIZATION & RESUME LOGIC ---
  useEffect(() => {
    const fetchExamData = async () => {
        try {
            const { data } = await api.get(`/user/exams/${examId}/start`);
            setExam(data);
            setAttemptId(data.attemptId);
            setTimeLeft(data.timeLeftSeconds);

            if (data.existingAnswers && data.existingAnswers.length > 0) {
                const restoredAnswers = {};
                const restoredTimes = {};
                
                data.existingAnswers.forEach(ans => {
                    restoredAnswers[ans.questionId] = ans.userSelectedOptions;
                    restoredTimes[ans.questionId] = ans.timeSpentSeconds || 0; // 🟢 Restore previous time spent
                });
                
                setAnswers(restoredAnswers);
                setQuestionTimeTracker(restoredTimes);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to load exam");
            navigate('/dashboard');
        }
    };
    fetchExamData();

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { 
            setCameraActive(true);
            mediaStreamRef.current = stream; 
            if (videoRef.current) {
                videoRef.current.srcObject = stream; 
            }
        })
        .catch(() => toast.error("Camera access is strictly required for proctoring!", { duration: 5000 }));

    return () => {
        stopCamera();
        if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    };
  }, [examId, navigate]);

  useEffect(() => {
      if (hasStarted && isFullscreen && videoRef.current && mediaStreamRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
      }
  }, [hasStarted, isFullscreen]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
        const tracks = mediaStreamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  };

  // --- 2. USER-INITIATED START ---
  const handleUserStart = async () => {
      if (!cameraActive) {
          toast.error("Please allow camera access to start the exam.");
          return;
      }
      if (!exam || !exam.questions || exam.questions.length === 0) {
          toast.error("This exam has no questions. Please contact your HOD.");
          return;
      }
      
      try {
          if (document.documentElement.requestFullscreen) {
              await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
              await document.documentElement.webkitRequestFullscreen();
          }
          setIsFullscreen(true);
      } catch (e) {
          console.warn("Fullscreen blocked by browser, but continuing anyway.");
      }
      
      setHasStarted(true); 
  };

  const returnToFullscreen = async () => {
      try {
          if (document.documentElement.requestFullscreen) {
              await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
              await document.documentElement.webkitRequestFullscreen();
          }
          setIsFullscreen(true);
      } catch (e) {
          toast.error("Failed to enter fullscreen. Please try again.");
      }
  };

  // --- 3. SUBMISSION ---
  const forceSubmit = async (reason = "Manual") => {
      if (isSubmitting) return; 

      if (!navigator.onLine) {
          isWaitingToSubmitRef.current = true;
          submitReasonRef.current = reason;
          setIsWaitingToSubmit(true);
          toast.error("You are offline. Please reconnect to internet to submit.");
          return; 
      }

      setIsSubmitting(true);
      setIsWaitingToSubmit(false);

      try {
        const { data } = await api.post(`/user/attempts/${attemptId}/submit`, { 
            finalAnswers: answersRef.current,
            timeSpentMap: timeTrackerRef.current, // 🟢 Send the mapped time to the backend
            isAutoSubmit: reason !== "Manual" && reason !== "User Completed",
            reason,
            timeLeftSeconds: timeLeft
        });
        
        stopCamera();
        
        if (document.fullscreenElement) await document.exitFullscreen().catch(()=>{});
        navigate(`/result/${data.attemptId}`, { replace: true }); 
      } catch (e) {
        toast.error("Submission failed. Progress was saved locally.");
        setIsSubmitting(false);
      }
  };

  const handleManualSubmit = () => {
    if (window.confirm("Are you sure you want to finish and submit the exam?")) {
        forceSubmit("User Completed");
    }
  };

  // --- 4. DISRUPTION TRACKING ---
  useEffect(() => {
      if (!hasStarted) return;

      const handleDisruption = () => {
          const now = Date.now();
          if (now - lastDisruptionTime.current < 1500) return; 
          
          const isCurrentlyFullscreen = !!document.fullscreenElement;
          const isTabHidden = document.hidden;
          
          setIsFullscreen(isCurrentlyFullscreen);

          let reason = "";
          if (!isCurrentlyFullscreen) reason = "Not enabling full screen.";
          if (isTabHidden) reason = "Switched browser tabs.";

          if (!isCurrentlyFullscreen || isTabHidden) {
              lastDisruptionTime.current = now;

              setDisruptionWarnings(prev => {
                  const newWarn = prev + 1;
                  
                  if (newWarn > 2) { 
                      toast.error("Exam terminated due to multiple disruptions.");
                      forceSubmit(reason); 
                  } else {
                      toast.error(`Warning ${newWarn}/2: ${reason} Rule violated!`, { duration: 5000 });
                  }
                  return newWarn;
              });
          }
      };

      document.addEventListener('fullscreenchange', handleDisruption);
      document.addEventListener('visibilitychange', handleDisruption);

      return () => {
          document.removeEventListener('fullscreenchange', handleDisruption);
          document.removeEventListener('visibilitychange', handleDisruption);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, attemptId]); 


  // --- 5. TIMER & PER-QUESTION TRACKING LOGIC ---
  useEffect(() => {
    if (!hasStarted || !isFullscreen || isWaitingToSubmit || !exam) return; 
    
    if (timeLeft <= 0) {
        if (!isSubmitting) forceSubmit("Timeout");
        return;
    }
    
    const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        // 🟢 NEW: Add 1 second to the currently viewed question's tracker
        const activeQId = exam.questions[currentIdx]?._id;
        if (activeQId) {
            setQuestionTimeTracker(prev => ({
                ...prev,
                [activeQId]: (prev[activeQId] || 0) + 1
            }));
        }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, isFullscreen, exam, timeLeft, isSubmitting, isWaitingToSubmit, currentIdx]);


  // --- 6. AUTO-SAVE & NAVIGATION ACTIONS ---
  const triggerAutoSave = async (qId, updatedAnswers) => {
      if (!attemptId || isOffline) return; 
      try {
          await api.put(`/user/attempts/${attemptId}/save`, {
              questionId: qId,
              answers: updatedAnswers,
              timeLeftSeconds: timeLeft,
              timeSpentSeconds: questionTimeTracker[qId] || 0 // 🟢 Auto-save the time spent so far
          });
      } catch (e) { console.error("Auto-save failed", e); }
  };

  const handleOptionSelect = (qId, optionText, type) => {
    setAnswers(prev => {
        let updatedAns = [];
        if (type === 'multiple') {
            const currentAns = prev[qId] || [];
            if (currentAns.includes(optionText)) updatedAns = currentAns.filter(t => t !== optionText);
            else updatedAns = [...currentAns, optionText];
        } else {
            updatedAns = [optionText]; 
        }
        triggerAutoSave(qId, updatedAns);
        return { ...prev, [qId]: updatedAns };
    });
  };

  const toggleReviewMark = (qId) => {
      setReviewMarked(prev => {
          const newSet = new Set(prev);
          if (newSet.has(qId)) newSet.delete(qId);
          else newSet.add(qId);
          return newSet;
      });
  };

  const handleNavigation = (direction) => {
      if (exam && exam.questions[currentIdx]) {
          const qId = exam.questions[currentIdx]._id;
          triggerAutoSave(qId, answers[qId] || []);
      }
      if (direction === 'next' && currentIdx < exam.questions.length - 1) setCurrentIdx(i => i + 1);
      if (direction === 'prev' && currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  // ============================================================
  // RENDER: PRE-START GATEWAY
  // ============================================================
  if (!hasStarted) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] p-6 text-center select-none relative">
              <div className="absolute top-6 left-6 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-gray-300 shadow-md flex items-center justify-center">
                 {!cameraActive && <Camera className="text-gray-500 w-8 h-8 animate-pulse" />}
                 <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive ? 'hidden' : ''}`} />
              </div>

              {!exam ? (
                  <Loader className="animate-spin text-blue-500 w-12 h-12 mb-4"/>
              ) : (
                  <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-200 max-w-lg w-full animate-in zoom-in-95 duration-300">
                      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShieldAlert size={40} />
                      </div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">{exam.name}</h1>
                      <p className="text-gray-500 font-medium mb-8">
                          Duration: {exam.durationMinutes} Minutes • {exam.questions.length} Questions
                      </p>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left mb-8">
                          <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                              <AlertTriangle size={18} /> Important Rules
                          </h4>
                          <ul className="text-sm text-orange-700 space-y-2 list-disc pl-5 font-medium">
                              <li>This exam requires <b>Fullscreen Mode</b>.</li>
                              <li>Your camera light will remain on for security.</li>
                              <li>Leaving fullscreen or switching tabs will result in automatic submission.</li>
                          </ul>
                      </div>

                      <button 
                          onClick={handleUserStart}
                          disabled={!cameraActive || exam.questions.length === 0}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-3"
                      >
                          {cameraActive ? <PlayCircle size={24} /> : <Loader className="animate-spin" size={24} />}
                          {exam.questions.length === 0 ? "No Questions Found" : cameraActive ? "I Agree, Start Exam" : "Waiting for Camera..."}
                      </button>
                      <button onClick={() => navigate('/dashboard')} className="mt-4 text-gray-500 font-bold hover:text-gray-800 text-sm">Cancel & Go Back</button>
                  </div>
              )}
          </div>
      );
  }

  // ============================================================
  // RENDER: OFFLINE SUBMIT LOCK
  // ============================================================
  if (isWaitingToSubmit) {
      return (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center animate-in fade-in duration-200">
              <UploadCloud size={80} className="text-orange-500 mb-6 animate-pulse" />
              <h2 className="text-4xl font-black mb-4">Waiting for Connection...</h2>
              <p className="text-lg text-gray-300 max-w-lg mb-8">
                  Your exam has ended, but you are currently offline. <br/><br/>
                  All your answers are safely stored. <b>Do not close this tab!</b> Connect to the internet, and your exam will submit automatically.
              </p>
              <div className="flex items-center gap-3 text-orange-400 font-bold bg-orange-500/10 px-6 py-3 rounded-full border border-orange-500/20">
                  <Loader className="animate-spin" size={20} /> Looking for internet...
              </div>
          </div>
      );
  }

  // ============================================================
  // RENDER: FULLSCREEN LOCK OVERLAY
  // ============================================================
  if (hasStarted && !isFullscreen && !isSubmitting) {
      return (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center animate-in fade-in duration-200">
              <AlertTriangle size={80} className="text-red-500 mb-6" />
              <h2 className="text-4xl font-black mb-4">Exam Paused</h2>
              <p className="text-lg text-gray-300 max-w-lg mb-8">
                  You have left fullscreen mode or switched tabs, which violates the exam rules. <br/><br/>
                  <span className="text-red-400 font-bold">Warning {disruptionWarnings} of 2.</span> <br/>
                  If you exceed 2 warnings, your exam will automatically submit.
              </p>
              <button 
                  onClick={returnToFullscreen}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-colors shadow-lg"
              >
                  <Maximize size={24} />
                  Return to Fullscreen
              </button>
          </div>
      );
  }

  // ============================================================
  // RENDER: EXAM ENGINE
  // ============================================================
  const question = exam?.questions ? exam.questions[currentIdx] : null;
  const qId = question?._id;
  
  if (!question) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-[#F9FAFB]">
              <AlertTriangle className="text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-bold">Error Loading Question</h2>
              <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 underline">Return to Dashboard</button>
          </div>
      );
  }
  
  const formatTime = (secs) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return { h, m, s };
  };
  const timeObj = formatTime(timeLeft);

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] select-none relative">
      
      {/* FLOATING CAMERA FEED */}
      <div className="absolute top-4 left-4 z-40 w-36 h-28 bg-black rounded-xl overflow-hidden border-[3px] border-white shadow-xl pointer-events-none">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
          <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> REC
          </div>
      </div>

      {/* OFFLINE BANNER */}
      {isOffline && (
          <div className="bg-red-500 text-white text-center py-2 text-sm font-bold flex justify-center items-center gap-2 shadow-md z-50">
              <WifiOff size={16} /> No Internet Connection. You can continue answering. Do not close this tab.
          </div>
      )}

      {/* TOP BAR */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 pl-48 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold border border-yellow-200">
                <span className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></span>
                In Progress
            </div>
            <h1 className="text-xl font-bold text-gray-900">{exam.name}</h1>
        </div>
        
        <div className="flex items-center gap-4">
            {disruptionWarnings > 0 && (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <AlertTriangle size={14}/> Warnings: {disruptionWarnings}/2
                </span>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center"><UserIcon size={20} className="text-gray-500"/></div>
                <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Student</p>
                </div>
            </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Area (Question) */}
        <div className="flex-1 flex flex-col p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-gray-900">Question {currentIdx + 1}</h2>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            {question.type.replace('_', ' ')}
                        </span>
                    </div>
                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                        {currentIdx + 1} of {exam.questions.length}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 leading-relaxed mb-8">
                    {question.questionText}
                </h3>

                <div className="space-y-4 flex-1">
                    {question.type === 'paragraph' ? (
                        <textarea 
                            className="w-full h-48 p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 focus:border-blue-500 outline-none resize-none font-medium transition-colors"
                            placeholder="Type your answer here... (Auto-saves as you type)"
                            value={(answers[qId] && answers[qId][0]) || ''}
                            onChange={(e) => {
                                setAnswers(prev => ({...prev, [qId]: [e.target.value]}));
                                triggerAutoSave(qId, [e.target.value]);
                            }}
                        />
                    ) : (
                        question.options.map((opt, i) => {
                            const isSelected = (answers[qId] || []).includes(opt.text);
                            return (
                                <button 
                                    key={i}
                                    onClick={() => handleOptionSelect(qId, opt.text, question.type)}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected 
                                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' 
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="font-semibold text-base">{opt.text}</span>
                                </button>
                            )
                        })
                    )}
                </div>

                <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-200">
                    <button 
                        onClick={() => toggleReviewMark(qId)}
                        className={`text-sm font-bold px-6 py-3 rounded-xl border-2 transition-colors ${
                            reviewMarked.has(qId) 
                            ? 'border-orange-500 text-orange-600 bg-orange-50' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {reviewMarked.has(qId) ? 'Unmark Review' : 'Mark for Review'}
                    </button>
                    
                    <div className="flex gap-3">
                        <button 
                            disabled={currentIdx === 0}
                            onClick={() => handleNavigation('prev')}
                            className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        
                        {currentIdx === exam.questions.length - 1 ? (
                             <button 
                                onClick={handleManualSubmit}
                                disabled={isSubmitting || isWaitingToSubmit}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-colors flex items-center gap-2 disabled:bg-gray-400"
                            >
                                {(isSubmitting || isWaitingToSubmit) && <Loader className="animate-spin w-4 h-4" />}
                                Submit Exam
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleNavigation('next')}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
                            >
                                Next Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Sidebar (Timer & Palette) */}
        <div className="w-[360px] bg-white border-l border-gray-200 flex flex-col p-6 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="mb-10">
                <h4 className="text-sm font-bold text-gray-500 mb-4 tracking-wide uppercase">Remaining Time</h4>
                <div className="flex justify-between gap-3">
                    {Object.entries(timeObj).map(([unit, val], i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div className="w-full aspect-square bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl font-black text-yellow-700 border border-yellow-200 shadow-sm">
                                {String(val).padStart(2, '0')}
                            </div>
                            <span className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">{unit === 'h' ? 'Hrs' : unit === 'm' ? 'Min' : 'Sec'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-200 mb-8" />

            <div className="flex-1 flex flex-col min-h-0">
                <h4 className="text-sm font-bold text-gray-500 mb-4 tracking-wide uppercase">Question Palette</h4>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-5 gap-3">
                        {exam.questions.map((q, i) => {
                            const isAnswered = answers[q._id] && answers[q._id].length > 0;
                            const isReview = reviewMarked.has(q._id);
                            
                            let bgColor = "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"; 
                            if (isReview) bgColor = "bg-red-300 border-red-400 text-red-900"; 
                            else if (isAnswered) bgColor = "bg-green-300 border-green-400 text-green-900"; 
                            
                            if (currentIdx === i) bgColor += " ring-4 ring-blue-500/30"; 

                            return (
                                <button key={q._id} onClick={() => { handleNavigation('next'); setCurrentIdx(i); }} className={`aspect-square rounded-full border-2 text-sm font-black transition-all ${bgColor}`}>
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Palette Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-300 border border-green-400"></div> Answered</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div> Not Answered</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-300 border border-red-400"></div> Marked Review</div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TestEngine;