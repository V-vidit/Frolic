const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    UserName: {
        type: String,
        required: true
    },
    UserPassword: {
        type: String,
        required: true
    },
    EmailAddress: {
        type: String,
        required: true,
        unique: true
    },
    PhoneNumber: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

module.exports=mongoose.model("users", userSchema);