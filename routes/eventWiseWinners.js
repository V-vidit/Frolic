const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const EventWiseWinners=require("../models/eventWiseWinner");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnlyMiddleware");
const Event=require("../models/event");

router.patch("/:id", authMiddleware, async (req, res) => {
    try{
        const { id } = req.params;
        const { sequence } = req.body;
        const userId = req.user._id;
        const isAdmin = req.user.isAdmin;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid Winner ID" });
        }

        const winner = await EventWiseWinners.findById(id);
        if (!winner) {
          return res.status(404).json({ message: "Winner not found" });
        }

        const event = await Event.findById(winner.EventID);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        const isEventCoordinator =
          event.EventCoOrdinatorID.toString() === userId.toString();

        if (!isAdmin && !isEventCoordinator) {
          return res.status(403).json({
            message: "Only Admin or Event Coordinator can update winner"
          });
        }

        if (sequence !== undefined) {
          if (![1, 2, 3].includes(sequence)) {
            return res.status(400).json({
              message: "Sequence must be 1, 2, or 3"
            });
          }
      
          await EventWiseWinners.findOneAndDelete({
            EventID: winner.EventID,
            sequence,
            _id: { $ne: id }
          });
      
          winner.sequence = sequence;
        }

        winner.ModifiedBy = userId;
        await winner.save();

        res.status(200).json({
          message: "Winner position updated successfully",
          winner
        });    
    } 
    catch (err) {
      res.status(500).json({
        message: "Internal Server Error",
        error: err.message
      });
    }
});

router.delete("/:id", authMiddleware, adminOnly, async(req,res)=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({message: "Invalid Object ID"});
        }

        const deletedWinner=await EventWiseWinners.findByIdAndDelete(req.params.id);

        if (!deletedWinner) {
            return res.status(404).json({message: "Winner not found"});
        }

        res.status(200).json({message: "Winner deleted successfully", deletedWinner});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})
module.exports=router;