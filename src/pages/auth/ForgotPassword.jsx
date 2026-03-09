import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
        await api.post('/auth/forgot-password', { email });
        setIsSent(true);
        toast.success("Reset link sent!");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-8 shadow-xl">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Forgot Password?</h1>
            <p className="text-[var(--text-muted)] mt-2 text-sm">
                Enter your email address and we'll send you a link to reset your password.
            </p>
        </div>

        {isSent ? (
            <div className="text-center">
                <div className="bg-green-50 text-green-800 border border-green-200 rounded-xl p-4 mb-6 text-sm font-medium">
                    If an account exists with {email}, an email has been sent with further instructions.
                </div>
                <Link to="/login" className="text-[var(--primary)] font-bold hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back to Login
                </Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                        <input 
                            type="email" 
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-full text-[var(--text)] focus:border-[var(--primary)] outline-none transition-colors"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-full text-sm font-bold text-[var(--sys-text-on-secondary)] flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
                    style={{ background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' }}
                >
                    {loading ? <span className="animate-spin text-lg">⏳</span> : <Send size={18} />}
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="text-center mt-6">
                    <Link to="/login" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                        Return to Login
                    </Link>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;