// import React, { useMemo, useRef, useState, useEffect } from 'react';
// import { Trash2, CheckCircle, Plus, ArrowLeft, ArrowRight, AlertCircle, BarChart, PenTool, CheckSquare, X, Edit2, ChevronsUp } from 'lucide-react';
// import Button from '../../components/ui/Button';

// const VerifyEdit = ({ 
//   questions, 
//   handleUpdateQuestion, 
//   handleOptionChange, 
//   handleDeleteQuestion, 
//   handleAddQuestion, 
//   setStep,
//   examName,
//   setExamName
// }) => {

//   const listContainerRef = useRef(null);
//   const headerRef = useRef(null); // 🟢 NEW: Reference to the top of the component
//   const [showScrollTop, setShowScrollTop] = useState(false);

//   // 🟢 FIXED: Use IntersectionObserver. It detects if the top is out of view, 
//   // ignoring WHICH parent div is actually causing the scrolling.
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         // If the header is NOT visible (scrolled past), show the button
//         setShowScrollTop(!entry.isIntersecting);
//       },
//       { root: null, threshold: 0 }
//     );

//     if (headerRef.current) {
//       observer.observe(headerRef.current);
//     }

//     return () => observer.disconnect();
//   }, []);

//   const typeCounts = useMemo(() => {
//     const counts = { single: 0, multiple: 0, true_false: 0, paragraph: 0 };
//     questions.forEach(q => {
//       if (counts[q.type] !== undefined) counts[q.type]++;
//     });
//     return counts;
//   }, [questions]);

//   const totalMarks = useMemo(() => {
//     return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
//   }, [questions]);

//   const handleCorrectnessToggle = (q, qIndex, oIndex) => {
//     if (q.type === 'single' || q.type === 'true_false') {
//         const updatedOptions = q.options.map((opt, idx) => ({
//             ...opt,
//             isCorrect: idx === oIndex ? true : false
//         }));
//         handleUpdateQuestion(qIndex, 'options', updatedOptions);
//     } else {
//         handleOptionChange(qIndex, oIndex, 'isCorrect', !q.options[oIndex].isCorrect);
//     }
//   };

//   const handleAddOption = (q, qIndex) => {
//       const newOption = { text: `Option ${q.options.length + 1}`, isCorrect: false };
//       const updatedOptions = [...q.options, newOption];
//       handleUpdateQuestion(qIndex, 'options', updatedOptions);
//   };

//   const handleDeleteOption = (q, qIndex, oIndex) => {
//       if (q.options.length <= 2) return;
//       const updatedOptions = q.options.filter((_, idx) => idx !== oIndex);
//       handleUpdateQuestion(qIndex, 'options', updatedOptions);
//   };

//   const handleAddQuestionToTop = async (type) => {
//     await handleAddQuestion(type);
//     scrollToTop(); 
//   };

//   // 🟢 FIXED: Scroll everything that could possibly be scrolling
//   const scrollToTop = () => {
//     // 1. Scroll local container
//     if (listContainerRef.current) {
//         listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//     // 2. Scroll the global <main> container from DashboardLayout
//     const mainContainer = document.querySelector('main');
//     if (mainContainer) {
//         mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//     // 3. Fallback to Window
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className="flex flex-col h-full relative overflow-hidden">
      
//       {/* HEADER ROW - 🟢 Attached headerRef here */}
//       <div 
//         ref={headerRef} 
//         className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[var(--sys-glass-border)] pb-4 shrink-0"
//       >
//         <div className="flex-1 flex items-center gap-3">
//            <PenTool className="text-[var(--text-muted)] shrink-0" size={20} />
//            <input 
//               type="text"
//               className="flex-1 bg-transparent text-xl font-bold text-[var(--text)] outline-none border-b border-transparent focus:border-[var(--primary)]/50 pb-1 transition-colors min-w-[200px]"
//               value={examName || ''}
//               onChange={(e) => setExamName(e.target.value)}
//               placeholder="Enter Exam Name..."
//            />
//         </div>

