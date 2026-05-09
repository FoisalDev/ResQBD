import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('Seeding database...');

	const adminPassword = await bcrypt.hash('admin123', 12);
	const volunteerPassword = await bcrypt.hash('volunteer123', 12);
	const citizenPassword = await bcrypt.hash('citizen123', 12);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@resqbd.gov.bd' },
		update: {},
		create: {
			name: 'System Administrator',
			email: 'admin@resqbd.gov.bd',
			phone: '+8801234567890',
			passwordHash: adminPassword,
			role: 'admin'
		}
	});

	const volunteer = await prisma.user.upsert({
		where: { email: 'volunteer@resqbd.org' },
		update: {},
		create: {
			name: 'Ahmed Hasan',
			email: 'volunteer@resqbd.org',
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
		where: { email: 'citizen@example.com' },
		update: {},
		create: {
			name: 'Rahim Ahmed',
			email: 'citizen@example.com',
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
	const riskCategories = ['Low', 'Medium', 'High'];

	for (const district of districts) {
		const riskScore = Math.random();
		const riskCategory = riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Medium' : 'Low';

		await prisma.riskPrediction.create({
			data: {
				district,
				riskScore,
				riskCategory,
				explanation: `${riskCategory} flood risk predicted for ${district} district based on current weather conditions`
			}
		});
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
