import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
// 🟢 FIXED: Removed react-hot-toast and imported your custom Notification hook
import { useNotification } from '../../context/NotificationContext';

const ResetPassword = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  // 🟢 FIXED: Extract showToast from your custom context
  const { showToast } = useNotification(); 
  
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🟢 FIXED: Validation updated to use your custom showToast
    if (!passwords.new || !passwords.confirm) {
        return showToast("Please fill out both password fields.", "error");
    }
    if (passwords.new.length < 6) {
        return showToast("Password must be at least 6 characters.", "error");
    }
    if (passwords.new !== passwords.confirm) {
        return showToast("Passwords do not match.", "error");
    }

    setLoading(true);
    try {
        await api.post(`/auth/reset-password/${token}`, { password: passwords.new });
        setIsSuccess(true);
        // 🟢 FIXED: Success notification
        showToast("Password reset successful!", "success");
        setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
        // 🟢 FIXED: Error notification
        showToast(error.response?.data?.message || "Invalid or expired reset link.", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-8 shadow-xl">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                {isSuccess ? <CheckCircle2 size={32} className="text-green-500" /> : <Lock size={32} />}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
                {isSuccess ? "Password Reset!" : "Set New Password"}
            </h1>
            <p className="text-[var(--text-muted)] mt-2 text-sm">
                {isSuccess ? "Redirecting you to login..." : "Please enter your new password below."}
            </p>
        </div>

        {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full pl-11 pr-12 py-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-full text-[var(--text)] focus:border-[var(--primary)] outline-none transition-colors"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[var(--primary)]"
                        >
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full pl-11 pr-12 py-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-full text-[var(--text)] focus:border-[var(--primary)] outline-none transition-colors"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-full text-sm font-bold text-[var(--sys-text-on-secondary)] hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
                    style={{ background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' }}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;