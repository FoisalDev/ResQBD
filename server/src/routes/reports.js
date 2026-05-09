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
		body('incident_type').isIn([
			'flood',
			'cyclone',
			'landslide',
			'fire',
			'building_collapse',
			'other'
		]),
		body('description').notEmpty(),
		body('latitude').isFloat({ min: -90, max: 90 }),
		body('longitude').isFloat({ min: -180, max: 180 })
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { incident_type, description, image_url, latitude, longitude } = req.body;

			const report = await prisma.disasterReport.create({
				data: {
					userId: req.user.id,
					incidentType: incident_type,
					description,
					imageUrl: image_url,
					latitude: parseFloat(latitude),
					longitude: parseFloat(longitude)
				},
				include: {
					user: { select: { name: true } }
				}
			});

			io.to('role:admin').emit('report:new', report);

			res.status(201).json(report);
		} catch (error) {
			res.status(500).json({ message: 'Failed to create report' });
		}
	}
);

router.get('/', authenticate, async (req, res) => {
	try {
		const where = req.user.role === 'citizen' ? { userId: req.user.id } : {};

		const reports = await prisma.disasterReport.findMany({
			where,
			include: {
				user: { select: { id: true, name: true, phone: true } }
			},
			orderBy: { createdAt: 'desc' }
		});

		res.json(reports);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get reports' });
	}
});

router.patch('/:id/verify', authenticate, authorize('admin'), async (req, res) => {
	try {
		const { status } = req.body;

		const report = await prisma.disasterReport.update({
			where: { id: parseInt(req.params.id) },
			data: {
				verified: status === 'verified',
				status: status === 'verified' ? 'verified' : 'rejected'
			}
		});

		res.json(report);
	} catch (error) {
		res.status(500).json({ message: 'Failed to verify report' });
	}
});

export default router;
