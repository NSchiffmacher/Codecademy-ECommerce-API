const db = require('../db');

class OrderItem {
    constructor(id, order_id, product_id, quantity) {
        this.id = id;
        this.order_id = order_id;
        this.product_id = product_id;
        this.quantity = quantity;
    }

    static async create(order_id, product_id, quantity) {
        const result = await db.query(`
            INSERT INTO order_item (order_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING id, order_id, product_id, quantity;
        `, [order_id, product_id, quantity]);

        return new OrderItem(result.rows[0].id, result.rows[0].order_id, result.rows[0].product_id, result.rows[0].quantity);
    }

    static async getById(id) {
        try {
            const result = await db.query(`
                SELECT * FROM order_item
                WHERE id = $1;
            `, [id]);
            return new OrderItem(result.rows[0].id, result.rows[0].order_id, result.rows[0].product_id, result.rows[0].quantity);
        } catch (e) {
            return null;
        }
    }

    static async getByOrderId(order_id) {
        const result = await db.query(`
            SELECT * FROM order_item
            WHERE order_id = $1;
        `, [order_id]);
        return result.rows.map(row => new OrderItem(row.id, row.order_id, row.product_id, row.quantity));
    }

    static async getByOrderIdAndProductId(order_id, product_id) {
        const result = await db.query(`
            SELECT * FROM order_item
            WHERE order_id = $1 AND product_id = $2;
        `, [order_id, product_id]);
        if (result.rows.length > 0) {
            return new OrderItem(result.rows[0].id, result.rows[0].order_id, result.rows[0].product_id, result.rows[0].quantity);
        } else {
            return null;
        }
    }

    async removeQuantityFromOrder(quantity) {
        this.quantity = this.quantity - quantity;
        if (this.quantity <= 0) {
            await this.delete();
            return false;
        } else {
            const result = await db.query(`
                UPDATE order_item
                SET quantity = $1
                WHERE id = $2;
            `, [this.quantity, this.id]);
            return true;
        }
    }

    async save(){
        await db.query(`
            UPDATE order_item
            SET quantity = $1, product_id = $2, order_id = $3
            WHERE id = $4;
        `, [this.quantity, this.product_id, this.order_id, this.id]);
        return true;
    }

    async delete(){
        await db.query(`
            DELETE FROM order_item
            WHERE id = $1;
        `, [this.id]);
        return true;
    }
}

module.exports = OrderItem;