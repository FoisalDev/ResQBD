import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import api from '../../services/api';

const riskColors = {
	High: { bg: '#DC2626', border: '#B91C1C', shadow: 'rgba(220,38,38,0.5)', label: 'High Risk' },
	Medium: { bg: '#D97706', border: '#B45309', shadow: 'rgba(217,119,6,0.5)', label: 'Medium Risk' },
	Low: { bg: '#059669', border: '#047857', shadow: 'rgba(5,150,105,0.5)', label: 'Low Risk' }
};

const shelterMark = { bg: '#3B82F6', border: '#2563EB', shadow: 'rgba(59,130,246,0.5)' };

const weatherIcons = {
	thunderstorm: { path: '<path d="M16 7a4 4 0 00-3.7-2.4 5 5 0 00-9.2 1.8A3.5 3.5 0 004 13.5h11a3.5 3.5 0 001-6.5z"/><path d="M11 9l-2 3.5h2.5L10 16" stroke-width="1.8"/>', label: 'Thunderstorm', color: '#6366F1' },
	'heavy-rain': { path: '<path d="M16 7a4 4 0 00-3.7-2.4 5 5 0 00-9.2 1.8A3.5 3.5 0 004 13.5h11a3.5 3.5 0 001-6.5z"/><path d="M7.5 15v1.5M7.5 19v1M11.5 15v1.5M11.5 19v1" stroke-width="1.5" stroke-linecap="round"/>', label: 'Heavy Rain', color: '#3B82F6' },
	rain: { path: '<path d="M16 7a4 4 0 00-3.7-2.4 5 5 0 00-9.2 1.8A3.5 3.5 0 004 13.5h11a3.5 3.5 0 001-6.5z"/><path d="M8.5 15v2M11.5 15v2" stroke-width="1.5" stroke-linecap="round"/>', label: 'Rain', color: '#60A5FA' },
	sunny: { path: '<circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M17.07 4.93l-1.41 1.41M8.34 13.66l-1.41 1.41" stroke-width="1.5" stroke-linecap="round"/>', label: 'Sunny', color: '#F59E0B' },
	cloudy: { path: '<path d="M16 7a4 4 0 00-3.7-2.4 5 5 0 00-9.2 1.8A3.5 3.5 0 004 13.5h11a3.5 3.5 0 001-6.5z"/>', label: 'Cloudy', color: '#64748B' },
	foggy: { path: '<path d="M4 8.5h12M4 11.5h10M4 14.5h11" stroke-width="1.8" stroke-linecap="round"/>', label: 'Foggy', color: '#94A3B8' },
	windy: { path: '<path d="M16 7a4 4 0 00-3.7-2.4 5 5 0 00-9.2 1.8A3.5 3.5 0 004 13.5h11a3.5 3.5 0 001-6.5z"/><path d="M6 15.5h7M4 18h10" stroke-width="1.5" stroke-linecap="round"/>', label: 'Windy', color: '#67E8F9' },
	hot: { path: '<path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M17.07 4.93l-1.41 1.41M8.34 13.66l-1.41 1.41" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="10" r="3" fill="none"/><path d="M9 8h2v3H9zM9 12h2v1H9z" fill="currentColor"/>', label: 'Extreme Heat', color: '#EF4444' },
	cold: { path: '<path d="M10 3v6m0 0L8 7m2 2l2-2M10 21v-6m0 0l2 2m-2-2l-2 2M4.93 4.93l4.24 4.24m0 0l-2 2m2-2l-2-2M19.07 4.93l-4.24 4.24m0 0l2 2m-2-2l2-2M4.93 19.07l4.24-4.24m0 0l2 2m-2-2l-2 2M19.07 19.07l-4.24-4.24m0 0l-2 2m2-2l-2-2" stroke-width="1.2" stroke-linecap="round"/>', label: 'Cold', color: '#06B6D4' }
};

const getWeatherCondition = (wd) => {
	if (!wd) return weatherIcons.cloudy;
	const r = parseFloat(wd.rainfall) || 0;
	const h = parseFloat(wd.humidity) || 50;
	const w = parseFloat(wd.wind) || 0;
	const t = parseFloat(wd.temperature) || 25;
	if (r > 10) return weatherIcons.thunderstorm;
	if (r > 3) return weatherIcons['heavy-rain'];
	if (r > 0) return weatherIcons.rain;
	if (h > 85) return weatherIcons.foggy;
	if (w > 30) return weatherIcons.windy;
	if (t > 35) return weatherIcons.hot;
	if (t > 28) return weatherIcons.sunny;
	if (t < 15) return weatherIcons.cold;
	return weatherIcons.cloudy;
};

