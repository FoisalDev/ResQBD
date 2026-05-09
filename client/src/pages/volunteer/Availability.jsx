import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const VolunteerAvailability = () => {
	const { t } = useTranslation();
	const [availability, setAvailability] = useState('offline');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchAvailability = async () => {
			try {
				const response = await api.get('/volunteers/me');
				setAvailability(response.data.availability);
			} catch (error) {
				console.error('Error fetching availability:', error);
			}
		};
		fetchAvailability();
	}, []);

	const updateAvailability = async (status) => {
		setLoading(true);
		try {
			await api.patch('/volunteers/availability', { availability: status });
			setAvailability(status);
		} catch (error) {
			console.error('Error updating availability:', error);
		} finally {
			setLoading(false);
		}
	};

	const statuses = [
		{ value: 'available', label: t('volunteer.status.available'), color: 'bg-green-500' },
		{ value: 'busy', label: t('volunteer.status.busy'), color: 'bg-yellow-500' },
		{ value: 'offline', label: t('volunteer.status.offline'), color: 'bg-gray-500' }
	];

	return (
		<div className="max-w-2xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white mb-6">{t('volunteer.availability')}</h2>

				<div className="space-y-4">
					{statuses.map((status) => (
						<button
							key={status.value}
							onClick={() => updateAvailability(status.value)}
							disabled={loading || availability === status.value}
							className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
								availability === status.value
									? 'bg-slate-700 border-2 border-primary-500'
									: 'bg-slate-800/50 hover:bg-slate-700'
							}`}
						>
							<div className="flex items-center gap-3">
								<div className={`w-4 h-4 ${status.color} rounded-full`} />
								<span className="text-white font-medium">{status.label}</span>
							</div>
							{availability === status.value && (
								<svg
									className="w-5 h-5 text-primary-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
						</button>
					))}
				</div>
			</motion.div>
		</div>
	);
};

export default VolunteerAvailability;
