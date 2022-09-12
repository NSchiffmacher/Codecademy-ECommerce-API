const db = require('../db');

class CartItem {
    constructor(id, cart_id, product_id, quantity) {
        this.id = id;
        this.cart_id = cart_id;
        this.product_id = product_id;
        this.quantity = quantity;
    }

    static async create(cart_id, product_id, quantity) {
        const result = await db.query(`
            INSERT INTO cart_item (cart_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING id, cart_id, product_id, quantity;
        `, [cart_id, product_id, quantity]);

        return new CartItem(result.rows[0].id, result.rows[0].cart_id, result.rows[0].product_id, result.rows[0].quantity);
    }

    static async getById(id) { 
        try {
            const result = await db.query(`
                SELECT * FROM cart_item
                WHERE id = $1;
            `, [id]);
            return new CartItem(result.rows[0].id, result.rows[0].cart_id, result.rows[0].product_id, result.rows[0].quantity);
        } catch (e) {
            return null;
        }
    }   

    static async getByCartId(cart_id) {
        const result = await db.query(`
            SELECT * FROM cart_item
            WHERE cart_id = $1;
        `, [cart_id]);
        return result.rows.map(row => new CartItem(row.id, row.cart_id, row.product_id, row.quantity));
    }

    static async getByCartIdAndProductId(cart_id, product_id) {
        const result = await db.query(`
            SELECT * FROM cart_item
            WHERE cart_id = $1 AND product_id = $2;
        `, [cart_id, product_id]);
        if (result.rows.length > 0) {
            return new CartItem(result.rows[0].id, result.rows[0].cart_id, result.rows[0].product_id, result.rows[0].quantity);
        } else {
            return null;
        }
    }

    async removeQuantityFromCart(quantity) {
        this.quantity = this.quantity - quantity;
        if (this.quantity <= 0) {
            await this.delete();
            return false;
        } else {
            const result = await db.query(`
                UPDATE cart_item
                SET quantity = $1
                WHERE id = $2;
            `, [this.quantity, this.id]);
            return true;
        }
    }

    async save(){
        await db.query(`
            UPDATE cart_item
            SET quantity = $1, product_id = $2, cart_id = $3
            WHERE id = $4;
        `, [this.quantity, this.product_id, this.cart_id, this.id]);
    }

    async delete() {
        await db.query(`
            DELETE FROM cart_item
            WHERE id = $1;
        `, [this.id]);
    }

}

module.exports = CartItem;