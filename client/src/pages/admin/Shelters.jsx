import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
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

const markerColors = {
	open: { bg: '#10B981', border: '#059669', shadow: 'rgba(16,185,129,0.5)', glow: 'rgba(16,185,129,0.25)' },
	full: { bg: '#F59E0B', border: '#D97706', shadow: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.2)' },
	closed: { bg: '#6B7280', border: '#4B5563', shadow: 'rgba(107,114,128,0.5)', glow: 'rgba(107,114,128,0.2)' }
};

const createShelterIcon = (status) => {
	const c = markerColors[status] || markerColors.open;
	return L.divIcon({
		className: '',
		html: `
			<div class="shelter-marker" data-status="${status}" style="
				width:34px;height:34px;background:${c.bg};border:3px solid ${c.border};
				border-radius:50%;box-shadow:0 0 20px ${c.shadow},0 4px 12px rgba(0,0,0,0.3);
				display:flex;align-items:center;justify-content:center;
				transition:transform 0.3s ease;cursor:pointer;
				${status === 'open' ? 'animation:shelterPulse 2s ease-in-out infinite;' : ''}
			">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
					<path d="M19 9.799l-7-5.522-7 5.522v10.478h14v-10.478zm-7-7.299l9 7.101v12.399h-18v-12.399l9-7.101z"/>
					<path d="M11 15h2v4h-2z"/><path d="M8 11h8v2h-8z"/>
				</svg>
			</div>
		`,
		iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -22]
	});
};

const createSelectedIcon = (isEditing) => L.divIcon({
	className: '',
	html: `
		<div style="
			width:38px;height:38px;background:#3B82F6;border:3px solid #2563EB;
			border-radius:50%;box-shadow:0 0 24px rgba(59,130,246,0.6),0 4px 12px rgba(0,0,0,0.4);
			display:flex;align-items:center;justify-content:center;
			animation:shelterPulse 1.5s ease-in-out infinite;
			transition:transform 0.3s ease;
		">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="white">
				<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
			</svg>
		</div>
	`,
	iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -24]
});

