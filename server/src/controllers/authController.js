const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.register = async (req, res) => {
  try {
    console.log('📝 Registration request received:', { ...req.body, password: '***' });
    
    const { name, email, password, startupName } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    console.log('✅ Creating new user...');
    const user = await User.create({
      name,
      email,
      password,
      startupName,
      isVerified: false,
      verificationStatus: 'pending'
    });

    console.log('✅ User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        startupName: user.startupName
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        startupName: user.startupName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};