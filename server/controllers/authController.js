import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import User from '../models/User.js';

class AuthController {
    
    // @desc    Register a new user
    // @route   POST /api/auth/signup
    async signup(req, res) {
        try {
            const { name, email, password, phone } = req.body;
            
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                role: 'user'
            });

            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            
            user.refreshToken = refreshToken;
            await user.save();

            res.status(201).json({ 
                success: true, 
                message: 'User registered successfully',
                data: {
                    accessToken,
                    refreshToken,
                    user: this.formatUser(user)
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Login user
    // @route   POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            
            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid credentials' });
            }

            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            user.refreshToken = refreshToken;
            await user.save();

            res.status(200).json({ 
                success: true, 
                message: 'Login successful',
                data: {
                    accessToken,
                    refreshToken,
                    user: this.formatUser(user)
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Refresh Token
    // @route   POST /api/auth/refresh
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(401).json({ success: false, message: 'Refresh token required' });
            }

            const user = await User.findOne({ refreshToken });
            if (!user) {
                return res.status(403).json({ success: false, message: 'Invalid refresh token' });
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
                if (err) return res.status(403).json({ success: false, message: 'Expired refresh token' });

                const accessToken = this.generateAccessToken(user);
                res.json({ success: true, data: { accessToken } });
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Logout user
    // @route   POST /api/auth/logout
    async logout(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
            res.json({ success: true, message: 'Logged out successfully' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get current user
    // @route   GET /api/auth/me
    async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.json({ success: true, data: this.formatUser(user) });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Update user profile
    // @route   PUT /api/auth/profile
    async updateProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            res.json({ 
                success: true, 
                message: 'Profile updated successfully',
                data: this.formatUser(updatedUser) 
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Helpers
    generateAccessToken(user) {
        return jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            { id: user._id }, 
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: '7d' }
        );
    }

    formatUser(user) {
        const obj = user.toObject ? user.toObject() : { ...user._doc };
        
        obj.createdAtFormatted = moment(obj.createdAt).format('MMMM Do YYYY, h:mm a');
        
        if (obj.updatedAt && new Date(obj.createdAt).getTime() !== new Date(obj.updatedAt).getTime()) {
            obj.updatedAtFormatted = moment(obj.updatedAt).format('MMMM Do YYYY, h:mm a');
        }

        delete obj.password;
        delete obj.refreshToken;
        delete obj.createdAt;
        delete obj.updatedAt;
        delete obj.__v;
        
        return obj;
    }
}

const authController = new AuthController();

// Bind methods to the controller instance to preserve 'this'
export const signup = authController.signup.bind(authController);
export const login = authController.login.bind(authController);
export const logout = authController.logout.bind(authController);
export const refreshToken = authController.refreshToken.bind(authController);
export const getMe = authController.getMe.bind(authController);
export const updateProfile = authController.updateProfile.bind(authController);

export default authController;
