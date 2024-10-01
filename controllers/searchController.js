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
