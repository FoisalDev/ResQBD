import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Particles from '../ui/Particles';
import GradientOrbs from '../ui/GradientOrbs';

const PublicLayout = () => {
	return (
		<div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col">
			<Particles />
			<GradientOrbs />
			<div className="relative z-10 flex-1 flex flex-col">
				<Navbar />
				<main className="flex-1">
					<Outlet />
				</main>
				<footer className="bg-slate-900/90 backdrop-blur-sm py-12 mt-auto border-t border-slate-800">
					<div className="container mx-auto px-4 text-center text-slate-400">
						<p className="text-lg">
							&copy; 2026 ResQBD - AI Disaster Response Platform for Bangladesh
						</p>
					</div>
				</footer>
			</div>
		</div>
	);
};

export default PublicLayout;
