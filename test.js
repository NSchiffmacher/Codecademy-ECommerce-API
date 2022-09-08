require('dotenv').config({path: __dirname + '/.env'});
const expect = require('chai').expect;

const db = require('./db');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const testUser = false;
const testProduct = false;
const testOrder = true;

describe('Testing the models', () => {
    describe('User', () => {
        if (!testUser) return;
        const email = `test${Date.now()}@test.com`;
        const password = `test${Date.now()}password`;


        it("should create a new user", async () => {
            const user = await User.create(email, password);

            expect(user).to.be.an.instanceOf(User);
            expect(user.email).to.equal(email);
            expect(user.id).to.be.a('number');
        });

        it("should should find a user based on it's email", async () => {
            const user = await User.getByEmail(email);

            expect(user).to.be.an.instanceOf(User);
            expect(user.email).to.equal(email);
            expect(user.id).to.be.a('number');
        });

        it("should delete a user", async () => {
            const user = await User.getByEmail(email);
            const result = await user.delete();

            expect(result).to.equal(true);
        });

        it("should return null when looking for an unknown email", async () => {
            const user = await User.getByEmail(email);
            expect(user).to.equal(null);
        });
    });

    describe("Product", () => {
        if (!testProduct) return;

        const name = `A test product`;
        const price = 100.99;
        const description = `The description of the given test product, a very expensive one`;
        let product_id = null;

        const quantityToAdd = 12;
        const quantityToRemove = 5;

        it("creates a new product", async () => {
            const product = await Product.create(name, price, description);
            product_id = product.id;

            expect(product).to.be.an.instanceOf(Product);
            expect(product.name).to.equal(name);
            expect(product.price).to.equal(price);
            expect(product.description).to.equal(description);
            expect(product.remaining_in_stock).to.equal(0);
        });

        it("finds a product based on it's id", async () => {
            const product = await Product.getById(product_id);

            expect(product).to.be.an.instanceOf(Product);
            expect(product.id).to.equal(product_id);
            expect(product.name).to.equal(name);
            expect(product.price).to.equal(price);
            expect(product.description).to.equal(description);
        });

        it("returns that no stock is available", async () => {
            const product = await Product.getById(product_id);

            expect(product.isAvailable()).to.equal(false);
        });

        it("adds stock to the product and return the stock", async () => {
            const product = await Product.getById(product_id);
            const result = await product.addStock(quantityToAdd);

            expect(result).to.equal(quantityToAdd);
            expect(product.remaining_in_stock).to.equal(quantityToAdd);
        });

        it("states that stock is available", async () => {
            const product = await Product.getById(product_id);

            expect(product.isAvailable()).to.equal(true);
        });

        it("deletes part of the product's stock", async () => {
            const product = await Product.getById(product_id);
            const remainingStock = await product.removeStock(quantityToRemove);

            expect(remainingStock).to.equal(quantityToAdd - quantityToRemove);
        });



        it("deletes a product and return true", async () => {
            const product = await Product.getById(product_id);
            const result = await product.delete();

            expect(result).to.equal(true);
        });

        it("returns null when looking for an unknown product", async () => {
            const product = await Product.getById(product_id);
            expect(product).to.equal(null);
        });
    })

    describe("Order", async () => {
        if (!testOrder) return;

        // Create the user to attach the order to
        let user = null;

        let productA = null;
        let productB = null;

        let order_id = null;

        before(async () => {
            user = await User.create(`test${Date.now()}@test.com`, `test${Date.now()}password`);
            productA = await Product.create(`Product A`, 100.99, `Product A description`, '', 10);
            productB = await Product.create(`Product B`, 200.99, `Product B description`, '', 5);
        });

        it("creates a new order", async () => {
            const order = await Order.create(user.id);
            order_id = order.id;

            expect(order).to.be.an.instanceOf(Order);
            expect(order.user_id).to.equal(user.id);
            expect(order.id).to.be.a('number');

        });

        it("gets an existing order by it's id", async () => {
            const order = await Order.getById(order_id);

            expect(order).to.be.an.instanceOf(Order);
            expect(order.user_id).to.equal(user.id);
        });

        it("adds a product to the order", async () => {
            const order = await Order.getById(order_id);

            const result = await order.addProduct(productA, 5);

            expect(result).to.equal(true);
            expect(order.items[0].quantity).to.equal(5);
        });

        it("adds a 2nd product to the order", async () => {
            const order = await Order.getById(order_id);

            const result = await order.addProduct(productB, 2);

            expect(result).to.equal(true);
            expect(order.items[1].quantity).to.equal(2);
        });

        it("finds the item in the oder", async () => {
            const order = await Order.getById(order_id);

            expect(order.items.length).to.equal(2);
            expect(order.items[0].product_id).to.equal(productA.id);
        });

        it("removes some possible quantity of a product from the order", async () => {
            const order = await Order.getById(order_id);
            const result = await order.removeProduct(productA, 2);

            expect(result).to.equal(true);
            expect(order.items.find(item => item.product_id === productA.id).quantity).to.equal(3);
        });

        it("removes some impossible quantity of a product from the order, expect removal", async () => {
            const order = await Order.getById(order_id);
            const result = await order.removeProduct(productB, 10);

            expect(result).to.equal(false);
            expect(order.items.length).to.equal(1);
        });

        it("deletes an order and returns true", async () => {
            const order = await Order.getById(order_id);
            const result = await order.delete();
            
            expect(result).to.equal(true);
        });

        after(async () => {
            await user.delete();
            await productA.delete();
            await productB.delete();
        });
    });
});
