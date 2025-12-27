const mongoose=require("mongoose");

const instituteSchema=mongoose.Schema({
    InstituteName: {
        type: String,
        required: true
    },
    InstituteImage: String,
    InstituteDescription: String,
    InstituteCoOrdinatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {timestamps: true});

module.exports=mongoose.model("institutes", instituteSchema);
