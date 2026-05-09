import express from 'express';
import axios from 'axios';
import { prisma } from '../app.js';
import { optionalAuth } from '../middleware/auth.js';
import { fetchLiveWeather } from '../services/weatherService.js';

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

const monsoonMonths = [5, 6, 7, 8, 9];

// REAL-TIME: rainfall, humidity, wind, temperature come from OpenWeatherMap API
// FALLBACK: water level is NOT available from OpenWeatherMap; uses safe baseline estimates

function calculateRiskScore(weather) {
	const month = new Date().getMonth() + 1;
	const isMonsoon = monsoonMonths.includes(month);

	const monsoonFactor = isMonsoon ? 0.25 : -0.05;

	const r = weather.rainfall / 300;
	const w = weather.water / 15;
	const wi = weather.wind / 60;
	const h = weather.humidity / 100;

	const score = Math.min(0.95, r * 0.35 + w * 0.30 + wi * 0.15 + h * 0.10 + monsoonFactor);

	return Math.max(0.05, Math.round(score * 1000) / 1000);
}

function getRiskCategory(score) {
	if (score > 0.6) return 'High';
	if (score > 0.3) return 'Medium';
	return 'Low';
}

function getExplanation(district, category, score, weather) {
	const dataNote = weather.dataSource.water.startsWith('FALLBACK')
		? ' (Note: water level is a fallback estimate — OpenWeatherMap does not provide river data; other fields are live)'
		: ' (All weather data sourced from live feeds)';

	if (category === 'High') {
		return `${district} is at HIGH flood risk (score: ${(score * 100).toFixed(0)}%) due to rainfall ${weather.rainfall}mm and water level ${weather.water}m.${dataNote}`;
	}
	if (category === 'Medium') {
		return `${district} has MODERATE flood risk (score: ${(score * 100).toFixed(0)}%). Rainfall: ${weather.rainfall}mm, Water: ${weather.water}m.${dataNote}`;
	}
	return `${district} has LOW flood risk (score: ${(score * 100).toFixed(0)}%). Rainfall: ${weather.rainfall}mm, Water: ${weather.water}m.${dataNote}`;
}

async function saveWeatherLog(weather) {
	try {
		return await prisma.weatherLog.create({
			data: {
				district: weather.district,
				temperature: weather.temperature,
				humidity: weather.humidity,
				windSpeed: weather.wind,
				rainfall: weather.rainfall,
				waterLevel: weather.water,
				description: `${weather.description} | Data source: Temp/Humidity/Wind/Rain=live(OpenWeatherMap), Water=FALLBACK(baseline estimate)`
			}
		});
	} catch (err) {
		console.error('Failed to save weather log:', err.message);
		return null;
	}
}

async function savePredictions(predictionsWithWeather) {
	for (const item of predictionsWithWeather) {
		try {
			const weatherLog = await saveWeatherLog(item.weather);

			await prisma.riskPrediction.create({
				data: {
					district: item.prediction.district,
					riskScore: item.prediction.risk_score,
					riskCategory: item.prediction.risk_category,
					explanation: item.prediction.explanation,
					weatherLogId: weatherLog?.id || null
				}
			});
		} catch (err) {
			console.error(`Failed to save prediction for ${item.prediction.district}:`, err.message);
		}
	}
}

