const express=require("express");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const cors=require("cors");
dotenv.config();
const app=express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("DB Connected");
}).catch((err)=>{
    console.log(err);
})

const authRoutes=require("./routes/auth");
const userRoutes=require("./routes/user");
const instituteRoutes=require("./routes/institute");
const departmentRoutes=require("./routes/department");
const eventRoutes=require("./routes/event");
const groupRoutes=require("./routes/group");
const particpantRoutes=require("./routes/participant")
const eventWiseWinnerRoutes=require("./routes/eventWiseWinners");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/participants", particpantRoutes);
app.use("/api/winners", eventWiseWinnerRoutes);

app.listen(process.env.PORT, ()=>{
    console.log(`Server at port number ${process.env.PORT}`);
    
})