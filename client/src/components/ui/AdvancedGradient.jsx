import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const AdvancedGradient = () => {
	const containerRef = useRef(null);
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 500], [0, 100]);

	return (
		<div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none">
			<motion.div
				className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
				style={{
					background:
						'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
					top: '-30%',
					left: '-20%'
				}}
				animate={{
					x: [0, 100, -50, 0],
					y: [0, 50, -30, 0],
					scale: [1, 1.15, 1.1, 1]
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>

			<motion.div
				className="absolute w-[700px] h-[700px] rounded-full blur-[130px]"
				style={{
					background:
						'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.15) 40%, transparent 70%)',
					top: '10%',
					right: '-15%'
				}}
				animate={{
					x: [0, -80, 40, 0],
					y: [0, -60, 30, 0],
					scale: [1.1, 1, 1.05, 1.1]
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>

			<motion.div
				className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
				style={{
					background:
						'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
					bottom: '5%',
					left: '30%'
				}}
				animate={{
					x: [0, 60, -40, 0],
					y: [0, -40, 20, 0],
					scale: [1, 1.2, 0.95, 1]
				}}
				transition={{
					duration: 22,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>

			<motion.div
				className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
				style={{
					background:
						'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(239, 68, 68, 0.1) 40%, transparent 70%)',
					bottom: '20%',
					right: '20%'
				}}
				animate={{
					x: [0, -50, 30, 0],
					y: [0, 30, -20, 0],
					scale: [1.05, 1, 1.1, 1.05]
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>

			<motion.div
				className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
				style={{
					background:
						'radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, rgba(20, 184, 166, 0.1) 40%, transparent 70%)',
					top: '40%',
					left: '40%'
				}}
				animate={{
					x: [0, 40, -60, 0],
					y: [0, 60, -40, 0],
					rotate: [0, 15, -15, 0]
				}}
				transition={{
					duration: 28,
					repeat: Infinity,
					ease: 'easeInOut'
				}}
			/>

			<svg className="absolute inset-0 w-full h-full opacity-30">
				<defs>
					<linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
						<stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
						<stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
					</linearGradient>
				</defs>
				<motion.path
					d="M0,300 Q400,100 800,300 T1600,300"
					fill="none"
					stroke="url(#waveGradient)"
					strokeWidth="1"
					animate={{
						d: [
							'M0,300 Q400,100 800,300 T1600,300',
							'M0,320 Q400,120 800,280 T1600,320',
							'M0,280 Q400,80 800,320 T1600,280',
							'M0,300 Q400,100 800,300 T1600,300'
						]
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				/>
				<motion.path
					d="M0,400 Q400,200 800,400 T1600,400"
					fill="none"
					stroke="url(#waveGradient)"
					strokeWidth="0.5"
					animate={{
						d: [
							'M0,400 Q400,200 800,400 T1600,400',
							'M0,420 Q400,220 800,380 T1600,420',
							'M0,380 Q400,180 800,420 T1600,380',
							'M0,400 Q400,200 800,400 T1600,400'
						]
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				/>
			</svg>

			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900" />
			<div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30" />
		</div>
	);
};

export default AdvancedGradient;
