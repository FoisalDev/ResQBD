import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CitizenReport = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		incident_type: 'flood',
		description: '',
		latitude: 23.8103,
		longitude: 90.4125
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await api.post('/reports', formData);
			setSuccess(true);
			setTimeout(() => navigate('/citizen/dashboard'), 2000);
		} catch (error) {
			console.error('Report error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white mb-2">{t('report.title')}</h2>
				<p className="text-slate-400 mb-6">{t('report.subtitle')}</p>

				{success ? (
					<div className="text-center py-8">
						<p className="text-white text-lg">{t('report.success')}</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('report.type')}
							</label>
							<select
								value={formData.incident_type}
								onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							>
								<option value="flood">{t('sos.types.flood')}</option>
								<option value="cyclone">{t('sos.types.cyclone')}</option>
								<option value="landslide">{t('sos.types.landslide')}</option>
								<option value="fire">{t('sos.types.fire')}</option>
								<option value="building_collapse">Building Collapse</option>
								<option value="other">{t('sos.types.other')}</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('report.description')}
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								rows={4}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('report.location')}
							</label>
							<div className="flex gap-3">
								<input
									type="number"
									step="any"
									value={formData.latitude}
									onChange={(e) =>
										setFormData({ ...formData, latitude: parseFloat(e.target.value) })
									}
									placeholder="Latitude"
									className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								/>
								<input
									type="number"
									step="any"
									value={formData.longitude}
									onChange={(e) =>
										setFormData({ ...formData, longitude: parseFloat(e.target.value) })
									}
									placeholder="Longitude"
									className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-warning text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50"
						>
							{loading ? t('common.loading') : t('report.submit')}
						</button>
					</form>
				)}
			</motion.div>
		</div>
	);
};

export default CitizenReport;
