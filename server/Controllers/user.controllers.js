const User=require("../models/user.model");
const generateToken=require("../config/generateToken");
require('dotenv').config();
const cookieSecret=process.env.COOKIE_SECRET;

const registerUser=async(req,res)=>{
    console.log(req.body);
    const {name,email,password,image,isAdmin}=req.body;
    // checking the response is correct or not
    if(!name|| !email || !password){
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const userExists=await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }
    // console.log("creating user!")
    // console.log(dp)

    
    const user = await User.create({
        name,
        email,
        password,
        image,
        isAdmin,
    })
    if(user){
        console.log("User created!");
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,

        })
    }
    else{
        res.status(400);
        throw new Error("failed to create user!");
    }
}
const authUser=async(req,res)=>{

    try
    {
        const {email,password}=req.body;
        const user=await User.findOne({email});
        
        if(user && await user.matchPassword(password)){
            const token=generateToken(user._id);
        
            res.cookie(cookieSecret, token, { maxAge: Date.now()+ 36000000 });

           
            res.status(201);
            res.send(user)
        }
        else{
            res.status(400);
            throw new Error("Password didn't match!/Wrong credentials!");
        }
        }
    catch(err)
    {
        res.status(400);
        throw new Error("Error!"+err);
    }

}
const isLogged=async(req,res)=>{
    try
    {
        if(req.rootUser)
        {
            res.status(201);
            res.send(req.rootUser);
            // console.log(req.rootUser);
        }
        else
        {
            res.status(400);
            throw new Error("Unauthorized!");
        }
    }
    catch(err)
    {
        throw new Error("Network Error!");
    }
}

const logout = (req, res) => {
    try {
      res.clearCookie(cookieSecret);
      
      res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to logout"
      });
    }
  };



  const allMembers=async (req, res) => {
    const { emails } = req.body;
  
    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'No emails provided' });
    }
  
    try {
      // Search for users by email (case-insensitive search)
      const participants = await User.find({
        email: { $in: emails.map((email) => email.toLowerCase()) },
      }).select('id name email');
  
      if (participants.length === 0) {
        return res.status(404).json({ message: 'No participants found for the provided emails' });
      }
  
      // Send the participants' names and ids
      return res.status(200).json({
        participants: participants.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error searching participants' });
    }
  };


  const deleteUser = async (req, res) => {
    const { userEmail } = req.body;
    try {
        const deletedUser = await User.findOneAndDelete({ email: userEmail });

        if (!deletedUser) {
            console.log('User not found.');
            return res.status(404).json({ message: 'User not found.' }); // 👈 send 404 if user not found
        } 

        console.log('User deleted successfully.');
        return res.status(200).json({ message: 'User deleted successfully.' }); // 👈 send success
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Server error while deleting user.' }); // 👈 send 500 error
    }
};


module.exports={registerUser,authUser,isLogged,logout,allMembers,deleteUser};