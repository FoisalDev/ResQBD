import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../app.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
	try {
		const notifications = await prisma.notification.findMany({
			where: { userId: req.user.id },
			orderBy: { createdAt: 'desc' },
			take: 50
		});
		res.json(notifications);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get notifications' });
	}
});

router.patch('/:id/read', authenticate, async (req, res) => {
	try {
		const notification = await prisma.notification.update({
			where: { id: parseInt(req.params.id) },
			data: { isRead: true }
		});
		res.json(notification);
	} catch (error) {
		res.status(500).json({ message: 'Failed to mark notification as read' });
	}
});

router.patch('/read-all', authenticate, async (req, res) => {
	try {
		await prisma.notification.updateMany({
			where: { userId: req.user.id, isRead: false },
			data: { isRead: true }
		});
		res.json({ message: 'All notifications marked as read' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to mark all notifications as read' });
	}
});

export default router;
