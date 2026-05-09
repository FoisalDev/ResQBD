import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';

const DIVISIONS = {
	'Dhaka': { lat: 23.8103, lng: 90.4125 },
	'Chittagong': { lat: 22.3569, lng: 91.7832 },
	'Sylhet': { lat: 24.8949, lng: 91.8687 },
	'Rajshahi': { lat: 24.3745, lng: 88.6042 },
	'Khulna': { lat: 22.8456, lng: 89.5403 },
	'Barisal': { lat: 22.7010, lng: 90.3535 },
	'Rangpur': { lat: 25.7439, lng: 89.2752 },
	'Mymensingh': { lat: 24.7471, lng: 90.4203 },
};

const shelterIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

const selectedIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

function LocationMarker({ position, onMapClick }) {
	useMapEvents({
		click(e) {
			onMapClick([e.latlng.lat, e.latlng.lng]);
		},
	});
	return position ? <Marker position={position} icon={selectedIcon} /> : null;
}

const AdminShelters = () => {
	const { t } = useTranslation();
	const [shelters, setShelters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [selectedDistrict, setSelectedDistrict] = useState('');
	const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);
	const [markerPos, setMarkerPos] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		latitude: '',
		longitude: '',
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

	const handleDistrictChange = (e) => {
		const district = e.target.value;
		setSelectedDistrict(district);
		if (district && DIVISIONS[district]) {
			const coords = DIVISIONS[district];
			setFormData({
				...formData,
				latitude: coords.lat,
				longitude: coords.lng,
				address: district
			});
			setMapCenter([coords.lat, coords.lng]);
			setMarkerPos([coords.lat, coords.lng]);
		}
	};

	const handleMapClick = (pos) => {
		setMarkerPos(pos);
		setFormData({
			...formData,
			latitude: parseFloat(pos[0].toFixed(6)),
			longitude: parseFloat(pos[1].toFixed(6)),
		});
		setSelectedDistrict('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.latitude || !formData.longitude) {
			alert('Please select a location on the map or choose a district.');
			return;
		}
		try {
			await api.post('/shelters', formData);
			const response = await api.get('/shelters');
			setShelters(response.data);
			setShowForm(false);
			resetForm();
		} catch (error) {
			console.error('Error creating shelter:', error);
		}
	};

	const resetForm = () => {
		setFormData({
			name: '',
			address: '',
			latitude: '',
			longitude: '',
			capacity: 100,
			contact_phone: '',
			status: 'open'
		});
		setSelectedDistrict('');
		setMarkerPos(null);
		setMapCenter([23.8103, 90.4125]);
	};

	const updateStatus = async (id, status) => {
		try {
			await api.put(`/shelters/${id}`, { status });
			setShelters(shelters.map((s) => (s.id === id ? { ...s, status } : s)));
		} catch (error) {
			console.error('Error updating shelter:', error);
		}
	};

	const handleDelete = async (id, name) => {
		if (!window.confirm(`Delete shelter "${name}"? This cannot be undone.`)) return;
		try {
			await api.delete(`/shelters/${id}`);
			setShelters(shelters.filter((s) => s.id !== id));
		} catch (error) {
			console.error('Error deleting shelter:', error);
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
							<select
								value={selectedDistrict}
								onChange={handleDistrictChange}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							>
								<option value="">-- Select District --</option>
								{Object.keys(DIVISIONS).map((d) => (
									<option key={d} value={d}>{d}</option>
								))}
							</select>
							<input
								type="text"
								placeholder="Address"
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
							<div className="flex gap-2">
								<input
									type="number"
									step="any"
									placeholder="Latitude"
									value={formData.latitude}
									onChange={(e) => {
										const lat = e.target.value;
										setFormData({ ...formData, latitude: lat });
										if (lat) setMarkerPos([parseFloat(lat), parseFloat(formData.longitude || 0)]);
									}}
									className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white w-1/2"
									required
								/>
								<input
									type="number"
									step="any"
									placeholder="Longitude"
									value={formData.longitude}
									onChange={(e) => {
										const lng = e.target.value;
										setFormData({ ...formData, longitude: lng });
										if (lng) setMarkerPos([parseFloat(formData.latitude || 0), parseFloat(lng)]);
									}}
									className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white w-1/2"
									required
								/>
							</div>
							<input
								type="number"
								placeholder="Capacity"
								value={formData.capacity}
								onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
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

						<div className="h-[300px] rounded-lg overflow-hidden border border-slate-600">
							<MapContainer center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
								<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
								{shelters.map((s) => (
									<Marker key={s.id} position={[s.latitude, s.longitude]} icon={shelterIcon} />
								))}
								<LocationMarker position={markerPos} onMapClick={handleMapClick} />
							</MapContainer>
						</div>
						<p className="text-xs text-slate-500">Click on the map to place the shelter, or select a district above.</p>

						<button
							type="submit"
							className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
						>
							Create
						</button>
					</form>
				</motion.div>
			)}

			{loading ? (
				<p className="text-slate-400">Loading...</p>
			) : shelters.length === 0 ? (
				<p className="text-slate-500 text-center py-12">No shelters found. Add one above.</p>
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{shelters.map((shelter) => (
						<motion.div
							key={shelter.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="glass-card p-6 rounded-xl relative group"
						>
							<button
								onClick={() => handleDelete(shelter.id, shelter.name)}
								className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-red-500/0 hover:bg-red-500/20 text-transparent hover:text-red-400 transition-all text-sm font-bold opacity-0 group-hover:opacity-100"
								title="Delete shelter"
							>
								✕
							</button>
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
							{shelter.contact_phone && (
								<p className="text-slate-400 text-xs mt-1">📞 {shelter.contact_phone}</p>
							)}
							<div className="mt-4 flex gap-2">
								<button
									onClick={() => updateStatus(shelter.id, 'open')}
									className="px-3 py-1 bg-green-600/20 text-green-500 rounded text-sm hover:bg-green-600/30"
								>
									Open
								</button>
								<button
									onClick={() => updateStatus(shelter.id, 'full')}
									className="px-3 py-1 bg-red-600/20 text-red-500 rounded text-sm hover:bg-red-600/30"
								>
									Full
								</button>
								<button
									onClick={() => updateStatus(shelter.id, 'closed')}
									className="px-3 py-1 bg-gray-600/20 text-gray-500 rounded text-sm hover:bg-gray-600/30"
								>
									Close
								</button>
							</div>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
};

export default AdminShelters;
