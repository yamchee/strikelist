// /backend/product.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        productId: Number,
        name: String,
        displayName: String,
        price: Number,
        picture: String
    }
);
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Product", ProductSchema);