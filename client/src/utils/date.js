export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const { withTime } = options;
  return withTime
    ? d.toLocaleString()
    : d.toLocaleDateString();
};
export const toBanglaNumerals = (num) => {
  if (num === null || num === undefined) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => banglaDigits[digit]);
};
