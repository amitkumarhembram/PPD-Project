const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function fullReset() {
    const dbName = process.env.DB_NAME || 'sres_db';
    const adminClient = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'postgres'
    });

    try {
        await adminClient.connect();
        console.log(`Terminating connections to ${dbName}...`);
        try {
            await adminClient.query(`
                SELECT pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE datname = $1 AND pid <> pg_backend_pid()
            `, [dbName]);
        } catch (e) {
            console.log('No active connections to terminate or error:', e.message);
        }

        console.log(`Dropping database ${dbName}...`);
        await adminClient.query(`DROP DATABASE IF EXISTS ${dbName}`);
        console.log(`Database ${dbName} dropped.`);

        console.log(`Creating database ${dbName}...`);
        await adminClient.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database ${dbName} created.`);
    } catch (e) {
        console.error('Error during DB reset:', e);
        process.exit(1);
    } finally {
        await adminClient.end();
    }

    // Run Schema
    const appClient = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: dbName
    });

    try {
        await appClient.connect();
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('Executing schema...');
        await appClient.query(schema);
        console.log('Schema executed.');

        // Seed Admin (Specific to Amit Project)
        console.log('Seeding superadmin...');
        const email = 'amitkumarhembram38@gmail.com';
        const password = '12345678';
        const name = 'Amit Kumar Hembram';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await appClient.query(`
            INSERT INTO admin (name, email, password, role)
            VALUES ($1, $2, $3, $4)
        `, [name, email, hashedPassword, 'SUPERADMIN']);
        console.log(`Superadmin seeded: ${email} / ${password}`);

        console.log('Full reset and seed complete.');

    } catch (e) {
        console.error('Error during schema/seed:', e);
    } finally {
        await appClient.end();
    }
}

fullReset();
