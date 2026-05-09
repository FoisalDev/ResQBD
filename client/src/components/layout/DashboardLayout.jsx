import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Particles from '../ui/Particles';
import GradientOrbs from '../ui/GradientOrbs';

const DashboardLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const getPageTitle = () => {
		const path = location.pathname;
		if (path.includes('dashboard')) return 'Dashboard';
		if (path.includes('sos') && !path.includes('history')) return 'Emergency SOS';
		if (path.includes('sos/history')) return 'SOS History';
		if (path.includes('report')) return 'Submit Report';
		if (path.includes('relief')) return 'Request Relief';
		if (path.includes('shelters')) return 'Shelter Finder';
		if (path.includes('notifications')) return 'Notifications';
		if (path.includes('profile')) return 'Profile';
		if (path.includes('tasks')) return 'Assigned Tasks';
		if (path.includes('availability')) return 'Availability';
		if (path.includes('deliveries')) return 'Relief Deliveries';
		if (path.includes('users')) return 'Manage Users';
		if (path.includes('volunteers')) return 'Manage Volunteers';
		if (path.includes('reports')) return 'Disaster Reports';
		if (path.includes('alerts')) return 'Alerts';
		if (path.includes('weather')) return 'Weather & Risk';
		if (path.includes('analytics')) return 'Analytics';
		return 'Dashboard';
	};

	return (
		<div className="min-h-screen bg-slate-900 flex relative overflow-hidden">
			<Particles />
			<GradientOrbs />
			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			<div className="flex-1 flex flex-col relative z-10">
				<Navbar onMenuClick={() => setSidebarOpen(true)} showMenu />
				<main className="flex-1 p-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
						<p className="text-slate-400">
							{user?.role === 'citizen' && 'Citizen Dashboard'}
							{user?.role === 'volunteer' && 'Volunteer Dashboard'}
							{user?.role === 'admin' && 'Admin Dashboard'}
						</p>
					</div>
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
