import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import api from '../../services/api';

const RiskOverview = () => {
	const { t } = useTranslation();
	const [predictions, setPredictions] = useState([]);
	const [shelters, setShelters] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [predictionsRes, sheltersRes] = await Promise.all([
					api.get('/risk/predictions/latest'),
					api.get('/shelters')
				]);
				setPredictions(predictionsRes.data);
				setShelters(sheltersRes.data);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const getRiskColor = (category) => {
		switch (category) {
			case 'High':
				return '#DC2626';
			case 'Medium':
				return '#D97706';
			case 'Low':
				return '#059669';
			default:
				return '#6B7280';
		}
	};

	const shelterIcon = new L.Icon({
		iconUrl:
			'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41]
	});

	const getDistrictPosition = (district) => {
		const positions = {
			Dhaka: [23.8103, 90.4125],
			Chittagong: [22.3569, 91.7832],
			Sylhet: [24.899, 91.8719],
			Rajshahi: [24.3745, 88.6042],
			Khulna: [22.8456, 89.5403],
			Barisal: [22.701, 90.3535],
			Rangpur: [25.7439, 89.2752],
			Mymensingh: [24.7471, 90.4203]
		};
		return positions[district] || [23.685, 90.3563];
	};

	return (
		<div className="min-h-screen py-8">
			<div className="container mx-auto px-4">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
					<h1 className="text-3xl font-bold text-white mb-6">{t('risk.title')}</h1>

					{/* Risk Cards */}
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						{['Low', 'Medium', 'High'].map((risk) => {
							const count = predictions.filter((p) => p.risk_category === risk).length;
							return (
								<div
									key={risk}
									className="glass-card p-6 rounded-xl"
									style={{ borderColor: getRiskColor(risk) }}
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-slate-400 mb-1">
												{risk} {t('risk.prediction')}
											</p>
											<p className="text-3xl font-bold" style={{ color: getRiskColor(risk) }}>
												{count}
											</p>
										</div>
										<div
											className="w-4 h-4 rounded-full"
											style={{ backgroundColor: getRiskColor(risk) }}
										/>
									</div>
								</div>
							);
						})}
					</div>

					{/* Map */}
					<div className="glass-card p-4 rounded-xl">
						<div className="h-[600px] rounded-lg overflow-hidden">
							<MapContainer
								center={[23.685, 90.3563]}
								zoom={7}
								style={{ height: '100%', width: '100%' }}
							>
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								{predictions.map((pred) => (
									<Marker key={pred.id} position={getDistrictPosition(pred.district)}>
										<Popup>
											<div className="text-center">
												<h3 className="font-semibold">{pred.district}</h3>
												<p>
													Risk:{' '}
													<span style={{ color: getRiskColor(pred.risk_category) }}>
														{pred.risk_category}
													</span>
												</p>
												<p>Score: {(pred.risk_score * 100).toFixed(1)}%</p>
											</div>
										</Popup>
									</Marker>
								))}
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

					{/* Risk Table */}
					<div className="glass-card p-6 rounded-xl mt-8">
						<h2 className="text-xl font-semibold text-white mb-4">
							{t('risk.prediction')} by District
						</h2>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="text-left text-slate-400 border-b border-slate-700">
										<th className="pb-3">District</th>
										<th className="pb-3">Risk Category</th>
										<th className="pb-3">Risk Score</th>
										<th className="pb-3">Explanation</th>
									</tr>
								</thead>
								<tbody>
									{predictions.map((pred) => (
										<tr key={pred.id} className="border-b border-slate-700/50">
											<td className="py-3 text-white">{pred.district}</td>
											<td className="py-3">
												<span
													className="px-2 py-1 rounded text-xs font-medium"
													style={{
														backgroundColor: `${getRiskColor(pred.risk_category)}20`,
														color: getRiskColor(pred.risk_category)
													}}
												>
													{pred.risk_category}
												</span>
											</td>
											<td className="py-3 text-white">{(pred.risk_score * 100).toFixed(1)}%</td>
											<td className="py-3 text-slate-400 text-sm">{pred.explanation}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default RiskOverview;
