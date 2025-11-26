require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

pool.query('SELECT NOW()', (err, res) => {
    if(err) console.error(err);
    else console.log('PostgreSQL connected:', res.rows[0]);
    pool.end();
});
