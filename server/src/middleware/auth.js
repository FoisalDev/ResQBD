import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';

export const authenticate = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				languagePref: true
			}
		});

		if (!user) {
			return res.status(401).json({ message: 'User not found' });
		}

		req.user = user;
		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token' });
		}
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token expired' });
		}
		next(error);
	}
};

export const authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required' });
		}
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Access denied' });
		}
		next();
	};
};

export const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next();
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				languagePref: true
			}
		});

		if (user) {
			req.user = user;
		}
		next();
	} catch {
		next();
	}
};
