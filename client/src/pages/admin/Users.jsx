import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminUsers = () => {
	const { t } = useTranslation();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await api.get('/admin/users');
				setUsers(response.data);
			} catch (error) {
				console.error('Error fetching users:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

	const deleteUser = async (id) => {
		if (!confirm('Are you sure you want to delete this user?')) return;
		try {
			await api.delete(`/admin/users/${id}`);
			setUsers(users.filter((u) => u.id !== id));
		} catch (error) {
			console.error('Error deleting user:', error);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-xl font-semibold text-white mb-4">{t('admin.users')}</h2>

				{loading ? (
					<p className="text-slate-400">{t('common.loading')}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left text-slate-400 border-b border-slate-700">
									<th className="pb-3">Name</th>
									<th className="pb-3">Email</th>
									<th className="pb-3">Role</th>
									<th className="pb-3">Joined</th>
									<th className="pb-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr key={user.id} className="border-b border-slate-700/50">
										<td className="py-3 text-white">{user.name}</td>
										<td className="py-3 text-slate-300">{user.email}</td>
										<td className="py-3">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													user.role === 'admin'
														? 'bg-purple-500/20 text-purple-500'
														: user.role === 'volunteer'
															? 'bg-blue-500/20 text-blue-500'
															: 'bg-green-500/20 text-green-500'
												}`}
											>
												{user.role}
											</span>
										</td>
										<td className="py-3 text-slate-400">
											{new Date(user.createdAt).toLocaleDateString()}
										</td>
										<td className="py-3">
											<button
												onClick={() => deleteUser(user.id)}
												className="text-danger hover:text-red-400"
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default AdminUsers;
