import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminSOS = () => {
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

	const updateStatus = async (id, status) => {
		try {
			await api.patch(`/sos/${id}/status`, { status });
			setSosList(sosList.map((s) => (s.id === id ? { ...s, status } : s)));
		} catch (error) {
			console.error('Error updating SOS:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('admin.sos')}</h2>
				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left text-slate-400 border-b border-slate-700">
									<th className="pb-3">Type</th>
									<th className="pb-3">Severity</th>
									<th className="pb-3">User</th>
									<th className="pb-3">Status</th>
									<th className="pb-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{sosList.map((sos) => (
									<tr key={sos.id} className="border-b border-slate-700/50">
										<td className="py-3 text-white capitalize">{sos.emergency_type}</td>
										<td className="py-3 text-white">{sos.severity}/5</td>
										<td className="py-3 text-slate-300">{sos.user?.name}</td>
										<td className="py-3">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													sos.status === 'resolved'
														? 'bg-green-500/20 text-green-500'
														: sos.status === 'in_progress'
															? 'bg-blue-500/20 text-blue-500'
															: 'bg-yellow-500/20 text-yellow-500'
												}`}
											>
												{sos.status}
											</span>
										</td>
										<td className="py-3">
											<select
												value={sos.status}
												onChange={(e) => updateStatus(sos.id, e.target.value)}
												className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
											>
												<option value="pending">Pending</option>
												<option value="acknowledged">Acknowledged</option>
												<option value="in_progress">In Progress</option>
												<option value="resolved">Resolved</option>
												<option value="cancelled">Cancelled</option>
											</select>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default AdminSOS;
