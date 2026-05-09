import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminRelief = () => {
	const { t } = useTranslation();
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRequests = async () => {
			try {
				const response = await api.get('/relief/requests');
				setRequests(response.data);
			} catch (error) {
				console.error('Error fetching relief requests:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchRequests();
	}, []);

	const approveRequest = async (id, status) => {
		try {
			await api.patch(`/relief/requests/${id}/approve`, { status });
			setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
		} catch (error) {
			console.error('Error approving relief:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('admin.relief')}</h2>
				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : (
					<div className="space-y-4">
						{requests.map((request) => (
							<div key={request.id} className="p-4 bg-slate-800/50 rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<h4 className="text-white font-medium capitalize">
										{request.relief_type} - {request.quantity}
									</h4>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${
											request.status === 'delivered'
												? 'bg-green-500/20 text-green-500'
												: request.status === 'approved' || request.status === 'dispatched'
													? 'bg-blue-500/20 text-blue-500'
													: request.status === 'rejected'
														? 'bg-red-500/20 text-red-500'
														: 'bg-yellow-500/20 text-yellow-500'
										}`}
									>
										{request.status}
									</span>
								</div>
								<p className="text-slate-400 text-sm">Urgency: {request.urgency}</p>
								<p className="text-slate-500 text-xs">By: {request.user?.name}</p>
								{request.status === 'pending' && (
									<div className="mt-3 flex gap-2">
										<button
											onClick={() => approveRequest(request.id, 'approved')}
											className="px-3 py-1 bg-green-600 text-white text-sm rounded"
										>
											Approve
										</button>
										<button
											onClick={() => approveRequest(request.id, 'rejected')}
											className="px-3 py-1 bg-red-600 text-white text-sm rounded"
										>
											Reject
										</button>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default AdminRelief;
