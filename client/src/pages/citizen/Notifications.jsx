import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const CitizenNotifications = () => {
	const { t } = useTranslation();
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const response = await api.get('/notifications');
				setNotifications(response.data);
			} catch (error) {
				console.error('Error fetching notifications:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchNotifications();
	}, []);

	const markAsRead = async (id) => {
		try {
			await api.patch(`/notifications/${id}/read`);
			setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await api.patch('/notifications/read-all');
			setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
		} catch (error) {
			console.error('Error marking all as read:', error);
		}
	};

	return (
		<div className="max-w-3xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-white">{t('notifications.title')}</h2>
					<button
						onClick={markAllAsRead}
						className="text-sm text-primary-500 hover:text-primary-400"
					>
						{t('notifications.markAllRead')}
					</button>
				</div>

				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : notifications.length > 0 ? (
					<div className="space-y-3">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								onClick={() => markAsRead(notification.id)}
								className={`p-4 rounded-lg cursor-pointer transition-colors ${
									notification.is_read ? 'bg-slate-800/50' : 'bg-slate-800'
								}`}
							>
								<div className="flex items-start gap-3">
									{!notification.is_read && (
										<div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
									)}
									<div className="flex-1">
										<h4 className="text-white font-medium">{notification.title}</h4>
										<p className="text-slate-400 text-sm mt-1">{notification.message}</p>
										<p className="text-slate-500 text-xs mt-2">
											{new Date(notification.created_at).toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-slate-400 text-center py-8">{t('notifications.noNotifications')}</p>
				)}
			</motion.div>
		</div>
	);
};

export default CitizenNotifications;
