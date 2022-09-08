const db = require('../db');

class Order {
    constructor(id, user_id, created_at, status) {
        this.id = id;
        this.user_id = user_id;
        this.created_at = created_at || new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.status = status || 'pending';

        this.order_items = [];
    }

    
}