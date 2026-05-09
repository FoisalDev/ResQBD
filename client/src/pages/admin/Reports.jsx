import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminReports = () => {
	const { t } = useTranslation();
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReports = async () => {
			try {
				const response = await api.get('/reports');
				setReports(response.data);
			} catch (error) {
				console.error('Error fetching reports:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchReports();
	}, []);

	const verifyReport = async (id, status) => {
		try {
			await api.patch(`/reports/${id}/verify`, { status });
			setReports(
				reports.map((r) => (r.id === id ? { ...r, status, verified: status === 'verified' } : r))
			);
		} catch (error) {
			console.error('Error verifying report:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('admin.reports')}</h2>
				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : (
					<div className="space-y-4">
						{reports.map((report) => (
							<div key={report.id} className="p-4 bg-slate-800/50 rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<h4 className="text-white font-medium capitalize">{report.incident_type}</h4>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${report.status === 'verified' ? 'bg-green-500/20 text-green-500' : report.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}
									>
										{report.status}
									</span>
								</div>
								<p className="text-slate-400 text-sm mb-2">{report.description}</p>
								<p className="text-slate-500 text-xs mb-3">
									By: {report.user?.name} | {new Date(report.created_at).toLocaleString()}
								</p>
								{report.status === 'submitted' && (
									<div className="flex gap-2">
										<button
											onClick={() => verifyReport(report.id, 'verified')}
											className="px-3 py-1 bg-green-600 text-white text-sm rounded"
										>
											Verify
										</button>
										<button
											onClick={() => verifyReport(report.id, 'rejected')}
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

export default AdminReports;
