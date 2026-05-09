import { motion } from 'framer-motion';

const GradientOrbs = () => {
	const orbs = [
		{
			color: 'from-blue-500/30 to-blue-600/10',
			size: 'w-[600px] h-[600px]',
			position: 'top-[-20%] left-[-10%]',
			duration: 20
		},
		{
			color: 'from-emerald-500/20 to-emerald-600/10',
			size: 'w-[500px] h-[500px]',
			position: 'top-[20%] right-[-10%]',
			duration: 18
		},
		{
			color: 'from-purple-500/20 to-purple-600/10',
			size: 'w-[400px] h-[400px]',
			position: 'bottom-[10%] left-[20%]',
			duration: 22
		},
		{
			color: 'from-red-500/15 to-red-600/10',
			size: 'w-[350px] h-[350px]',
			position: 'bottom-[20%] right-[10%]',
			duration: 16
		},
		{
			color: 'from-cyan-500/20 to-cyan-600/10',
			size: 'w-[450px] h-[450px]',
			position: 'top-[50%] left-[50%]',
			duration: 25
		}
	];

	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none">
			{orbs.map((orb, index) => (
				<motion.div
					key={index}
					className={`absolute rounded-full blur-[100px] ${orb.size} ${orb.position}`}
					style={{
						background: `radial-gradient(circle, var(--tw-gradient-from)) 0%, var(--tw-gradient-to) 70%`
					}}
					animate={{
						x: [0, 30, -30, 0],
						y: [0, -20, 20, 0],
						scale: [1, 1.1, 0.95, 1],
						rotate: [0, 10, -10, 0]
					}}
					transition={{
						duration: orb.duration,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				>
					<div className={`w-full h-full rounded-full bg-gradient-to-br ${orb.color}`} />
				</motion.div>
			))}

			<div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/50" />
		</div>
	);
};

export default GradientOrbs;
