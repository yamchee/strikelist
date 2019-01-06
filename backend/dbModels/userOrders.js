// /backend/userOrders.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserOrdersSchema = new Schema(
    {
        userId: String,
        orders: [{
            productId: Number,
            count: Number
        }]
    }, {
        timestamps: {
            createdAt: true, updatedAt: true
        }
    }
);
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("UserOrders", UserOrdersSchema);