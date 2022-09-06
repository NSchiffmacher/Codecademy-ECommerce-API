require('dotenv').config({path: __dirname + '/.env'})

const db = require('./db');
const fs = require('fs');

const main = async () => {
    console.log('Creating all tables...');
    
    // Test creation
    try {
        process.stdout.write('   * Creating table "test"... ');
        await db.query(`    
            CREATE TABLE test (
                id integer PRIMARY KEY,
                name text NOT NULL
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creating of table "test" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
}

main();