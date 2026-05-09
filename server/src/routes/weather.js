import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { fetchLiveWeather, fetchAllDistrictsWeather } from '../services/weatherService.js';
import { prisma } from '../app.js';

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

router.get('/current', optionalAuth, async (req, res) => {
	try {
		const { district } = req.query;
		const targetDistricts = district ? [district] : districts;

		const weatherData = await Promise.all(
			targetDistricts.map(async (d) => {
				const result = await fetchLiveWeather(d);
				return {
					district: result.district,
					temperature: result.temperature,
					humidity: result.humidity,
					wind_speed: result.wind,
					rainfall: result.rainfall,
					water_level: result.water,
					description: result.description,
					data_source: result.dataSource,
					fetched_at: result.fetchedAt
				};
			})
		);

		res.json(weatherData);
	} catch (error) {
		console.error('Weather fetch error:', error);
		res.status(500).json({ message: 'Failed to fetch weather' });
	}
});

router.get('/logs', optionalAuth, async (req, res) => {
	try {
		const logs = await prisma.weatherLog.findMany({
			orderBy: { fetchedAt: 'desc' },
			take: 100
		});
		res.json(logs);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get weather logs' });
	}
});

export default router;
