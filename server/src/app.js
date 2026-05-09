import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import sosRoutes from './routes/sos.js';
import reportRoutes from './routes/reports.js';
import shelterRoutes from './routes/shelters.js';
import volunteerRoutes from './routes/volunteers.js';
import assignmentRoutes from './routes/assignments.js';
import reliefRoutes from './routes/relief.js';
import weatherRoutes from './routes/weather.js';
import riskRoutes from './routes/risk.js';
import notificationRoutes from './routes/notifications.js';
import alertRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
import { setupSocket } from './socket/index.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin:
			process.env.NODE_ENV === 'production'
				? 'https://your-production-domain.com'
				: ['http://localhost:5173', 'http://127.0.0.1:5173'],
		methods: ['GET', 'POST'],
		credentials: true
	}
});

export const prisma = new PrismaClient();
export { io };

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' }
	})
);

app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'production'
				? 'https://your-production-domain.com'
				: ['http://localhost:5173', 'http://127.0.0.1:5173'],
		credentials: true
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: { message: 'Too many attempts, please try again later' }
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/shelters', shelterRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/relief', reliefRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/risk', riskRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/api/v1/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

setupSocket(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
	await prisma.$disconnect();
	process.exit(0);
});

export default app;
