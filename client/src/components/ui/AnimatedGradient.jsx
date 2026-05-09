import { motion } from 'framer-motion';

const AnimatedGradient = () => {
	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none">
			<motion.div
				className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
				style={{
					background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
				}}
				animate={{
					x: ['-10%', '10%', '-10%'],
					y: ['-10%', '10%', '-10%'],
					scale: [1, 1.2, 1]
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>
			<motion.div
				className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
				style={{
					background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
					top: '20%',
					right: '-10%'
				}}
				animate={{
					x: ['10%', '-10%', '10%'],
					y: ['10%', '-10%', '10%'],
					scale: [1.1, 1, 1.1]
				}}
				transition={{
					duration: 12,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>
			<motion.div
				className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
				style={{
					background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
					bottom: '10%',
					left: '30%'
				}}
				animate={{
					x: ['-15%', '15%', '-15%'],
					scale: [1, 1.15, 1]
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>
			<motion.div
				className="absolute w-[350px] h-[350px] rounded-full blur-[80px]"
				style={{
					background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
					top: '40%',
					left: '10%'
				}}
				animate={{
					y: ['5%', '-5%', '5%'],
					scale: [1.05, 1, 1.05]
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>
		</div>
	);
};

export default AnimatedGradient;
