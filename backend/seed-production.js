/**
 * seed-production.js
 * Run once against the production DB to create schema + seed admin.
 * Usage: DATABASE_URL=<your-db-url> node seed-production.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log('Connected to DB.');

        // Run schema
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('Running schema...');
        await client.query(schema);
        console.log('Schema done.');

        // Seed superadmin
        const email = 'amitkumarhembram38@gmail.com';
        const password = '12345678';
        const name = 'Amit Kumar Hembram';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existing = await client.query('SELECT id FROM admin WHERE email = $1', [email]);
        if (existing.rowCount === 0) {
            await client.query(
                'INSERT INTO admin (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, email, hashedPassword, 'SUPERADMIN']
            );
            console.log(`Superadmin seeded: ${email} / ${password}`);
        } else {
            console.log('Superadmin already exists.');
        }

        console.log('All done.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

seed();
