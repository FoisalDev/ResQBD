import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminAlerts = () => {
	const { t } = useTranslation();
	const [alerts, setAlerts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		title: '',
		message: '',
		severity: 'info',
		target_area: ''
	});

	useEffect(() => {
		const fetchAlerts = async () => {
			try {
				const response = await api.get('/alerts');
				setAlerts(response.data);
			} catch (error) {
				console.error('Error fetching alerts:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchAlerts();
	}, []);

	const createAlert = async (e) => {
		e.preventDefault();
		try {
			await api.post('/alerts', formData);
			const response = await api.get('/alerts');
			setAlerts(response.data);
			setShowForm(false);
			setFormData({ title: '', message: '', severity: 'info', target_area: '' });
		} catch (error) {
			console.error('Error creating alert:', error);
		}
	};

	const deleteAlert = async (id) => {
		try {
			await api.delete(`/alerts/${id}`);
			setAlerts(alerts.filter((a) => a.id !== id));
		} catch (error) {
			console.error('Error deleting alert:', error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-white">{t('admin.alerts')}</h2>
				<button
					onClick={() => setShowForm(!showForm)}
					className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700"
				>
					{t('admin.broadcast')}
				</button>
			</div>

			{showForm && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="glass-card p-6 rounded-xl"
				>
					<form onSubmit={createAlert} className="space-y-4">
						<input
							type="text"
							placeholder="Title"
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							required
						/>
						<textarea
							placeholder="Message"
							value={formData.message}
							onChange={(e) => setFormData({ ...formData, message: e.target.value })}
							className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							rows={3}
							required
						/>
						<select
							value={formData.severity}
							onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
							className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
						>
							<option value="info">Info</option>
							<option value="warning">Warning</option>
							<option value="danger">Danger</option>
						</select>
						<input
							type="text"
							placeholder="Target Area (optional)"
							value={formData.target_area}
							onChange={(e) => setFormData({ ...formData, target_area: e.target.value })}
							className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
						/>
						<button
							type="submit"
							className="px-6 py-2 bg-danger text-white rounded-lg hover:bg-red-700"
						>
							Broadcast Alert
						</button>
					</form>
				</motion.div>
			)}

			<div className="space-y-4">
				{alerts.map((alert) => (
					<motion.div
						key={alert.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className={`glass-card p-6 rounded-xl border-l-4 ${
							alert.severity === 'danger'
								? 'border-danger'
								: alert.severity === 'warning'
									? 'border-warning'
									: 'border-info'
						}`}
					>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-white font-semibold">{alert.title}</h3>
								<p className="text-slate-400 mt-1">{alert.message}</p>
								{alert.target_area && (
									<p className="text-slate-500 text-sm mt-2">Area: {alert.target_area}</p>
								)}
							</div>
							<button
								onClick={() => deleteAlert(alert.id)}
								className="text-slate-400 hover:text-danger"
							>
								Delete
							</button>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
};

export default AdminAlerts;
