const mongoose=require("mongoose");

const eventSchema=mongoose.Schema({
    EventName: {
        type: String,
        required: true
    },
    EventTagline: String,
    EventImage: String,
    EventDescription: String,
    GroupMinParticipants: {
        type: Number,
        required: true
    },
    GroupMaxParticipants: {
        type: Number,
        required: true
    },
    EventFees: {
        type: Number,
        default: 0
    },
    EventFirstPrice: Number,
    EventSecondPrice: Number,
    EventThirdPrice: Number,
    DepartmentID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "departments",
        required: true,
    },
    EventCoOrdinatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    EventMainStudentCoOrdinatorName: String,
    EventMainStudentCoOrdinatorPhone: String,
    EventMainStudentCoOrdinatorEmail: String,
    EventLocation: String,
    MaxGroupsAllowed: {
        type: Number,
        required: true
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
},{timestamps: true});

module.exports=mongoose.model("events", eventSchema);