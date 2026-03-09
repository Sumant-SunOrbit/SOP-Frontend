import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion'; 
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
// import AuthLayout from '../components/layout/AuthLayout'; 

import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('Rahul@lms.com');
  const [password, setPassword] = useState('pass123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'HOD') {
        navigate('/hod/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <AuthLayout title="">
      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 rounded-2xl bg-[var(--sys-danger)]/5 border border-[var(--sys-danger)]/10 text-[var(--sys-danger)] text-sm font-medium text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--sys-text-muted)] ml-4">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--sys-text-muted)] group-focus-within:text-[var(--sys-secondary)] transition-colors" />
            <input
              type="email"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-[var(--sys-bg)]/50 border border-[var(--sys-glass-border)] rounded-full text-[var(--sys-text)] placeholder-[var(--sys-text-muted)] outline-none focus:border-[var(--sys-secondary)] focus:ring-4 focus:ring-[var(--sys-secondary)]/10 transition-all duration-300"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--sys-text-muted)] ml-4">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--sys-text-muted)] group-focus-within:text-[var(--sys-secondary)] transition-colors" />
            <input
              type="password"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-[var(--sys-bg)]/50 border border-[var(--sys-glass-border)] rounded-full text-[var(--sys-text)] placeholder-[var(--sys-text-muted)] outline-none focus:border-[var(--sys-secondary)] focus:ring-4 focus:ring-[var(--sys-secondary)]/10 transition-all duration-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {/* 🟢 NEW: Forgot Password Link */}
          <div className="flex justify-end pt-1 pr-4">
            <Link to="/forgot-password" className="text-xs font-bold text-[var(--sys-primary)] hover:text-[var(--sys-secondary)] hover:underline transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[image:var(--sys-pill-gradient)] shadow-[var(--sys-pill-shadow)] text-black font-bold tracking-wide uppercase flex justify-center items-center gap-2 hover:brightness-105 active:scale-[0.98] active:translate-y-[1px] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-black" />
            ) : (
              <>
                Sign In <ArrowRight className="w-5 h-5 text-black" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* 🟢 NEW: Dynamic Copyright Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs font-medium text-[var(--sys-text-muted)] opacity-80">
          SunOrbit Copyright © {currentYear}
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;