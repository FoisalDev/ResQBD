import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CitizenRelief = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		relief_type: 'food',
		quantity: '',
		urgency: 'medium',
		description: ''
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await api.post('/relief/requests', formData);
			setSuccess(true);
			setTimeout(() => navigate('/citizen/dashboard'), 2000);
		} catch (error) {
			console.error('Relief error:', error);
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
				<h2 className="text-2xl font-bold text-white mb-2">{t('relief.title')}</h2>
				<p className="text-slate-400 mb-6">{t('relief.subtitle')}</p>

				{success ? (
					<div className="text-center py-8">
						<p className="text-white text-lg">{t('relief.success')}</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('relief.type')}
							</label>
							<select
								value={formData.relief_type}
								onChange={(e) => setFormData({ ...formData, relief_type: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							>
								<option value="food">{t('relief.types.food')}</option>
								<option value="water">{t('relief.types.water')}</option>
								<option value="medicine">{t('relief.types.medicine')}</option>
								<option value="clothing">{t('relief.types.clothing')}</option>
								<option value="shelter">{t('relief.types.shelter')}</option>
								<option value="other">{t('relief.types.other')}</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('relief.quantity')}
							</label>
							<input
								type="text"
								value={formData.quantity}
								onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
								placeholder="e.g., 10 kg rice, 5 liters water"
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('relief.urgency')}
							</label>
							<select
								value={formData.urgency}
								onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							>
								<option value="low">{t('relief.urgencies.low')}</option>
								<option value="medium">{t('relief.urgencies.medium')}</option>
								<option value="high">{t('relief.urgencies.high')}</option>
								<option value="critical">{t('relief.urgencies.critical')}</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('relief.description')}
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								rows={3}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
						>
							{loading ? t('common.loading') : t('relief.submit')}
						</button>
					</form>
				)}
			</motion.div>
		</div>
	);
};

export default CitizenRelief;
