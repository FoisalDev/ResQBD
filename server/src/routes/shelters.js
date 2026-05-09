import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma, io } from '../app.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
	try {
		const shelters = await prisma.shelter.findMany({
			where: { status: { not: 'closed' } },
			orderBy: { name: 'asc' }
		});
		res.json(shelters);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get shelters' });
	}
});

router.get(
	'/nearby',
	optionalAuth,
	[query('lat').isFloat({ min: -90, max: 90 }), query('lng').isFloat({ min: -180, max: 180 })],
	async (req, res) => {
		try {
			const { lat, lng } = req.query;
			const radius = 50;

			const shelters = await prisma.$queryRaw`
      SELECT *, 
        (6371 * acos(cos(radians(${parseFloat(lat)})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${parseFloat(lng)})) + 
        sin(radians(${parseFloat(lat)})) * sin(radians(latitude)))) AS distance 
      FROM shelters 
      WHERE status != 'closed'
      HAVING distance < ${radius}
      ORDER BY distance
      LIMIT 10
    `;

			res.json(shelters);
		} catch (error) {
			console.error('Get nearby shelters error:', error);
			res.status(500).json({ message: 'Failed to get nearby shelters' });
		}
	}
);

router.post(
	'/',
	authenticate,
	authorize('admin'),
	[
		body('name').notEmpty(),
		body('address').notEmpty(),
		body('latitude').isFloat({ min: -90, max: 90 }),
		body('longitude').isFloat({ min: -180, max: 180 }),
		body('capacity').isInt({ min: 1 })
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { name, address, latitude, longitude, capacity, contact_phone, status } = req.body;

			const shelter = await prisma.shelter.create({
				data: {
					name,
					address,
					latitude: parseFloat(latitude),
					longitude: parseFloat(longitude),
					capacity,
					contactPhone: contact_phone,
					status: status || 'open',
					createdBy: req.user.id
				}
			});

			io.emit('map:refresh', { type: 'shelter' });

			res.status(201).json(shelter);
		} catch (error) {
			console.error('Create shelter error:', error);
			res.status(500).json({ message: 'Failed to create shelter' });
		}
	}
);

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
	try {
		const {
			name,
			address,
			latitude,
			longitude,
			capacity,
			contact_phone,
			status,
			current_occupancy
		} = req.body;

		const shelter = await prisma.shelter.update({
			where: { id: parseInt(req.params.id) },
			data: {
				...(name && { name }),
				...(address && { address }),
				...(latitude && { latitude: parseFloat(latitude) }),
				...(longitude && { longitude: parseFloat(longitude) }),
				...(capacity && { capacity: parseInt(capacity) }),
				...(contact_phone && { contactPhone: contact_phone }),
				...(status && { status }),
				...(current_occupancy !== undefined && { currentOccupancy: parseInt(current_occupancy) })
			}
		});

		io.emit('map:refresh', { type: 'shelter' });

		res.json(shelter);
	} catch (error) {
		console.error('Update shelter error:', error);
		res.status(500).json({ message: 'Failed to update shelter' });
	}
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
	try {
		await prisma.shelter.delete({
			where: { id: parseInt(req.params.id) }
		});

		io.emit('map:refresh', { type: 'shelter' });

		res.json({ message: 'Shelter deleted' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete shelter' });
	}
});

export default router;
