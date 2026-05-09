import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks';
import api from '../../services/api';

const VolunteerDashboard = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [stats, setStats] = useState({ tasksPending: 0, tasksCompleted: 0, deliveries: 0 });
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [tasksRes, deliveriesRes] = await Promise.all([
					api.get('/assignments'),
					api.get('/relief/distributions')
				]);

				setStats({
					tasksPending: tasksRes.data.filter((t) => t.status === 'pending').length,
					tasksCompleted: tasksRes.data.filter((t) => t.status === 'completed').length,
					deliveries: deliveriesRes.data.length
				});
				setTasks(tasksRes.data.slice(0, 5));
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const cards = [
		{
			title: 'Pending Tasks',
			value: stats.tasksPending,
			icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'bg-warning'
		},
		{
			title: 'Completed',
			value: stats.tasksCompleted,
			icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'bg-green-500'
		},
		{
			title: 'Deliveries',
			value: stats.deliveries,
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
			color: 'bg-info'
		}
	];

	return (
		<div className="space-y-6">
			<div className="glass-card p-6 rounded-xl">
				<h2 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h2>
				<p className="text-slate-300 mt-1">Here's your volunteer overview.</p>
			</div>

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
								<p className="text-slate-300 text-sm font-medium">{card.title}</p>
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

			<div className="glass-card p-6 rounded-xl">
				<h3 className="text-lg font-semibold text-white mb-4">Assigned Tasks</h3>
				{loading ? (
					<p className="text-slate-300">{t('common.loading')}</p>
				) : tasks.length > 0 ? (
					<div className="space-y-3">
						{tasks.map((task) => (
							<div
								key={task.id}
								className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
							>
								<div>
									<p className="text-white font-medium">{task.task_type}</p>
									<p className="text-sm text-slate-400">
										{new Date(task.created_at).toLocaleDateString()}
									</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${
										task.status === 'completed'
											? 'bg-green-500/20 text-green-500'
											: task.status === 'in_progress'
												? 'bg-blue-500/20 text-blue-500'
												: 'bg-yellow-500/20 text-yellow-500'
									}`}
								>
									{task.status}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-slate-300">No tasks assigned</p>
				)}
			</div>
		</div>
	);
};

export default VolunteerDashboard;
