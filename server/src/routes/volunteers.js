import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
	try {
		const volunteers = await prisma.volunteer.findMany({
			include: {
				user: {
					select: { id: true, name: true, email: true, phone: true }
				}
			}
		});
		res.json(volunteers);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get volunteers' });
	}
});

router.get('/me', authenticate, authorize('volunteer'), async (req, res) => {
	try {
		const volunteer = await prisma.volunteer.findUnique({
			where: { userId: req.user.id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
						latitude: true,
						longitude: true
					}
				}
			}
		});
		res.json(volunteer);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get volunteer' });
	}
});

router.patch(
	'/availability',
	authenticate,
	authorize('volunteer'),
	[body('availability').isIn(['available', 'busy', 'offline'])],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { availability, latitude, longitude } = req.body;

			const volunteer = await prisma.volunteer.update({
				where: { userId: req.user.id },
				data: {
					availability,
					...(latitude && { latitude: parseFloat(latitude) }),
					...(longitude && { longitude: parseFloat(longitude) })
				},
				include: {
					user: {
						select: { id: true, name: true }
					}
				}
			});

			io.to('role:admin').emit('volunteer:updated', volunteer);

			res.json(volunteer);
		} catch (error) {
			res.status(500).json({ message: 'Failed to update availability' });
		}
	}
);

router.patch('/:id/verify', authenticate, authorize('admin'), async (req, res) => {
	try {
		const volunteer = await prisma.volunteer.update({
			where: { id: parseInt(req.params.id) },
			data: { verified: true },
			include: {
				user: { select: { id: true } }
			}
		});

		await prisma.notification.create({
			data: {
				userId: volunteer.userId,
				title: 'Volunteer Verified',
				message: 'Your volunteer account has been verified',
				type: 'system'
			}
		});

		res.json(volunteer);
	} catch (error) {
		res.status(500).json({ message: 'Failed to verify volunteer' });
	}
});

router.get('/nearest', authenticate, authorize('admin'), async (req, res) => {
	try {
		const { lat, lng } = req.query;

		const volunteers = await prisma.$queryRaw`
      SELECT v.*, u.name, u.phone, u.email,
        (6371 * acos(cos(radians(${parseFloat(lat)})) * cos(radians(v.latitude)) * 
        cos(radians(v.longitude) - radians(${parseFloat(lng)})) + 
        sin(radians(${parseFloat(lat)})) * sin(radians(v.latitude)))) AS distance 
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.availability = 'available' AND v.latitude IS NOT NULL
      ORDER BY distance
      LIMIT 5
    `;

		res.json(volunteers);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get nearest volunteers' });
	}
});

export default router;
