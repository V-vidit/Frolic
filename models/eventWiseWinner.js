const mongoose=require("mongoose");

const eventWiseWinnersSchema= mongoose.Schema({
    EventID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "events",
        required: true
    },
    GroupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groups",
        required: true
    },
    sequence: {
        type: Number,
        required: true
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {timestamps: true});

module.exports=mongoose.model("eventWiseWinners", eventWiseWinnersSchema);