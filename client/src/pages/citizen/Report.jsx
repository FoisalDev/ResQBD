import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';

const reportIcon = new L.Icon({
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
	return position ? <Marker position={position} icon={reportIcon} /> : null;
}

const CitizenReport = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		incident_type: 'flood',
		description: '',
		latitude: '',
		longitude: ''
	});
	const [markerPos, setMarkerPos] = useState(null);
	const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const lat = parseFloat(pos.coords.latitude.toFixed(6));
					const lng = parseFloat(pos.coords.longitude.toFixed(6));
					setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
					setMarkerPos([lat, lng]);
					setMapCenter([lat, lng]);
				},
				() => {}
			);
		}
	}, []);

	const handleMapClick = (pos) => {
		setMarkerPos(pos);
		setFormData((prev) => ({
			...prev,
			latitude: parseFloat(pos[0].toFixed(6)),
			longitude: parseFloat(pos[1].toFixed(6)),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.latitude || !formData.longitude) {
			alert('Please select a location on the map first.');
			return;
		}
		setLoading(true);
		try {
			await api.post('/reports', {
				...formData,
				latitude: parseFloat(formData.latitude),
				longitude: parseFloat(formData.longitude)
			});
			setSuccess(true);
			setTimeout(() => navigate('/citizen/dashboard'), 2000);
		} catch (error) {
			console.error('Report error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white mb-2">{t('report.title')}</h2>
				<p className="text-slate-400 mb-6">{t('report.subtitle')}</p>

				{success ? (
					<div className="text-center py-8">
						<p className="text-white text-lg">{t('report.success')}</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('report.type')}
							</label>
							<select
								value={formData.incident_type}
								onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
							>
								<option value="flood">{t('sos.types.flood')}</option>
								<option value="cyclone">{t('sos.types.cyclone')}</option>
								<option value="landslide">{t('sos.types.landslide')}</option>
								<option value="fire">{t('sos.types.fire')}</option>
								<option value="building_collapse">Building Collapse</option>
								<option value="other">{t('sos.types.other')}</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('report.description')}
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								rows={4}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Location <span className="text-slate-500">(click on map)</span>
							</label>
							<div className="h-[300px] rounded-lg overflow-hidden border border-slate-600 mb-3">
								<MapContainer center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
									<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
									<LocationMarker position={markerPos} onMapClick={handleMapClick} />
								</MapContainer>
							</div>
							<div className="flex gap-3">
								<input
									type="number"
									step="any"
									value={formData.latitude}
									onChange={(e) => {
										const lat = e.target.value;
										setFormData({ ...formData, latitude: lat });
										if (lat) setMarkerPos([parseFloat(lat), parseFloat(formData.longitude || 0)]);
									}}
									placeholder="Latitude"
									className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								/>
								<input
									type="number"
									step="any"
									value={formData.longitude}
									onChange={(e) => {
										const lng = e.target.value;
										setFormData({ ...formData, longitude: lng });
										if (lng) setMarkerPos([parseFloat(formData.latitude || 0), parseFloat(lng)]);
									}}
									placeholder="Longitude"
									className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
								/>
								<button
									type="button"
									onClick={() => {
										if (navigator.geolocation) {
											navigator.geolocation.getCurrentPosition(
												(pos) => {
													const lat = parseFloat(pos.coords.latitude.toFixed(6));
													const lng = parseFloat(pos.coords.longitude.toFixed(6));
													setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
													setMarkerPos([lat, lng]);
													setMapCenter([lat, lng]);
												},
												() => alert('Could not get your location.')
											);
										} else {
											alert('Geolocation is not supported by your browser.');
										}
									}}
									className="px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 text-sm whitespace-nowrap"
									title="Use my location"
								>
									📍
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-warning text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50"
						>
							{loading ? t('common.loading') : t('report.submit')}
						</button>
					</form>
				)}
			</motion.div>
		</div>
	);
};

export default CitizenReport;
