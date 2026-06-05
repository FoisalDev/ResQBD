import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CitizenSOS = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		emergency_type: 'flood',
		severity: 3,
		description: '',
		latitude: '',
		longitude: ''
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');
	const [locating, setLocating] = useState(true);

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setFormData((prev) => ({
						...prev,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					}));
					setLocating(false);
				},
				() => {
					setLocating(false);
				}
			);
		} else {
			setLocating(false);
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!formData.latitude || !formData.longitude) {
			setError(t('sos.locationRequired') || 'Location is required');
			return;
		}

		const confirmed = window.confirm(
			t('sos.confirmSubmit') || 'Send emergency SOS? This will alert authorities.'
		);
		if (!confirmed) return;

		setLoading(true);
		try {
			await api.post('/sos', {
				...formData,
				latitude: parseFloat(formData.latitude),
				longitude: parseFloat(formData.longitude)
			});
			setSuccess(true);
			setTimeout(() => navigate('/citizen/sos/history'), 2000);
		} catch (err) {
			setError(err.response?.data?.message || t('common.error'));
		} finally {
			setLoading(false);
		}
	};

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			setLocating(true);
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setFormData((prev) => ({
						...prev,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					}));
					setLocating(false);
				},
				() => {
					setLocating(false);
				}
			);
		}
	};

	const severityLabels = {
		1: t('sos.severityLabels.veryLow') || 'Very Low',
		2: t('sos.severityLabels.low') || 'Low',
		3: t('sos.severityLabels.medium') || 'Medium',
		4: t('sos.severityLabels.high') || 'High',
		5: t('sos.severityLabels.critical') || 'Critical'
	};

	return (
		<div className="max-w-2xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white mb-2">{t('sos.title')}</h2>
				<p className="text-slate-400 mb-6">{t('sos.subtitle')}</p>

				{success ? (
					<div className="text-center py-8">
						<div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<p className="text-white text-lg">{t('sos.success')}</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
								{error}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('sos.type')}
							</label>
							<select
								value={formData.emergency_type}
								onChange={(e) => setFormData({ ...formData, emergency_type: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							>
								<option value="flood">{t('sos.types.flood')}</option>
								<option value="cyclone">{t('sos.types.cyclone')}</option>
								<option value="landslide">{t('sos.types.landslide')}</option>
								<option value="fire">{t('sos.types.fire')}</option>
								<option value="other">{t('sos.types.other')}</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('sos.severity')}: {formData.severity}/5 - {severityLabels[formData.severity]}
							</label>
							<div className="flex items-center gap-2">
								<span className="text-xs text-slate-500">1</span>
								<input
									type="range"
									min="1"
									max="5"
									value={formData.severity}
									onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
									className="flex-1"
								/>
								<span className="text-xs text-slate-500">5</span>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('sos.description')}
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								rows={3}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('sos.location')}
							</label>
							<div className="flex gap-3">
								<input
									type="number"
									step="any"
									value={formData.latitude}
									onChange={(e) =>
										setFormData({ ...formData, latitude: e.target.value })
									}
									placeholder="Latitude"
									className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								/>
								<input
									type="number"
									step="any"
									value={formData.longitude}
									onChange={(e) =>
										setFormData({ ...formData, longitude: e.target.value })
									}
									placeholder="Longitude"
									className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								/>
							</div>
							<button
								type="button"
								onClick={getCurrentLocation}
								disabled={locating}
								className="mt-2 text-sm text-primary-500 hover:text-primary-400 disabled:text-slate-500"
							>
								{locating ? 'Locating...' : t('sos.useCurrentLocation')}
							</button>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-danger text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
						>
							{loading ? t('common.loading') : t('sos.submit')}
						</button>
					</form>
				)}
			</motion.div>
		</div>
	);
};

export default CitizenSOS;
