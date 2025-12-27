const express=require("express");
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const adminOnlyMiddleware=require("../middleware/adminOnlyMiddleware");
const Institute=require("../models/institute");


router.get("/", authMiddleware, async(req,res)=>{
    try{
        const institutes= await Institute.find();

        res.status(200).json({institutes});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get("/:id", authMiddleware, async(req,res)=>{
    try{
        const institute=await Institute.findById(req.params.id);

        if (!institute) {
            return res.status(404).json({message: "Institute not found"});
        }

        res.status(200).json({institute});
    }
    catch(err){
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.post("/",authMiddleware, adminOnlyMiddleware, async(req,res)=>{
    try{
        const {InstituteName, InstituteImage, InstituteDescription, InstituteCoOrdinatorID}=req.body;

        if (!InstituteName || !InstituteCoOrdinatorID) {
            return res.status(400).json({message: "InstitureName and InstituteCoOrdinatorID are required"});
        }

        const institute=await Institute.create({
            InstituteName,
            InstituteImage,
            InstituteDescription,
            InstituteCoOrdinatorID,
            ModifiedBy: req.user.id
        });

        res.status(200).json({message: "Institute created successfully", institute});
    }
    catch(err){
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.patch("/:id", authMiddleware,adminOnlyMiddleware,async(req,res)=>{
    try{
        const institute= await Institute.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            {
                new: true
            }
        );

        if (!institute) {
            return res.status(404).json({message:"Institute not found"});
        }

        res.status(200).json({message:"Institute updated successfully", updatedInstitute: institute});
    }
    catch(err){
        res.status(500).json({message:"Internal Server Error"});
    }
})

router.delete("/:id", authMiddleware, adminOnlyMiddleware, async(req,res)=>{
    try{
        const institute=await Institute.findByIdAndDelete(req.params.id);

        if (!institute) {
            return res.status(404).json({meesage: "Institute not found"});
        }

        res.status(200).json({message:"Institute deleted successfully", deletedInstitute: institute});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

module.exports=router;