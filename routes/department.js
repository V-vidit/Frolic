const express=require('express');
const router=express.Router();
const Department= require("../models/department");
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnlyMiddleware');
const Institute = require('../models/institute');
const mongoose=require("mongoose");


router.get("/", authMiddleware, async(req,res)=>{
    try{
        const departments=await Department.find();

        res.status(200).json({departments});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get("/:instituteId/departments", authMiddleware, async(req,res)=>{
    try{    
        const {instituteId}=req.params;

        if (!mongoose.Types.ObjectId.isValid(instituteId)) {
          return res.status(400).json({ message: "Invalid institute ID" });
        }

        const instituteExists= await Institute.findById(instituteId);
        if (!instituteExists) {
            return res.status(404).json({message: "Institute not found"});
        }

        const departments=await Department.find({
            InstituteID: instituteId 
        }).populate("DepartmentCoOrdinatorID", "UserName EmailAddress").select("-__v");

        res.status(200).json({departments});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.post("/", authMiddleware, async(req,res)=>{
    try{
        const {DepartmentName, DepartmentImage, DepartmentDescription, InstituteID, DepartmentCoOrdinatorID}=req.body;

        if(!DepartmentName || !InstituteID || !DepartmentCoOrdinatorID){
            return res.status(400).json({message: "DepartmentName, InstituteID and DepartmentCoOrdinatorID are required"});
        }

        if(!mongoose.Types.ObjectId.isValid(InstituteID) || !mongoose.Types.ObjectId.isValid(DepartmentCoOrdinatorID)){
                  return res.status(400).json({ message: "Invalid ObjectId" });
        }

        const institute= await Institute.findById(InstituteID);
        if (!institute) {
            return res.status(404).json({message: "Institute not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isInstituteCoOrdinator=institute.InstituteCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isInstituteCoOrdinator) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const department=await Department.create({
            DepartmentName,
            DepartmentImage,
            DepartmentDescription,
            InstituteID,
            DepartmentCoOrdinatorID,
            ModifiedBy: req.user.id
        });

        res.status(200).json({message: "Department registered successfully", department});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.patch("/:id", authMiddleware, async(req,res)=>{
    try{
        const {id}=req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Department ID"});
        }

        const department=await Department.findById(id);
        if (!department) {
            return res.status(404).json({message: "Department not found"});
        }

        const isAdmin=req.user.isAdmin;
        const isDepartmentCoOrdinator=department.DepartmentCoOrdinatorID.toString()===req.user.id;

        if (!isAdmin && !isDepartmentCoOrdinator) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const allowedFields=[
            "DepartmentName",
            "DepartmentImage",
            "DepartmentDescription",
            "DepartmentCoOrdinatorID"
        ];

        const updates={};

        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        });

        if(updates.DepartmentCoOrdinatorID && !mongoose.Types.ObjectId.isValid(updates.DepartmentCoOrdinatorID)) 
        {
          return res.status(400).json({ message: "Invalid Department Coordinator ID" });
        }

        updates.ModifiedBy=req.user.id;

        const updatedDepartment=await Department.findByIdAndUpdate(id,
            {
                $set: updates
            },
            {new:true, runValidators: true}
        );

        res.status(200).json({message: "Department Updated", updatedDepartment});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.delete("/:id",authMiddleware, adminOnly, async(req,res)=>{
    try{

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ message: "Invalid Department ID" });
        }
        
        const deletedDepartment= await Department.findByIdAndDelete(req.params.id);

        if (!deletedDepartment) {
            return res.status(404).json({message: "Department not found"});
        }

        res.status(200).json({message:"Department Deleted Successfully", deletedDepartment});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

module.exports=router;