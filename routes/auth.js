const express=require("express")
const User=require("../models/user");
const bcrypt= require("bcryptjs");
const jwt=require("jsonwebtoken");
const authMiddleware=require("../middleware/authMiddleware");

const router=express.Router();

router.post("/register", async(req,res)=>{
    try{
        const {UserName, UserPassword, EmailAddress, PhoneNumber, isAdmin}= req.body;

        if (!UserName || !UserPassword || !EmailAddress || !PhoneNumber || isAdmin===undefined) {
            return res.status(400).json({message: "Missing Credentials"})
        }

        const userExists= await User.findOne({EmailAddress});

        if (userExists) {
            return res.status(409).json({message: "User already exixts"});
        }
        

        const hashedPassword= await bcrypt.hash(UserPassword,10);

        const user= await User.create({
            UserName,
            UserPassword: hashedPassword,
            EmailAddress,
            PhoneNumber,
            isAdmin
        });

        res.json({message: "User created successfully", 
            newUser: {
                id: user._id,
                username: user.UserName,
                email: user.EmailAddress
            }
        });
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.post("/login", async(req,res)=>{
    try{
        const {EmailAddress, UserPassword}=req.body;

        const user= await User.findOne({EmailAddress});

        if (!user) {
            return res.status(401).json({message: "Invalid Credentails"});
        }

        const isMatch= await bcrypt.compare(UserPassword, user.UserPassword);

        if (!isMatch) {
            return res.status(401).json({message: "Invalid Credentials"});
        }        

        const token= jwt.sign(
            {
                id: user._id,
                email: user.EmailAddress,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            {expiresIn: "30m"}
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30*60*1000
        });

        res.status(200).json({message: "Login Successfullu"});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.get("/me",authMiddleware,async(req,res)=>{
    try{
        const user = await User.findById(req.user.id).select("-UserPassword");

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    }
    catch(err){
        res.status(500).json({ message: "Internal Server Error" });
    }
})



module.exports=router;