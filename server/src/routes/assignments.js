import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post(
	'/',
	authenticate,
	authorize('admin'),
	[body('volunteer_id').isInt(), body('task_type').notEmpty()],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { volunteer_id, sos_request_id, task_type, description } = req.body;

			const assignment = await prisma.volunteerAssignment.create({
				data: {
					volunteerId: volunteer_id,
					sosRequestId: sos_request_id,
					taskType: task_type,
					description,
					assignedBy: req.user.id
				},
				include: {
					volunteer: { include: { user: { select: { id: true, name: true } } } },
					sosRequest: true
				}
			});

			await prisma.notification.create({
				data: {
					userId: assignment.volunteer.userId,
					title: 'New Task Assigned',
					message: `You have been assigned a ${task_type} task`,
					type: 'task'
				}
			});

			io.to(`user:${assignment.volunteer.userId}`).emit('task:assigned', assignment);

			res.status(201).json(assignment);
		} catch (error) {
			res.status(500).json({ message: 'Failed to create assignment' });
		}
	}
);

router.get('/', authenticate, async (req, res) => {
	try {
		const where = req.user.role === 'volunteer' ? { volunteer: { userId: req.user.id } } : {};

		const assignments = await prisma.volunteerAssignment.findMany({
			where,
			include: {
				volunteer: { include: { user: { select: { id: true, name: true, phone: true } } } },
				sosRequest: true,
				assignedByUser: { select: { name: true } }
			},
			orderBy: { createdAt: 'desc' }
		});

		res.json(assignments);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get assignments' });
	}
});

router.patch(
	'/:id/status',
	authenticate,
	authorize('volunteer'),
	[body('status').isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { status } = req.body;

			const assignment = await prisma.volunteerAssignment.update({
				where: { id: parseInt(req.params.id) },
				data: { status },
				include: {
					volunteer: { include: { user: { select: { id: true } } } }
				}
			});

			if (status === 'completed' && assignment.sosRequestId) {
				await prisma.sOSRequest.update({
					where: { id: assignment.sosRequestId },
					data: { status: 'resolved' }
				});
			}

			io.to('role:admin').emit('task:updated', assignment);

			res.json(assignment);
		} catch (error) {
			res.status(500).json({ message: 'Failed to update assignment' });
		}
	}
);

router.get('/suggest/:sosId', authenticate, authorize('admin'), async (req, res) => {
	try {
		const sos = await prisma.sOSRequest.findUnique({
			where: { id: parseInt(req.params.sosId) }
		});

		if (!sos) {
			return res.status(404).json({ message: 'SOS not found' });
		}

		const volunteers = await prisma.$queryRaw`
      SELECT v.*, u.name, u.phone, u.email,
        (6371 * acos(cos(radians(${sos.latitude})) * cos(radians(v.latitude)) * 
        cos(radians(v.longitude) - radians(${sos.longitude})) + 
        sin(radians(${sos.latitude})) * sin(radians(v.latitude)))) AS distance 
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.availability = 'available' AND v.latitude IS NOT NULL AND v.verified = true
      ORDER BY distance
      LIMIT 5
    `;

		res.json(volunteers);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get suggested volunteers' });
	}
});

export default router;
