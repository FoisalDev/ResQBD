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
	const [showPassword, setShowPassword] = useState(false);

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
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
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
