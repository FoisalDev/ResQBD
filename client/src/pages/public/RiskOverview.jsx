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

	const isWaterLevelFallback = (pred) => {
		if (pred.data_source) {
			return pred.data_source.water && pred.data_source.water.startsWith('FALLBACK');
		}
		if (pred.weather_data && pred.weather_data.dataSourceNote) {
			return pred.weather_data.dataSourceNote.includes('FALLBACK');
		}
		return true;
	};

	const getDataSourceBadge = (pred) => {
		const isFallback = isWaterLevelFallback(pred);
		if (isFallback) {
			return { label: 'Partial Fallback', color: '#F59E0B' };
		}
		return { label: 'Live Data', color: '#10B981' };
	};

	const shelterIcon = new L.Icon({
		iconUrl:
			'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41]
	});

	const getRiskIcon = (category) => {
		const colors = {
			High: 'red',
			Medium: 'orange',
			Low: 'green'
		};
		const color = colors[category] || 'grey';
		return new L.Icon({
			iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41]
		});
	};

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
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-3xl font-bold text-white">{t('risk.title')}</h1>
					</div>

					<div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
						<div className="flex items-center gap-1">
							<span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
							<span>Live weather data (OpenWeatherMap)</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
							<span>Water level = fallback estimate</span>
						</div>
					</div>

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
								{predictions.map((pred) => {
									const dataBadge = getDataSourceBadge(pred);
									return (
									<Marker
										key={pred.id || pred.district}
										position={getDistrictPosition(pred.district)}
										icon={getRiskIcon(pred.risk_category)}
									>
											<Popup>
												<div className="text-center min-w-[200px]">
													<h3 className="font-semibold text-lg">{pred.district}</h3>
													<p>
														Risk:{' '}
														<span style={{ color: getRiskColor(pred.risk_category) }}>
															{pred.risk_category}
														</span>
													</p>
													<p>Score: {(pred.risk_score * 100).toFixed(1)}%</p>
													{pred.weather_data && (
														<div className="mt-2 text-xs text-left border-t pt-2">
															<p>Temp: {pred.weather_data.temperature}°C</p>
															<p>Humidity: {pred.weather_data.humidity}%</p>
															<p>Wind: {pred.weather_data.wind} km/h</p>
															<p>Rainfall: {pred.weather_data.rainfall} mm</p>
															<p>
																Water Level: {pred.weather_data.water} m
																<span
																	className="ml-1 text-amber-500"
																	title={isWaterLevelFallback(pred) ? 'Fallback estimate' : 'Live data'}
																>
																	{isWaterLevelFallback(pred) ? '(est.)' : ''}
																</span>
															</p>
														</div>
													)}
													<div
														className="mt-2 text-xs px-2 py-0.5 rounded inline-block text-white"
														style={{ backgroundColor: dataBadge.color }}
													>
														{dataBadge.label}
													</div>
												</div>
											</Popup>
										</Marker>
									);
								})}
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
										<th className="pb-3">Weather Data Used</th>
										<th className="pb-3">Data Source</th>
										<th className="pb-3">Explanation</th>
									</tr>
								</thead>
								<tbody>
									{predictions.map((pred) => {
										const dataBadge = getDataSourceBadge(pred);
										return (
											<tr key={pred.id || pred.district} className="border-b border-slate-700/50">
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
												<td className="py-3 text-slate-400 text-sm">
													{pred.weather_data ? (
														<div>
															<div>T: {pred.weather_data.temperature}°C</div>
															<div>H: {pred.weather_data.humidity}%</div>
															<div>W: {pred.weather_data.wind} km/h</div>
															<div>R: {pred.weather_data.rainfall} mm</div>
															<div>
																WL: {pred.weather_data.water} m
																{isWaterLevelFallback(pred) && (
																	<span className="text-amber-500 ml-1">(est.)</span>
																)}
															</div>
														</div>
													) : (
														<span className="italic">Not available</span>
													)}
												</td>
												<td className="py-3">
													<span
														className="px-2 py-0.5 rounded text-xs font-medium text-white"
														style={{ backgroundColor: dataBadge.color }}
													>
														{dataBadge.label}
													</span>
												</td>
												<td className="py-3 text-slate-400 text-sm max-w-xs">
													{pred.explanation}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						<div className="mt-4 text-xs text-slate-500">
							<p>
								<strong>Data source note:</strong> Temperature, humidity, wind speed, and rainfall are fetched live from
								OpenWeatherMap API. Water level is NOT available from OpenWeatherMap — a safe dry-season baseline
								estimate is used as fallback and clearly marked <span className="text-amber-500">(est.)</span>.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default RiskOverview;
