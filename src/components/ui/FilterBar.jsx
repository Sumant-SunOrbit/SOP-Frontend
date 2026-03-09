// import React from 'react';
// import { Search, RefreshCw, X, Calendar, Clock, HelpCircle, Users, CheckSquare, Square } from 'lucide-react';

// const FilterBar = ({ 
//   filters, 
//   setFilters, 
//   type = "Items", 
//   onRefresh, 
//   onReset, 
//   loading = false,
//   showSearch = true,
//   showDeptFilter = false,
//   showRoleFilter = false,
//   showDateFilter = false,
//   showDurationFilter = false,
//   showQuestionCountFilter = false,
//   showLimit = true,
//   departments = [], 
//   onSelectAll = null, 
//   isAllSelected = false,
//   selectedCount = 0 
// }) => {
  
//   const handleChange = (field, value) => {
//     setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
//   };

//   const handleNumberChange = (field, value) => {
//     const num = Math.max(0, parseInt(value) || 0);
//     handleChange(field, num || ''); 
//   };

//   return (
//     <div className="mb-4 space-y-4 border-b border-[var(--sys-glass-border)] pb-6">
      
//       <div className="flex flex-wrap justify-between items-end gap-3 mb-2">
//         <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
//             Filter {type}
//         </label>
        
//         {onSelectAll && (
//             <div className="flex items-center gap-3">
//                 {selectedCount > 0 && (
//                     <div className="flex items-center gap-1.5 text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1.5 rounded-lg border border-[var(--primary)]/20 animate-in fade-in zoom-in duration-200">
//                         <Users size={14} />
//                         <span>{selectedCount} Selected</span>
//                     </div>
//                 )}
//                 <button 
//                     type="button"
//                     onClick={onSelectAll}
//                     className="flex items-center gap-2 text-xs font-bold text-[var(--text)] hover:bg-[var(--glass-border)] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[var(--sys-glass-border)]"
//                 >
//                     {isAllSelected ? <CheckSquare size={16} className="text-[var(--primary)]" /> : <Square size={16} className="text-[var(--text-muted)]" />}
//                     {isAllSelected ? "Deselect All Visible" : "Select All Visible"}
//                 </button>
//             </div>
//         )}
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
//           {showSearch && (
//             <div className={`relative ${showDateFilter || showDurationFilter ? 'md:col-span-3' : 'md:col-span-4'}`}>
//                 <Search className="absolute left-3 top-3 text-[var(--text-muted)]" size={16} />
//                 <input 
//                     className="w-full pl-9 pr-4 py-2.5 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)] transition-colors"
//                     placeholder={`Search ${type}...`}
//                     value={filters.search}
//                     onChange={(e) => handleChange('search', e.target.value)}
//                 />
//             </div>
//           )}

//           {showDeptFilter && (
//             <div className="md:col-span-2">
//                 <select 
//                     className="w-full h-full px-3 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
//                     value={filters.department}
//                     onChange={(e) => handleChange('department', e.target.value)}
//                 >
//                     <option value="">All Depts</option>
//                     {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
//                 </select>
//             </div>
//           )}

//           {showRoleFilter && (
//             <div className="md:col-span-2">
//                 <select 
//                     className="w-full h-full px-3 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
//                     value={filters.role}
//                     onChange={(e) => handleChange('role', e.target.value)}
//                 >
//                     <option value="">All Roles</option>
//                     <option value="User">User</option>
//                     <option value="HOD">HOD</option>
//                     <option value="Admin">Admin</option>
//                 </select>
//             </div>
//           )}

//           {showDateFilter && (
//             <>
//                 <div className="md:col-span-2 relative">
//                     <input type="date" className="w-full h-full px-3 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} />
//                 </div>
//                 <div className="md:col-span-2 relative">
//                     <input type="date" className="w-full h-full px-3 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} />
//                 </div>
//             </>
//           )}

