const express=require("express");
const app=express();
const mongoose=require("mongoose");
const cors=require("cors");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const jwt=require("jsonwebtoken");
const db=require("./db");
require('dotenv').config();
const port = process.env.PORT;

// importing the files:
const {registerUser,authUser, isLogged, logout, allMembers, deleteUser}=require("./controllers/user.controllers");
const Authenticate = require("./middlewares/auth");
const { createMeeting ,getUserMeetings, suggestAvailableSlots} = require("./Controllers/meeting.controllers");
const { registedAdmin, authAdmin ,suggestMeetings,deleteMeetingAndNotify} = require("./Controllers/admin.controllers");

// Setting the database:
db();

// for parsing the cookies and data:
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// for request from frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));






// postman test:
app.post("/register",registerUser);
app.post("/login",authUser);
app.get("/checkauth",Authenticate,isLogged);
app.get("/logout",logout);
app.post("/schedulemeeting",createMeeting);
app.post("/allmeetings",getUserMeetings);
app.post("/otherdates",suggestAvailableSlots);
app.post("/members",allMembers);

// Admin requests:

app.post("/deleteuser",deleteUser);
app.post("/adminreg",registedAdmin);
app.post("/adminlogin",authAdmin);
app.post("/admin/delete-user",deleteUser);
app.post('/admin/suggest-meetings', suggestMeetings);
app.post('/admin/delete-meeting', deleteMeetingAndNotify);

app.get("/postman",(req,res)=>{
    res.send("this is the data received");  
})

app.listen(port || 3000,(req,res)=>{
    console.log("Server is set at port number\t"+port);
})