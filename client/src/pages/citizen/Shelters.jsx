import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';

const CitizenShelters = () => {
	const { t } = useTranslation();
	const [shelters, setShelters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState('list');

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

	const getStatusColor = (status) => {
		switch (status) {
			case 'open':
				return 'bg-green-500/20 text-green-500';
			case 'full':
				return 'bg-red-500/20 text-red-500';
			default:
				return 'bg-gray-500/20 text-gray-500';
		}
	};

	const shelterIcon = new L.Icon({
		iconUrl:
			'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41]
	});

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-white">{t('shelter.title')}</h2>
					<p className="text-slate-400">{t('shelter.subtitle')}</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => setViewMode('list')}
						className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-300'}`}
					>
						List
					</button>
					<button
						onClick={() => setViewMode('map')}
						className={`px-4 py-2 rounded-lg ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-300'}`}
					>
						Map
					</button>
				</div>
			</div>

			{loading ? (
				<p className="text-slate-400">{t('common.loading')}</p>
			) : viewMode === 'list' ? (
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
									className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(shelter.status)}`}
								>
									{t(`shelter.status.${shelter.status}`)}
								</span>
							</div>
							<p className="text-slate-400 text-sm mb-3">{shelter.address}</p>
							<div className="space-y-2 text-sm">
								<p className="text-slate-300">
									{t('shelter.capacity')}: {shelter.capacity}
								</p>
								<p className="text-slate-300">
									{t('shelter.occupancy')}: {shelter.current_occupancy}
								</p>
								{shelter.contact_phone && (
									<p className="text-slate-300">
										{t('shelter.contact')}: {shelter.contact_phone}
									</p>
								)}
							</div>
						</motion.div>
					))}
				</div>
			) : (
				<div className="glass-card p-4 rounded-xl">
					<div className="h-[600px] rounded-lg overflow-hidden">
						<MapContainer
							center={[23.8103, 90.4125]}
							zoom={7}
							style={{ height: '100%', width: '100%' }}
						>
							<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
							{shelters.map((shelter) => (
								<Marker
									key={shelter.id}
									position={[shelter.latitude, shelter.longitude]}
									icon={shelterIcon}
								>
									<Popup>
										<div className="text-center">
											<h3 className="font-semibold">{shelter.name}</h3>
											<p>Capacity: {shelter.capacity}</p>
											<p>Status: {shelter.status}</p>
										</div>
									</Popup>
								</Marker>
							))}
						</MapContainer>
					</div>
				</div>
			)}
		</div>
	);
};

export default CitizenShelters;
