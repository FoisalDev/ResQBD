import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { prisma } from '../app.js';
import { authenticate } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = 'uploads/avatars';
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif|webp/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);
		if (extname && mimetype) {
			return cb(null, true);
		}
		cb(new Error('Only image files are allowed!'));
	}
});

router.post(
	'/register',
	[
		body('email').isEmail().normalizeEmail(),
		body('password').isLength({ min: 6 }),
		body('name').trim().notEmpty()
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { name, email, phone, password, role } = req.body;

			const existingUser = await prisma.user.findFirst({
				where: { OR: [{ email }, { phone: phone || undefined }] }
			});

			if (existingUser) {
				return res.status(400).json({ message: 'Email or phone already exists' });
			}

			const passwordHash = await bcrypt.hash(password, 12);

			const user = await prisma.user.create({
				data: {
					name,
					email,
					phone,
					passwordHash,
					role: role || 'citizen'
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					languagePref: true
				}
			});

			if (role === 'volunteer') {
				await prisma.volunteer.create({
					data: { userId: user.id }
				});
			}

			const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN || '24h'
			});

			res.status(201).json({
				user: {
					...user,
					avatarUrl: null
				},
				token
			});
		} catch (error) {
			console.error('Register error:', error);
			res.status(500).json({ message: 'Registration failed' });
		}
	}
);

router.post(
	'/login',
	[body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { email, password } = req.body;

			const user = await prisma.user.findUnique({
				where: { email }
			});

			if (!user) {
				return res.status(401).json({ message: 'Invalid credentials' });
			}

			const isValid = await bcrypt.compare(password, user.passwordHash);
			if (!isValid) {
				return res.status(401).json({ message: 'Invalid credentials' });
			}

			const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN || '24h'
			});

			res.json({
				token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					avatarUrl: user.avatarUrl,
					languagePref: user.languagePref
				}
			});
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).json({ message: 'Login failed' });
		}
	}
);

router.get('/me', authenticate, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				avatarUrl: true,
				languagePref: true,
				latitude: true,
				longitude: true,
				createdAt: true
			}
		});

		if (user.role === 'volunteer') {
			const volunteer = await prisma.volunteer.findUnique({
				where: { userId: user.id }
			});
			user.volunteer = volunteer;
		}

		res.json(user);
	} catch (error) {
		console.error('Get me error:', error);
		res.status(500).json({ message: 'Failed to get user' });
	}
});

router.put(
	'/profile',
	authenticate,
	[
		body('name').optional().trim().notEmpty(),
		body('phone').optional(),
		body('languagePref').optional().isIn(['en', 'bn'])
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { name, phone, languagePref, latitude, longitude } = req.body;

			const user = await prisma.user.update({
				where: { id: req.user.id },
				data: {
					...(name && { name }),
					...(phone && { phone }),
					...(languagePref && { languagePref }),
					...(latitude && { latitude: parseFloat(latitude) }),
					...(longitude && { longitude: parseFloat(longitude) })
				},
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					role: true,
					avatarUrl: true,
					languagePref: true
				}
			});

			res.json(user);
		} catch (error) {
			console.error('Update profile error:', error);
			res.status(500).json({ message: 'Failed to update profile' });
		}
	}
);

router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		const avatarUrl = `/uploads/avatars/${req.file.filename}`;

		const user = await prisma.user.update({
			where: { id: req.user.id },
			data: { avatarUrl },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				avatarUrl: true,
				languagePref: true
			}
		});

		res.json(user);
	} catch (error) {
		console.error('Avatar upload error:', error);
		res.status(500).json({ message: 'Failed to upload avatar' });
	}
});

export default router;