//         <div className="flex gap-3 shrink-0">
//             <Button variant="secondary" onClick={() => setStep(1)} icon={ArrowLeft}>Cancel Edit</Button>
//             <Button onClick={() => setStep(3)} icon={ArrowRight}>Proceed to Schedule</Button>
//         </div>
//       </div>

//       {/* TOOLBAR */}
//       <div className="flex flex-wrap gap-4 pb-4 border-b border-[var(--sys-glass-border)] shrink-0 items-center justify-between">
//           <div className="flex flex-col">
//               <span className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
//                 <span>{questions.length} Total Questions</span>
//                 <span className="text-[var(--text-muted)]">|</span>
//                 <span className="text-[var(--primary)]">{totalMarks} Total Marks</span>
//               </span>
//               <span className="text-xs font-medium text-[var(--text-muted)] flex gap-2 mt-1">
//                  <span>Single: {typeCounts.single}</span>|
//                  <span>Multi: {typeCounts.multiple}</span>|
//                  <span>T/F: {typeCounts.true_false}</span>|
//                  <span>Para: {typeCounts.paragraph}</span>
//               </span>
//           </div>
          
//           <div className="flex flex-wrap gap-2">
//             <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('single')} className="rounded-full px-3">Single</Button>
//             <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('multiple')} className="rounded-full px-3">Multi</Button>
//             <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('true_false')} className="rounded-full px-3">T/F</Button>
//             <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('paragraph')} className="rounded-full px-3">Para</Button>
//           </div>
//       </div>

//       {/* QUESTIONS LIST */}
//       <div 
//         ref={listContainerRef} 
//         className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar py-4 space-y-6 scroll-smooth"
//       >
//         {questions.map((q, qIndex) => (
//           <div key={q._id} className="p-5 rounded-2xl border border-[var(--sys-glass-border)] bg-[var(--background)]/40 hover:border-[var(--primary)]/30 transition-all group animate-in slide-in-from-top-2">
            
//             <div className="flex flex-wrap justify-between items-center mb-4 gap-3 border-b border-[var(--sys-glass-border)]/50 pb-3">
//               <span className="text-[10px] font-bold tracking-wider text-[var(--text-inverse)] bg-[var(--primary)] px-2 py-1 rounded-full uppercase">
//                   {q.type.replace('_', ' ')}
//               </span>

//               <div className="flex items-center gap-3 ml-auto">
//                 <div className="flex items-center gap-1 bg-[var(--background)]/50 rounded-lg px-2 py-1 border border-[var(--sys-glass-border)]">
//                     <BarChart size={12} className="text-[var(--text-muted)]" />
//                     <select 
//                         className="bg-transparent text-xs font-medium text-[var(--text)] outline-none cursor-pointer"
//                         value={q.difficulty || 'Medium'}
//                         onChange={(e) => handleUpdateQuestion(qIndex, 'difficulty', e.target.value)}
//                     >
//                         <option value="Easy">Easy</option>
//                         <option value="Medium">Medium</option>
//                         <option value="Hard">Hard</option>
//                     </select>
//                 </div>

//                 <div className="flex items-center gap-1 bg-[var(--background)]/50 rounded-lg px-2 py-1 border border-[var(--sys-glass-border)]">
//                     <span className="text-xs text-[var(--text-muted)] font-bold">Marks:</span>
//                     <input 
//                         type="number" 
//                         className="w-8 bg-transparent text-xs font-bold text-[var(--text)] outline-none text-right"
//                         value={q.marks === 0 ? '' : q.marks}
//                         min={0}
//                         onChange={(e) => {
//                             const val = e.target.value;
//                             if (val === '') {
//                                 handleUpdateQuestion(qIndex, 'marks', 0);
//                             } else {
//                                 handleUpdateQuestion(qIndex, 'marks', parseInt(val) || 0);
//                             }
//                         }}
//                         onBlur={(e) => {
//                             const val = parseInt(e.target.value);
//                             if (isNaN(val)) {
//                                 handleUpdateQuestion(qIndex, 'marks', 0);
//                             }
//                         }}
//                     />
//                 </div>

