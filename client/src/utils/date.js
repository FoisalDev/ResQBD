const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const formatDate = (date, options = {}) => {
	if (!date) return '';

	const parsedDate = new Date(date);

	if (Number.isNaN(parsedDate.getTime())) return '';

	const { withTime = false } = options;

	return withTime ? parsedDate.toLocaleString() : parsedDate.toLocaleDateString();
};

export const toBanglaNumerals = (num) => {
	if (num === null || num === undefined) return '';

	return String(num).replace(/\d/g, (digit) => BANGLA_DIGITS[digit]);
};