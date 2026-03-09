import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Create the Context
const NotificationContext = createContext();

// Custom Hook to use the notifications
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to trigger a toast
  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            // Dynamic styling based on type
            let style = "bg-blue-50 border-blue-200 text-blue-800";
            let Icon = Info;

            if (toast.type === 'success') {
              style = "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"; // Green theme
              Icon = CheckCircle2;
            } else if (toast.type === 'error') {
              style = "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"; // Red theme
              Icon = AlertTriangle;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg border backdrop-blur-md min-w-[280px] max-w-md ${style}`}
              >
                <Icon size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm font-bold flex-1 leading-snug">{toast.message}</span>
                <button 
                  onClick={() => removeToast(toast.id)} 
                  className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};