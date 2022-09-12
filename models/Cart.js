const db = require('../db');

const Product = require('./Product');
const CartItem = require('./CartItem');
const User = require('./User');
const Order = require('./Order');

class Cart {
    constructor(user_id){
        this.user_id = user_id;

        this.items = [];
    }

    static async _create(user_id){
        // check if the user exists 
        let user = await User.getById(user_id);
        if (user == null) {
            throw new Error('User does not exist');
        }

        let cart = new Cart(user_id);
        const result = await db.query(`
            INSERT INTO cart (user_id)
            VALUES ($1)
            RETURNING id;
        `, [cart.user_id]);
        cart.id = Number(result.rows[0].id);
        return cart;
    }

    static async getById(id){
        try {
            const result = await db.query(`
                SELECT * FROM cart
                WHERE id = $1;
            `, [id]);
            let cart = new Cart(result.rows[0].user_id);
            cart.id = id;

            cart.items = await CartItem.getByCartId(id);

            return cart;
        } catch (e) {
            return null;
        }
    }

    static async get(user_id){
        try {
            const result = await db.query(`
                SELECT * FROM cart
                WHERE user_id = $1;
            `, [user_id]);
            let cart = new Cart(result.rows[0].user_id);
            cart.id = result.rows[0].id;

            cart.items = await CartItem.getByCartId(cart.id);

            return cart;
        } catch (e) {
            try {
                return await this._create(user_id);
            } catch(e) {
                return null;
            }
        }
    }

    async addProduct(product, quantity){
        try {
            let cartItem = await CartItem.getByCartIdAndProductId(this.id, product.id);
            if (cartItem != null) {
                cartItem.quantity = cartItem.quantity + quantity;
                await cartItem.save();
            } else {
                cartItem = await CartItem.create(this.id, product.id, quantity);
            }

            this.items.push(cartItem);
            return true; 
        } catch (e) {
            return false;
        }
    }

    async removeProduct(product, quantity){
        let updated = true;
        try {
            let cartItem = await CartItem.getByCartIdAndProductId(this.id, product.id);
            if (cartItem != null) {
                cartItem.quantity = cartItem.quantity - quantity;
                if (cartItem.quantity <= 0) {
                    await cartItem.delete();
                    updated = false;
                } else {
                    await cartItem.save();
                }
            } else {
                return false;
            }

            this.items = await CartItem.getByCartId(this.id);
            return updated; 
        } catch (e) {
            return false;
        }
    }

    async delete(){
        try {
            await db.query(`
                DELETE FROM cart
                WHERE id = $1;
            `, [this.id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async order(){
        let order = await Order.create(this.user_id);
        if (order != null) {
            for (let item of this.items) {
                let product = await Product.getById(item.product_id);
                await order.addProduct(product, item.quantity);
            }
            await this.delete();
            return order;
        } else {
            return null;
        }
    }
}

module.exports = Cart;