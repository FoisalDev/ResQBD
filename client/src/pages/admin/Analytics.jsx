import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar
} from 'recharts';
import api from '../../services/api';

const AdminAnalytics = () => {
	const { t } = useTranslation();
	const [incidents, setIncidents] = useState([]);
	const [relief, setRelief] = useState({ by_status: [], by_type: [] });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [incidentsRes, reliefRes] = await Promise.all([
					api.get('/admin/analytics/incidents'),
					api.get('/admin/analytics/relief')
				]);
				setIncidents(incidentsRes.data);
				setRelief(reliefRes.data);
			} catch (error) {
				console.error('Error fetching analytics:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

	const reliefStatusData =
		relief.by_status?.map((s) => ({
			name: s.status,
			value: s._count.status
		})) || [];

	const reliefTypeData =
		relief.by_type?.map((t) => ({
			name: t.reliefType,
			value: t._count.reliefType
		})) || [];

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-white">{t('admin.analytics')}</h2>

			{loading ? (
				<p className="text-slate-400">{t('common.loading')}</p>
			) : (
				<div className="grid md:grid-cols-2 gap-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="glass-card p-6 rounded-xl"
					>
						<h3 className="text-lg font-semibold text-white mb-4">Incidents Over Time</h3>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={incidents}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis dataKey="date" stroke="#9CA3AF" />
								<YAxis stroke="#9CA3AF" />
								<Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
								<Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
							</LineChart>
						</ResponsiveContainer>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="glass-card p-6 rounded-xl"
					>
						<h3 className="text-lg font-semibold text-white mb-4">Relief by Status</h3>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={reliefStatusData}
									cx="50%"
									cy="50%"
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									label
								>
									{reliefStatusData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
							</PieChart>
						</ResponsiveContainer>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="glass-card p-6 rounded-xl md:col-span-2"
					>
						<h3 className="text-lg font-semibold text-white mb-4">Relief by Type</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={reliefTypeData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis dataKey="name" stroke="#9CA3AF" />
								<YAxis stroke="#9CA3AF" />
								<Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
								<Bar dataKey="value" fill="#3B82F6" />
							</BarChart>
						</ResponsiveContainer>
					</motion.div>
				</div>
			)}
		</div>
	);
};

export default AdminAnalytics;
