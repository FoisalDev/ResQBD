import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		const savedUser = localStorage.getItem('user');
		if (token && savedUser) {
			setUser(JSON.parse(savedUser));
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		const response = await api.post('/auth/login', { email, password });
		const { token, user } = response.data;
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(user));
		setUser(user);
		return user;
	};

	const register = async (userData) => {
		const response = await api.post('/auth/register', userData);
		const { token, user } = response.data;
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(user));
		setUser(user);
		return user;
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setUser(null);
	};

	const updateUser = (updatedUser) => {
		setUser(updatedUser);
		localStorage.setItem('user', JSON.stringify(updatedUser));
	};

	const updateProfile = async (data) => {
		const response = await api.put('/auth/profile', data);
		const updatedUser = response.data;
		setUser(updatedUser);
		localStorage.setItem('user', JSON.stringify(updatedUser));
		return updatedUser;
	};

	return (
		<AuthContext.Provider
			value={{ user, loading, login, register, logout, updateUser, updateProfile }}
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
