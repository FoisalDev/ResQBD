import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import api from '../../services/api';

const CitizenDashboard = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [stats, setStats] = useState({ sosPending: 0, reliefPending: 0, reports: 0 });
	const [recentSOS, setRecentSOS] = useState([]);
	const [alerts, setAlerts] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [sosRes, reliefRes, reportsRes, alertsRes] = await Promise.all([
					api.get('/sos'),
					api.get('/relief/requests'),
					api.get('/reports'),
					api.get('/alerts')
				]);

				setStats({
					sosPending: sosRes.data.filter((s) => s.status === 'pending').length,
					reliefPending: reliefRes.data.filter((r) => r.status === 'pending').length,
					reports: reportsRes.data.length
				});
				setRecentSOS(sosRes.data.slice(0, 3));
				setAlerts(alertsRes.data.slice(0, 3));
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			}
		};
		fetchData();
	}, []);

	const cards = [
		{
			title: 'SOS Requests',
			value: stats.sosPending,
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			color: 'bg-danger'
		},
		{
			title: 'Relief Pending',
			value: stats.reliefPending,
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
			color: 'bg-warning'
		},
		{
			title: 'Reports',
			value: stats.reports,
			icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			color: 'bg-info'
		}
	];

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="glass-card p-6 rounded-xl">
				<h2 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h2>
				<p className="text-slate-400 mt-1">Stay safe. Here's your emergency status overview.</p>
			</div>

			{/* Stats Cards */}
			<div className="grid md:grid-cols-3 gap-6">
				{cards.map((card, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="glass-card p-6 rounded-xl"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-slate-400 text-sm">{card.title}</p>
								<p className="text-3xl font-bold text-white mt-1">{card.value}</p>
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

			{/* Alerts */}
			{alerts.length > 0 && (
				<div className="glass-card p-6 rounded-xl">
					<h3 className="text-lg font-semibold text-white mb-4">Active Alerts</h3>
					<div className="space-y-3">
						{alerts.map((alert) => (
							<div
								key={alert.id}
								className={`p-4 rounded-lg ${
									alert.severity === 'danger'
										? 'bg-danger/20 border-danger/50'
										: alert.severity === 'warning'
											? 'bg-warning/20 border-warning/50'
											: 'bg-info/20 border-info/50'
								} border`}
							>
								<h4 className="font-semibold text-white">{alert.title}</h4>
								<p className="text-sm text-slate-300 mt-1">{alert.message}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Quick Actions */}
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Link
					to="/citizen/sos"
					className="glass-card p-4 rounded-xl hover:border-danger/50 transition-colors"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-danger/20 rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-danger"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<span className="text-white font-medium">Send SOS</span>
					</div>
				</Link>

				<Link
					to="/citizen/report"
					className="glass-card p-4 rounded-xl hover:border-warning/50 transition-colors"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-warning"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<span className="text-white font-medium">Report Incident</span>
					</div>
				</Link>

				<Link
					to="/citizen/relief"
					className="glass-card p-4 rounded-xl hover:border-info/50 transition-colors"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-info"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
								/>
							</svg>
						</div>
						<span className="text-white font-medium">Request Relief</span>
					</div>
				</Link>

				<Link
					to="/citizen/shelters"
					className="glass-card p-4 rounded-xl hover:border-primary-500/50 transition-colors"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
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
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<span className="text-white font-medium">Find Shelter</span>
					</div>
				</Link>
			</div>

			{/* Recent SOS */}
			<div className="glass-card p-6 rounded-xl">
				<h3 className="text-lg font-semibold text-white mb-4">Recent SOS Requests</h3>
				{recentSOS.length > 0 ? (
					<div className="space-y-3">
						{recentSOS.map((sos) => (
							<div
								key={sos.id}
								className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
							>
								<div>
									<p className="text-white font-medium">{sos.emergency_type}</p>
									<p className="text-sm text-slate-400">
										{new Date(sos.created_at).toLocaleDateString()}
									</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${
										sos.status === 'resolved'
											? 'bg-green-500/20 text-green-500'
											: sos.status === 'in_progress'
												? 'bg-blue-500/20 text-blue-500'
												: 'bg-yellow-500/20 text-yellow-500'
									}`}
								>
									{sos.status.replace('_', ' ')}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-slate-400">No recent SOS requests</p>
				)}
			</div>
		</div>
	);
};

export default CitizenDashboard;
