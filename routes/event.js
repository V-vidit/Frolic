const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const Event=require("../models/event");
const authMiddleware = require("../middleware/authMiddleware");
const Department = require("../models/department");
const adminOnly = require("../middleware/adminOnlyMiddleware");
const Group = require("../models/group");
const User=require("../models/user");
const EventWiseWinners=require("../models/eventWiseWinner");

router.get("/", authMiddleware,async(req,res)=>{
    try{
        const events=await Event.find();

        res.status(200).json({events});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get("/:id/events", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Department ID"});
        }

        const department=await Department.findById(id);
        if (!department) {
            return res.status(404).json({message: "Department not found"});
        }

        const events=await Event.find({DepartmentID: id}).populate("EventCoOrdinatorID", "UserName EmailAddress").select("-__v")

        res.status(200).json({events});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get("/:id", authMiddleware, async(req,res)=>{
    try{

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        const event=await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({message:"Event not found"});
        }

        res.status(200).json({event});
    }
    catch(err){
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.post("/", authMiddleware, async(req,res)=>{
    try{
        const {
            EventName,
            EventTagline,
            EventImage,
            EventDescription,
            GroupMinParticipants,
            GroupMaxParticipants,
            EventFees,
            EventFirstPrice,
            EventSecondPrice,
            EventThirdPrice,
            DepartmentID,
            EventCoOrdinatorID,
            EventMainStudentCoOrdinatorName,
            EventMainStudentCoOrdinatorPhone,
            EventMainStudentCoOrdinatorEmail,
            EventLocation,
            MaxGroupsAllowed
        } = req.body;

        if (!EventName || !DepartmentID || !EventCoOrdinatorID) {
            return res.status(400).json({
                message: "EventName, DepartmentID and EventCoOrdinatorID are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(DepartmentID) || !mongoose.Types.ObjectId.isValid(EventCoOrdinatorID)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        const coordinatorUser = await User.findById(EventCoOrdinatorID);

        if (!coordinatorUser) {
            return res.status(404).json({message: "Event Coordinator must be a valid user"});
        }

        const department=await Department.findById(DepartmentID);
        if (!department) {
            return res.status(404).json({message: "Department not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isDeptCoOrdinator=department.DepartmentCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isDeptCoOrdinator) {
            return res.status(403).json({message: "Unauthorized"});
        }

        if ( GroupMinParticipants !== undefined && GroupMaxParticipants !== undefined &&
            GroupMinParticipants > GroupMaxParticipants) 
        {
          return res.status(400).json({
            message: "GroupMinParticipants cannot exceed GroupMaxParticipants"
          });
        }

        const event=await Event.create({
            EventName,
            EventTagline,
            EventImage,
            EventDescription,
            GroupMinParticipants,
            GroupMaxParticipants,
            EventFees,
            EventFirstPrice,
            EventSecondPrice,
            EventThirdPrice,
            DepartmentID,
            EventCoOrdinatorID,
            EventMainStudentCoOrdinatorName,
            EventMainStudentCoOrdinatorPhone,
            EventMainStudentCoOrdinatorEmail,
            EventLocation,
            MaxGroupsAllowed,
            ModifiedBy: req.user.id
        });

        res.status(200).json({message: "Event created successfully", event});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.patch("/:id", authMiddleware, async(req,res)=>{
    try{
        const {id}= req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({message: "Event not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isEventCoOrdinator= event.EventCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isEventCoOrdinator) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const allowedFields=[
            "EventName",
            "EventTagline",
            "EventImage",
            "EventDescription",
            "GroupMinParticipants",
            "GroupMaxParticipants",
            "EventFees",
            "EventFirstPrice",
            "EventSecondPrice",
            "EventThirdPrice",
            "EventCoOrdinatorID",
            "EventMainStudentCoOrdinatorName",
            "EventMainStudentCoOrdinatorPhone",
            "EventMainStudentCoOrdinatorEmail",
            "EventLocation",
            "MaxGroupsAllowed"
        ];
        
        const updates={};

        allowedFields.forEach((field)=>{
            if(req.body[field] !== undefined){
                updates[field]=req.body[field];
            }
        });

        if (updates.EventCoOrdinatorID && !mongoose.Types.ObjectId.isValid(updates.EventCoOrdinatorID)) {
            return res.status(400).json({message: "Invalid Event Coordinator ID"});
        }

        if( updates.GroupMinParticipants !== undefined && updates.GroupMaxParticipants !== undefined &&
            updates.GroupMinParticipants > updates.GroupMaxParticipants ) 
        {
          return res.status(400).json({
            message: "GroupMinParticipants cannot exceed GroupMaxParticipants"
          });
        }

        updates.ModifiedBy=req.user.id;

        const updatedEvent= await Event.findByIdAndUpdate(
            id,
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({message: "Event updated successfully", updatedEvent});
    }
    catch(err){
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.delete("/:id", authMiddleware, adminOnly, async(req,res)=>{
    try{
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Event ID"});
        }

        const deletedEvent= await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({message: "Event not found"});
        }

        res.status(200).json({message: "Event deleted successfully", deletedEvent});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get("/:id/groups", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        const event=await Event.findById(id);
        if (!event) {
            return res.status(404).json({message: "Event not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isEventCoOrdinator=event.EventCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isEventCoOrdinator) {
            return res.status(403).json({message:"Unauthorized"});
        }

        const groups=await Group.find({EventID: id}).select("-__v");

        res.status(200).json({groups});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.post("/:id/groups", authMiddleware, async(req,res)=>{
    try{
        const {id} =req.params;
        const {GroupName} = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Event ID"});
        }

        if (!GroupName) {
            return res.status(400).json({message: "GroupName is required"});
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({message: "Event not found"});
        }

        const groupCount = await Group.countDocuments({ EventID: id });

        if (groupCount >= event.MaxGroupsAllowed) 
        {
          return res.status(400).json({ message: "Maximum groups limit reached for this event"});
        }

        const group= await Group.create({
            GroupName,
            EventID: id,
            IsPaymentDone: false,
            IsPresent: true,
            ModifiedBy: req.user.id
        });

        res.status(200).json({message: "Group created successfully", group});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get("/:id/winners", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Event ID"});
        }

        const winners=await EventWiseWinners.find({
            EventID: id,
        }).populate("EventID", "EventName EventFess")
        .populate("GroupID", "GroupName")
        .sort({sequence: 1});

        if (winners.length===0) {
            return res.status(404).json({message: "Winners not yet declared"});
        }

        res.status(200).json({id, winners});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.post("/:id/winners", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;
        const {GroupID, sequence}=req.body;
        const userID=req.user._id;
        const isAdmin=req.user.isAdmin;

        if (
            !mongoose.Types.ObjectId.isValid(id) ||
            !mongoose.Types.ObjectId.isValid(GroupID)
        ) {
          return res.status(400).json({ message: "Invalid Object ID" });
        }

        if (![1, 2, 3].includes(sequence)) {
          return res.status(400).json({
            message: "Sequence must be 1, 2, or 3"
          });
        }

        const event = await Event.findById(id);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        const isEventCoOrdinator=event.EventCoOrdinatorID.toString()===userID.toString();

        if (!isAdmin && !isEventCoOrdinator) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const group=await Group.findById(GroupID);
        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        if (group.EventID.toString() !== id.toString()) 
        {
            return res.status(400).json({message: "Group does not belong to this event"});
        }

        const sequenceExists = await EventWiseWinners.findOne({
          EventID: id,
          sequence
        });

        if (sequenceExists) {
            return res.status(409).json({message: `Winner already declared for position ${sequence}`});
        }

        const groupAlreadyWinner=await EventWiseWinners.findOne({
            EventID: id,
            GroupID
        });

        if (groupAlreadyWinner) {
            return res.status(409).json({message: "Group is already declared as a winner"});
        }

        const winner=await EventWiseWinners.create({
            EventID: id,
            GroupID,
            sequence,
            ModifiedBy: userID
        });

        res.status(201).json({message: "Winner declared", winner});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

module.exports=router;