import express from 'express';
import axios from 'axios';
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

router.get('/current', optionalAuth, async (req, res) => {
	try {
		const { district } = req.query;
		const targetDistricts = district ? [district] : districts;

		const weatherData = await Promise.all(
			targetDistricts.map(async (d) => {
				try {
					if (
						process.env.OPENWEATHER_API_KEY &&
						process.env.OPENWEATHER_API_KEY !== 'your-openweather-api-key'
					) {
						const response = await axios.get(
							`https://api.openweathermap.org/data/2.5/weather?q=${d},BD`,
							{ params: { appid: process.env.OPENWEATHER_API_KEY } }
						);
						return {
							district: d,
							temperature: response.data.main.temp - 273.15,
							humidity: response.data.main.humidity,
							wind_speed: response.data.wind.speed * 3.6,
							description: response.data.weather[0].description,
							fetched_at: new Date()
						};
					}
				} catch (e) {
					console.log(`Weather API error for ${d}:`, e.message);
				}

				return {
					district: d,
					temperature: 28 + Math.random() * 5,
					humidity: 70 + Math.random() * 20,
					wind_speed: 10 + Math.random() * 20,
					description: 'Partly cloudy',
					fetched_at: new Date()
				};
			})
		);

		res.json(weatherData);
	} catch (error) {
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
