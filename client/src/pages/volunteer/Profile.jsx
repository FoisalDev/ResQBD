import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks';
import api from '../../services/api';

const VolunteerProfile = () => {
	const { t, i18n } = useTranslation();
	const { user, updateUser } = useAuth();
	const fileInputRef = useRef(null);
	const [formData, setFormData] = useState({
		name: user?.name || '',
		phone: '',
		languagePref: i18n.language
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [avatarPreview, setAvatarPreview] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (selectedFile) {
				const formDataUpload = new FormData();
				formDataUpload.append('avatar', selectedFile);
				await api.post('/auth/avatar', formDataUpload, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
			}
			const updatedUser = await api.put('/auth/profile', formData);
			updateUser(updatedUser.data);
			i18n.changeLanguage(formData.languagePref);
			localStorage.setItem('language', formData.languagePref);
			setSelectedFile(null);
			setAvatarPreview(null);
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error('Profile update error:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setSelectedFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setAvatarPreview(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const handleCancelAvatar = () => {
		setSelectedFile(null);
		setAvatarPreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="glass-card p-6 rounded-xl"
			>
				<h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>

				<div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
					<div className="flex items-center gap-4">
						<div className="relative">
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt="Preview"
									className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
								/>
							) : user?.avatarUrl ? (
								<img
									src={
										user.avatarUrl.startsWith('http')
											? user.avatarUrl
											: `http://localhost:5001${user.avatarUrl}`
									}
									alt={user?.name}
									className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
								/>
							) : (
								<div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center border-2 border-primary-500">
									<span className="text-white text-2xl font-bold">
										{user?.name?.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
							<button
								type="button"
								onClick={handleAvatarClick}
								className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
							>
								<svg
									className="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</button>
						</div>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleAvatarChange}
							accept="image/*"
							className="hidden"
						/>
						<div>
							<p className="text-white font-semibold">{user?.name}</p>
							<p className="text-slate-400 text-sm">{user?.email}</p>
							<p className="text-primary-500 text-sm capitalize">{user?.role}</p>
							{selectedFile ? (
								<div className="flex items-center gap-2 mt-2">
									<p className="text-slate-500 text-xs">New photo selected</p>
									<button
										type="button"
										onClick={handleCancelAvatar}
										className="text-xs text-danger hover:underline"
									>
										Cancel
									</button>
								</div>
							) : (
								<p className="text-slate-500 text-xs mt-1">Click camera icon to change photo</p>
							)}
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-slate-300 mb-2">
							{t('auth.name')}
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-300 mb-2">
							{t('auth.phone')}
						</label>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
							className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-300 mb-2">
							{t('common.language')}
						</label>
						<select
							value={formData.languagePref}
							onChange={(e) => setFormData({ ...formData, languagePref: e.target.value })}
							className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
						>
							<option value="en">English</option>
							<option value="bn">বাংলা (Bengali)</option>
						</select>
					</div>

					{success && (
						<div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-500 text-sm">
							Profile updated successfully!
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
					>
						{loading ? t('common.loading') : t('common.save')}
					</button>
				</form>
			</motion.div>
		</div>
	);
};

export default VolunteerProfile;
