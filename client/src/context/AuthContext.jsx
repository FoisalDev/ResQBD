import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const clearAuthStorage = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

const saveAuthStorage = (token, user) => {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem(TOKEN_KEY);
		const savedUser = localStorage.getItem(USER_KEY);

		if (token && savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (e) {
				console.error('Failed to parse saved user:', e);
				clearAuthStorage();
			}
		} else {
			clearAuthStorage();
		}

		setLoading(false);
	}, []);

	const login = async (email, password) => {
		const trimmedEmail = email?.trim();

		if (!trimmedEmail || !password) {
			throw new Error('Email and password are required');
		}

		const response = await api.post('/auth/login', {
			email: trimmedEmail,
			password,
		});

		const { token, user } = response.data || {};

		if (!token || !user) {
			throw new Error('Invalid login response from server');
		}

		saveAuthStorage(token, user);
		setUser(user);
		return user;
	};

	const register = async (userData) => {
		const payload = {
			...userData,
			email: userData?.email?.trim(),
		};

		if (!payload.email || !payload.password) {
			throw new Error('Email and password are required');
		}

		const response = await api.post('/auth/register', payload);
		const { token, user } = response.data || {};

		if (!token || !user) {
			throw new Error('Invalid registration response from server');
		}

		saveAuthStorage(token, user);
		setUser(user);
		return user;
	};

	const logout = () => {
		clearAuthStorage();
		setUser(null);
	};

	const updateUser = (updatedUser) => {
		if (!updatedUser) {
			logout();
			return;
		}

		setUser(updatedUser);
		localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
	};

	const updateProfile = async (data) => {
		if (!data) {
			throw new Error('Profile data is required');
		}

		const response = await api.put('/auth/profile', data);
		const updatedUser = response.data?.user || response.data;

		if (!updatedUser) {
			throw new Error('Invalid profile update response from server');
		}

		updateUser(updatedUser);
		return updatedUser;
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				isAuthenticated: Boolean(user),
				login,
				register,
				logout,
				updateUser,
				updateProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};