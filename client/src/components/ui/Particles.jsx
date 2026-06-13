import { useEffect, useRef } from 'react';

const PARTICLE_AREA = 12000;
const MOUSE_DISTANCE = 150;
const PARTICLE_DISTANCE = 80;
const MAX_NEARBY_PARTICLES = 5;

const PARTICLE_COLORS = ['59, 130, 246', '16, 185, 129'];

const Particles = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) return;

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		let animationFrame;
		let particles = [];
		let mouse = { x: null, y: null };

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		const createParticles = () => {
			particles = [];
			const particleCount = Math.floor((canvas.width * canvas.height) / PARTICLE_AREA);

			for (let i = 0; i < particleCount; i++) {
				particles.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					radius: Math.random() * 2 + 1,
					speedX: (Math.random() - 0.5) * 0.8,
					speedY: (Math.random() - 0.5) * 0.8,
					opacity: Math.random() * 0.4 + 0.1,
					color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
					phase: Math.random() * Math.PI * 2,
				});
			}
		};

		const drawParticles = (time) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			particles.forEach((particle, index) => {
				particle.x += particle.speedX;
				particle.y += particle.speedY;

				if (particle.x < 0) particle.x = canvas.width;
				if (particle.x > canvas.width) particle.x = 0;
				if (particle.y < 0) particle.y = canvas.height;
				if (particle.y > canvas.height) particle.y = 0;

				const glow = Math.sin(time * 0.001 + particle.phase) * 0.3 + 0.7;

				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.radius * glow, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * glow})`;
				ctx.fill();

				if (mouse.x !== null && mouse.y !== null) {
					const distance = Math.hypot(mouse.x - particle.x, mouse.y - particle.y);

					if (distance < MOUSE_DISTANCE) {
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(mouse.x, mouse.y);
						ctx.strokeStyle = `rgba(${particle.color}, ${
							0.15 * (1 - distance / MOUSE_DISTANCE)
						})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}

				for (
					let j = index + 1;
					j < Math.min(index + MAX_NEARBY_PARTICLES, particles.length);
					j++
				) {
					const other = particles[j];
					const distance = Math.hypot(particle.x - other.x, particle.y - other.y);

					if (distance < PARTICLE_DISTANCE) {
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(other.x, other.y);
						ctx.strokeStyle = `rgba(${particle.color}, ${
							0.08 * (1 - distance / PARTICLE_DISTANCE)
						})`;
						ctx.lineWidth = 0.3;
						ctx.stroke();
					}
				}
			});
		};

		const animate = (time) => {
			drawParticles(time);
			animationFrame = requestAnimationFrame(animate);
		};

		const handleResize = () => {
			resizeCanvas();
			createParticles();
		};

		const handleMouseMove = (e) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};

		const handleMouseLeave = () => {
			mouse.x = null;
			mouse.y = null;
		};

		resizeCanvas();
		createParticles();
		animationFrame = requestAnimationFrame(animate);

		window.addEventListener('resize', handleResize);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 z-0 pointer-events-none"
			aria-hidden="true"
		/>
	);
};

export default Particles;