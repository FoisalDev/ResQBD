import { useEffect, useRef } from 'react';

const Particles = () => {
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
			const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
			for (let i = 0; i < particleCount; i++) {
				particles.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					radius: Math.random() * 2 + 1,
					speedX: (Math.random() - 0.5) * 0.8,
					speedY: (Math.random() - 0.5) * 0.8,
					opacity: Math.random() * 0.4 + 0.1,
					color: Math.random() > 0.5 ? '59, 130, 246' : '16, 185, 129',
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
				ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * glow})`;
				ctx.fill();

				if (mouse.x !== null) {
					const dx = mouse.x - particle.x;
					const dy = mouse.y - particle.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < 150) {
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(mouse.x, mouse.y);
						ctx.strokeStyle = `rgba(${particle.color}, ${0.15 * (1 - distance / 150)})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}

				for (let j = index + 1; j < Math.min(index + 5, particles.length); j++) {
					const other = particles[j];
					const dx = particle.x - other.x;
					const dy = particle.y - other.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < 80) {
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(other.x, other.y);
						ctx.strokeStyle = `rgba(${particle.color}, ${0.08 * (1 - distance / 80)})`;
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

export default Particles;
