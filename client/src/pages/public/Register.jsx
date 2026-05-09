import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks';

const Register = () => {
	const { t } = useTranslation();
	const { register } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
		role: 'citizen'
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const validateField = (name, value) => {
		switch (name) {
			case 'name':
				if (!value.trim()) return t('validation.nameRequired');
				if (value.length < 2) return t('validation.nameMin');
				break;
			case 'email':
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!value) return t('validation.emailRequired');
				if (!emailRegex.test(value)) return t('validation.emailInvalid');
				break;
			case 'phone':
				const phoneRegex = /^(\+880|0)[1-9]\d{9}$/;
				if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
					return t('validation.phoneInvalid');
				}
				break;
			case 'password':
				if (!value) return t('validation.passwordRequired');
				if (value.length < 6) return t('validation.passwordMin');
				break;
			case 'confirmPassword':
				if (value !== formData.password) return t('validation.passwordMatch');
				break;
			default:
				break;
		}
		return null;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		const error = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;
		const error = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newErrors = {};
		Object.keys(formData).forEach((key) => {
			if (key !== 'role') {
				const error = validateField(key, formData[key]);
				if (error) newErrors[key] = error;
			}
		});
		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) return;

		setLoading(true);
		try {
			const user = await register({
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
				role: formData.role
			});
			navigate(`/${user.role}/dashboard`);
		} catch (err) {
			const errorData = err.response?.data;
			if (errorData?.errors) {
				const newErrors = {};
				errorData.errors.forEach((err) => {
					newErrors[err.path] = err.msg;
				});
				setErrors(newErrors);
			} else if (errorData?.message) {
				setErrors({ form: errorData.message });
			} else {
				setErrors({ form: t('common.error') });
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="max-w-md w-full"
			>
				<div className="text-center mb-8">
					<Link to="/" className="inline-flex items-center gap-2 mb-6">
						<div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
							<span className="text-white font-bold text-xl">R</span>
						</div>
					</Link>
					<h1 className="text-3xl font-bold text-white">{t('auth.registerTitle')}</h1>
					<p className="text-slate-400 mt-2">{t('auth.registerSubtitle')}</p>
				</div>

				<div className="glass-card p-8 rounded-2xl">
					<form onSubmit={handleSubmit} className="space-y-5">
						{errors.form && (
							<div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
								{errors.form}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.name')} <span className="text-danger">*</span>
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:border-primary-500 ${
									errors.name ? 'border-danger' : 'border-slate-600'
								}`}
								placeholder="e.g. John Doe"
							/>
							{errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
							<p className="text-slate-500 text-xs mt-1">Minimum 2 characters</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.email')} <span className="text-danger">*</span>
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:border-primary-500 ${
									errors.email ? 'border-danger' : 'border-slate-600'
								}`}
								placeholder="e.g. user@example.com"
							/>
							{errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
							<p className="text-slate-500 text-xs mt-1">
								Enter a valid email address (e.g. name@gmail.com)
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.phone')} <span className="text-slate-500">(optional)</span>
							</label>
							<input
								type="tel"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:border-primary-500 ${
									errors.phone ? 'border-danger' : 'border-slate-600'
								}`}
								placeholder="e.g. +8801712345678"
							/>
							{errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
							<p className="text-slate-500 text-xs mt-1">Format: +880 or 0 followed by 10 digits</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.role')}
							</label>
							<select
								value={formData.role}
								onChange={(e) => setFormData({ ...formData, role: e.target.value })}
								className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
							>
								<option value="citizen">{t('auth.citizen')}</option>
								<option value="volunteer">{t('auth.volunteer')}</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.password')} <span className="text-danger">*</span>
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:border-primary-500 ${
									errors.password ? 'border-danger' : 'border-slate-600'
								}`}
								placeholder="••••••••"
							/>
							{errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
							<p className="text-slate-500 text-xs mt-1">At least 6 characters</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								{t('auth.confirmPassword')} <span className="text-danger">*</span>
							</label>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:border-primary-500 ${
									errors.confirmPassword ? 'border-danger' : 'border-slate-600'
								}`}
								placeholder="••••••••"
							/>
							{errors.confirmPassword && (
								<p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
						>
							{loading ? t('common.loading') : t('common.register')}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-slate-400">
							{t('auth.haveAccount')}{' '}
							<Link to="/login" className="text-primary-500 hover:text-primary-400">
								{t('nav.login')}
							</Link>
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Register;
