import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [connected, setConnected] = useState(false);
	const { user } = useAuth();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;

		const newSocket = io(window.location.origin, {
			auth: { token },
			transports: ['websocket', 'polling']
		});

		newSocket.on('connect', () => {
			setConnected(true);
			if (user) {
				newSocket.emit('join:role', user.role);
				newSocket.emit('join:user', user.id);
			}
		});

		newSocket.on('disconnect', () => {
			setConnected(false);
		});

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, [user]);

	const joinRoom = (room) => {
		if (socket && connected) {
			socket.emit('join:room', room);
		}
	};

	const leaveRoom = (room) => {
		if (socket && connected) {
			socket.emit('leave:room', room);
		}
	};

	const emit = (event, data) => {
		if (socket && connected) {
			socket.emit(event, data);
		}
	};

	const on = (event, callback) => {
		if (socket) {
			socket.on(event, callback);
			return () => socket.off(event, callback);
		}
	};

	return (
		<SocketContext.Provider value={{ socket, connected, joinRoom, leaveRoom, emit, on }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error('useSocket must be used within SocketProvider');
	}
	return context;
};
