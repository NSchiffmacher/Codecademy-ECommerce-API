const db = require('../db');

class Product {
    constructor(id, name, price, description, image_url = '', remaining_in_stock = 0) {
        this.id = id;
        this.name = name;
        this.price = parseFloat(price);
        this.description = description;
        this.image_url = image_url;
        this.remaining_in_stock = Number(remaining_in_stock);
    }

    static async create(name, price, description, image_url = '', remaining_in_stock = 0) {
        const id = ((await db.query('SELECT MAX(id) FROM "product"')).rows[0].max || 0) + 1;

        const result = await db.query(`
            INSERT INTO product (id, name, price, description, image_url, remaining_in_stock)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, price, description, remaining_in_stock
        `, [id, name, price, description, image_url, remaining_in_stock]);

        return new Product(result.rows[0].id, result.rows[0].name, result.rows[0].price, result.rows[0].description, result.rows[0].remaining_in_stock);
    }

    static async getById(id) {
        const result = await db.query(`
            SELECT id, name, price, description, remaining_in_stock, image_url
            FROM product
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return new Product(result.rows[0].id, result.rows[0].name, result.rows[0].price, result.rows[0].description,result.rows[0].image_url ,result.rows[0].remaining_in_stock);
    }

    async delete() {
        try {
            const result = await db.query(`
                DELETE FROM product
                WHERE id = $1
            `, [this.id]);

            return result.rowCount === 1;
        } catch (e) {
            return false;
        }
    }

    isAvailable() {
        return this.remaining_in_stock > 0;
    }

    async addStock(quantity) {
        try {
            const result = await db.query(`
                UPDATE product
                SET remaining_in_stock = remaining_in_stock + $1
                WHERE id = $2
                RETURNING remaining_in_stock
            `, [quantity, this.id]);

            this.remaining_in_stock = result.rows[0].remaining_in_stock;
            return this.remaining_in_stock;
        } catch (e) {
            return -1;
        }
    }

    async removeStock(quantity) {
        try {
            const result = await db.query(`
                UPDATE product
                SET remaining_in_stock = remaining_in_stock - $1
                WHERE id = $2
                RETURNING remaining_in_stock
            `, [quantity, this.id]);

            this.remaining_in_stock = result.rows[0].remaining_in_stock;
            return this.remaining_in_stock;
        } catch (e) {
            return -1;
        }
    }
}

module.exports = Product;