//                 <button 
//                   onClick={() => handleDeleteQuestion(qIndex)} 
//                   className="text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors p-1.5 rounded flex items-center gap-1 text-xs font-bold"
//                   title="Delete Question"
//                 >
//                   <Trash2 size={16}/> Delete
//                 </button>
//               </div>
//             </div>
            
//             <div className="relative mb-4">
//               <Edit2 size={14} className="absolute left-0 top-1.5 text-[var(--text-muted)] pointer-events-none opacity-50" />
//               <textarea 
//                 className="w-full bg-transparent text-[var(--text)] font-semibold text-lg outline-none resize-none border-b border-[var(--sys-glass-border)] focus:border-[var(--primary)]/50 focus:bg-[var(--background)]/50 p-1 pl-6 rounded-none transition-all"
//                 value={q.questionText}
//                 onChange={(e) => handleUpdateQuestion(qIndex, 'questionText', e.target.value)}
//                 rows={2}
//                 title="Edit Question Text"
//               />
//             </div>
            
//             <div className="space-y-2 pl-2">
//               {q.type === 'paragraph' ? (
//                   <div className="space-y-1 relative">
//                       <label className="text-xs text-[var(--text-muted)] uppercase font-bold flex items-center gap-1">
//                         Model Answer: 
//                       </label>
//                       <div className="relative">
//                         <Edit2 size={14} className="absolute right-3 top-3 text-[var(--text-muted)] pointer-events-none opacity-50" />
//                         <textarea
//                             className="w-full bg-[var(--background)]/50 text-[var(--text)] text-sm rounded-xl border border-[var(--sys-glass-border)] p-3 pr-8 outline-none focus:border-[var(--primary)]"
//                             value={q.correctAnswerText || ""}
//                             onChange={(e) => handleUpdateQuestion(qIndex, 'correctAnswerText', e.target.value)}
//                             rows={3}
//                             title="Edit Model Answer"
//                         />
//                       </div>
//                   </div>
//               ) : (
//                   <div className="space-y-2">
//                       {q.options?.map((opt, oIndex) => (
//                           <div key={oIndex} className="flex items-center gap-3">
//                               <button 
//                                   type="button"
//                                   onClick={() => handleCorrectnessToggle(q, qIndex, oIndex)}
//                                   className="shrink-0 transition-colors text-[#c2912d]"
//                               >
//                                   {opt.isCorrect ? (
//                                       q.type === 'multiple' ? (
//                                           <CheckSquare size={20} className="fill-[#c2912d]/20" />
//                                       ) : (
//                                           <CheckCircle size={20} className="fill-[#c2912d]/20" />
//                                       )
//                                   ) : (
//                                       <div className={`w-5 h-5 border-2 border-current ${q.type === 'multiple' ? 'rounded' : 'rounded-full'}`} />
//                                   )}
//                               </button>

//                               <div className="flex-1 relative flex items-center">
//                                 <input 
//                                     className={`w-full bg-transparent text-sm outline-none border-b border-[var(--sys-glass-border)] focus:border-[var(--primary)] py-1 pr-6 ${opt.isCorrect ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]'}`}
//                                     value={opt.text}
//                                     onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
//                                     title="Edit Option Text"
//                                 />
//                                 <Edit2 size={12} className="absolute right-2 text-[var(--text-muted)] pointer-events-none opacity-40" />
//                               </div>
                              
//                               <button 
//                                   type="button"
//                                   onClick={() => handleDeleteOption(q, qIndex, oIndex)}
//                                   className={`p-1.5 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-all ${q.options.length <= 2 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
//                                   title={q.options.length <= 2 ? "Minimum 2 options required" : "Delete Option"}
//                                   disabled={q.options.length <= 2}
//                               >
//                                   <X size={16} />
//                               </button>
//                           </div>
//                       ))}