router.post('/predict', optionalAuth, async (req, res) => {
	try {
		const { district } = req.body;
		const targetDistricts = district ? [district] : districts;

		const results = await Promise.all(
			targetDistricts.map(async (d) => {
				// Step 1: Fetch live weather (with fallback for water level)
				const weather = await fetchLiveWeather(d);

				// Step 2: Try AI service with live data
				const aiResult = await axios
					.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/predict`, {
						district: d,
						rainfall_mm: weather.rainfall,
						humidity_pct: weather.humidity,
						wind_speed_kmh: weather.wind,
						temperature_c: weather.temperature,
						water_level_m: weather.water,
						month: new Date().getMonth() + 1
					})
					.then((r) => r.data)
					.catch(() => null);

				// Step 3: If AI service unavailable, calculate locally using live weather
				const prediction = aiResult || (() => {
					const riskScore = calculateRiskScore(weather);
					const riskCategory = getRiskCategory(riskScore);
					return {
						district: d,
						risk_score: riskScore,
						risk_category: riskCategory,
						explanation: getExplanation(d, riskCategory, riskScore, weather)
					};
				})();

				return { prediction, weather };
			})
		);

		// Step 4: Save weather logs and predictions to DB
		savePredictions(results);

		// Step 5: Return enriched response
		const response = results.map(({ prediction, weather }) => ({
			...prediction,
			data_source: weather.dataSource,
			weather_data: {
				temperature: weather.temperature,
				humidity: weather.humidity,
				wind: weather.wind,
				rainfall: weather.rainfall,
				water: weather.water
			}
		}));

		res.json(response);
	} catch (error) {
		console.error('Prediction error:', error);
		res.status(500).json({ message: 'Failed to get predictions' });
	}
});

router.get('/predictions', optionalAuth, async (req, res) => {
	try {
		const predictions = await prisma.riskPrediction.findMany({
			orderBy: { createdAt: 'desc' },
			take: 50,
			include: {
				weatherLog: {
					select: {
						temperature: true,
						humidity: true,
						windSpeed: true,
						rainfall: true,
						waterLevel: true,
						description: true,
						fetchedAt: true
					}
				}
			}
		});

		const serialized = predictions.map((p) => ({
			id: p.id,
			district: p.district,
			risk_category: p.riskCategory,
			risk_score: parseFloat(p.riskScore),
			explanation: p.explanation,
			createdAt: p.createdAt,
			weather_data: p.weatherLog
				? {
						temperature: parseFloat(p.weatherLog.temperature),
						humidity: parseFloat(p.weatherLog.humidity),
						wind: parseFloat(p.weatherLog.windSpeed),
						rainfall: parseFloat(p.weatherLog.rainfall),
						water: parseFloat(p.weatherLog.waterLevel),
						fetchedAt: p.weatherLog.fetchedAt,
						dataSourceNote: p.weatherLog.description
				  }
				: null
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
			orderBy: { createdAt: 'desc' },
			include: {
				weatherLog: {
					select: {
						temperature: true,
						humidity: true,
						windSpeed: true,
						rainfall: true,
						waterLevel: true,
						description: true,
						fetchedAt: true
					}
				}
			}
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
					createdAt: p.createdAt,
					weather_data: p.weatherLog
						? {
								temperature: parseFloat(p.weatherLog.temperature),
								humidity: parseFloat(p.weatherLog.humidity),
								wind: parseFloat(p.weatherLog.windSpeed),
								rainfall: parseFloat(p.weatherLog.rainfall),
								water: parseFloat(p.weatherLog.waterLevel),
								fetchedAt: p.weatherLog.fetchedAt,
								dataSourceNote: p.weatherLog.description
						  }
						: null
				};
			}
		});

		const result = Object.values(latestByDistrict);

		if (result.length === 0) {
			// No predictions in last 24h — fetch live weather and compute fresh predictions
			const freshResults = await Promise.all(
				districts.map(async (d) => {
					const weather = await fetchLiveWeather(d);
					const riskScore = calculateRiskScore(weather);
					const riskCategory = getRiskCategory(riskScore);
					return {
						prediction: {
							district: d,
							risk_score: riskScore,
							risk_category: riskCategory,
							explanation: getExplanation(d, riskCategory, riskScore, weather)
						},
						weather
					};
				})
			);

			savePredictions(freshResults);

			return res.json(
				freshResults.map(({ prediction, weather }) => ({
					...prediction,
					data_source: weather.dataSource,
					weather_data: {
						temperature: weather.temperature,
						humidity: weather.humidity,
						wind: weather.wind,
						rainfall: weather.rainfall,
						water: weather.water
					}
				}))
			);
		}

		res.json(result);
	} catch (error) {
		// Final fallback: if DB query fails, use live weather directly
		console.error('DB error in latest predictions, using live fallback:', error.message);
		const fallbackResults = await Promise.all(
			districts.map(async (d) => {
				const weather = await fetchLiveWeather(d);
				const riskScore = calculateRiskScore(weather);
				const riskCategory = getRiskCategory(riskScore);
				return {
					district: d,
					risk_score: riskScore,
					risk_category: riskCategory,
					explanation: getExplanation(d, riskCategory, riskScore, weather),
					data_source: weather.dataSource,
					weather_data: {
						temperature: weather.temperature,
						humidity: weather.humidity,
						wind: weather.wind,
						rainfall: weather.rainfall,
						water: weather.water
					}
				};
			})
		);
		res.json(fallbackResults);
	}
});

export default router;
