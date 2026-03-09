// Utility to format date as DD-MM-YYYY
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

// Component version for direct usage in JSX
const FormatDate = ({ date }) => {
  return <>{formatDate(date)}</>;
};

export default FormatDate;
