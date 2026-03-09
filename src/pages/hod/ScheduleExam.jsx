import React, { useMemo } from 'react';
import { Calendar, Clock, ArrowLeft, CheckSquare, ArrowRight, Info, Hash, Target, PieChart, BarChart } from 'lucide-react';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/Button';

const ScheduleExam = ({ schedule, setSchedule, handlePublish, setStep, loading, config, questions = [] }) => {
  
  // 🟢 CALCULATE EXAM STATS DIRECTLY FROM PROPS
  const stats = useMemo(() => {
    let tMarks = 0;
    const tCounts = { single: 0, multiple: 0, true_false: 0, paragraph: 0 };
    // 🟢 NEW: Object to track total marks per question type
    const tTypeMarks = { single: 0, multiple: 0, true_false: 0, paragraph: 0 }; 
    const mCounts = {};

    const safeQuestions = Array.isArray(questions) ? questions : [];

    safeQuestions.forEach(q => {
      // 1. Total Marks Overall
      const qMarks = Number(q.marks) || 0;
      tMarks += qMarks;
      
      // 2. Question Types Count & Marks per Type
      const qType = q.type ? q.type.toLowerCase() : '';
      if (tCounts[qType] !== undefined) {
          tCounts[qType]++;
          tTypeMarks[qType] += qMarks; // Accumulate marks for this specific type
      }
      
      // 3. Marks Breakdown Count (e.g. { "1": 15, "5": 2 })
      if (!mCounts[qMarks]) mCounts[qMarks] = 0;
      mCounts[qMarks]++;
    });

    return { 
        totalQuestions: safeQuestions.length,
        totalMarks: tMarks, 
        typeCounts: tCounts, 
        typeMarks: tTypeMarks, // Export the new marks-per-type object
        markCounts: mCounts 
    };
  }, [questions]);

  // Determine Access Condition Text dynamically
  let accessMessage = "Condition 4: Exam can be attended At Any Time.";
  let alertStyle = "bg-blue-50 text-blue-800 border-blue-200";

  if (schedule.date && schedule.endDate) {
      accessMessage = "Condition 1: Exam can only be attended During this specific period.";
      alertStyle = "bg-purple-50 text-purple-800 border-purple-200";
  } else if (schedule.date && !schedule.endDate) {
      accessMessage = "Condition 2: Exam can be attended anytime After the start date.";
      alertStyle = "bg-green-50 text-green-800 border-green-200";
  } else if (!schedule.date && schedule.endDate) {
      accessMessage = "Condition 3: Exam can be attended anytime Till the end date.";
      alertStyle = "bg-orange-50 text-orange-800 border-orange-200";
  }

  return (
    <div className="flex flex-col h-full justify-center items-center overflow-y-auto custom-scrollbar py-8">
      <div className="w-full max-w-3xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text)]">Finalize Schedule</h3>
            <p className="text-[var(--text-muted)] text-sm">
              For: <span className="text-[var(--primary)] font-semibold">{config.name}</span>
            </p>
          </div>
        </div>
        
        {/* EXAM SUMMARY DASHBOARD */}
        <div className="bg-[var(--background)]/50 p-5 rounded-2xl border border-[var(--sys-glass-border)] shadow-sm space-y-4">
           <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--sys-glass-border)] pb-2">
              <PieChart size={14} /> Exam Summary
           </h4>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--glass-surface)] p-3 rounded-xl border border-[var(--sys-glass-border)] text-center">
                 <div className="text-2xl font-black text-[var(--text)]">{stats.totalQuestions}</div>
                 <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Questions</div>
              </div>
              <div className="bg-[var(--glass-surface)] p-3 rounded-xl border border-[var(--primary)]/30 text-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                 <div className="text-2xl font-black text-[var(--primary)]">{stats.totalMarks}</div>
                 <div className="text-[10px] uppercase font-bold text-[var(--primary)]/70">Total Marks</div>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
               
               {/* 🟢 UPDATED: Question Types Breakdown with Total Marks per type */}
               <div className="space-y-2">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Type Breakdown</div>
                  <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[11px] font-medium bg-[var(--background)] border border-[var(--sys-glass-border)] text-[var(--text)] px-3 py-1.5 rounded-lg">
                          <span>Single: <b>{stats.typeCounts.single}</b> Qs</span>
                          <span className="text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded font-bold">{stats.typeMarks.single} M</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium bg-[var(--background)] border border-[var(--sys-glass-border)] text-[var(--text)] px-3 py-1.5 rounded-lg">
                          <span>Multi: <b>{stats.typeCounts.multiple}</b> Qs</span>
                          <span className="text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded font-bold">{stats.typeMarks.multiple} M</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium bg-[var(--background)] border border-[var(--sys-glass-border)] text-[var(--text)] px-3 py-1.5 rounded-lg">
                          <span>T/F: <b>{stats.typeCounts.true_false}</b> Qs</span>
                          <span className="text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded font-bold">{stats.typeMarks.true_false} M</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-medium bg-[var(--background)] border border-[var(--sys-glass-border)] text-[var(--text)] px-3 py-1.5 rounded-lg">
                          <span>Para: <b>{stats.typeCounts.paragraph}</b> Qs</span>
                          <span className="text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded font-bold">{stats.typeMarks.paragraph} M</span>
                      </div>
                  </div>
               </div>

               {/* Marks Breakdown */}
               <div className="space-y-2">
                  <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Marks Breakdown</div>
                  <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[145px] pr-1">
                      {Object.keys(stats.markCounts).length === 0 ? (
                          <span className="text-[10px] text-[var(--text-muted)] italic text-center py-4">No questions added</span>
                      ) : (
                          Object.entries(stats.markCounts).map(([mark, count]) => (
                              <div key={mark} className="flex justify-between items-center text-[11px] font-medium bg-[var(--background)] border border-[var(--sys-glass-border)] text-[var(--text)] px-3 py-1.5 rounded-lg">
                                  <span><span className="text-[var(--text-muted)]">Value:</span> <b>{mark} Marks</b></span>
                                  <span className="text-[var(--primary)]">{count} Qs</span>
                              </div>
                          ))
                      )}
                  </div>
               </div>

           </div>
        </div>

        {/* Schedule Inputs */}
        <div className="bg-[var(--background)]/30 p-6 rounded-[24px] border border-[var(--sys-glass-border)] space-y-6 shadow-sm">
            
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                  type="datetime-local" 
                  label="Start Exam (Optional)" 
                  icon={Calendar}
                  value={schedule.date || ''} 
                  onChange={e => setSchedule({...schedule, date: e.target.value})} 
                />
                
                <InputField 
                  type="datetime-local" 
                  label="End Exam (Optional)" 
                  icon={Calendar}
                  value={schedule.endDate || ''} 
                  onChange={e => setSchedule({...schedule, endDate: e.target.value})} 
                />
            </div>

            <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-bold ${alertStyle}`}>
                <Info size={20} className="shrink-0 mt-0.5" />
                <p>{accessMessage}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                  type="number" 
                  label="Duration (Minutes)" 
                  icon={Clock}
                  value={schedule.duration} 
                  onChange={e => setSchedule({...schedule, duration: e.target.value})} 
                />
                
                <InputField 
                  type="number" 
                  label="Passing Marks" 
                  icon={CheckSquare}
                  value={schedule.passingMarks} 
                  onChange={e => setSchedule({...schedule, passingMarks: e.target.value})} 
                />
            </div>
        </div>

        <div className="flex gap-4 w-full pb-8">
          <Button variant="secondary" className="flex-1" onClick={() => setStep(2)} icon={ArrowLeft}>Back</Button>
          <Button className="flex-[2]" size="md" onClick={handlePublish} isLoading={loading} icon={ArrowRight}>
            Proceed to Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleExam;