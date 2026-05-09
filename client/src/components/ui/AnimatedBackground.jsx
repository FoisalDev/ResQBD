import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		let animationFrame;
		let particles = [];

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		const createParticles = () => {
			particles = [];
			const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
			for (let i = 0; i < particleCount; i++) {
				particles.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					radius: Math.random() * 2 + 0.5,
					speedX: (Math.random() - 0.5) * 0.5,
					speedY: (Math.random() - 0.5) * 0.5,
					opacity: Math.random() * 0.5 + 0.1,
					phase: Math.random() * Math.PI * 2
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
				ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity * glow})`;
				ctx.fill();

				if (index > 0) {
					const prev = particles[index - 1];
					const distance = Math.sqrt(
						Math.pow(particle.x - prev.x, 2) + Math.pow(particle.y - prev.y, 2)
					);
					if (distance < 100) {
						ctx.beginPath();
						ctx.moveTo(prev.x, prev.y);
						ctx.lineTo(particle.x, particle.y);
						ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
						ctx.stroke();
					}
				}
			});
		};

		const animate = (time) => {
			drawParticles(time);
			animationFrame = requestAnimationFrame(animate);
		};

		resizeCanvas();
		createParticles();
		animate(0);

		window.addEventListener('resize', () => {
			resizeCanvas();
			createParticles();
		});

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default AnimatedBackground;
