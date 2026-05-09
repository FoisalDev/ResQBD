import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminVolunteers = () => {
	const { t } = useTranslation();
	const [volunteers, setVolunteers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVolunteers = async () => {
			try {
				const response = await api.get('/volunteers');
				setVolunteers(response.data);
			} catch (error) {
				console.error('Error fetching volunteers:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchVolunteers();
	}, []);

	const verifyVolunteer = async (id) => {
		try {
			await api.patch(`/volunteers/${id}/verify`);
			setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, verified: true } : v)));
		} catch (error) {
			console.error('Error verifying volunteer:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('admin.volunteers')}</h2>

				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left text-slate-400 border-b border-slate-700">
									<th className="pb-3">Name</th>
									<th className="pb-3">Email</th>
									<th className="pb-3">Phone</th>
									<th className="pb-3">Availability</th>
									<th className="pb-3">Verified</th>
									<th className="pb-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{volunteers.map((vol) => (
									<tr key={vol.id} className="border-b border-slate-700/50">
										<td className="py-3 text-white">{vol.user.name}</td>
										<td className="py-3 text-slate-300">{vol.user.email}</td>
										<td className="py-3 text-slate-300">{vol.user.phone}</td>
										<td className="py-3">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													vol.availability === 'available'
														? 'bg-green-500/20 text-green-500'
														: vol.availability === 'busy'
															? 'bg-yellow-500/20 text-yellow-500'
															: 'bg-gray-500/20 text-gray-500'
												}`}
											>
												{vol.availability}
											</span>
										</td>
										<td className="py-3">
											{vol.verified ? (
												<span className="text-green-500">Verified</span>
											) : (
												<button
													onClick={() => verifyVolunteer(vol.id)}
													className="text-primary-500 hover:text-primary-400"
												>
													Verify
												</button>
											)}
										</td>
										<td className="py-3 text-slate-300">{vol.skills}</td>
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

export default AdminVolunteers;
