import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminShelters = () => {
	const { t } = useTranslation();
	const [shelters, setShelters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		latitude: 23.8103,
		longitude: 90.4125,
		capacity: 100,
		contact_phone: '',
		status: 'open'
	});

	useEffect(() => {
		const fetchShelters = async () => {
			try {
				const response = await api.get('/shelters');
				setShelters(response.data);
			} catch (error) {
				console.error('Error fetching shelters:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchShelters();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await api.post('/shelters', formData);
			const response = await api.get('/shelters');
			setShelters(response.data);
			setShowForm(false);
			setFormData({
				name: '',
				address: '',
				latitude: 23.8103,
				longitude: 90.4125,
				capacity: 100,
				contact_phone: '',
				status: 'open'
			});
		} catch (error) {
			console.error('Error creating shelter:', error);
		}
	};

	const updateStatus = async (id, status) => {
		try {
			await api.put(`/shelters/${id}`, { status });
			setShelters(shelters.map((s) => (s.id === id ? { ...s, status } : s)));
		} catch (error) {
			console.error('Error updating shelter:', error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-white">{t('admin.shelters')}</h2>
				<button
					onClick={() => setShowForm(!showForm)}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
				>
					Add Shelter
				</button>
			</div>

			{showForm && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="glass-card p-6 rounded-xl"
				>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<input
								type="text"
								placeholder="Name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
							<input
								type="text"
								placeholder="Address"
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
							<input
								type="number"
								step="any"
								placeholder="Latitude"
								value={formData.latitude}
								onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
							<input
								type="number"
								step="any"
								placeholder="Longitude"
								value={formData.longitude}
								onChange={(e) =>
									setFormData({ ...formData, longitude: parseFloat(e.target.value) })
								}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
							<input
								type="number"
								placeholder="Capacity"
								value={formData.capacity}
								onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
							<input
								type="text"
								placeholder="Contact Phone"
								value={formData.contact_phone}
								onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							/>
						</div>
						<button
							type="submit"
							className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
						>
							Create
						</button>
					</form>
				</motion.div>
			)}

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{shelters.map((shelter) => (
					<motion.div
						key={shelter.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="glass-card p-6 rounded-xl"
					>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-white">{shelter.name}</h3>
							<span
								className={`px-2 py-1 rounded text-xs font-medium ${shelter.status === 'open' ? 'bg-green-500/20 text-green-500' : shelter.status === 'full' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'}`}
							>
								{shelter.status}
							</span>
						</div>
						<p className="text-slate-400 text-sm mb-2">{shelter.address}</p>
						<p className="text-slate-300 text-sm">
							Capacity: {shelter.capacity} | Occupancy: {shelter.current_occupancy}
						</p>
						<div className="mt-4 flex gap-2">
							<button
								onClick={() => updateStatus(shelter.id, 'open')}
								className="px-3 py-1 bg-green-600/20 text-green-500 rounded text-sm"
							>
								Open
							</button>
							<button
								onClick={() => updateStatus(shelter.id, 'full')}
								className="px-3 py-1 bg-red-600/20 text-red-500 rounded text-sm"
							>
								Full
							</button>
							<button
								onClick={() => updateStatus(shelter.id, 'closed')}
								className="px-3 py-1 bg-gray-600/20 text-gray-500 rounded text-sm"
							>
								Close
							</button>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
};

export default AdminShelters;
