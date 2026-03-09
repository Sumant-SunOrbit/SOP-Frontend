import React, { useState, useEffect } from 'react';
import { UserPlus, Check } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination'; 
import FilterBar from '../../components/ui/FilterBar';
import SelectField from '../../components/form/input/SelectField';

// 🟢 NEW: Import your custom notification hook
import { useNotification } from '../../context/NotificationContext';

const AssignPage = ({ type = 'exam' }) => {
  const { showToast } = useNotification(); // 🟢 Initialize notification context

  const [items, setItems] = useState([]); // Exams or Courses
  const [selectedItem, setSelectedItem] = useState('');
  
  // --- USER DATA STATE ---
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // Array of IDs
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [departments, setDepartments] = useState([]); 

  // --- FILTERS & PAGINATION STATE ---
  const initialFilters = {
    search: '',
    department: '',
    role: '', 
    limit: 10,
    page: 1
  };
  const [filters, setFilters] = useState(initialFilters);
  const [paginationInfo, setPaginationInfo] = useState({ totalPages: 1 });

  // 1. Initial Load (Departments & Items)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemEndpoint = type === 'exam' ? '/hod/exams' : '/hod/courses';
        
        const [deptRes, itemRes] = await Promise.all([
          api.get('/common/departments').catch(() => ({ data: { departments: [] } })), 
          api.get(itemEndpoint).catch(() => ({ data: [] }))
        ]);

        // Extract Departments
        setDepartments(deptRes.data.departments || []);
        
        // Handle both Array (Legacy) and Object (Paginated) responses
        let loadedItems = [];
        if (Array.isArray(itemRes.data)) {
            loadedItems = itemRes.data;
        } else if (type === 'exam' && Array.isArray(itemRes.data.exams)) {
            loadedItems = itemRes.data.exams;
        } else if (type === 'course' && Array.isArray(itemRes.data.courses)) {
            loadedItems = itemRes.data.courses;
        }
        
        setItems(loadedItems);
      } catch (e) { 
        console.error("Error fetching data:", e); 
        setItems([]); 
      }
    };
    fetchData();
  }, [type]);

  // 2. Fetch Users when Filters Change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); 

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const queryParams = new URLSearchParams({
        search: filters.search,
        department: filters.department,
        role: filters.role,
        limit: filters.limit,
        page: filters.page
      }).toString();

      const { data } = await api.get(`/common/users?${queryParams}`);
      setUsers(Array.isArray(data.users) ? data.users : []);
      setPaginationInfo({ totalPages: data.pagination?.pages || 1 });
    } catch (e) {
      // 🟢 FIXED: Use custom notification
      showToast("Failed to load users", "error");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Reset Handler
  const handleReset = () => {
    setFilters(initialFilters);
    // 🟢 FIXED: Use custom notification
    showToast("Filters reset", "success");
  };

  // --- SELECTION LOGIC ---
  const toggleUser = (id) => {
    if (selectedUsers.includes(id)) {
        setSelectedUsers(selectedUsers.filter(u => u !== id));
    } else {
        setSelectedUsers([...selectedUsers, id]);
    }
  };

  const isAllVisibleSelected = users.length > 0 && users.every(u => selectedUsers.includes(u._id));

  const handleSelectAllVisible = () => {
    const visibleIds = users.map(u => u._id);
    if (isAllVisibleSelected) {
        setSelectedUsers(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
        setSelectedUsers(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  // --- ASSIGN LOGIC ---
  const handleAssign = async () => {
    // 🟢 FIXED: Validation checks now use custom notifications
    if (!selectedItem) {
        return showToast(`Please select a ${type} to assign.`, "error");
    }
    if (selectedUsers.length === 0) {
        return showToast("Please select at least one user.", "error");
    }
    
    try {
      const endpoint = type === 'exam' ? '/hod/assign/exam' : '/hod/assign/course';
      const payload = type === 'exam' 
        ? { examId: selectedItem, userIds: selectedUsers } 
        : { courseId: selectedItem, userIds: selectedUsers };
        
      await api.post(endpoint, payload);
      
      // 🟢 FIXED: Success notification
      showToast(`Assigned successfully to ${selectedUsers.length} users!`, "success");
      setSelectedUsers([]); // Clear selection after successful assignment
    } catch (e) { 
      // 🟢 FIXED: Error notification with backend error message fallback
      showToast(e.response?.data?.message || "Assignment Failed", "error"); 
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[var(--background)] flex justify-center">
      <div className="w-full max-w-5xl bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-8 shadow-sm">
        
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text)] capitalize">Assign {type}</h1>
        </div>

        {/* 1. Select Resource (Exam or Course) */}
        <div className="mb-8">
          <SelectField
            label={`Select ${type === 'exam' ? 'Exam' : 'Course'}`}
            options={Array.isArray(items) ? items.map(item => ({ value: item._id, label: item.name || item.title })) : []}
            value={items.find(i => i._id === selectedItem) ? { value: selectedItem, label: (items.find(i => i._id === selectedItem).name || items.find(i => i._id === selectedItem).title) } : null}
            onChange={(selected) => setSelectedItem(selected ? selected.value : '')}
            placeholder={`-- Choose ${type === 'exam' ? 'Exam' : 'Course'} --`}
          />
        </div>

        {/* 2. Filter Bar (Reusable Component) */}
        <FilterBar 
            type="Users"
            filters={filters}
            setFilters={setFilters}
            onRefresh={fetchUsers}
            onReset={handleReset} 
            loading={loadingUsers}
            showDeptFilter={true}
            showRoleFilter={true}
            departments={departments}
            onSelectAll={handleSelectAllVisible}
            isAllSelected={isAllVisibleSelected}
            selectedCount={selectedUsers.length} 
        />

        {/* 3. User List Grid */}
        <div className="mb-6">
          {loadingUsers ? (
              <div className="text-center py-12 text-[var(--text-muted)] animate-pulse">Loading users...</div>
          ) : users.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--sys-glass-border)] rounded-2xl">
                  No users found matching filters.
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px] content-start">
                {users.map(user => (
                  <div 
                    key={user._id}
                    onClick={() => toggleUser(user._id)}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all group ${
                      selectedUsers.includes(user._id) 
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-sm' 
                        : 'bg-[var(--background)]/50 border-[var(--sys-glass-border)] hover:border-[var(--primary)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedUsers.includes(user._id) ? 'bg-[var(--primary)] text-white' : 'bg-[var(--glass-border)] text-[var(--text-muted)]'}`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--text)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{user.email} • <span className="opacity-70">{user.departmentId?.name || 'No Dept'}</span></p>
                        </div>
                    </div>
                    
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedUsers.includes(user._id) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--text-muted)]'}`}>
                        {selectedUsers.includes(user._id) && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>
          )}

          {/* Pagination Controls */}
          <Pagination 
            currentPage={filters.page} 
            totalPages={paginationInfo.totalPages} 
            onPageChange={(page) => setFilters({ ...filters, page })} 
          />
        </div>

        {/* Footer Button */}
        <div className=" border-[var(--sys-glass-border)]">
            <Button 
                className="w-full" 
                size="md" 
                onClick={handleAssign} 
                icon={UserPlus} 
                disabled={selectedUsers.length === 0 || !selectedItem}
            >
                Confirm Assignment ({selectedUsers.length})
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignPage;