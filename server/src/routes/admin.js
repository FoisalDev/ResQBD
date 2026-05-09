import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { prisma } from '../app.js';

const router = express.Router();

router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
	try {
		const [
			totalSOS,
			activeSOS,
			totalVolunteers,
			availableVolunteers,
			totalShelters,
			openShelters,
			pendingRelief,
			totalUsers
		] = await Promise.all([
			prisma.sOSRequest.count(),
			prisma.sOSRequest.count({
				where: { status: { in: ['pending', 'acknowledged', 'in_progress'] } }
			}),
			prisma.volunteer.count(),
			prisma.volunteer.count({ where: { availability: 'available' } }),
			prisma.shelter.count(),
			prisma.shelter.count({ where: { status: 'open' } }),
			prisma.reliefRequest.count({ where: { status: 'pending' } }),
			prisma.user.count()
		]);

		res.json({
			total_sos: totalSOS,
			active_sos: activeSOS,
			total_volunteers: totalVolunteers,
			available_volunteers: availableVolunteers,
			total_shelters: totalShelters,
			open_shelters: openShelters,
			relief_pending: pendingRelief,
			total_users: totalUsers
		});
	} catch (error) {
		console.error('Stats error:', error);
		res.status(500).json({ message: 'Failed to get stats' });
	}
});

router.get('/analytics/incidents', authenticate, authorize('admin'), async (req, res) => {
	try {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const incidents = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count, 'sos' as type
      FROM sos_requests
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT DATE(created_at) as date, COUNT(*) as count, 'report' as type
      FROM disaster_reports
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

		const serialized = incidents.map((i) => ({
			date: i.date,
			count: Number(i.count),
			type: i.type
		}));
		res.json(serialized);
	} catch (error) {
		console.error('Incident analytics error:', error.message);
		res.status(500).json({ message: 'Failed to get incident analytics' });
	}
});

router.get('/analytics/relief', authenticate, authorize('admin'), async (req, res) => {
	try {
		const byStatus = await prisma.reliefRequest.groupBy({
			by: ['status'],
			_count: { status: true }
		});

		const byType = await prisma.reliefRequest.groupBy({
			by: ['reliefType'],
			_count: { reliefType: true }
		});

		res.json({
			by_status: byStatus,
			by_type: byType
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to get relief analytics' });
	}
});

router.get('/users', authenticate, authorize('admin'), async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				createdAt: true
			},
			orderBy: { createdAt: 'desc' }
		});
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get users' });
	}
});

router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
	try {
		await prisma.user.delete({
			where: { id: parseInt(req.params.id) }
		});
		res.json({ message: 'User deleted' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete user' });
	}
});

export default router;
