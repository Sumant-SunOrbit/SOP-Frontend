import React, { useState, useEffect, useRef } from 'react';
import GlassTable, { TableRow, TableCell } from '../../components/ui/GlassTable';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/Button';
import { Plus, User, Mail, Lock, Building2, Edit2, X, Phone } from 'lucide-react'; 
import api from '../../services/api';
import { motion } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext'; 

const ManageHODs = () => {
  const { showToast } = useNotification(); 

  const [hods, setHods] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', password: '', departmentId: '' });

  const formRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  // Robust Scroll Logic: Waits for form to open, then smoothly scrolls
  useEffect(() => {
    if (showForm && formRef.current) {
      const timeout = setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250); 
      return () => clearTimeout(timeout);
    }
  }, [showForm, editId]);

  const fetchData = async () => {
    try {
      const [hodRes, deptRes] = await Promise.all([
        api.get('/admin/hod'),
        api.get('/admin/departments')
      ]);
      setHods(hodRes.data);
      setDepartments(deptRes.data);
    } catch (error) { 
      showToast('Failed to load data. Please check your connection.', 'error'); 
    }
  };

  const handleEdit = (hod) => {
    setFormData({
      name: hod.name || '',
      email: hod.email || '',
      phoneNumber: hod.phoneNumber || '', 
      password: '',
      departmentId: hod.departmentId?._id || ''
    });
    setEditId(hod._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phoneNumber: '', password: '', departmentId: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🟢 Strict Validations using showToast
    if (!formData.name || formData.name.trim() === '') {
      showToast("Full Name is required.", "error");
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      showToast("Email Address is required.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // 🟢 NEW: Exact 10-digit validation check for Phone Number
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      showToast("Please enter a valid 10-digit Phone Number.", "error");
      return;
    }

    // Password is only required when creating a NEW HOD
    if (!editId && (!formData.password || formData.password.trim() === '')) {
      showToast("Password is required for new HOD accounts.", "error");
      return;
    }

    if (!formData.departmentId) {
      showToast("Please assign a department.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editId) {
        // Send Update Request
        await api.put(`/admin/hod/${editId}`, formData);
        fetchData(); 
        showToast('HOD details updated successfully!', 'success');
      } else {
        // Send Create Request (Backend handles sending the email)
        const { data } = await api.post('/admin/hod', formData);
        setHods([...hods, { ...data, departmentId: departments.find(d => d._id === formData.departmentId) }]);
        showToast('New HOD added & credentials sent to email!', 'success');
      }
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-8 min-h-screen bg-[var(--background)]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text)]">HOD Management</h1>
        
        {/* Dynamic Icon (Plus/X) and Text */}
        <Button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          icon={showForm ? X : Plus}
        >
          {showForm ? 'Cancel' : 'Add New HOD'}
        </Button>
      </div>

      {showForm && (
        <motion.div 
          ref={formRef} 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 scroll-mt-6"
        >
          <h3 className="text-xl font-bold mb-6 text-[var(--sys-text)]">
            {editId ? 'Edit HOD Details' : 'New HOD Credentials'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Full Name *" icon={User} 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <InputField 
              label="Email Address *" icon={Mail} type="email" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            
            {/* 🟢 UPDATED: Phone Number Input restricted to numbers & exactly 10 digits max */}
            <InputField 
              label="Phone Number *" icon={Phone} type="tel" 
              placeholder="9876543210"
              maxLength="10"
              value={formData.phoneNumber} 
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, ''); // Removes all non-numeric characters instantly
                if (onlyNums.length <= 10) {
                  setFormData({...formData, phoneNumber: onlyNums});
                }
              }}
            />

            {/* HIDDEN ON EDIT: Admin cannot edit password */}
            {!editId && (
              <InputField 
                label="Password *" 
                icon={Lock} type="password" 
                placeholder="••••••••"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sys-text-muted)] ml-1">Assign Department *</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sys-text-muted)] w-5 h-5" />
                <select
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--sys-bg)]/50 border border-[var(--sys-glass-border)] rounded-2xl text-[var(--sys-text)] appearance-none outline-none focus:border-[var(--sys-primary)] focus:ring-4 focus:ring-[var(--sys-primary)]/10 transition-all"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                >
                  <option value="" className="text-gray-500">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id} className="text-black">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 pt-4 flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>
                {editId ? 'Update HOD' : 'Create Account'}
              </Button>
              <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-card overflow-hidden">
        <GlassTable headers={['Name', 'Contact Info', 'Assigned Department', 'Actions']}>
          {hods.map((hod, idx) => (
            <TableRow key={hod._id} delay={idx * 0.05}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[image:var(--sys-pill-gradient)] text-black flex items-center justify-center font-bold text-sm shadow-sm">
                    {hod.name ? hod.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="font-semibold text-[var(--sys-text)]">{hod.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-[var(--sys-text-muted)]">{hod.email}</span>
                  <span className="text-xs text-[var(--sys-text-muted)] opacity-70 mt-0.5 font-medium">{hod.phoneNumber || 'No phone'}</span>
                </div>
              </TableCell>
              <TableCell>
                {hod.departmentId?.name ? (
                  <span className="px-3 py-1 rounded-full bg-[var(--sys-primary)]/10 text-[var(--sys-primary)] border border-[var(--sys-primary)]/20 text-xs font-bold">
                    {hod.departmentId.name}
                  </span>
                ) : (
                  <span className="text-[var(--sys-text-muted)] italic text-sm">Not Assigned</span>
                )}
              </TableCell>
              <TableCell>
                <button 
                  onClick={() => handleEdit(hod)}
                  className="flex items-center justify-center w-full gap-1 text-sm text-[var(--sys-primary)] font-medium hover:underline"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </TableCell>
            </TableRow>
          ))}
        </GlassTable>
      </div>
    </div>
  );
};

export default ManageHODs;