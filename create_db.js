require('dotenv').config({path: __dirname + '/.env'})

const db = require('./db');
const fs = require('fs');

const main = async () => {
    console.log('Creating all tables...');
    
    // User creation
    try {
        process.stdout.write('   * Creating table "user"... ');
        await db.query(`    
            CREATE TABLE "user" (
                "id" serial PRIMARY KEY,
                "email" varchar(100) UNIQUE,
                "password" varchar(200)
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of table "user" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
    
    // Product creation
    try {
        process.stdout.write('   * Creating table "product"... ');
        await db.query(`    
            CREATE TABLE product (
                id serial PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                image_url VARCHAR(200),
                description TEXT,

                price numeric NOT NULL,
                remaining_in_stock integer DEFAULT 0
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of table "product" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
    
    // Cart item creation
    try {
        process.stdout.write('   * Creating table "cart_item"... ');
        await db.query(`    
            CREATE TABLE cart_item (
                "id" serial PRIMARY KEY,
                "cart_id" integer NOT NULL,
                "product_id" integer NOT NULL,
                "quantity" integer NOT NULL DEFAULT 0
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of table "cart_item" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
    
    // Cart creation
    try {
        process.stdout.write('   * Creating table "cart"... ');
        await db.query(`    
            CREATE TABLE cart (
                "id" serial PRIMARY KEY,
                "user_id" integer NOT NULL
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of table "cart" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
    
    // Order item creation
    try {
        process.stdout.write('   * Creating table "order_item"... ');
        await db.query(`    
            CREATE TABLE order_item (
                "id" serial PRIMARY KEY,
                "order_id" integer NOT NULL,
                "product_id" integer NOT NULL,
                "quantity" integer NOT NULL DEFAULT 0
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of table "order_item" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
    
    // Order creation
    try {
        process.stdout.write('   * Creating table "order"... ');
        await db.query(`    
            CREATE TABLE "order" (
                "id" serial PRIMARY KEY,
                "user_id" integer NOT NULL,
                "created_at" date,
                "status" varchar(100)
            );
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of table "order" failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 
    
    // Foreign keys creation
    try {
        process.stdout.write('   * Creating foreign keys... ');
        await db.query(`    
            ALTER TABLE "cart_item" ADD FOREIGN KEY ("cart_id") REFERENCES "cart" ("id");
            ALTER TABLE "cart_item" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");
            ALTER TABLE "cart" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
            ALTER TABLE "order_item" ADD FOREIGN KEY ("order_id") REFERENCES "order" ("id");
            ALTER TABLE "order_item" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");
            ALTER TABLE "order" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
        `);
        console.log('OK !');
    } catch (e) {
        console.log('\n[ERROR] Creation of the foreign keys failed ! Check "error.log" for more details.');
        fs.appendFile('error.log', e.toString() + '\n', err => {});
    } 

    // Add indexes

    console.log('All tables created !');
}

main();