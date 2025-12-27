const mongoose=require("mongoose");

const groupSchema= mongoose.Schema({
    GroupName:{
        type: String,
        required: true,
    },
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "events"
    },
    
    IsPaymentDone: Boolean,
    IsPresent: Boolean,
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
},{timestamps: true});

module.exports=mongoose.model("groups", groupSchema);
