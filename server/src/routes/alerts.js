import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
	try {
		const alerts = await prisma.adminAlert.findMany({
			where: { isActive: true },
			include: {
				creator: { select: { name: true } }
			},
			orderBy: { createdAt: 'desc' }
		});
		res.json(alerts);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get alerts' });
	}
});

router.post(
	'/',
	authenticate,
	authorize('admin'),
	[
		body('title').notEmpty(),
		body('message').notEmpty(),
		body('severity').optional().isIn(['info', 'warning', 'danger'])
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { title, message, severity, target_area, expires_at } = req.body;

			const alert = await prisma.adminAlert.create({
				data: {
					createdBy: req.user.id,
					title,
					message,
					severity: severity || 'info',
					targetArea: target_area,
					expiresAt: expires_at ? new Date(expires_at) : null
				}
			});

			io.emit('alert:broadcast', alert);

			res.status(201).json(alert);
		} catch (error) {
			res.status(500).json({ message: 'Failed to create alert' });
		}
	}
);

router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
	try {
		const { is_active, title, message, severity } = req.body;

		const alert = await prisma.adminAlert.update({
			where: { id: parseInt(req.params.id) },
			data: {
				...(is_active !== undefined && { isActive: is_active }),
				...(title && { title }),
				...(message && { message }),
				...(severity && { severity })
			}
		});

		if (is_active !== undefined) {
			io.emit('alert:broadcast', alert);
		}

		res.json(alert);
	} catch (error) {
		res.status(500).json({ message: 'Failed to update alert' });
	}
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
	try {
		await prisma.adminAlert.delete({
			where: { id: parseInt(req.params.id) }
		});
		res.json({ message: 'Alert deleted' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete alert' });
	}
});

export default router;
