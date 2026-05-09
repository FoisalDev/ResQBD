import { useEffect, useRef } from 'react';

const HeroParticles = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		let animationFrame;
		let particles = [];
		let mouse = { x: null, y: null };

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		const createParticles = () => {
			particles = [];
			const particleCount = Math.floor((canvas.width * canvas.height) / 8000);

			for (let i = 0; i < particleCount; i++) {
				const radius = Math.random() * 2.5 + 0.5;
				particles.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					radius: radius,
					baseRadius: radius,
					speedX: (Math.random() - 0.5) * 1.2,
					speedY: (Math.random() - 0.5) * 1.2,
					opacity: Math.random() * 0.5 + 0.15,
					color: ['59, 130, 246', '16, 185, 129', '139, 92, 246', '239, 68, 68', '20, 184, 166'][
						Math.floor(Math.random() * 5)
					],
					phase: Math.random() * Math.PI * 2,
					pulseSpeed: Math.random() * 0.003 + 0.001
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

				const pulse = Math.sin(time * particle.pulseSpeed + particle.phase);
				const currentRadius = particle.baseRadius * (1 + pulse * 0.4);
				const currentOpacity = particle.opacity * (0.7 + pulse * 0.3);

				const gradient = ctx.createRadialGradient(
					particle.x,
					particle.y,
					0,
					particle.x,
					particle.y,
					currentRadius * 3
				);
				gradient.addColorStop(0, `rgba(${particle.color}, ${currentOpacity})`);
				gradient.addColorStop(1, `rgba(${particle.color}, 0)`);

				ctx.beginPath();
				ctx.arc(particle.x, particle.y, currentRadius * 3, 0, Math.PI * 2);
				ctx.fillStyle = gradient;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(particle.x, particle.y, currentRadius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${particle.color}, ${currentOpacity})`;
				ctx.fill();

				if (mouse.x !== null) {
					const dx = mouse.x - particle.x;
					const dy = mouse.y - particle.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < 200) {
						const force = (1 - distance / 200) * 2;
						particle.x -= dx * force * 0.01;
						particle.y -= dy * force * 0.01;

						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(mouse.x, mouse.y);
						ctx.strokeStyle = `rgba(${particle.color}, ${0.3 * (1 - distance / 200)})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}

				for (let j = index + 1; j < Math.min(index + 8, particles.length); j++) {
					const other = particles[j];
					const dx = particle.x - other.x;
					const dy = particle.y - other.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < 100) {
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(other.x, other.y);
						ctx.strokeStyle = `rgba(${particle.color}, ${0.12 * (1 - distance / 100)})`;
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
		animate(0);

		window.addEventListener('resize', () => {
			resizeCanvas();
			createParticles();
		});
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);

	return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default HeroParticles;
