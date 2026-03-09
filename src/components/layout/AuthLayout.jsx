import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--sys-bg)] transition-colors duration-300">
      
      {/* Background Decor (Nature & Gold Blobs) */}
      {/* Top Left: Soft Gold */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--sys-secondary)]/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      {/* Bottom Right: Nature Green */}
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--sys-primary)]/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-10 bg-[var(--sys-glass-surface)] border border-[var(--sys-glass-border)] backdrop-blur-xl rounded-[32px] shadow-2xl relative z-10"
      >
        {/* Branding Header */}
        <div className="text-center mb-10">
          {/* Added 'flex justify-center' to properly center the image horizontally */}
          <h1 className="flex justify-center mb-4">
            <img 
               src="https://plots.krisala.com/wp-content/uploads/2025/05/krisala-new-logo-scaled.png" 
               alt="Krisala Logo" 
               // Replaced 'items-center' with 'mx-auto' and adjusted height
               className="h-12 w-auto object-contain mx-auto" 
             />
          </h1>
          {title && (
            <p className="text-[var(--sys-text-muted)] text-sm font-medium tracking-wide uppercase">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-[var(--sys-text-muted)] text-xs mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Content (Forms, etc.) */}
        {children}

      </motion.div>
    </div>
  );
};

export default AuthLayout;