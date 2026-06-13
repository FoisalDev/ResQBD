import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post(
	'/',
	authenticate,
	authorize('admin'),
	[body('volunteer_id').isInt(), body('sos_request_id').optional().isInt(), body('task_type').notEmpty()],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { volunteer_id, sos_request_id, task_type, description } = req.body;

			const volunteer = await prisma.volunteer.findUnique({
				where: { id: volunteer_id }
			});
			if (!volunteer) {
				return res.status(404).json({ message: 'Volunteer not found' });
			}

			if (sos_request_id) {
				const sos = await prisma.sOSRequest.findUnique({
					where: { id: sos_request_id }
				});
				if (!sos) {
					return res.status(404).json({ message: 'SOS request not found' });
				}
			}

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

			prisma.notification.create({
				data: {
					userId: assignment.volunteer.userId,
					title: 'New Task Assigned',
					message: `You have been assigned a ${task_type} task`,
					type: 'task',
					link: '/volunteer/tasks'
				}
			}).catch((err) => console.error('Failed to create notification:', err));

			io.to(`user:${assignment.volunteer.userId}`).emit('task:assigned', assignment);

			res.status(201).json(assignment);
		} catch (error) {
			console.error('Create assignment error:', error);
			if (error.code === 'P2002') {
				return res.status(409).json({ message: 'This SOS already has a volunteer assigned (unique constraint). Run prisma db push to remove the old constraint.' });
			}
			if (error.code === 'P2003') {
				return res.status(400).json({ message: 'Invalid volunteer or SOS reference' });
			}
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
        AND v.id NOT IN (
          SELECT va.volunteer_id FROM volunteer_assignments va WHERE va.sos_request_id = ${sos.id}
        )
      ORDER BY distance
      LIMIT 5
    `;

		res.json(volunteers);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get suggested volunteers' });
	}
});

export default router;
