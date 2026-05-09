import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminWeather = () => {
	const { t } = useTranslation();
	const [weather, setWeather] = useState([]);
	const [predictions, setPredictions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [weatherRes, predictionsRes] = await Promise.all([
					api.get('/weather/current'),
					api.get('/risk/predictions/latest')
				]);
				setWeather(weatherRes.data);
				setPredictions(predictionsRes.data);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const runPrediction = async () => {
		try {
			await api.post('/risk/predict');
			const response = await api.get('/risk/predictions/latest');
			setPredictions(response.data);
		} catch (error) {
			console.error('Error running prediction:', error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-white">{t('admin.weather')}</h2>
				<button
					onClick={runPrediction}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
				>
					Run AI Prediction
				</button>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="glass-card p-6 rounded-xl"
				>
					<h3 className="text-lg font-semibold text-white mb-4">Current Weather</h3>
					{loading ? (
						<p className="text-slate-400">{t('common.loading')}</p>
					) : (
						<div className="space-y-3">
							{weather.map((w) => (
								<div
									key={w.district}
									className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg"
								>
									<span className="text-white font-medium">{w.district}</span>
									<div className="text-right">
										<p className="text-white">{w.temperature?.toFixed(1)}°C</p>
										<p className="text-slate-400 text-sm">{w.description}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="glass-card p-6 rounded-xl"
				>
					<h3 className="text-lg font-semibold text-white mb-4">Risk Predictions</h3>
					{loading ? (
						<p className="text-slate-400">{t('common.loading')}</p>
					) : (
						<div className="space-y-3">
							{predictions.map((p) => (
								<div
									key={p.id}
									className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg"
								>
									<span className="text-white font-medium">{p.district}</span>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${
											p.risk_category === 'High'
												? 'bg-danger/20 text-danger'
												: p.risk_category === 'Medium'
													? 'bg-warning/20 text-warning'
													: 'bg-green-500/20 text-green-500'
										}`}
									>
										{p.risk_category} ({(p.risk_score * 100).toFixed(0)}%)
									</span>
								</div>
							))}
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default AdminWeather;
