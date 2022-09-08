const db = require('../db');

const Product = require('./Product');
const OrderItem = require('./OrderItem');

class Order {
    constructor(user_id, created_at, status) {
        this.user_id = user_id;
        this.created_at = created_at || new Date();
        this.status = status || 'pending';

        this.items = [];
    }

    static async create(user_id, created_at, status) {
        let order = new Order(user_id, created_at, status);
        const result = await db.query(`
            INSERT INTO "order" (user_id, created_at, status)
            VALUES ($1, $2, $3)
            RETURNING id;
        `, [order.user_id, order.created_at, order.status]);
        order.id = Number(result.rows[0].id);
        return order;
    }   

    static async getById(id) {
        try {
            const result = await db.query(`
                SELECT * FROM "order"
                WHERE id = $1;
            `, [id]);
            let order = new Order(result.rows[0].user_id, result.rows[0].created_at, result.rows[0].status);
            order.id = id;

            order.items = await OrderItem.getByOrderId(id);

            return order;
        } catch (e) {
            return null;
        }
    }

    async addProduct(product, quantity) {
        try {
            let order_item = await OrderItem.create(this.id, product.id, quantity);
            this.items.push(order_item);
            return true;
        } catch (e) {
            return false;
        }
    }

    async removeProduct(product, quantity) {
        let orderItem = this.items.find(item => item.product_id === product.id);
        if (!orderItem) return null;

        let doneWithoutRemove = (await orderItem.removeQuantityFromOrder(quantity));
        if (!doneWithoutRemove) {
            this.items = this.items.filter(item => item.id !== orderItem.id);
        }
        return doneWithoutRemove;
    }

    async delete(){
        try {
            await db.query(`
                DELETE FROM "order"
                WHERE id = $1;
            `, [this.id]);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
}

module.exports = Order;