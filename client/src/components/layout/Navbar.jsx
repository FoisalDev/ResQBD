import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks';
import api from '../../services/api';

const Navbar = ({ onMenuClick, showMenu }) => {
	const { t, i18n } = useTranslation();
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [langOpen, setLangOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (user) {
			fetchNotifications();
		}
	}, [user]);

	const toggleLanguage = () => {
		const newLang = i18n.language === 'en' ? 'bn' : 'en';
		i18n.changeLanguage(newLang);
		localStorage.setItem('language', newLang);
		setLangOpen(false);
	};

	const fetchNotifications = async () => {
		if (!user) return;
		try {
			const response = await api.get('/notifications');
			setNotifications(response.data.slice(0, 5));
			setUnreadCount(response.data.filter((n) => !n.isRead).length);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		}
	};

	const markAsRead = async (id) => {
		try {
			await api.patch(`/notifications/${id}/read`);
			fetchNotifications();
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await api.patch('/notifications/read-all');
			fetchNotifications();
		} catch (error) {
			console.error('Error marking all as read:', error);
		}
	};

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	const isActive = (path) => location.pathname === path;

	return (
		<nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
			<div className="px-6">
				<div className="flex items-center justify-between h-24">
					<div className="flex items-center gap-8">
						{showMenu && (
							<button
								onClick={onMenuClick}
								className="lg:hidden p-2 text-slate-400 hover:text-white"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
						)}
						<Link to="/" className="flex items-center gap-2">
							<img src="/logo.png" alt="ResQBD" className="w-60 h-60 object-contain" />
						</Link>

						{!user && (
							<div className="hidden md:flex items-center gap-6">
								<Link
									to="/"
									className={`text-sm ${isActive('/') ? 'text-primary-400' : 'text-slate-300 hover:text-white'}`}
								>
									{t('nav.home')}
								</Link>
								<Link
									to="/about"
									className={`text-sm ${isActive('/about') ? 'text-primary-400' : 'text-slate-300 hover:text-white'}`}
								>
									{t('nav.about')}
								</Link>
								<Link
									to="/risk"
									className={`text-sm ${isActive('/risk') ? 'text-primary-400' : 'text-slate-300 hover:text-white'}`}
								>
									{t('nav.risk')}
								</Link>
							</div>
						)}
					</div>

					<div className="flex items-center gap-4">
						{user ? (
							<>
								<div className="relative">
									<button
										onClick={() => {
											setNotifOpen(!notifOpen);
											fetchNotifications();
										}}
										className="p-2 text-slate-400 hover:text-white relative"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
											/>
										</svg>
										{unreadCount > 0 && (
											<span className="absolute top-0 right-0 w-5 h-5 bg-danger rounded-full text-xs flex items-center justify-center text-white">
												{unreadCount}
											</span>
										)}
									</button>
									<AnimatePresence>
										{notifOpen && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 10 }}
												className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden"
											>
												<div className="p-3 border-b border-slate-700 flex items-center justify-between">
													<h3 className="font-semibold text-white">{t('notifications.title')}</h3>
													{unreadCount > 0 && (
														<button
															onClick={markAllAsRead}
															className="text-xs text-primary-400 hover:text-primary-300"
														>
															Mark all read
														</button>
													)}
												</div>
												<div className="max-h-64 overflow-y-auto">
													{notifications.length > 0 ? (
														notifications.map((n) => (
															<div
																key={n.id}
																onClick={() => !n.isRead && markAsRead(n.id)}
																className={`p-3 border-b border-slate-700 cursor-pointer ${
																	n.isRead ? 'opacity-60' : 'hover:bg-slate-700'
																}`}
															>
																<div className="flex items-start gap-2">
																	{!n.isRead && (
																		<span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />
																	)}
																	<div className="flex-1 min-w-0">
																		<p className="text-sm text-white truncate">{n.title}</p>
																		<p className="text-xs text-slate-400 truncate">{n.message}</p>
																	</div>
																</div>
															</div>
														))
													) : (
														<p className="p-3 text-sm text-slate-400">
															{t('notifications.noNotifications')}
														</p>
													)}
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								<div className="relative">
									<button
										onClick={() => setLangOpen(!langOpen)}
										className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white"
									>
										<span className="text-lg">{i18n.language === 'en' ? '🇬🇧' : '🇧🇩'}</span>
										<span className="text-sm">{i18n.language === 'en' ? 'EN' : 'BN'}</span>
									</button>
									<AnimatePresence>
										{langOpen && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 10 }}
												className="absolute right-0 mt-2 w-32 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden"
											>
												<button
													onClick={toggleLanguage}
													className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
												>
													{i18n.language === 'en' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								<div className="flex items-center gap-3">
									{user.avatarUrl ? (
										<img
											src={
												user.avatarUrl.startsWith('http')
													? user.avatarUrl
													: `http://localhost:5001${user.avatarUrl}`
											}
											alt={user.name}
											className="w-8 h-8 rounded-full object-cover"
										/>
									) : (
										<div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
											<span className="text-white text-sm font-medium">
												{user.name?.charAt(0).toUpperCase()}
											</span>
										</div>
									)}
									<button
										onClick={handleLogout}
										className="text-sm text-slate-300 hover:text-white"
									>
										{t('common.logout')}
									</button>
								</div>
							</>
						) : (
							<>
								<div className="relative">
									<button
										onClick={() => setLangOpen(!langOpen)}
										className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white"
									>
										<span className="text-lg">{i18n.language === 'en' ? '🇬🇧' : '🇧🇩'}</span>
										<span className="text-sm">{i18n.language === 'en' ? 'EN' : 'BN'}</span>
									</button>
									<AnimatePresence>
										{langOpen && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 10 }}
												className="absolute right-0 mt-2 w-32 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden"
											>
												<button
													onClick={toggleLanguage}
													className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
												>
													{i18n.language === 'en' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
								<Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white">
									{t('nav.login')}
								</Link>
								<Link
									to="/register"
									className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
								>
									{t('nav.register')}
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