const ZoomControl = () => {
	const map = useMap();
	useEffect(() => {
		const zc = L.control.zoom({ position: 'topright' });
		zc.addTo(map);
		return () => { zc.remove(); };
	}, [map]);
	return null;
};

const createRiskIcon = (category, weatherData) => {
	const c = riskColors[category] || riskColors.Low;
	const wi = getWeatherCondition(weatherData);
	return L.divIcon({
		className: '',
		html: `
			<div class="risk-marker" data-risk="${category}" style="
				width:42px;height:42px;background:white;border:3px solid ${c.bg};
				border-radius:50%;box-shadow:0 0 20px ${c.shadow},0 4px 12px rgba(0,0,0,0.15);
				display:flex;align-items:center;justify-content:center;position:relative;
				transition:transform 0.3s ease;cursor:pointer;
				animation:riskPulse 2s ease-in-out infinite;
			">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${wi.color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
					${wi.path}
				</svg>
				<div style="
					position:absolute;bottom:-4px;right:-4px;
					width:16px;height:16px;background:${c.bg};border:2px solid white;
					border-radius:50%;display:flex;align-items:center;justify-content:center;
					box-shadow:0 2px 4px rgba(0,0,0,0.2);
				">
					<svg width="8" height="8" viewBox="0 0 24 24" fill="white">
						<path d="M12 2L1 21h22L12 2z"/>
					</svg>
				</div>
			</div>
		`,
		iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -24]
	});
};

const createShelterIcon = () => L.divIcon({
	className: '',
	html: `
		<div class="shelter-marker" style="
			width:30px;height:30px;background:white;border:2.5px solid ${shelterMark.bg};
			border-radius:50%;box-shadow:0 0 14px ${shelterMark.shadow},0 3px 8px rgba(0,0,0,0.15);
			display:flex;align-items:center;justify-content:center;
			transition:transform 0.3s ease;cursor:pointer;
		">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="${shelterMark.bg}">
				<path d="M19 9.799l-7-5.522-7 5.522v10.478h14v-10.478zm-7-7.299l9 7.101v12.399h-18v-12.399l9-7.101z"/>
				<path d="M11 15h2v4h-2z"/><path d="M8 11h8v2h-8z"/>
			</svg>
		</div>
	`,
	iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18]
});

