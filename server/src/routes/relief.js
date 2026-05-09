import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post(
	'/requests',
	authenticate,
	authorize('citizen'),
	[
		body('relief_type').isIn(['food', 'water', 'medicine', 'clothing', 'shelter', 'other']),
		body('quantity').notEmpty(),
		body('urgency').isIn(['low', 'medium', 'high', 'critical'])
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { relief_type, quantity, urgency, description, latitude, longitude } = req.body;

			const relief = await prisma.reliefRequest.create({
				data: {
					userId: req.user.id,
					reliefType: relief_type,
					quantity,
					urgency,
					description,
					latitude: latitude ? parseFloat(latitude) : null,
					longitude: longitude ? parseFloat(longitude) : null
				}
			});

			res.status(201).json(relief);
		} catch (error) {
			res.status(500).json({ message: 'Failed to create relief request' });
		}
	}
);

router.get('/requests', authenticate, async (req, res) => {
	try {
		const where = req.user.role === 'citizen' ? { userId: req.user.id } : {};

		const requests = await prisma.reliefRequest.findMany({
			where,
			include: {
				user: { select: { id: true, name: true, phone: true } }
			},
			orderBy: { createdAt: 'desc' }
		});

		res.json(requests);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get relief requests' });
	}
});

router.patch('/requests/:id/approve', authenticate, authorize('admin'), async (req, res) => {
	try {
		const { status } = req.body;

		const relief = await prisma.reliefRequest.update({
			where: { id: parseInt(req.params.id) },
			data: { status: status === 'approved' ? 'approved' : 'rejected' },
			include: { user: { select: { id: true } } }
		});

		await prisma.notification.create({
			data: {
				userId: relief.userId,
				title: 'Relief Request ' + (status === 'approved' ? 'Approved' : 'Rejected'),
				message: `Your relief request has been ${status}`,
				type: 'relief'
			}
		});

		io.to(`user:${relief.userId}`).emit('relief:updated', relief);

		res.json(relief);
	} catch (error) {
		res.status(500).json({ message: 'Failed to update relief request' });
	}
});

router.post(
	'/distributions',
	authenticate,
	authorize('admin'),
	[body('relief_request_id').isInt(), body('volunteer_id').optional().isInt()],
	async (req, res) => {
		try {
			const { relief_request_id, volunteer_id, notes } = req.body;

			const distribution = await prisma.reliefDistribution.create({
				data: {
					reliefRequestId: relief_request_id,
					volunteerId: volunteer_id,
					approvedBy: req.user.id,
					notes
				}
			});

			await prisma.reliefRequest.update({
				where: { id: relief_request_id },
				data: { status: 'dispatched' }
			});

			if (volunteer_id) {
				const volunteer = await prisma.volunteer.findUnique({ where: { id: volunteer_id } });
				if (volunteer) {
					await prisma.notification.create({
						data: {
							userId: volunteer.userId,
							title: 'New Relief Delivery',
							message: 'You have been assigned a relief delivery task',
							type: 'task'
						}
					});
					io.to(`user:${volunteer.userId}`).emit('task:assigned', distribution);
				}
			}

			res.status(201).json(distribution);
		} catch (error) {
			res.status(500).json({ message: 'Failed to create distribution' });
		}
	}
);

router.get('/distributions', authenticate, async (req, res) => {
	try {
		const where = req.user.role === 'volunteer' ? { volunteer: { userId: req.user.id } } : {};

		const distributions = await prisma.reliefDistribution.findMany({
			where,
			include: {
				reliefRequest: { include: { user: { select: { name: true, phone: true } } } },
				volunteer: { include: { user: { select: { name: true } } } }
			}
		});

		res.json(distributions);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get distributions' });
	}
});

router.patch(
	'/distributions/:id/status',
	authenticate,
	authorize('volunteer', 'admin'),
	async (req, res) => {
		try {
			const { delivery_status } = req.body;

			const distribution = await prisma.reliefDistribution.update({
				where: { id: parseInt(req.params.id) },
				data: { deliveryStatus: delivery_status },
				include: { reliefRequest: true }
			});

			if (delivery_status === 'delivered') {
				await prisma.reliefRequest.update({
					where: { id: distribution.reliefRequestId },
					data: { status: 'delivered' }
				});
			}

			res.json(distribution);
		} catch (error) {
			res.status(500).json({ message: 'Failed to update distribution' });
		}
	}
);

export default router;
