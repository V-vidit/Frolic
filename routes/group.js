const express=require("express");
const router=express.Router();
const Group=require("../models/group");
const authMiddleware = require("../middleware/authMiddleware");
const { default: mongoose } = require("mongoose");
const Participant=require("../models/participant");

router.get("/:id", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Group ID"});
        }

        const group= await Group.findById(id).populate("ModifiedBy", "UserName EmailAddress").populate("EventID", "EventName EventCoOrdinatorID");

        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isGroupLeader=await Participant.exists({
            GroupID: id,
            IsGroupLeader: true,
            ModifiedBy: req.user.id
        });

        const isEventCoOrdinator= group.EventID.EventCoOrdinatorID.toString()===req.user.id;

        if(!isAdmin && !isGroupLeader && !isEventCoOrdinator){
            return res.status(403).json({message: "Unauthorized"});
        }

        res.status(200).json({group});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.patch("/:id", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        const group=await Group.findById(id).populate("EventID", "EventCoOrdinatorID");

        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isEventCoOrdinator= group.EventID.EventCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isEventCoOrdinator) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const allowedFields=[
            "GroupName",
            "IsPaymentDone",
            "IsPresent"
        ];

        const updates={};

        allowedFields.forEach((field) => {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        });

        updates.ModifiedBy=req.user.id;

        const updatedGroup=await Group.findByIdAndUpdate(
            id,
            {
                $set: updates
            },
            {new: true, runValidators: true}
        );

        res.status(200).json({message: "Group updated successfully", updatedGroup});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;  
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid Group ID" });
        }   

        const group = await Group.findById(id);

        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }   

        const isAdmin = req.user.isAdmin;   

        const isGroupLeader = await Participant.exists({
          GroupID: id,
          IsGroupLeader: true,
          ModifiedBy: req.user.id
        }); 

        if (!isAdmin && !isGroupLeader) {
          return res.status(403).json({ message: "Unauthorized" });
        }   

        const deletedGroup = await Group.findByIdAndDelete(id);  

        await Participant.deleteMany({ GroupID: id });  

        res.status(200).json({
          message: "Group deleted successfully", deletedGroup
        });

    } 
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:id/participants", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        const group = await Group.findById(id)
        .populate("EventID", "EventCoOrdinatorID");


        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isGroupLeader=await Participant.exists({
            GroupID: id,
            IsGroupLeader: true,
            ModifiedBy: req.user.id
        });

        const isEventCoOrdinator= group.EventID.EventCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isGroupLeader && !isEventCoOrdinator) {
            return res.status(403).json({message:"Unauthorized"});
        }

        const participants = await Participant.find({ GroupID: id })
        .populate("ModifiedBy", "UserName EmailAddress")
        .select("-__v");

        res.status(200).json({participants});
        
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/:id/participants", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;
        const{
            ParticipantName,
            ParticipantEnrollmentNumber,
            ParticipantInstituteName,
            ParticipantCity,
            ParticipantMobile,
            ParticipantEmail,
        }=req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        if (!ParticipantName || !ParticipantEnrollmentNumber) {
            return res.status(400).json({message: "ParticipantName and ParticipantEnrollment are required"});
        }

        const group=await Group.findById(id);
        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        const isGroupLeader=await Participant.exists({
            GroupID: id,
            IsGroupLeader: true,
            ModifiedBy: req.user.id
        });

        if (!isGroupLeader) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const existingParticipant=await Participant.findOne({
            ParticipantEnrollmentNumber
        });

        if (existingParticipant) {
            return res.status(400).json({message: "Participant already exists"});
        }

        const participant=await Participant.create({
            ParticipantName,
            ParticipantEnrollmentNumber,
            ParticipantInstituteName,
            ParticipantCity,
            ParticipantMobile,
            ParticipantEmail,
            IsGroupLeader: false,        
            GroupID: id,
            ModifiedBy: req.user.id
        });

        res.status(201).json({message: "Participant added successfully", participant});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})
module.exports=router;