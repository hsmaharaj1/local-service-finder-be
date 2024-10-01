const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your actual secret key

// Login a provider
exports.loginProvider = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM service_providers WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const provider = result.rows[0];
        const isMatch = await bcrypt.compare(password, provider.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userid: provider.id }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        const { password: _, ...providerDetails } = provider;
        res.status(200).json({ success: true, provider: providerDetails });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
};
