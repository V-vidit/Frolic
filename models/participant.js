const mongoose=require("mongoose");

const participantSchema= mongoose.Schema({
    ParticipantName: {
        type:String,
        required: true,
    },
    ParticipantEnrollmentNumber: {
        type:String,
        required: true,
        unique: true
    },
    ParticipantInstituteName: String,
    ParticipantCity: String,
    ParticipantMobile: String,
    ParticipantEmail: String,
    IsGroupLeader: {
        type: Boolean,
        default: false
    },
    GroupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groups",
        required: true
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
},{timestamps: true});

module.exports=mongoose.model("participants", participantSchema);