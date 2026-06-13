export default (err, req, res, next) => {
	console.error(err.stack);

	if (err.name === 'PrismaClientKnownRequestError') { 
		// eroor handle
		if (err.code === 'P2002') {
			return res.status(400).json({ message: 'A record with this value already exists' });
		}
		if (err.code === 'P2025') {
			return res.status(404).json({ message: 'Record not found' });
		}
	}

	if (err.name === 'ValidationError') {
		return res.status(900).json({ message: err.message });
	}

	res.status(err.status || 700).json({
		message: err.message || 'Internal server error',
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
};