//                       <button 
//                           type="button"
//                           onClick={() => handleAddOption(q, qIndex)}
//                           className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg transition-colors mt-2"
//                       >
//                           <Plus size={14} /> Add Option
//                       </button>
//                   </div>
//               )}
//             </div>
//           </div>
//         ))}
        
//         {questions.length === 0 && (
//             <div className="text-center py-20 text-[var(--text-muted)] border-2 border-dashed border-[var(--sys-glass-border)] rounded-2xl">
//                 <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                 <p>No questions generated.</p>
//             </div>
//         )}
//       </div>

//       {showScrollTop && (
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-10 right-10 p-4 bg-gray-600 text-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-gray-700 hover:scale-110 transition-all duration-200 z-[9999] flex items-center justify-center animate-in fade-in zoom-in"
//           title="Scroll to Top"
//         >
//           <ChevronsUp size={28} strokeWidth={3} />
//         </button>
//       )}

//     </div>
//   );
// };

// export default VerifyEdit;



import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Trash2, CheckCircle, Plus, ArrowLeft, ArrowRight, AlertCircle, BarChart, PenTool, CheckSquare, X, Edit2, ChevronsUp } from 'lucide-react';
import Button from '../../components/ui/Button';

const VerifyEdit = ({ 
  questions, 
  handleUpdateQuestion, 
  handleOptionChange, 
  handleDeleteQuestion, 
  handleAddQuestion, 
  setStep,
  examName,
  setExamName
}) => {

  const listContainerRef = useRef(null);
  const topMarkerRef = useRef(null); // 🟢 NEW: Invisible tracker inside the list
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 🟢 FIXED: Observe the invisible marker INSIDE the scrollable list.
  // This guarantees it works regardless of which container is scrolling.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the top marker is NOT visible (pushed up by scrolling), show button
        setShowScrollTop(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );

    if (topMarkerRef.current) {
      observer.observe(topMarkerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const typeCounts = useMemo(() => {
    const counts = { single: 0, multiple: 0, true_false: 0, paragraph: 0 };
    questions.forEach(q => {
      if (counts[q.type] !== undefined) counts[q.type]++;
    });
    return counts;
  }, [questions]);

  const totalMarks = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  }, [questions]);

  const handleCorrectnessToggle = (q, qIndex, oIndex) => {
    if (q.type === 'single' || q.type === 'true_false') {
        const updatedOptions = q.options.map((opt, idx) => ({
            ...opt,
            isCorrect: idx === oIndex ? true : false
        }));
        handleUpdateQuestion(qIndex, 'options', updatedOptions);
    } else {
        handleOptionChange(qIndex, oIndex, 'isCorrect', !q.options[oIndex].isCorrect);
    }
  };

  const handleAddOption = (q, qIndex) => {
      const newOption = { text: `Option ${q.options.length + 1}`, isCorrect: false };
      const updatedOptions = [...q.options, newOption];
      handleUpdateQuestion(qIndex, 'options', updatedOptions);
  };

  const handleDeleteOption = (q, qIndex, oIndex) => {
      if (q.options.length <= 2) return;
      const updatedOptions = q.options.filter((_, idx) => idx !== oIndex);
      handleUpdateQuestion(qIndex, 'options', updatedOptions);
  };

  const handleAddQuestionToTop = async (type) => {
    await handleAddQuestion(type);
    scrollToTop(); 
  };

  const scrollToTop = () => {
    // 1. Scroll local container
    if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 2. Scroll the global <main> container from DashboardLayout
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 3. Fallback to Window
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[var(--sys-glass-border)] pb-4 shrink-0">
        <div className="flex-1 flex items-center gap-3">
           <PenTool className="text-[var(--text-muted)] shrink-0" size={20} />
           <input 
              type="text"
              className="flex-1 bg-transparent text-xl font-bold text-[var(--text)] outline-none border-b border-transparent focus:border-[var(--primary)]/50 pb-1 transition-colors min-w-[200px]"
              value={examName || ''}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Enter Exam Name..."
           />
        </div>

        <div className="flex gap-3 shrink-0">
            <Button variant="secondary" onClick={() => setStep(1)} icon={ArrowLeft}>Cancel Edit</Button>
            <Button onClick={() => setStep(3)} icon={ArrowRight}>Proceed to Schedule</Button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-4 pb-4 border-b border-[var(--sys-glass-border)] shrink-0 items-center justify-between">
          <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <span>{questions.length} Total Questions</span>
                <span className="text-[var(--text-muted)]">|</span>
                <span className="text-[var(--primary)]">{totalMarks} Total Marks</span>
              </span>
              <span className="text-xs font-medium text-[var(--text-muted)] flex gap-2 mt-1">
                 <span>Single: {typeCounts.single}</span>|
                 <span>Multi: {typeCounts.multiple}</span>|
                 <span>T/F: {typeCounts.true_false}</span>|
                 <span>Para: {typeCounts.paragraph}</span>
              </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('single')} className="rounded-full px-3">Single</Button>
            <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('multiple')} className="rounded-full px-3">Multi</Button>
            <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('true_false')} className="rounded-full px-3">T/F</Button>
            <Button size="xs" variant="secondary" icon={Plus} onClick={() => handleAddQuestionToTop('paragraph')} className="rounded-full px-3">Para</Button>
          </div>
      </div>

      {/* QUESTIONS LIST */}
      <div 
        ref={listContainerRef} 
        className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar py-4 space-y-6 scroll-smooth relative"
      >
        {/* 🟢 NEW: Invisible scroll tracker element placed right before the questions map */}
        <div ref={topMarkerRef} className="w-full h-[1px] shrink-0" />

        {questions.map((q, qIndex) => (
          <div key={q._id} className="p-5 rounded-2xl border border-[var(--sys-glass-border)] bg-[var(--background)]/40 hover:border-[var(--primary)]/30 transition-all group animate-in slide-in-from-top-2">
            
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3 border-b border-[var(--sys-glass-border)]/50 pb-3">
              <span className="text-[10px] font-bold tracking-wider text-[var(--text-inverse)] bg-[var(--primary)] px-2 py-1 rounded-full uppercase">
                  {q.type.replace('_', ' ')}
              </span>

              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1 bg-[var(--background)]/50 rounded-lg px-2 py-1 border border-[var(--sys-glass-border)]">
                    <BarChart size={12} className="text-[var(--text-muted)]" />
                    <select 
                        className="bg-transparent text-xs font-medium text-[var(--text)] outline-none cursor-pointer"
                        value={q.difficulty || 'Medium'}
                        onChange={(e) => handleUpdateQuestion(qIndex, 'difficulty', e.target.value)}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div className="flex items-center gap-1 bg-[var(--background)]/50 rounded-lg px-2 py-1 border border-[var(--sys-glass-border)]">
                    <span className="text-xs text-[var(--text-muted)] font-bold">Marks:</span>
                    <input 
                        type="number" 
                        className="w-8 bg-transparent text-xs font-bold text-[var(--text)] outline-none text-right"
                        value={q.marks === 0 ? '' : q.marks}
                        min={0}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                                handleUpdateQuestion(qIndex, 'marks', 0);
                            } else {
                                handleUpdateQuestion(qIndex, 'marks', parseInt(val) || 0);
                            }
                        }}
                        onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val)) {
                                handleUpdateQuestion(qIndex, 'marks', 0);
                            }
                        }}
                    />
                </div>

                <button 
                  onClick={() => handleDeleteQuestion(qIndex)} 
                  className="text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors p-1.5 rounded flex items-center gap-1 text-xs font-bold"
                  title="Delete Question"
                >
                  <Trash2 size={16}/> Delete
                </button>
              </div>
            </div>
            
            <div className="relative mb-4">
              <Edit2 size={14} className="absolute left-0 top-1.5 text-[var(--text-muted)] pointer-events-none opacity-50" />
              <textarea 
                className="w-full bg-transparent text-[var(--text)] font-semibold text-lg outline-none resize-none border-b border-[var(--sys-glass-border)] focus:border-[var(--primary)]/50 focus:bg-[var(--background)]/50 p-1 pl-6 rounded-none transition-all"
                value={q.questionText}
                onChange={(e) => handleUpdateQuestion(qIndex, 'questionText', e.target.value)}
                rows={2}
                title="Edit Question Text"
              />
            </div>
            
            <div className="space-y-2 pl-2">
              {q.type === 'paragraph' ? (
                  <div className="space-y-1 relative">
                      <label className="text-xs text-[var(--text-muted)] uppercase font-bold flex items-center gap-1">
                        Model Answer: 
                      </label>
                      <div className="relative">
                        <Edit2 size={14} className="absolute right-3 top-3 text-[var(--text-muted)] pointer-events-none opacity-50" />
                        <textarea
                            className="w-full bg-[var(--background)]/50 text-[var(--text)] text-sm rounded-xl border border-[var(--sys-glass-border)] p-3 pr-8 outline-none focus:border-[var(--primary)]"
                            value={q.correctAnswerText || ""}
                            onChange={(e) => handleUpdateQuestion(qIndex, 'correctAnswerText', e.target.value)}
                            rows={3}
                            title="Edit Model Answer"
                        />
                      </div>
                  </div>
              ) : (
                  <div className="space-y-2">
                      {q.options?.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                              <button 
                                  type="button"
                                  onClick={() => handleCorrectnessToggle(q, qIndex, oIndex)}
                                  className="shrink-0 transition-colors text-[#c2912d]"
                              >
                                  {opt.isCorrect ? (
                                      q.type === 'multiple' ? (
                                          <CheckSquare size={20} className="fill-[#c2912d]/20" />
                                      ) : (
                                          <CheckCircle size={20} className="fill-[#c2912d]/20" />
                                      )
                                  ) : (
                                      <div className={`w-5 h-5 border-2 border-current ${q.type === 'multiple' ? 'rounded' : 'rounded-full'}`} />
                                  )}
                              </button>

                              <div className="flex-1 relative flex items-center">
                                <input 
                                    className={`w-full bg-transparent text-sm outline-none border-b border-[var(--sys-glass-border)] focus:border-[var(--primary)] py-1 pr-6 ${opt.isCorrect ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]'}`}
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                    title="Edit Option Text"
                                />
                                <Edit2 size={12} className="absolute right-2 text-[var(--text-muted)] pointer-events-none opacity-40" />
                              </div>
                              
                              <button 
                                  type="button"
                                  onClick={() => handleDeleteOption(q, qIndex, oIndex)}
                                  className={`p-1.5 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-all ${q.options.length <= 2 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                                  title={q.options.length <= 2 ? "Minimum 2 options required" : "Delete Option"}
                                  disabled={q.options.length <= 2}
                              >
                                  <X size={16} />
                              </button>
                          </div>
                      ))}

                      <button 
                          type="button"
                          onClick={() => handleAddOption(q, qIndex)}
                          className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg transition-colors mt-2"
                      >
                          <Plus size={14} /> Add Option
                      </button>
                  </div>
              )}
            </div>
          </div>
        ))}
        
        {questions.length === 0 && (
            <div className="text-center py-20 text-[var(--text-muted)] border-2 border-dashed border-[var(--sys-glass-border)] rounded-2xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No questions generated.</p>
            </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 p-2 bg-gray-600 text-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-gray-700 hover:scale-110 transition-all duration-200 z-[9999] flex items-center justify-center animate-in fade-in zoom-in"
          title="Scroll to Top"
        >
          <ChevronsUp size={28} strokeWidth={3} />
        </button>
      )}

    </div>
  );
};

export default VerifyEdit;