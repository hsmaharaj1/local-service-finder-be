const db = require('../db');
const { calculateDistance } = require('../utils/haversine');

exports.searchProviders = async (req, res) => {
    const { search, location } = req.body;
    const { latitude, longitude } = location;

    try {
        const result = await db.query(
            `SELECT sp.id, sp.name, sp.email, pd.location, pd.latitude, pd.longitude, pd.category
             FROM service_providers sp
             JOIN provider_details pd ON sp.id = pd.provider_id
             WHERE sp.name ILIKE $1 OR pd.category ILIKE $1
             OR SIMILARITY(sp.name, $2) > 0.3 OR SIMILARITY(pd.category, $2) > 0.3`,
            [`%${search}%`, search]
        );

        const servicesWithDistance = result.rows.map(service => {
            const distance = calculateDistance(latitude, longitude, service.latitude, service.longitude);
            return { ...service, distance };
        });

        const relevantServices = servicesWithDistance.filter(service =>
            service.category.toLowerCase().includes(search.toLowerCase())
        );

        const irrelevantServices = servicesWithDistance.filter(service =>
            !service.category.toLowerCase().includes(search.toLowerCase())
        );

        relevantServices.sort((a, b) => a.distance - b.distance);
        irrelevantServices.sort((a, b) => a.distance - b.distance);

        res.json({ success: true, services: [...relevantServices, ...irrelevantServices] });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
};

exports.searchRandom = async (req, res) => {
    try {
        // Query to select up to 6 random providers
        const result = await db.query(
            `SELECT sp.id, sp.name, sp.email, pd.location, pd.latitude, pd.longitude, pd.category
             FROM service_providers sp
             JOIN provider_details pd ON sp.id = pd.provider_id ORDER BY RANDOM() LIMIT 6`
        );

        // Get the providers from the query result
        const providers = result.rows;

        // Respond with the providers found, maintaining the response format
        res.status(200).json({
            success: true,
            providers: providers, // List of providers (could be less than 6)
            count: providers.length // Count of returned providers
        });
    } catch (error) {
        console.error('Error fetching random providers:', error);
        res.status(500).json({ success: false, message: 'Error fetching providers' });
    }
};