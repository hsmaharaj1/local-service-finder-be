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
        // const isMatch = await bcrypt.compare(password, provider.password);
        // Direct comparison for testing purposes
        if (provider && password === provider.password) {
            const token = provider.id
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

            // Omit the password from provider details
            const { password: _, ...providerDetails } = provider;
            res.status(200).json({ success: true, provider: providerDetails, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
};

// Define the /hasdetails endpoint
exports.hasDetails = async (req, res) => {
    const { provider_id } = req.query; // or req.body if it's a POST request
  
    if (!provider_id) {
      return res.status(400).json({ success: false, message: "provider_id is required" });
    }
  
    try {
      // Query to check if provider_id exists in provider_details
      const result = await db.query(
        'SELECT EXISTS (SELECT 1 FROM provider_details WHERE provider_id = $1)', 
        [provider_id]
      );
  
      // The query returns an object with the key "exists" which will be true or false
      const exists = result.rows[0].exists;
  
      res.json({ success: true, hasDetails: exists });
    } catch (err) {
      console.error('Error querying provider_details:', err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
