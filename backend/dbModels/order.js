// /backend/order.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        productId: Number,
        count: Number
    }
);
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Order", OrderSchema);