const RiskPopupContent = ({ pred, getRiskColor, isWaterLevelFallback, getDataSourceBadge }) => {
	const c = riskColors[pred.risk_category] || riskColors.Low;
	const dataBadge = getDataSourceBadge(pred);
	const wd = pred.weather_data;
	const wi = getWeatherCondition(wd);
	return (
		<div className="min-w-[240px]">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<div dangerouslySetInnerHTML={{__html: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${wi.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${wi.path}</svg>`}} />
					<h3 className="font-semibold text-base" style={{color:'#1e293b'}}>{pred.district}</h3>
				</div>
				<span className="px-2 py-0.5 rounded text-xs font-medium" style={{background:c.bg+'22', color:c.bg, border:`1px solid ${c.bg}44`}}>{pred.risk_category}</span>
			</div>
			<div className="mb-3">
				<div className="flex justify-between text-xs text-slate-600 mb-1">
					<span>Risk Score</span>
					<span>{(pred.risk_score * 100).toFixed(1)}%</span>
				</div>
				<div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
					<div className="h-full rounded-full transition-all duration-700" style={{width: Math.min(pred.risk_score * 100, 100) + '%', background: `linear-gradient(90deg, ${c.bg}88, ${c.bg})`}} />
				</div>
			</div>
			{wd && (
				<>
					<div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
						<div dangerouslySetInnerHTML={{__html: `<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="${wi.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${wi.path}</svg>`}} />
						<span className="font-medium" style={{color: wi.color}}>{wi.label}</span>
					</div>
					<div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
						<div className="flex items-center gap-1.5 bg-slate-50 rounded px-2 py-1">
							<svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
							<span>{wd.temperature}°C</span>
						</div>
						<div className="flex items-center gap-1.5 bg-slate-50 rounded px-2 py-1">
							<svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
							<span>{wd.humidity}%</span>
						</div>
						<div className="flex items-center gap-1.5 bg-slate-50 rounded px-2 py-1">
							<svg className="w-3.5 h-3.5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z"/></svg>
							<span>{wd.wind} km/h</span>
						</div>
						<div className="flex items-center gap-1.5 bg-slate-50 rounded px-2 py-1">
							<svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
							<span>{wd.rainfall} mm</span>
						</div>
					</div>
				</>
			)}
			{pred.explanation && <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2 mt-1">{pred.explanation}</p>}
			<div className="mt-2 text-xs px-2 py-0.5 rounded inline-block text-white" style={{backgroundColor: dataBadge.color}}>{dataBadge.label}</div>
		</div>
	);
};

const ShelterPopupContent = ({ shelter }) => {
	const pct = shelter.capacity > 0 ? Math.round((shelter.current_occupancy / shelter.capacity) * 100) : 0;
	return (
		<div className="min-w-[180px]">
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-semibold text-sm" style={{color:'#1e293b'}}>{shelter.name}</h3>
				<span className={`px-2 py-0.5 rounded text-xs font-medium ${shelter.status === 'open' ? 'text-green-600 bg-green-100' : shelter.status === 'full' ? 'text-amber-600 bg-amber-100' : 'text-gray-600 bg-gray-100'}`}>{shelter.status}</span>
			</div>
			<p className="text-xs text-slate-500 mb-2">{shelter.address}</p>
			<div className="mb-1">
				<div className="flex justify-between text-xs text-slate-600 mb-0.5">
					<span>Capacity</span><span>{shelter.current_occupancy}/{shelter.capacity}</span>
				</div>
				<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
					<div className="h-full rounded-full transition-all duration-500" style={{width: Math.min(pct, 100) + '%', background: shelter.status === 'open' ? '#10B981' : shelter.status === 'full' ? '#F59E0B' : '#6B7280'}} />
				</div>
			</div>
		</div>
	);
};

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
				<style>{`
					@keyframes riskPulse {
						0%, 100% { transform: scale(1); box-shadow: 0 0 16px var(--risk-shadow, rgba(220,38,38,0.5)); }
						50% { transform: scale(1.1); box-shadow: 0 0 28px var(--risk-shadow, rgba(220,38,38,0.5)); }
					}
					.risk-marker:hover { transform: scale(1.2) !important; z-index: 1000 !important; }
					.shelter-marker:hover { transform: scale(1.25) !important; z-index: 1000 !important; }
					.leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important; }
					.leaflet-popup-content { margin: 14px 16px; }
					.leaflet-popup-close-button { top: 8px !important; right: 8px !important; color: #94a3b8 !important; font-size: 18px !important; }
					.risk-marker[data-risk="High"] { --risk-shadow: rgba(220,38,38,0.5); }
					.risk-marker[data-risk="Medium"] { --risk-shadow: rgba(217,119,6,0.5); animation-duration: 2.5s !important; }
					.risk-marker[data-risk="Low"] { --risk-shadow: rgba(5,150,105,0.5); animation-duration: 3s !important; }
				`}</style>
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
						<div className="h-[600px] rounded-lg overflow-hidden relative">
							<MapContainer
								center={[23.685, 90.3563]}
								zoom={7}
								style={{ height: '100%', width: '100%' }}
								zoomControl={false}
							>
								<ZoomControl />
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								{predictions.map((pred) => (
									<Marker
										key={pred.id || pred.district}
										position={getDistrictPosition(pred.district)}
										icon={createRiskIcon(pred.risk_category, pred.weather_data)}
									>
										<Popup>
											<RiskPopupContent pred={pred} getRiskColor={getRiskColor} isWaterLevelFallback={isWaterLevelFallback} getDataSourceBadge={getDataSourceBadge} />
										</Popup>
									</Marker>
								))}
								{shelters.map((shelter) => (
									<Marker
										key={shelter.id}
										position={[parseFloat(shelter.latitude), parseFloat(shelter.longitude)]}
										icon={createShelterIcon()}
									>
										<Popup>
											<ShelterPopupContent shelter={shelter} />
										</Popup>
									</Marker>
								))}
							</MapContainer>

							<div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1.5">
								{Object.entries(riskColors).map(([cat, c]) => (
									<div key={cat} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg border border-slate-200">
										<span className="w-2.5 h-2.5 rounded-full" style={{background: c.bg, boxShadow: `0 0 6px ${c.shadow}`}} />
										<span>{c.label}</span>
									</div>
								))}
								<div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg border border-slate-200 mt-1">
									<span className="w-2.5 h-2.5 rounded-full" style={{background: shelterMark.bg, boxShadow: `0 0 6px ${shelterMark.shadow}`}} />
									<span>Shelter</span>
								</div>
							</div>

							<div className="absolute bottom-4 left-4 z-[1000] flex flex-wrap gap-1.5 max-w-[260px]">
								{Object.values(weatherIcons).map((wi) => (
									<div key={wi.label} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-white/85 backdrop-blur-sm text-slate-600 shadow border border-slate-100">
										<div dangerouslySetInnerHTML={{__html: `<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="${wi.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${wi.path}</svg>`}} />
										<span>{wi.label}</span>
									</div>
								))}
							</div>
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
