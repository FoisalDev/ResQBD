import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post(
	'/',
	authenticate,
	authorize('citizen'),
	[
		body('emergency_type').isIn(['flood', 'cyclone', 'landslide', 'fire', 'other']),
		body('severity').isInt({ min: 1, max: 5 }),
		body('latitude').isFloat({ min: -90, max: 90 }),
		body('longitude').isFloat({ min: -180, max: 180 })
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { emergency_type, severity, description, latitude, longitude } = req.body;

			const sos = await prisma.sOSRequest.create({
				data: {
					userId: req.user.id,
					emergencyType: emergency_type,
					severity,
					description,
					latitude: parseFloat(latitude),
					longitude: parseFloat(longitude)
				},
				include: {
					user: {
						select: { name: true, phone: true }
					}
				}
			});

			await prisma.notification.create({
				data: {
					userId: req.user.id,
					title: 'SOS Submitted',
					message: `Your SOS request has been submitted. Type: ${emergency_type}`,
					type: 'sos'
				}
			});

			io.to('role:admin').emit('sos:new', sos);
			io.to('role:volunteer').emit('sos:new', sos);

			res.status(201).json(sos);
		} catch (error) {
			console.error('Create SOS error:', error);
			res.status(500).json({ message: 'Failed to create SOS' });
		}
	}
);

router.get('/', authenticate, async (req, res) => {
	try {
		const where = req.user.role === 'citizen' ? { userId: req.user.id } : {};

		const sos = await prisma.sOSRequest.findMany({
			where,
			include: {
				user: {
					select: { id: true, name: true, phone: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		res.json(sos);
	} catch (error) {
		console.error('Get SOS error:', error);
		res.status(500).json({ message: 'Failed to get SOS' });
	}
});

router.get('/:id', authenticate, async (req, res) => {
	try {
		const sos = await prisma.sOSRequest.findUnique({
			where: { id: parseInt(req.params.id) },
			include: {
				user: {
					select: { id: true, name: true, phone: true }
				}
			}
		});

		if (!sos) {
			return res.status(404).json({ message: 'SOS not found' });
		}

		if (req.user.role === 'citizen' && sos.userId !== req.user.id) {
			return res.status(403).json({ message: 'Access denied' });
		}

		res.json(sos);
	} catch (error) {
		console.error('Get SOS by id error:', error);
		res.status(500).json({ message: 'Failed to get SOS' });
	}
});

router.patch(
	'/:id/status',
	authenticate,
	authorize('admin'),
	[body('status').isIn(['pending', 'acknowledged', 'in_progress', 'resolved', 'cancelled'])],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { status } = req.body;

			const sos = await prisma.sOSRequest.update({
				where: { id: parseInt(req.params.id) },
				data: { status },
				include: {
					user: {
						select: { id: true, name: true }
					}
				}
			});

			await prisma.notification.create({
				data: {
					userId: sos.userId,
					title: 'SOS Status Updated',
					message: `Your SOS has been ${status.replace('_', ' ')}`,
					type: 'sos'
				}
			});

			io.to(`user:${sos.userId}`).emit('sos:updated', sos);
			io.to('role:admin').emit('sos:updated', sos);

			res.json(sos);
		} catch (error) {
			console.error('Update SOS status error:', error);
			res.status(500).json({ message: 'Failed to update SOS status' });
		}
	}
);

export default router;
