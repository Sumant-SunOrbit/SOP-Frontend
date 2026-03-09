// import React from 'react';
// import { motion } from 'framer-motion';

// // Fixed variable naming to match your new --sys- prefix
// const GlassTable = ({ headers, children }) => {
//   return (
//     <div className="w-full overflow-hidden rounded-[20px] border border-[var(--sys-glass-border)] bg-[var(--sys-glass-surface)] shadow-sm transition-colors duration-300">
//       <div className="overflow-x-auto">
//         {/* ✅ ADDED: table-fixed ensures column widths are respected */}
//         <table className="w-full border-collapse table-fixed">
//           <thead>
//             <tr className="border-b border-[var(--sys-glass-border)] bg-[var(--sys-secondary)]/10">
//               {headers.map((header, index) => (
//                 // ✅ ADDED: text-center (with first:text-left for better aesthetics on names)
//                 <th 
//                   key={index} 
//                   className="px-6 py-4 text-xs font-bold text-[var(--sys-text-muted)] uppercase tracking-wider text-center first:text-left"
//                 >
//                   {header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-[var(--sys-glass-border)]">
//             {children}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export const TableRow = ({ children, delay = 0 }) => (
//   <motion.tr 
//     initial={{ opacity: 0, x: -10 }}
//     animate={{ opacity: 1, x: 0 }}
//     transition={{ delay }}
//     className="hover:bg-[var(--text)]/5 transition-colors duration-200 group"
//   >
//     {children}
//   </motion.tr>
// );

// export const TableCell = ({ children, className = "" }) => (
//   // ✅ ADDED: text-center, align-middle, and first:text-left to match headers
//   <td className={`px-6 py-4 text-sm text-[var(--text)] whitespace-nowrap text-center align-middle first:text-left ${className}`}>
//     {children}
//   </td>
// );

// export default GlassTable;



import React from 'react';
import { motion } from 'framer-motion';

const GlassTable = ({ headers, children }) => {
  return (
    <div className="w-full overflow-hidden rounded-[20px] border border-[var(--sys-glass-border)] bg-[var(--sys-glass-surface)] shadow-sm transition-colors duration-300">
      {/* Ensures horizontal scrolling on smaller screens */}
      <div className="overflow-x-auto w-full">
        {/* ✅ ADDED: min-w-[800px] prevents columns from crushing on mobile */}
        <table className="w-full border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--sys-glass-border)] bg-[#6c757d]">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider text-center first:text-left border-r border-[var(--sys-glass-border)] last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--sys-glass-border)]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TableRow = ({ children, delay = 0 }) => (
  <motion.tr 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="hover:bg-[var(--text)]/5 transition-colors duration-200 group"
  >
    {children}
  </motion.tr>
);

export const TableCell = ({ children, className = "" }) => (
  // ✅ REMOVED: whitespace-nowrap (This was the main culprit for overlapping)
  // ✅ ADDED: break-words just in case of extremely long unbroken text
  <td className={`px-4 py-4 text-sm text-[var(--text)] text-center align-middle first:text-left break-words border-r border-[var(--sys-glass-border)] last:border-r-0 ${className}`}>
    {children}
  </td>
);

export default GlassTable;