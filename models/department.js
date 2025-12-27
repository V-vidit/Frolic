const mongoose = require("mongoose");

const departmentSchema=mongoose.Schema({
    DepartmentName: {
        type:String,
        required: true
    },
    DepartmentImage: String,
    DepartmentDescription: String,
    InstituteID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "institutes",
        required: true
    },
    DepartmentCoOrdinatorID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
    },
    ModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
    }
}, {timestamps: true});

module.exports=mongoose.model("departments", departmentSchema);