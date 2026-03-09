import { motion } from 'framer-motion';

const LogoLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Logo Icon */}
        <div className="relative w-20 h-20 mb-6">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-xl"
          />
          <div className="relative z-10 w-full h-full bg-[var(--glass-surface)] rounded-2xl shadow-lg flex items-center justify-center border border-[var(--sys-glass-border)]">
            <span className="text-3xl font-bold italic text-[var(--text)]">P</span>
          </div>
        </div>
        
        {/* Text */}
        <h2 className="text-xl font-medium tracking-wide text-[var(--text)] font-sans">
          KRI<span className="font-bold text-[var(--primary)]">SALA</span>
        </h2>
        
        {/* Loading Bar */}
        <div className="mt-6 w-32 h-1 bg-[var(--text)]/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-[var(--primary)] rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LogoLoader;