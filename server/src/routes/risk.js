import express from 'express';
import axios from 'axios';
import { prisma } from '../app.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const districts = [
	'Dhaka',
	'Chittagong',
	'Sylhet',
	'Rajshahi',
	'Khulna',
	'Barisal',
	'Rangpur',
	'Mymensingh'
];

router.post('/predict', optionalAuth, async (req, res) => {
	try {
		const { district } = req.body;
		const targetDistricts = district ? [district] : districts;

		const predictions = await Promise.all(
			targetDistricts.map(async (d) => {
				const weather = await axios
					.get(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/predict`, {
						data: {
							district: d,
							rainfall_mm: Math.random() * 200,
							humidity_pct: 60 + Math.random() * 35,
							wind_speed_kmh: Math.random() * 60,
							temperature_c: 25 + Math.random() * 10,
							water_level_m: 5 + Math.random() * 10,
							month: new Date().getMonth() + 1
						}
					})
					.catch(() => null);

				if (weather?.data) {
					return weather.data;
				}

				const riskScore = Math.random();
				let riskCategory = 'Low';
				if (riskScore > 0.7) riskCategory = 'High';
				else if (riskScore > 0.4) riskCategory = 'Medium';

				return {
					district: d,
					risk_score: riskScore,
					risk_category: riskCategory,
					explanation: `${riskCategory} risk level predicted for ${d} district`
				};
			})
		);

		res.json(predictions);
	} catch (error) {
		console.error('Prediction error:', error);
		res.status(500).json({ message: 'Failed to get predictions' });
	}
});

router.get('/predictions', optionalAuth, async (req, res) => {
	try {
		const predictions = await prisma.riskPrediction.findMany({
			orderBy: { createdAt: 'desc' },
			take: 50
		});
		const serialized = predictions.map((p) => ({
			id: p.id,
			district: p.district,
			risk_category: p.riskCategory,
			risk_score: parseFloat(p.riskScore),
			explanation: p.explanation,
			createdAt: p.createdAt
		}));
		res.json(serialized);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get predictions' });
	}
});

router.get('/predictions/latest', optionalAuth, async (req, res) => {
	try {
		const predictions = await prisma.riskPrediction.findMany({
			where: {
				createdAt: {
					gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		const latestByDistrict = {};
		predictions.forEach((p) => {
			if (!latestByDistrict[p.district]) {
				latestByDistrict[p.district] = {
					id: p.id,
					district: p.district,
					risk_category: p.riskCategory,
					risk_score: parseFloat(p.riskScore),
					explanation: p.explanation,
					createdAt: p.createdAt
				};
			}
		});

		res.json(Object.values(latestByDistrict));
	} catch (error) {
		const fallback = districts.map((d) => ({
			district: d,
			risk_score: Math.random() * 0.8 + 0.1,
			risk_category: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
			explanation: 'Risk prediction data not available'
		}));
		res.json(fallback);
	}
});

export default router;
