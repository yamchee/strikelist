// /backend/user.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        userId: String, // unique active directory user name
        fullName: String,
        shortName: String,
        isAdmin: Boolean,
        photo: String
    }
);
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("User", UserSchema);