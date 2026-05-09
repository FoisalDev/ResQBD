import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/public/Landing';
import About from './pages/public/About';
import RiskOverview from './pages/public/RiskOverview';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenSOS from './pages/citizen/SOS';
import CitizenSOSHistory from './pages/citizen/SOSHistory';
import CitizenReport from './pages/citizen/Report';
import CitizenRelief from './pages/citizen/Relief';
import CitizenShelters from './pages/citizen/Shelters';
import CitizenNotifications from './pages/citizen/Notifications';
import CitizenProfile from './pages/citizen/Profile';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import VolunteerTasks from './pages/volunteer/Tasks';
import VolunteerAvailability from './pages/volunteer/Availability';
import VolunteerDeliveries from './pages/volunteer/Deliveries';
import VolunteerNotifications from './pages/volunteer/Notifications';
import VolunteerProfile from './pages/volunteer/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVolunteers from './pages/admin/Volunteers';
import AdminShelters from './pages/admin/Shelters';
import AdminSOS from './pages/admin/SOS';
import AdminReports from './pages/admin/Reports';
import AdminRelief from './pages/admin/Relief';
import AdminAlerts from './pages/admin/Alerts';
import AdminWeather from './pages/admin/Weather';
import AdminAnalytics from './pages/admin/Analytics';
import AdminNotifications from './pages/admin/Notifications';

const ProtectedRoute = ({ children, roles }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (roles && !roles.includes(user.role)) {
		return <Navigate to={`/${user.role}/dashboard`} replace />;
	}

	return children;
};

function App() {
	const { user } = useAuth();

	return (
		<Routes>
			{/* Public Routes */}
			<Route element={<PublicLayout />}>
				<Route path="/" element={<Landing />} />
				<Route path="/about" element={<About />} />
				<Route path="/risk" element={<RiskOverview />} />
				<Route
					path="/login"
					element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />}
				/>
				<Route
					path="/register"
					element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />}
				/>
			</Route>

			{/* Citizen Routes */}
			<Route
				path="/citizen"
				element={
					<ProtectedRoute roles={['citizen']}>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				<Route path="dashboard" element={<CitizenDashboard />} />
				<Route path="sos" element={<CitizenSOS />} />
				<Route path="sos/history" element={<CitizenSOSHistory />} />
				<Route path="report" element={<CitizenReport />} />
				<Route path="relief" element={<CitizenRelief />} />
				<Route path="shelters" element={<CitizenShelters />} />
				<Route path="notifications" element={<CitizenNotifications />} />
				<Route path="profile" element={<CitizenProfile />} />
			</Route>

			{/* Volunteer Routes */}
			<Route
				path="/volunteer"
				element={
					<ProtectedRoute roles={['volunteer']}>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				<Route path="dashboard" element={<VolunteerDashboard />} />
				<Route path="tasks" element={<VolunteerTasks />} />
				<Route path="availability" element={<VolunteerAvailability />} />
				<Route path="deliveries" element={<VolunteerDeliveries />} />
				<Route path="notifications" element={<VolunteerNotifications />} />
				<Route path="profile" element={<VolunteerProfile />} />
			</Route>

			{/* Admin Routes */}
			<Route
				path="/admin"
				element={
					<ProtectedRoute roles={['admin']}>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				<Route path="dashboard" element={<AdminDashboard />} />
				<Route path="users" element={<AdminUsers />} />
				<Route path="volunteers" element={<AdminVolunteers />} />
				<Route path="shelters" element={<AdminShelters />} />
				<Route path="sos" element={<AdminSOS />} />
				<Route path="reports" element={<AdminReports />} />
				<Route path="relief" element={<AdminRelief />} />
				<Route path="alerts" element={<AdminAlerts />} />
				<Route path="weather" element={<AdminWeather />} />
				<Route path="analytics" element={<AdminAnalytics />} />
				<Route path="notifications" element={<AdminNotifications />} />
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
