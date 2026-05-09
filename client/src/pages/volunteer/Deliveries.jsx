import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const VolunteerDeliveries = () => {
	const { t } = useTranslation();
	const [deliveries, setDeliveries] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDeliveries = async () => {
			try {
				const response = await api.get('/relief/distributions');
				setDeliveries(response.data);
			} catch (error) {
				console.error('Error fetching deliveries:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchDeliveries();
	}, []);

	const updateStatus = async (id, status) => {
		try {
			await api.patch(`/relief/distributions/${id}/status`, { delivery_status: status });
			setDeliveries(deliveries.map((d) => (d.id === id ? { ...d, delivery_status: status } : d)));
		} catch (error) {
			console.error('Error updating delivery:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('volunteer.deliveries')}</h2>

				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : deliveries.length > 0 ? (
					<div className="space-y-4">
						{deliveries.map((delivery) => (
							<div key={delivery.id} className="p-4 bg-slate-800/50 rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<h4 className="text-white font-medium">{delivery.relief_request?.relief_type}</h4>
									<span
										className={`px-3 py-1 rounded-full text-xs font-medium ${
											delivery.delivery_status === 'delivered'
												? 'bg-green-500/20 text-green-500'
												: delivery.delivery_status === 'in_transit'
													? 'bg-blue-500/20 text-blue-500'
													: 'bg-yellow-500/20 text-yellow-500'
										}`}
									>
										{delivery.delivery_status}
									</span>
								</div>
								<p className="text-slate-400 text-sm">
									Quantity: {delivery.relief_request?.quantity}
								</p>
								{delivery.delivery_status === 'preparing' && (
									<button
										onClick={() => updateStatus(delivery.id, 'in_transit')}
										className="mt-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
									>
										Start Delivery
									</button>
								)}
								{delivery.delivery_status === 'in_transit' && (
									<button
										onClick={() => updateStatus(delivery.id, 'delivered')}
										className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
									>
										Mark Delivered
									</button>
								)}
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

export default VolunteerDeliveries;
