import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export const register = async (req: Request, res: Response) => {
  try {
    let { name, email, password } = req.body;

    // Validation and sanitization
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Normalize email
    email = email.trim().toLowerCase();
    name = name.trim();
    password = password.trim();

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: 'credentials',
    });

    console.log(`New user registered: ${email}`);
    return res.status(201).json({
      message: 'User created successfully',
      success: true,
      userId: user._id,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    // Validation and sanitization
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Trim and normalize email
    email = email.trim().toLowerCase();
    password = password.trim();

    // Find user with case-insensitive email search
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } }).select('+password');
    if (!user) {
      console.log(`Login attempt: User not found for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user has a password (credential-based user)
    if (!user.password) {
      console.log(`Login attempt: User ${email} is registered with OAuth provider, not credentials`);
      return res.status(400).json({ message: 'This account uses a different login method' });
    }

    // Validate password
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`Login attempt: Invalid password for user: ${email}`);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    } catch (bcryptError: any) {
      console.error('Bcrypt comparison error:', bcryptError);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    console.log(`User logged in successfully: ${email}`);
    return res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    let { email, name, googleId, profileImage } = req.body;

    // Validation and sanitization
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Please provide email and googleId' });
    }

    // Normalize email
    email = email.trim().toLowerCase();
    name = (name || '').trim() || email.split('@')[0];

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Find or create Google user (case-insensitive search)
    let user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });

    if (!user) {
      // Create new Google user
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        profileImage: profileImage || '',
        // Password is not set for Google users (optional field)
      });
      console.log(`New Google user created: ${email}`);
    } else if (user.authProvider === 'credentials') {
      // User exists as credentials user, update to Google auth
      console.log(`User ${email} linked with Google OAuth`);
      user.authProvider = 'google';
      if (profileImage) {
        user.profileImage = profileImage;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    console.log(`Google user logged in: ${email}`);
    return res.status(200).json({
      message: 'Google login successful',
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      message: 'Logout successful',
      success: true,
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};
