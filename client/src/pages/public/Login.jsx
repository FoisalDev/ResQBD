import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks';

const Login = () => {
	const { t } = useTranslation();
	const { login } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [focusedField, setFocusedField] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const user = await login(formData.email, formData.password);
			navigate(`/${user.role}/dashboard`);
		} catch (err) {
			setError(err.response?.data?.message || t('auth.invalidCredentials'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4">
			<motion.div
				initial={{ opacity: 0, y: 30, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
				className="max-w-md w-full"
			>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="text-center mb-8"
				>
					<Link to="/" className="inline-flex items-center gap-2 mb-6">
						<motion.div
							whileHover={{ rotate: 360, scale: 1.1 }}
							transition={{ duration: 0.5 }}
							className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
						>
							<span className="text-white font-bold text-2xl">R</span>
						</motion.div>
					</Link>
					<h1 className="text-3xl font-bold text-white">{t('auth.loginTitle')}</h1>
					<p className="text-slate-400 mt-2">{t('auth.loginSubtitle')}</p>
				</motion.div>

				<div className="glass-card p-8 rounded-2xl">
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
								{error}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.email')}
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.password')}
							</label>
							<input
								type="password"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
						>
							{loading ? t('common.loading') : t('common.login')}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-slate-400">
							{t('auth.noAccount')}{' '}
							<Link to="/register" className="text-primary-500 hover:text-primary-400">
								{t('nav.register')}
							</Link>
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Login;