const PopupContent = ({ shelter, onEdit, onStatusChange }) => {
	const c = markerColors[shelter.status] || markerColors.open;
	const pct = shelter.capacity > 0 ? Math.round((shelter.current_occupancy / shelter.capacity) * 100) : 0;
	return (
		<div className="min-w-[200px]">
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-semibold text-base" style={{color: '#1e293b'}}>{shelter.name}</h3>
				<span className="px-2 py-0.5 rounded text-xs font-medium" style={{
					background: c.bg + '22', color: c.bg, border: `1px solid ${c.bg}44`
				}}>{shelter.status}</span>
			</div>
			<p className="text-xs text-slate-500 mb-2">{shelter.address}</p>
			<div className="mb-2">
				<div className="flex justify-between text-xs text-slate-600 mb-1">
					<span>Capacity</span>
					<span>{shelter.current_occupancy} / {shelter.capacity}</span>
				</div>
				<div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
					<div className="h-full rounded-full transition-all duration-500" style={{
						width: Math.min(pct, 100) + '%', background: c.bg
					}} />
				</div>
			</div>
			{shelter.contact_phone && (
				<p className="text-xs text-slate-500 mb-2">📞 {shelter.contact_phone}</p>
			)}
			<div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-100">
				<button onClick={() => onEdit(shelter)} className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">Edit</button>
				{shelter.status !== 'open' && <button onClick={() => onStatusChange(shelter.id, 'open')} className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors">Open</button>}
				{shelter.status !== 'full' && <button onClick={() => onStatusChange(shelter.id, 'full')} className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors">Full</button>}
			</div>
		</div>
	);
};

function LocationMarker({ position, onMapClick, isEditing }) {
	useMapEvents({
		click(e) { onMapClick([e.latlng.lat, e.latlng.lng]); },
	});
	return position ? <Marker position={position} icon={createSelectedIcon(isEditing)} /> : null;
}

function MapController({ flyTo, zoom }) {
	const map = useMap();
	useEffect(() => {
		if (flyTo) map.flyTo(flyTo, zoom || 8, { duration: 0.8 });
	}, [flyTo, zoom, map]);
	return null;
}

const ZoomControl = () => {
	const map = useMap();
	useEffect(() => {
		const zc = L.control.zoom({ position: 'topright' });
		zc.addTo(map);
		return () => { zc.remove(); };
	}, [map]);
	return null;
};

const AdminShelters = () => {
	const { t } = useTranslation();
	const [shelters, setShelters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingShelter, setEditingShelter] = useState(null);
	const [selectedDistrict, setSelectedDistrict] = useState('');
	const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);
	const [flyTo, setFlyTo] = useState(null);
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
			setFlyTo([coords.lat, coords.lng]);
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
			if (editingShelter) {
				await api.put(`/shelters/${editingShelter.id}`, formData);
			} else {
				await api.post('/shelters', formData);
			}
			const response = await api.get('/shelters');
			setShelters(response.data);
			setShowForm(false);
			resetForm();
		} catch (error) {
			console.error('Error saving shelter:', error);
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
		setEditingShelter(null);
		setSelectedDistrict('');
		setMarkerPos(null);
		setMapCenter([23.8103, 90.4125]);
	};

	const startEdit = (shelter) => {
		setEditingShelter(shelter);
		setFormData({
			name: shelter.name,
			address: shelter.address,
			latitude: shelter.latitude,
			longitude: shelter.longitude,
			capacity: shelter.capacity,
			contact_phone: shelter.contact_phone || '',
			status: shelter.status
		});
		setMarkerPos([parseFloat(shelter.latitude), parseFloat(shelter.longitude)]);
		setMapCenter([parseFloat(shelter.latitude), parseFloat(shelter.longitude)]);
		setShowForm(true);
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
		<>
			<style>{`
				@keyframes shelterPulse {
					0%, 100% { transform: scale(1); box-shadow: 0 0 16px var(--pulse-shadow, rgba(16,185,129,0.5)); }
					50% { transform: scale(1.12); box-shadow: 0 0 28px var(--pulse-shadow, rgba(16,185,129,0.5)); }
				}
				.shelter-marker:hover { transform: scale(1.2) !important; z-index: 1000 !important; }
				.leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important; }
				.leaflet-popup-content { margin: 14px 16px; }
				.leaflet-popup-close-button { top: 8px !important; right: 8px !important; color: #94a3b8 !important; font-size: 18px !important; }
				.shelter-marker[data-status="open"] { --pulse-shadow: rgba(16,185,129,0.5); }
				.custom-scrollbar::-webkit-scrollbar { width: 4px; }
				.custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
			`}</style>
			<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-white">{t('admin.shelters')}</h2>
				<button
					onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
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
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-semibold text-white">
							{editingShelter ? 'Edit Shelter' : 'Add New Shelter'}
						</h3>
						<button
							type="button"
							onClick={() => { setShowForm(false); resetForm(); }}
							className="text-slate-400 hover:text-white"
						>
							✕
						</button>
					</div>
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

						<div className="h-[350px] rounded-lg overflow-hidden border border-slate-600 relative">
							<MapContainer center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
								<ZoomControl />
								<TileLayer
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								/>
								<MapController flyTo={flyTo} zoom={8} />
								{shelters.map((s) => (
									<Marker key={s.id} position={[parseFloat(s.latitude), parseFloat(s.longitude)]} icon={createShelterIcon(s.status)}>
										<Popup>
											<PopupContent shelter={s} onEdit={startEdit} onStatusChange={updateStatus} />
										</Popup>
									</Marker>
								))}
								<LocationMarker position={markerPos} onMapClick={handleMapClick} isEditing={!!editingShelter} />
							</MapContainer>

							<div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
								{Object.entries(markerColors).map(([status, c]) => (
									<div key={status} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg border border-slate-200">
										<span className="w-2.5 h-2.5 rounded-full" style={{background: c.bg, boxShadow: `0 0 6px ${c.shadow}`}} />
										<span className="capitalize">{status}</span>
									</div>
								))}
							</div>

							<div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1 text-xs text-slate-500 bg-white/85 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-100 pointer-events-none">
								<div className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
									<span>Open</span>
								</div>
								<div className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
									<span>Shelter</span>
								</div>
							</div>
						</div>
						<p className="text-xs text-slate-500">Click on the map to place the shelter. Hover shelter markers for details.</p>

						<button
							type="submit"
							className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
						>
							{editingShelter ? 'Update' : 'Create'}
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
									onClick={() => startEdit(shelter)}
									className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-sm hover:bg-blue-600/30"
								>
									Edit
								</button>
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
		</>
	);
};

export default AdminShelters;
