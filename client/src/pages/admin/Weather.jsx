import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const toArray = (data) => (Array.isArray(data) ? data : []);

const getRiskClass = (category) => {
	if (category === 'High') return 'bg-danger/20 text-danger';
	if (category === 'Medium') return 'bg-warning/20 text-warning';
	return 'bg-green-500/20 text-green-500';
};

const formatTemperature = (temperature) => {
	if (typeof temperature !== 'number') return 'N/A';
	return `${temperature.toFixed(1)}°C`;
};

const formatRiskScore = (score) => {
	if (typeof score !== 'number') return 'N/A';
	return `${(score * 100).toFixed(0)}%`;
};

const AdminWeather = () => {
	const { t } = useTranslation();
	const [weather, setWeather] = useState([]);
	const [predictions, setPredictions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [predicting, setPredicting] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				setError('');

				const [weatherRes, predictionsRes] = await Promise.all([
					api.get('/weather/current'),
					api.get('/risk/predictions/latest'),
				]);

				setWeather(toArray(weatherRes.data));
				setPredictions(toArray(predictionsRes.data));
			} catch (error) {
				console.error('Error fetching data:', error);
				setError('Failed to load weather and prediction data.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const runPrediction = async () => {
		try {
			setPredicting(true);
			setError('');

			await api.post('/risk/predict');

			const response = await api.get('/risk/predictions/latest');
			setPredictions(toArray(response.data));
		} catch (error) {
			console.error('Error running prediction:', error);
			setError('Failed to run AI prediction.');
		} finally {
			setPredicting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-white">{t('admin.weather')}</h2>
				<button
					type="button"
					onClick={runPrediction}
					disabled={predicting}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{predicting ? 'Running...' : 'Run AI Prediction'}
				</button>
			</div>

			{error && (
				<p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
					{error}
				</p>
			)}

			<div className="grid md:grid-cols-2 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="glass-card p-6 rounded-xl"
				>
					<h3 className="text-lg font-semibold text-white mb-4">Current Weather</h3>

					{loading ? (
						<p className="text-slate-400">{t('common.loading')}</p>
					) : weather.length === 0 ? (
						<p className="text-slate-400">No weather data available.</p>
					) : (
						<div className="space-y-3">
							{weather.map((w) => (
								<div
									key={w.district}
									className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg"
								>
									<span className="text-white font-medium">{w.district}</span>
									<div className="text-right">
										<p className="text-white">{formatTemperature(w.temperature)}</p>
										<p className="text-slate-400 text-sm">{w.description || 'No description'}</p>
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
					) : predictions.length === 0 ? (
						<p className="text-slate-400">No prediction data available.</p>
					) : (
						<div className="space-y-3">
							{predictions.map((p) => (
								<div
									key={p.id || p.district}
									className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg"
								>
									<span className="text-white font-medium">{p.district}</span>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${getRiskClass(
											p.risk_category
										)}`}
									>
										{p.risk_category || 'Low'} ({formatRiskScore(p.risk_score)})
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