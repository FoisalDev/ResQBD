import { motion } from 'framer-motion';

const DEFAULT_DURATION = 0.4;
const FAST_DURATION = 0.2;
const SCALE_DURATION = 0.3;

const directions = {
	left: { x: -50 },
	right: { x: 50 },
	up: { y: -50 },
	down: { y: 50 },
};

export const AnimatedCard = ({ children, className = '', delay = 0 }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: DEFAULT_DURATION }}
			whileHover={{ y: -5, transition: { duration: FAST_DURATION } }}
			className={`glass-card rounded-xl ${className}`.trim()}
		>
			{children}
		</motion.div>
	);
};

export const FadeIn = ({ children, delay = 0, className = '' }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: DEFAULT_DURATION }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const SlideIn = ({ children, direction = 'left', delay = 0, className = '' }) => {
	const selectedDirection = directions[direction] || directions.left;

	return (
		<motion.div
			initial={{ opacity: 0, ...selectedDirection }}
			animate={{ opacity: 1, x: 0, y: 0 }}
			transition={{ delay, duration: DEFAULT_DURATION }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const ScaleIn = ({ children, delay = 0, className = '' }) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay, duration: SCALE_DURATION }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const StaggerContainer = ({ children, className = '', staggerDelay = 0.1 }) => {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: staggerDelay,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const StaggerItem = ({ children, className = '' }) => {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: DEFAULT_DURATION },
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export const PulseButton = ({ children, onClick, className = '', disabled = false }) => {
	return (
		<motion.button
			onClick={onClick}
			disabled={disabled}
			whileHover={{ scale: disabled ? 1 : 1.05 }}
			whileTap={{ scale: disabled ? 1 : 0.95 }}
			className={className}
		>
			{children}
		</motion.button>
	);
};

export default {
	AnimatedCard,
	FadeIn,
	SlideIn,
	ScaleIn,
	StaggerContainer,
	StaggerItem,
	PulseButton,
};