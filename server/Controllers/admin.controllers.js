const bcrypt = require('bcrypt'); 
const Admin = require('../models/admin.model'); 
const User = require('../models/user.model');       
const nodemailer = require('nodemailer');     
const Meeting=require("../models/meeting.model");
const generateToken=require("../config/generateToken");
const Mail = require('nodemailer/lib/mailer');
require('dotenv').config();
const mail=process.env.MAIL;
const appPassword=process.env.MAILPASSWORD;



const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin";

// Admin Register Route
const registedAdmin = async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;

        if (secretKey !== ADMIN_SECRET) {
            return res.status(403).json({ message: "Forbidden: Invalid admin secret" });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists." });
        }


        // Create new Admin
        const newAdmin = new Admin({
            email,
            password
        });

        await newAdmin.save();

        res.status(201).json({ message: "Admin registered successfully." });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: "Internal server error." });
    }
};



// Setup nodemailer transporter (using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mail,    
        pass: appPassword,      
    }
});
const deleteMeetingAndNotify = async (req, res) => {
    const { meetingId } = req.body;
    try {
        const meeting = await Meeting.findById(meetingId).populate('participants.user createdBy');

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const emailsToNotify = [];

        // Add all participant emails
        meeting.participants.forEach(participant => {
            if (participant.user && participant.user.email) {
                emailsToNotify.push(participant.user.email);
            }
        });

        // Add creator email
        if (meeting.createdBy && meeting.createdBy.email) {
            emailsToNotify.push(meeting.createdBy.email);
        }

        // Delete the meeting
        await Meeting.findByIdAndDelete(meetingId);

        // Send notification emails
        for (const email of emailsToNotify) {
            await transporter.sendMail({
                from: mail, 
                to: email,
                subject: `Meeting Cancelled: ${meeting.title}`,
                text: `The meeting "${meeting.title}" scheduled on ${meeting.date.toDateString()} has been cancelled by admin.`
            });
        }

        console.log('Meeting deleted and notifications sent.');

        // Send response to frontend
        return res.status(200).json({ message: 'Meeting deleted successfully and notifications sent.' });

    } catch (error) {
        console.error('Error deleting meeting and notifying:', error);
        return res.status(500).json({ message: 'Error deleting meeting and notifying participants' });
    }
};

// Backend endpoint for suggesting meeting names based on search query
const suggestMeetings = async (req, res) => {
    const { query } = req.body; 
    try {
        // Find meetings that match the query (case-insensitive)
        const meetings = await Meeting.find({
            title: { $regex: query, $options: 'i' }  
        }).select('_id title');  

        if (!meetings || meetings.length === 0) {
            return res.status(404).json({ message: 'No meetings found' });
        }

        return res.status(200).json(meetings);
    } catch (error) {
        console.error('Error fetching meeting suggestions:', error);
        return res.status(500).json({ message: 'Error fetching meeting suggestions' });
    }
};




const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Admin.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

       

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        // Set token in HTTP-Only cookie
        res.cookie('adminToken', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, 
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            message: 'Login successful',
        });

    } catch (error) {
        console.error('Error authenticating admin:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};




module.exports={registedAdmin,authAdmin,suggestMeetings,deleteMeetingAndNotify};

