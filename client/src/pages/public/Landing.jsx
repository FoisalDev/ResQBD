import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HeroParticles from '../../components/ui/HeroParticles';
import AdvancedGradient from '../../components/ui/AdvancedGradient';

const Landing = () => {
	const { t } = useTranslation();

	const features = [
		{
			icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
			title: t('landing.features.ai.title'),
			description: t('landing.features.ai.description')
		},
		{
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			title: t('landing.features.sos.title'),
			description: t('landing.features.sos.description')
		},
		{
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
			title: t('landing.features.volunteer.title'),
			description: t('landing.features.volunteer.description')
		},
		{
			icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
			title: t('landing.features.shelter.title'),
			description: t('landing.features.shelter.description')
		}
	];

	return (
		<div className="min-h-screen relative">
			<HeroParticles />
			<AdvancedGradient />

			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
				{/* Animated Background */}
				<div className="absolute inset-0 overflow-hidden">
					{/* Gradient Base */}
					<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

					{/* Animated Orbs - More Visible */}
					<motion.div
						className="absolute top-[10%] left-[5%]"
						style={{
							width: '300px',
							height: '300px',
							background:
								'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 30%, rgba(59, 130, 246, 0.1) 60%, transparent 80%)',
							filter: 'blur(20px)'
						}}
						animate={{
							x: [0, 40, -20, 0],
							y: [0, 30, -20, 0]
						}}
						transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute bottom-[20%] right-[10%]"
						style={{
							width: '350px',
							height: '350px',
							background:
								'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(16, 185, 129, 0.4) 30%, rgba(16, 185, 129, 0.1) 60%, transparent 80%)',
							filter: 'blur(20px)'
						}}
						animate={{
							x: [0, -30, 20, 0],
							y: [0, -40, 20, 0]
						}}
						transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute top-[40%] right-[25%]"
						style={{
							width: '250px',
							height: '250px',
							background:
								'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.4) 30%, rgba(139, 92, 246, 0.1) 60%, transparent 80%)',
							filter: 'blur(15px)'
						}}
						animate={{
							x: [0, 25, -15, 0]
						}}
						transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute bottom-[10%] left-[30%]"
						style={{
							width: '200px',
							height: '200px',
							background:
								'radial-gradient(circle, rgba(239, 68, 68, 0.7) 0%, rgba(239, 68, 68, 0.3) 30%, rgba(239, 68, 68, 0.1) 60%, transparent 80%)',
							filter: 'blur(15px)'
						}}
						animate={{
							x: [0, -20, 15, 0],
							y: [0, 15, -10, 0]
						}}
						transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute top-[20%] right-[5%]"
						style={{
							width: '180px',
							height: '180px',
							background:
								'radial-gradient(circle, rgba(20, 184, 166, 0.8) 0%, rgba(20, 184, 166, 0.4) 30%, rgba(20, 184, 166, 0.1) 60%, transparent 80%)',
							filter: 'blur(12px)'
						}}
						animate={{
							rotate: [0, 10, -10, 0]
						}}
						transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
					/>

					{/* Overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/60" />
				</div>

				<div className="relative z-10 container mx-auto px-4 text-center">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
					>
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							whileHover={{ scale: 1.02 }}
							className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/30 to-blue-500/30 rounded-full border border-primary-500/40 mb-6 backdrop-blur-sm"
						>
							<motion.span
								className="w-2.5 h-2.5 bg-primary-400 rounded-full"
								animate={{
									scale: [1, 1.3, 1],
									boxShadow: [
										'0 0 0 0 rgba(59, 130, 246, 0)',
										'0 0 0 8px rgba(59, 130, 246, 0)',
										'0 0 0 0 rgba(59, 130, 246, 0)'
									]
								}}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							<span className="text-primary-300 text-sm font-medium">
								Bangladesh's Leading Disaster Response System
							</span>
						</motion.div>

						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
							<motion.span
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="block text-white"
							>
								AI-Powered Disaster Response for
							</motion.span>
							<motion.span
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-emerald-400 bg-[length:200%_auto] animate-gradient"
							>
								Bangladesh
							</motion.span>
						</h1>
						<motion.p
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
						>
							{t('landing.heroSubtitle')}
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8 }}
							className="flex flex-col sm:flex-row gap-4 justify-center"
						>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.98 }}
								className="relative"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl blur-lg opacity-50" />
								<Link
									to="/register"
									className="relative inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg"
								>
									{t('landing.cta')}
								</Link>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.98 }}
								className="relative"
							>
								<div className="absolute inset-0 bg-slate-600/50 rounded-xl blur-md" />
								<Link
									to="/risk"
									className="relative inline-block px-8 py-4 bg-slate-700/80 text-white font-semibold rounded-xl hover:bg-slate-600/80 transition-all border border-slate-600"
								>
									{t('landing.ctaSecondary')}
								</Link>
							</motion.div>
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.2 }}
						className="absolute bottom-8 left-1/2 -translate-x-1/2"
					>
						<motion.div
							animate={{ y: [0, 10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center pt-2"
						>
							<div className="w-1 h-2 bg-slate-400 rounded-full" />
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 bg-slate-900/80 backdrop-blur-sm">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{[
							{ value: '2,500+', label: t('landing.stats.sos') },
							{ value: '500+', label: t('landing.stats.volunteers') },
							{ value: '150+', label: t('landing.stats.shelters') },
							{ value: '10,000+', label: t('landing.stats.relief') }
						].map((stat, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								viewport={{ once: true }}
								className="text-center"
							>
								<motion.div
									whileHover={{ scale: 1.1 }}
									className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent mb-2"
								>
									{stat.value}
								</motion.div>
								<div className="text-slate-400">{stat.label}</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 bg-slate-900 relative">
				<div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900" />
				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<motion.span
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							className="inline-block px-4 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-4"
						>
							Features
						</motion.span>
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Powerful Features for Disaster Response
						</h2>
						<p className="text-slate-400 max-w-2xl mx-auto">
							Comprehensive tools designed to save lives during natural disasters in Bangladesh
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.15 }}
								viewport={{ once: true }}
								whileHover={{ y: -10, transition: { duration: 0.2 } }}
								className="group glass-card p-6 rounded-2xl hover:border-primary-500/50 transition-all cursor-pointer relative overflow-hidden"
							>
								<motion.div
									className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
									initial={false}
								/>
								<div className="relative z-10">
									<motion.div
										whileHover={{ rotate: 360, scale: 1.1 }}
										transition={{ duration: 0.5 }}
										className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20"
									>
										<svg
											className="w-7 h-7 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d={feature.icon}
											/>
										</svg>
									</motion.div>
									<h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
										{feature.title}
									</h3>
									<p className="text-slate-400 text-sm">{feature.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-24 bg-slate-800/50">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
					</motion.div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{
								step: '1',
								title: 'Report Emergency',
								description: 'Citizens submit SOS alerts with location details'
							},
							{
								step: '2',
								title: 'AI Analysis',
								description: 'Our system analyzes risk levels and assigns resources'
							},
							{
								step: '3',
								title: 'Rapid Response',
								description: 'Volunteers and authorities respond quickly'
							}
						].map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								viewport={{ once: true }}
								className="relative"
							>
								<div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
									{item.step}
								</div>
								<h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
								<p className="text-slate-400">{item.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700 relative">
				<div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700" />
				<div className="container mx-auto px-4 text-center relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Ready to Make a Difference?
						</h2>
						<p className="text-white/90 mb-8 max-w-2xl mx-auto">
							Join our network of volunteers and help save lives during disasters
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								to="/register"
								className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
							>
								Register Now
							</Link>
							<Link
								to="/about"
								className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
							>
								Learn More
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default Landing;
