import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fetchLiveWeather } from '../src/services/weatherService.js';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
	console.log('Seeding database...');

	const adminPassword = await bcrypt.hash('admin1234', 12);
	const volunteerPassword = await bcrypt.hash('@Resq1234', 12);
	const citizenPassword = await bcrypt.hash('@Resq1234', 12);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@gmail.com' },
		update: {},
		create: {
			name: 'System Administrator',
			email: 'admin@gmail.com',
			phone: '+8801234567890',
			passwordHash: adminPassword,
			role: 'admin'
		}
	});

	const volunteer = await prisma.user.upsert({
		where: { email: 'volunteer@gmail.com' },
		update: {},
		create: {
			name: 'Ahmed Hasan',
			email: 'volunteer@gmail.com',
			phone: '+8801234567891',
			passwordHash: volunteerPassword,
			role: 'volunteer'
		}
	});

	await prisma.volunteer.upsert({
		where: { userId: volunteer.id },
		update: {},
		create: {
			userId: volunteer.id,
			skills: 'First Aid, Water Rescue, First Response',
			availability: 'available',
			verified: true,
			latitude: 23.8103,
			longitude: 90.4125
		}
	});

	const citizen = await prisma.user.upsert({
		where: { email: 'citizen@gmail.com' },
		update: {},
		create: {
			name: 'Rahim Ahmed',
			email: 'citizen@gmail.com',
			phone: '+8801234567892',
			passwordHash: citizenPassword,
			role: 'citizen',
			latitude: 23.8103,
			longitude: 90.4125
		}
	});

	const shelters = [
		{
			name: 'Dhaka North Shelter',
			address: 'Gulshan-2, Dhaka',
			latitude: 23.7925,
			longitude: 90.4078,
			capacity: 500,
			status: 'open',
			contactPhone: '+8802-222222222'
		},
		{
			name: 'Dhaka South Shelter',
			address: 'Mirpur-10, Dhaka',
			latitude: 23.8098,
			longitude: 90.3666,
			capacity: 300,
			status: 'open',
			contactPhone: '+8802-222222223'
		},
		{
			name: 'Chittagong Central Shelter',
			address: 'GEC Circle, Chittagong',
			latitude: 22.3569,
			longitude: 91.7832,
			capacity: 400,
			status: 'open',
			contactPhone: '+88031-222222'
		},
		{
			name: 'Sylhet Shelter',
			address: 'Zinda Bazar, Sylhet',
			latitude: 24.899,
			longitude: 91.8719,
			capacity: 250,
			status: 'open',
			contactPhone: '+880821-222222'
		},
		{
			name: 'Khulna Shelter',
			address: 'Khalishpur, Khulna',
			latitude: 22.8456,
			longitude: 89.5403,
			capacity: 350,
			status: 'full',
			contactPhone: '+88041-222222'
		}
	];

	for (const shelter of shelters) {
		await prisma.shelter.upsert({
			where: { id: shelters.indexOf(shelter) + 1 },
			update: shelter,
			create: {
				...shelter,
				createdBy: admin.id
			}
		});
	}

	await prisma.sOSRequest.create({
		data: {
			userId: citizen.id,
			emergencyType: 'flood',
			severity: 4,
			description: 'Severe flooding in the area',
			latitude: 23.8103,
			longitude: 90.4125,
			status: 'pending'
		}
	});

	await prisma.disasterReport.create({
		data: {
			userId: citizen.id,
			incidentType: 'flood',
			description: 'Water level rising rapidly in the neighborhood',
			latitude: 23.815,
			longitude: 90.41,
			status: 'submitted'
		}
	});

	await prisma.reliefRequest.create({
		data: {
			userId: citizen.id,
			reliefType: 'food',
			quantity: '10 kg rice, 5 kg potatoes',
			urgency: 'high',
			description: 'Family of 5 needs food supplies',
			status: 'pending'
		}
	});

	const alerts = [
		{
			createdBy: admin.id,
			title: 'Monsoon Alert',
			message: 'Heavy rainfall expected in Dhaka and Sylhet districts',
			severity: 'warning',
			targetArea: 'Dhaka, Sylhet',
			isActive: true
		},
		{
			createdBy: admin.id,
			title: 'Cyclone Warning',
			message: 'Cyclone Amphan approaching coastal areas',
			severity: 'danger',
			targetArea: 'Chittagong, Barisal',
			isActive: true
		}
	];

	for (const alert of alerts) {
		await prisma.adminAlert.create({ data: alert });
	}

	const districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
	const month = new Date().getMonth() + 1;
	const monsoonMonths = [5, 6, 7, 8, 9];

	console.log('Fetching live weather data for risk predictions...');
	for (const district of districts) {
		// REAL-TIME: weather data from OpenWeatherMap (with fallback for water level)
		const weather = await fetchLiveWeather(district);

		const isMonsoon = monsoonMonths.includes(month);
		const monsoonFactor = isMonsoon ? 0.25 : -0.05;

		const riskScore = Math.min(0.95, Math.max(0.05,
			(weather.rainfall / 300) * 0.35 +
			(weather.water / 15) * 0.30 +
			(weather.wind / 60) * 0.15 +
			(weather.humidity / 100) * 0.10 +
			monsoonFactor
		));

		const riskCategory = riskScore > 0.6 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low';

		const dataNote = weather.dataSource.water.startsWith('FALLBACK')
			? ' (Note: water level is a fallback estimate — OpenWeatherMap does not provide river data; other fields are live)'
			: '';

		// Save weather log first
		const weatherLog = await prisma.weatherLog.create({
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

		await prisma.riskPrediction.create({
			data: {
				district,
				riskScore: Math.round(riskScore * 1000) / 1000,
				riskCategory,
				explanation: `${riskCategory} flood risk predicted for ${district} district based on live weather data (rainfall: ${weather.rainfall}mm, water: ${weather.water}m).${dataNote}`,
				weatherLogId: weatherLog.id
			}
		});

		console.log(`  ${district}: ${riskCategory} (score: ${(riskScore * 100).toFixed(0)}%) — weather: live, water: ${weather.dataSource.water.startsWith('FALLBACK') ? 'FALLBACK' : 'live'}`);
	}

	console.log('Database seeded successfully!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
