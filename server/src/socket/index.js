import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';

export const setupSocket = (io) => {
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error('Authentication required'));
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const user = await prisma.user.findUnique({
				where: { id: decoded.userId },
				select: { id: true, role: true }
			});

			if (!user) {
				return next(new Error('User not found'));
			}

			socket.user = user;
			next();
		} catch (error) {
			next(new Error('Authentication failed'));
		}
	});

	io.on('connection', (socket) => {
		console.log(`User connected: ${socket.user.id} (${socket.user.role})`);

		socket.on('join:role', (role) => {
			socket.leaveAll();
			socket.join(`role:${role}`);
			console.log(`User ${socket.user.id} joined role:${role}`);
		});

		socket.on('join:user', (userId) => {
			socket.join(`user:${userId}`);
		});

		socket.on('join:room', (room) => {
			socket.join(room);
		});

		socket.on('leave:room', (room) => {
			socket.leave(room);
		});

		socket.on('disconnect', () => {
			console.log(`User disconnected: ${socket.user.id}`);
		});
	});
};
