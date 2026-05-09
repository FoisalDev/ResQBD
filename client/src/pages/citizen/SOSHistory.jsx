import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const CitizenSOSHistory = () => {
	const { t } = useTranslation();
	const [sosList, setSosList] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSOS = async () => {
			try {
				const response = await api.get('/sos');
				setSosList(response.data);
			} catch (error) {
				console.error('Error fetching SOS:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchSOS();
	}, []);

	const getStatusColor = (status) => {
		switch (status) {
			case 'resolved':
				return 'bg-green-500/20 text-green-500';
			case 'in_progress':
				return 'bg-blue-500/20 text-blue-500';
			case 'acknowledged':
				return 'bg-yellow-500/20 text-yellow-500';
			default:
				return 'bg-gray-500/20 text-gray-500';
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
										className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sos.status)}`}
									>
										{t(`sos.status.${sos.status}`)}
									</span>
								</div>
								<p className="text-slate-400 text-sm">{sos.description}</p>
								<p className="text-slate-500 text-xs mt-2">
									{new Date(sos.created_at).toLocaleString()}
								</p>
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
