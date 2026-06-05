export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const { withTime } = options;
  return withTime
    ? d.toLocaleString()
    : d.toLocaleDateString();
};
