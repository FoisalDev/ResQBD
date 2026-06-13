import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useSocket } from '../../hooks';

const STATUS_COLORS = {
	pending: 'bg-yellow-500/20 text-yellow-500',
	acknowledged: 'bg-blue-400/20 text-blue-400',
	in_progress: 'bg-blue-500/20 text-blue-500',
	resolved: 'bg-green-500/20 text-green-500',
	cancelled: 'bg-gray-500/20 text-gray-500'
};

const AdminSOS = () => {
	const { t } = useTranslation();
	const { on } = useSocket();
	const [sosList, setSosList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [expandedId, setExpandedId] = useState(null);
	const [suggestions, setSuggestions] = useState({});
	const [assigning, setAssigning] = useState({});
	const [error, setError] = useState('');
	const [allVolunteers, setAllVolunteers] = useState([]);
	const [volunteerSearch, setVolunteerSearch] = useState('');
	const [selectedVolunteer, setSelectedVolunteer] = useState({});
	const [assignedCount, setAssignedCount] = useState({});
	const [assignmentsData, setAssignmentsData] = useState({});

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
		const cleanupNew = on('sos:new', (newSos) => {
			setSosList((prev) => [newSos, ...prev]);
		});
		const cleanupUpdated = on('sos:updated', (updatedSos) => {
			setSosList((prev) =>
				prev.map((s) => (s.id === updatedSos.id ? { ...s, ...updatedSos } : s))
			);
		});
		const cleanupVolunteer = on('volunteer:updated', () => {
			fetchVolunteers();
		});
		return () => {
			cleanupNew?.();
			cleanupUpdated?.();
			cleanupVolunteer?.();
		};
	}, [on]);

	const fetchVolunteers = async () => {
		try {
			const res = await api.get('/volunteers?all=false');
			setAllVolunteers(res.data);
		} catch (err) {
			console.error('Error fetching volunteers:', err);
		}
	};

	const fetchAssignmentsForSOS = async (sosId) => {
		try {
			const res = await api.get('/assignments');
			const sosAssignments = res.data.filter((a) => a.sosRequestId === sosId);
			setAssignedCount((prev) => ({ ...prev, [sosId]: sosAssignments.length }));
			setAssignmentsData((prev) => ({ ...prev, [sosId]: sosAssignments }));
		} catch (err) {
			console.error('Error fetching assignments:', err);
		}
	};

	const updateStatus = async (id, status) => {
		setError('');
		try {
			await api.patch(`/sos/${id}/status`, { status });
			setSosList((prev) =>
				prev.map((s) => (s.id === id ? { ...s, status } : s))
			);
		} catch (err) {
			const msg = err.response?.data?.message || 'Failed to update status';
			setError(msg);
			console.error('Error updating SOS:', err);
		}
	};

	const fetchSuggestions = async (sosId) => {
		try {
			const response = await api.get(`/assignments/suggest/${sosId}`);
			setSuggestions((prev) => ({ ...prev, [sosId]: response.data }));
		} catch (error) {
			console.error('Error fetching suggestions:', error);
		}
	};

	const assignVolunteer = async (sosId, volunteerId) => {
		setError('');
		setAssigning((prev) => ({ ...prev, [sosId]: true }));
		try {
			await api.post('/assignments', {
				volunteer_id: volunteerId,
				sos_request_id: sosId,
				task_type: 'sos_response',
				description: 'Emergency SOS response'
			});
			const current = assignedCount[sosId] || 0;
			setAssignedCount((prev) => ({ ...prev, [sosId]: current + 1 }));
			setSelectedVolunteer((prev) => ({ ...prev, [sosId]: undefined }));
			setVolunteerSearch('');
			setSuggestions((prev) => ({ ...prev, [sosId]: undefined }));
			if (current === 0) {
				const sos = sosList.find((s) => s.id === sosId);
				if (sos && sos.status === 'pending') {
					updateStatus(sosId, 'acknowledged');
				}
			}
		} catch (err) {
			const msg = err.response?.data?.message || 'Failed to assign volunteer';
			setError(msg);
			console.error('Error assigning volunteer:', err);
		} finally {
			setAssigning((prev) => ({ ...prev, [sosId]: false }));
		}
	};

	const toggleExpand = (sosId) => {
		if (expandedId === sosId) {
			setExpandedId(null);
		} else {
			setExpandedId(sosId);
			fetchSuggestions(sosId);
			fetchVolunteers();
			fetchAssignmentsForSOS(sosId);
		}
	};

	const pendingCount = sosList.filter((s) => s.status === 'pending').length;

	const filteredVolunteers = allVolunteers.filter((v) => {
		if (!volunteerSearch) return true;
		const name = (v.user?.name || '').toLowerCase();
		const phone = (v.user?.phone || '').toLowerCase();
		const search = volunteerSearch.toLowerCase();
		return name.includes(search) || phone.includes(search);
	});

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-white">{t('admin.sos')}</h2>
					{pendingCount > 0 && (
						<span className="px-3 py-1 bg-danger/20 text-danger text-sm rounded-full font-medium">
							{pendingCount} Pending
						</span>
					)}
				</div>
				{error && (
					<div className="mb-4 p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
						{error}
					</div>
				)}
				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : sosList.length > 0 ? (
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
									<>
										<tr
											key={sos.id}
											className="border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30"
											onClick={() => toggleExpand(sos.id)}
										>
											<td className="py-3 text-white capitalize">{sos.emergencyType || sos.emergency_type || ''}</td>
											<td className="py-3 text-white">{sos.severity}/5</td>
											<td className="py-3 text-slate-300">{sos.user?.name || sos.userId}</td>
											<td className="py-3">
												<span
													className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[sos.status] || 'bg-yellow-500/20 text-yellow-500'}`}
												>
													{sos.status.replace('_', ' ')}
												</span>
											</td>
											<td className="py-3" onClick={(e) => e.stopPropagation()}>
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
										{expandedId === sos.id && (
											<tr key={`${sos.id}-detail`} className="bg-slate-800/30">
												<td colSpan={5} className="p-4">
													<div className="grid md:grid-cols-2 gap-4">
														<div>
															<h4 className="text-white font-medium mb-2">Details</h4>
															<p className="text-slate-400 text-sm mb-1">
																<strong>Description:</strong> {sos.description || 'N/A'}
															</p>
															<p className="text-slate-400 text-sm mb-1">
																<strong>Latitude:</strong> {sos.latitude}
															</p>
															<p className="text-slate-400 text-sm mb-1">
																<strong>Longitude:</strong> {sos.longitude}
															</p>
															<p className="text-slate-400 text-sm mb-1">
																<strong>Contact:</strong> {sos.user?.phone || 'N/A'}
															</p>
															{assignedCount[sos.id] > 0 && (
																<div className="text-slate-400 text-sm mt-2">
																	<strong className="text-white">Assigned volunteers:</strong>
																	<ul className="mt-1 space-y-1">
																		{(assignmentsData[sos.id] || []).map((a) => (
																			<li key={a.id} className="flex items-center gap-2 text-xs">
																				<span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
																				{a.volunteer?.user?.name || `Volunteer #${a.volunteerId}`}
																				<span className="text-slate-500">- {a.status}</span>
																			</li>
																		))}
																	</ul>
																</div>
															)}
														</div>
														<div>
															<h4 className="text-white font-medium mb-2">
																Assign Volunteer{assignedCount[sos.id] > 0 ? ` (${assignedCount[sos.id]} assigned)` : ''}
															</h4>

															{allVolunteers.length === 0 ? (
																<p className="text-slate-400 text-sm mb-3">No available volunteers right now.</p>
															) : (
																<div className="mb-3">
																	<input
																		type="text"
																		placeholder="Search volunteers..."
																		value={volunteerSearch}
																		onChange={(e) => setVolunteerSearch(e.target.value)}
																		className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-2"
																	/>
																	<select
																		value={selectedVolunteer[sos.id] || ''}
																		onChange={(e) =>
																			setSelectedVolunteer((prev) => ({
																				...prev,
																				[sos.id]: parseInt(e.target.value)
																			}))
																		}
																		className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
																	>
																		<option value="">-- Select a volunteer --</option>
																		{filteredVolunteers.map((v) => (
																			<option key={v.id} value={v.id}>
																				{v.user?.name || `Volunteer #${v.id}`}
																			</option>
																		))}
																	</select>
																	<button
																		onClick={() => {
																			const vid = selectedVolunteer[sos.id];
																			if (vid) assignVolunteer(sos.id, vid);
																		}}
																		disabled={assigning[sos.id] || !selectedVolunteer[sos.id]}
																		className="mt-2 w-full px-3 py-2 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50"
																	>
																		{assigning[sos.id] ? 'Assigning...' : 'Assign Volunteer'}
																	</button>
																</div>
															)}

															<p className="text-slate-400 text-xs mb-2">Nearby available volunteers:</p>
															{suggestions[sos.id] ? (
																suggestions[sos.id].length > 0 ? (
																	<div className="space-y-2">
																		{suggestions[sos.id].map((v) => (
																			<div
																				key={v.id}
																				className="flex items-center justify-between p-2 bg-slate-700/50 rounded"
																			>
																				<div>
																					<p className="text-white text-sm">{v.name}</p>
																					<p className="text-slate-400 text-xs">
																						{v.distance ? `${Number(v.distance).toFixed(1)} km` : ''} | {v.phone}
																					</p>
																				</div>
																				<button
																					onClick={() => assignVolunteer(sos.id, v.id)}
																					disabled={assigning[sos.id]}
																					className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50"
																				>
																					{assigning[sos.id] ? '...' : 'Assign'}
																				</button>
																			</div>
																		))}
																	</div>
																) : (
																	<p className="text-slate-500 text-sm">No available volunteers nearby</p>
																)
															) : (
																<p className="text-slate-500 text-sm">Loading nearby volunteers...</p>
															)}
														</div>
													</div>
												</td>
											</tr>
										)}
									</>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-slate-400">{t('common.noData')}</p>
				)}
			</motion.div>
		</div>
	);
};

export default AdminSOS;
