const db = require('../db');
const bcrypt = require('bcrypt');

class User {
    constructor(id, email, password) {
        this.id = id;
        this.email = email;
        this.password = password;
    }

    static async create(email, password_raw) {
        // Get next id
        const id = ((await db.query('SELECT MAX(id) FROM "user"')).rows[0].max || 0) + 1;
    
        const password = await bcrypt.hash(password_raw, 10);
        const result = await db.query(`
            INSERT INTO "user" (id, email, password)
            VALUES ($1, $2, $3)
            RETURNING id;
        `, [id, email, password]);
        return new User(Number(result.rows[0].id), email, password);
    }

    static async getById(id) {
        try {
            const result = await db.query(`
                SELECT * FROM "user"
                WHERE id = $1;
            `, [id]);
            return new User(Number(result.rows[0].id), result.rows[0].email, result.rows[0].password);
        } catch (e) {
            return null;
        }
    }

    static async getByEmail(email) {
        try {
            const result = await db.query(`
                SELECT * FROM "user"
                WHERE email = $1;
            `, [email]);
            return new User(Number(result.rows[0].id), result.rows[0].email, result.rows[0].password);
        } catch (e) {
            return null;
        }
    }


    async save() {
        const result = await db.query(`
            UPDATE "user"
            SET email = $1, password = $2
            WHERE id = $3
            RETURNING id;
        `, [this.email, this.password, this.id]);
        return Number(result.rows[0].id);
    }

    async changePassword(password_raw) {
        const password = await bcrypt.hash(password_raw, 10);
        this.password = password;
        return await this.save();
    }

    async delete() {
        try {
            await db.query(`
                DELETE FROM "user"
                WHERE id = $1;
            `, [this.id]);
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = User;