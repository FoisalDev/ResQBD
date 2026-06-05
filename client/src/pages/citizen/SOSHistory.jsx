import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { formatDate } from '../../utils/date';
import { useSocket } from '../../hooks';

const STATUS_COLORS = {
	pending: 'bg-yellow-500/20 text-yellow-500',
	acknowledged: 'bg-blue-400/20 text-blue-400',
	in_progress: 'bg-blue-500/20 text-blue-500',
	resolved: 'bg-green-500/20 text-green-500',
	cancelled: 'bg-gray-500/20 text-gray-500'
};

const CitizenSOSHistory = () => {
	const { t } = useTranslation();
	const { on } = useSocket();
	const [sosList, setSosList] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchSOS = useCallback(async () => {
		try {
			const response = await api.get('/sos');
			setSosList(response.data);
		} catch (error) {
			console.error('Error fetching SOS:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSOS();
	}, [fetchSOS]);

	useEffect(() => {
		if (!on) return;
		const cleanup = on('sos:updated', (updatedSos) => {
			setSosList((prev) =>
				prev.map((s) => (s.id === updatedSos.id ? { ...s, ...updatedSos } : s))
			);
		});
		return cleanup;
	}, [on]);

	const cancelSOS = async (id) => {
		const confirmed = window.confirm(
			t('sos.confirmCancel') || 'Cancel this SOS request?'
		);
		if (!confirmed) return;
		try {
			await api.patch(`/sos/${id}/cancel`);
			setSosList((prev) =>
				prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s))
			);
		} catch (error) {
			console.error('Error cancelling SOS:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('sos.history')}</h2>

				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : sosList.length > 0 ? (
					<div className="space-y-4">
						{sosList.map((sos) => (
							<div key={sos.id} className="p-4 bg-slate-800/50 rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<span className="text-white font-medium capitalize">{sos.emergency_type}</span>
									<span
										className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sos.status] || 'bg-gray-500/20 text-gray-500'}`}
									>
										{t(`sos.status.${sos.status}`)}
									</span>
								</div>
								<p className="text-slate-400 text-sm">{sos.description}</p>
								<div className="flex items-center justify-between mt-2">
									<p className="text-slate-500 text-xs">
										{formatDate(sos.created_at, { withTime: true })} | Severity: {sos.severity}/5
									</p>
									{sos.status === 'pending' && (
										<button
											onClick={() => cancelSOS(sos.id)}
											className="text-xs text-red-400 hover:text-red-300"
										>
											{t('common.cancel')}
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-slate-400">{t('common.noData')}</p>
				)}
			</motion.div>
		</div>
	);
};

export default CitizenSOSHistory;