//           {showDurationFilter && (
//              <div className="md:col-span-2 relative">
//                 <Clock className="absolute left-3 top-3 text-[var(--text-muted)]" size={16} />
//                 <input type="number" min="0" className="w-full pl-9 pr-3 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" placeholder="Min Mins" value={filters.minDuration || ''} onChange={(e) => handleNumberChange('minDuration', e.target.value)} />
//              </div>
//           )}

//           {showQuestionCountFilter && (
//              <div className="md:col-span-2 relative">
//                 <HelpCircle className="absolute left-3 top-3 text-[var(--text-muted)]" size={16} />
//                 <input type="number" min="0" className="w-full pl-9 pr-3 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" placeholder="Min Q's" value={filters.minQuestions || ''} onChange={(e) => handleNumberChange('minQuestions', e.target.value)} />
//              </div>
//           )}

//           {showLimit && (
//             <div className="md:col-span-1">
//                 <select className="w-full h-full px-2 py-2 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] text-center" value={filters.limit} onChange={(e) => handleChange('limit', Number(e.target.value))}>
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={50}>50</option>
//                 </select>
//             </div>
//           )}

//           <div className="md:col-span-1 flex gap-2">
//               {onRefresh && <button type="button" onClick={onRefresh} className="flex-1 h-full flex items-center justify-center bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/20 transition-colors"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>}
//               {onReset && <button type="button" onClick={onReset} className="flex-1 h-full flex items-center justify-center bg-[var(--danger)]/10 text-[var(--danger)] rounded-xl hover:bg-[var(--danger)]/20 transition-colors"><X size={18} /></button>}
//           </div>
//       </div>
//     </div>
//   );
// };

// export default FilterBar;


import React from 'react';
import { Search, RefreshCw, X, Calendar, Clock, HelpCircle, Users, CheckSquare, Square } from 'lucide-react';
import SelectField from '../form/input/SelectField';

