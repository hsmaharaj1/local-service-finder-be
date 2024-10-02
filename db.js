const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()'); // Get the current timestamp
        console.log('Connection successful:', res.rows[0]);
    } catch (error) {
        console.error('Connection error:', error);
    }
};

// Create the schema
const createSchema = async () => {
    try {
        await testConnection(); // Ensure the connection is established

        await pool.query(`
            -- Create service_providers table
            CREATE TABLE IF NOT EXISTS service_providers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(100)
            );

            -- Create provider_details table
            CREATE TABLE IF NOT EXISTS provider_details (
                id SERIAL PRIMARY KEY,
                provider_id INT REFERENCES service_providers(id) ON DELETE CASCADE,
                location VARCHAR(255),
                latitude DECIMAL(9, 6),
                longitude DECIMAL(9, 6),
                rating DECIMAL(2, 1) CHECK (rating >= 1 AND rating <= 5), 
                about TEXT,
                category VARCHAR(100),
                CONSTRAINT unique_provider_id UNIQUE (provider_id)
            );

            -- Create booking_logs table
            CREATE TABLE IF NOT EXISTS booking_logs (
                id SERIAL PRIMARY KEY,
                user_name VARCHAR(100),
                phone_number VARCHAR(15), 
                booking_datetime TIMESTAMP,
                provider_id INT REFERENCES service_providers(id) ON DELETE CASCADE,
                is_done BOOLEAN DEFAULT FALSE
            );

            -- Create pg_trgm extension for text search (if not already created)
            CREATE EXTENSION IF NOT EXISTS pg_trgm;
        `);

        console.log("Schema created successfully.");
    } catch (error) {
        console.error("Error creating schema:", error);
    }
};

// Call the function to create the schema
createSchema();

// Export query function to be used in other parts of the app
module.exports = {
    query: (text, params) => pool.query(text, params),
};
