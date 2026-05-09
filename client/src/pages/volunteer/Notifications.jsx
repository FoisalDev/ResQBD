import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const VolunteerNotifications = () => {
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
			console.error('Error:', error);
		}
	};

	return (
		<div className="max-w-3xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white mb-6">{t('notifications.title')}</h2>

				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : notifications.length > 0 ? (
					<div className="space-y-3">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								onClick={() => markAsRead(notification.id)}
								className={`p-4 rounded-lg cursor-pointer ${notification.is_read ? 'bg-slate-800/50' : 'bg-slate-800'}`}
							>
								<h4 className="text-white font-medium">{notification.title}</h4>
								<p className="text-slate-400 text-sm mt-1">{notification.message}</p>
								<p className="text-slate-500 text-xs mt-2">
									{new Date(notification.created_at).toLocaleString()}
								</p>
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

export default VolunteerNotifications;