const FilterBar = ({ 
  // --- Data & State ---
  filters, 
  setFilters, 
  type = "Items", 
  
  // --- Actions ---
  onRefresh, 
  onReset, 
  loading = false,

  // --- Configuration Flags ---
  showSearch = true,
  showDeptFilter = false,
  showRoleFilter = false,
  showDateFilter = false,
  showDurationFilter = false,
  showQuestionCountFilter = false,
  showLimit = true,
  
  // --- Data Sources ---
  departments = [], 
  
  // --- Selection Logic ---
  onSelectAll = null, 
  isAllSelected = false,
  selectedCount = 0 
}) => {
  
  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleNumberChange = (field, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    handleChange(field, num || ''); 
  };

  return (
    <div className="mb-4 space-y-4 border-b border-[var(--sys-glass-border)] pb-6">
      
      {/* 1. Header & Selection Area */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-2">
        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
            Filter {type}
        </label>
        
        {onSelectAll && (
            <div className="flex items-center gap-3">
                {selectedCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1.5 rounded-lg border border-[var(--primary)]/20 animate-in fade-in zoom-in duration-200">
                        <Users size={14} />
                        <span>{selectedCount} Selected</span>
                    </div>
                )}
                <button 
                    type="button"
                    onClick={onSelectAll}
                    className="flex items-center gap-2 text-xs font-bold text-[var(--text)] hover:bg-[var(--glass-border)] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[var(--sys-glass-border)]"
                >
                    {isAllSelected ? <CheckSquare size={16} className="text-[var(--primary)]" /> : <Square size={16} className="text-[var(--text-muted)]" />}
                    {isAllSelected ? "Deselect All Visible" : "Select All Visible"}
                </button>
            </div>
        )}
      </div>
      
      {/* 2. Main Controls Container (Flex for Desktop: Filters Left | Buttons Right) */}
      <div className="flex flex-col xl:flex-row gap-3 items-start">
          
          {/* A. Filters Grid (4 Items per row on XL screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full flex-1">
              
              {/* Search Input */}
              {showSearch && (
                <div className="relative h-[42px]">
                    <Search className="absolute left-3 top-3 text-[var(--text-muted)]" size={16} />
                    <input 
                        className="w-full h-full pl-9 pr-4 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)] transition-colors"
                        placeholder={`Search ${type}...`}
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                    />
                </div>
              )}

              {/* Department Dropdown */}
              {showDeptFilter && (
                <div className="h-[42px]">
                    <select 
                        className="w-full h-full px-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] appearance-none"
                        value={filters.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                </div>
              )}

              {/* Role Dropdown */}
              {showRoleFilter && (
                <div className="h-[42px]">
                    <select 
                        className="w-full h-full px-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] appearance-none"
                        value={filters.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="User">User</option>
                        <option value="HOD">HOD</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
              )}

              {/* Date Range Filters */}
              {showDateFilter && (
                <>
                    <div className="relative h-[42px]">
                        <input type="date" max="9999-12-31" className="w-full h-full px-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} />
                    </div>
                    <div className="relative h-[42px]">
                        <input type="date" max="9999-12-31" className="w-full h-full px-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} />
                    </div>
                </>
              )}

              {/* Duration Filter */}
              {showDurationFilter && (
                 <div className="relative h-[42px]">
                    <Clock className="absolute left-3 top-3 text-[var(--text-muted)]" size={16} />
                    <input type="number" min="0" className="w-full h-full pl-9 pr-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)]" placeholder="Min Mins" value={filters.minDuration || ''} onChange={(e) => handleNumberChange('minDuration', e.target.value)} />
                 </div>
              )}

              {/* Question Count Filter */}
              {showQuestionCountFilter && (
                 <div className="relative h-[42px]">
                    <HelpCircle className="absolute left-3 top-3 text-[var(--text-muted)]" size={16} />
                    <input type="number" min="0" className="w-full h-full pl-9 pr-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)]" placeholder="Min Q's" value={filters.minQuestions || ''} onChange={(e) => handleNumberChange('minQuestions', e.target.value)} />
                 </div>
              )}

              {/* Limit Dropdown */}
            {showLimit && (
              <div className="h-[42px]">
                  <SelectField
                      options={[
                          { value: 5, label: '5 per page' },
                          { value: 10, label: '10 per page' },
                          { value: 20, label: '20 per page' },
                          { value: 50, label: '50 per page' }
                      ]}
                      value={{ value: filters.limit, label: `${filters.limit} per page` }}
                      onChange={(selected) => handleChange('limit', selected ? selected.value : 5)}
                      placeholder="Limit"
                      isSearchable={false}
                      controlClassName="!min-h-[42px] !h-[42px] !shadow-none !rounded-xl"
                  />
              </div>
            )}
        </div>

          {/* B. Action Buttons (Right Side) */}
          <div className="flex gap-2 w-full xl:w-auto shrink-0 h-[42px]">
              {onRefresh && (
                  <button 
                      type="button"
                      onClick={onRefresh}
                      className="flex-1 xl:flex-none xl:w-12 h-full flex items-center justify-center bg-[var(--background)] text-[var(--text)] rounded-xl hover:bg-[var(--sys-glass-border)]/50 transition-colors border border-[var(--sys-glass-border)]"
                      title="Refresh List"
                  >
                      <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  </button>
              )}
              {onReset && (
                  <button 
                      type="button"
                      onClick={onReset}
                      className="flex-1 xl:flex-none xl:w-12 h-full flex items-center justify-center bg-[var(--background)] text-[var(--text)] rounded-xl hover:bg-[var(--sys-glass-border)]/50 transition-colors border border-[var(--sys-glass-border)]"
                      title="Reset Filters"
                  >
                      <X size={18} />
                  </button>
              )}
          </div>
      </div>
    </div>
  );
};

export default FilterBar;