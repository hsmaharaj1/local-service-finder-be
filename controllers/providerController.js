const db = require('../db');

// Add a new provider
exports.addProvider = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    try {
        // Check if the provider already exists
        const existingProvider = await db.query('SELECT * FROM service_providers WHERE email = $1', [email]);
        if (existingProvider.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Provider with this email already exists' });
        }

        // Insert the new provider into the database
        const result = await db.query(
            'INSERT INTO service_providers (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );

        res.status(201).json({
            success: true,
            provider: result.rows[0], // Return the created provider details
        });
    } catch (error) {
        console.error('Error adding provider:', error);
        res.status(500).json({ success: false, message: 'Error adding provider' });
    }
};

// Add provider details
exports.addProviderDetails = async (req, res) => {
    const { location, latitude, longitude, about, category, user_id } = req.body;

    // Validate required fields
    if (!user_id || !location || !latitude || !longitude || !about || !category) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const result = await db.query(
            `INSERT INTO provider_details (provider_id, location, latitude, longitude, rating, about, category)
             VALUES ($1, $2, $3, $4, 4.3, $5, $6)
             ON CONFLICT (provider_id) 
             DO UPDATE SET location = EXCLUDED.location, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, 
                           about = EXCLUDED.about, category = EXCLUDED.category 
             RETURNING *`,
            [user_id, location, latitude, longitude, about, category]
        );

        return res.status(201).json({ success: true, providerDetails: result.rows[0] });
    } catch (error) {
        console.error('Error adding or updating provider details:', error);
        return res.status(500).json({ success: false, message: 'Error adding or updating provider details' });
    }
};


// Fetch provider details
exports.getProviderDetails = async (req, res) => {
    const providerId = req.params.id;

    try {
        const result = await db.query(
            `SELECT sp.id, sp.name, sp.email, pd.location, pd.latitude, pd.longitude, pd.about, pd.category, pd.rating
             FROM service_providers sp
             JOIN provider_details pd ON sp.id = pd.provider_id
             WHERE sp.id = $1`, [providerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        res.json({ success: true, provider: result.rows[0] });
    } catch (error) {
        console.error('Error fetching provider details:', error);
        res.status(500).json({ success: false, message: 'Error fetching provider details' });
    }
};

// Update provider details
exports.updateProviderDetails = async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const { location, latitude, longitude, about, category } = req.body;

    if (!location || !latitude || !longitude || !about || !category) {
        return res.status(400).json({ success: false, message: 'All fields must be provided for update' });
    }

    try {
        const result = await db.query(
            `UPDATE provider_details SET location = $1, latitude = $2, longitude = $3, about = $4, category = $5
             WHERE provider_id = $6 RETURNING *`,
            [location, latitude, longitude, about, category, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Provider details not found' });
        }

        res.status(200).json({ success: true, providerDetails: result.rows[0] });
    } catch (error) {
        console.error('Error updating provider details:', error);
        res.status(500).json({ success: false, message: 'Error updating provider details' });
    }
};
