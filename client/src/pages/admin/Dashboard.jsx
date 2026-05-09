import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminDashboard = () => {
	const { t } = useTranslation();
	const [stats, setStats] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await api.get('/admin/stats');
				setStats(response.data);
			} catch (error) {
				console.error('Error fetching stats:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	const cards = [
		{
			title: t('admin.stats.totalSos'),
			value: stats.total_sos,
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			color: 'bg-danger'
		},
		{
			title: t('admin.stats.activeSos'),
			value: stats.active_sos,
			icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'bg-warning'
		},
		{
			title: t('admin.stats.volunteers'),
			value: stats.total_volunteers,
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
			color: 'bg-blue-500'
		},
		{
			title: 'Available',
			value: stats.available_volunteers,
			icon: 'M5 13l4 4L19 7',
			color: 'bg-green-500'
		},
		{
			title: t('admin.stats.shelters'),
			value: stats.total_shelters,
			icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
			color: 'bg-primary-500'
		},
		{
			title: 'Open Shelters',
			value: stats.open_shelters,
			icon: 'M5 13l4 4L19 7',
			color: 'bg-emerald-500'
		},
		{
			title: t('admin.stats.reliefPending'),
			value: stats.relief_pending,
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
			color: 'bg-purple-500'
		},
		{
			title: 'Total Users',
			value: stats.total_users,
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			color: 'bg-indigo-500'
		}
	];

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white">{t('admin.dashboard')}</h2>
				<p className="text-slate-300 mt-1">Overview of the disaster response platform</p>
			</motion.div>

			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{cards.map((card, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
						className="glass-card p-6 rounded-xl"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-slate-300 text-sm font-medium">{card.title}</p>
								<p className="text-3xl font-bold text-white mt-1">{loading ? '...' : card.value}</p>
							</div>
							<div
								className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
							>
								<svg
									className="w-6 h-6 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d={card.icon}
									/>
								</svg>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
};

export default AdminDashboard;
