const express=require("express");
const router=express.Router();
const User=require("../models/user");
const authMiddleware=require("../middleware/authMiddleware");
const selfOrAdminMiddleware=require("../middleware/selfOrAdminMiddleware");
const adminOnlyMiddleware = require("../middleware/adminOnlyMiddleware");

router.get("/", authMiddleware, adminOnlyMiddleware,async(req,res)=>{
    try{
        const users= await User.find().select("-UserPassword");

        res.status(200).json({users});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.get("/:id", authMiddleware,selfOrAdminMiddleware, async(req,res)=>{
    try{
        const user= await User.findById(req.params.id).select("-UserPassword");

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({user});
    }
    catch(err){
        res.status(500).json({message:"Internal Server Error"});
    }
})


router.patch("/:id", authMiddleware, selfOrAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        $set: req.body 
      },
      { new: true }
    ).select("-UserPassword");    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      updatedUser: user
    });

  } 
  catch(err)
  {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.delete("/:id", authMiddleware,adminOnlyMiddleware, async(req,res)=>{
    try{
        const user= await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "User deleted successfully", deletedUser: user});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})
module.exports=router;
