import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const About = () => {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen py-16">
			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="max-w-4xl mx-auto"
				>
					<h1 className="text-4xl font-bold text-white mb-8 text-center">About ResQBD</h1>

					<div className="glass-card p-8 rounded-2xl mb-8">
						<h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
						<p className="text-slate-300 leading-relaxed">
							ResQBD is an AI-powered disaster response platform specifically designed for
							Bangladesh. We leverage cutting-edge technology to predict, respond to, and manage
							natural disasters more effectively. Our platform connects citizens, volunteers, and
							government authorities to save lives and minimize damage during floods, cyclones, and
							other emergencies.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 mb-8">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="glass-card p-6 rounded-2xl"
						>
							<h3 className="text-xl font-semibold text-white mb-3">AI-Powered Predictions</h3>
							<p className="text-slate-400">
								Our machine learning models analyze weather data to predict flood and cyclone risks
								in real-time, enabling proactive disaster management.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="glass-card p-6 rounded-2xl"
						>
							<h3 className="text-xl font-semibold text-white mb-3">Rapid Emergency Response</h3>
							<p className="text-slate-400">
								Citizens can send SOS alerts with their exact location, enabling volunteers and
								rescue teams to respond quickly and efficiently.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
							className="glass-card p-6 rounded-2xl"
						>
							<h3 className="text-xl font-semibold text-white mb-3">Volunteer Network</h3>
							<p className="text-slate-400">
								Our extensive network of trained volunteers is ready to assist in rescue operations,
								relief distribution, and shelter management.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
							className="glass-card p-6 rounded-2xl"
						>
							<h3 className="text-xl font-semibold text-white mb-3">Bilingual Support</h3>
							<p className="text-slate-400">
								The platform supports both Bengali and English, ensuring accessibility for all
								citizens across Bangladesh.
							</p>
						</motion.div>
					</div>

					<div className="glass-card p-8 rounded-2xl">
						<h2 className="text-2xl font-semibold text-white mb-4">Technology Stack</h2>
						<div className="flex flex-wrap gap-3">
							{[
								'React',
								'Node.js',
								'Python',
								'FastAPI',
								'MySQL',
								'Socket.io',
								'Leaflet',
								'TensorFlow'
							].map((tech) => (
								<span
									key={tech}
									className="px-4 py-2 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium"
								>
									{tech}
								</span>
							))}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default About;
