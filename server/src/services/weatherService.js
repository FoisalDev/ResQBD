import axios from 'axios';

const DISTRICTS = [
	'Dhaka',
	'Chittagong',
	'Sylhet',
	'Rajshahi',
	'Khulna',
	'Barisal',
	'Rangpur',
	'Mymensingh'
];

const FALLBACK_WATER_LEVELS = {
	Dhaka: 3.5,
	Chittagong: 4.0,
	Sylhet: 4.5,
	Rajshahi: 2.0,
	Khulna: 3.5,
	Barisal: 4.0,
	Rangpur: 2.5,
	Mymensingh: 3.5
};

export async function fetchLiveWeather(district) {
	const hasApiKey =
		process.env.OPENWEATHER_API_KEY &&
		process.env.OPENWEATHER_API_KEY !== 'your-openweather-api-key';

	if (hasApiKey) {
		try {
			const response = await axios.get(
				`https://api.openweathermap.org/data/2.5/weather?q=${district},BD`,
				{ params: { appid: process.env.OPENWEATHER_API_KEY } }
			);

			const data = response.data;

			const rainfall = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;

			const description = data.weather[0].description;

			return {
				district,
				temperature: parseFloat((data.main.temp - 273.15).toFixed(1)),
				humidity: data.main.humidity,
				wind: parseFloat((data.wind.speed * 3.6).toFixed(1)),
				rainfall: parseFloat(rainfall.toFixed(1)),
				water: FALLBACK_WATER_LEVELS[district] || 3.0,
				description,
				fetchedAt: new Date(),
				dataSource: {
					temperature: 'live — OpenWeatherMap',
					humidity: 'live — OpenWeatherMap',
					wind: 'live — OpenWeatherMap',
					rainfall: 'live — OpenWeatherMap',
					water: 'FALLBACK — OpenWeatherMap does not provide water level data; using dry-season baseline estimate'
				}
			};
		} catch (err) {
			console.warn(`OpenWeatherMap API error for ${district}: ${err.message}`);
		}
	}

	console.warn(`FALLBACK: No live weather for ${district} — using simulated data`);

	return {
		district,
		temperature: parseFloat((28 + Math.random() * 5).toFixed(1)),
		humidity: Math.round(70 + Math.random() * 20),
		wind: parseFloat((10 + Math.random() * 20).toFixed(1)),
		rainfall: 0,
		water: FALLBACK_WATER_LEVELS[district] || 3.0,
		description: 'Estimated (no live data source configured)',
		fetchedAt: new Date(),
		dataSource: {
			temperature: 'FALLBACK — no OpenWeatherMap API key or API call failed',
			humidity: 'FALLBACK — no OpenWeatherMap API key or API call failed',
			wind: 'FALLBACK — no OpenWeatherMap API key or API call failed',
			rainfall: 'FALLBACK — no rain data available; set to 0',
			water: 'FALLBACK — OpenWeatherMap does not provide water levels; using dry-season baseline estimate'
		}
	};
}

export async function fetchAllDistrictsWeather() {
	const results = await Promise.allSettled(
		DISTRICTS.map(async (d) => {
			return await fetchLiveWeather(d);
		})
	);

	return results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);
}
