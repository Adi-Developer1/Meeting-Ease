const jwt=require('jsonwebtoken');
require('dotenv').config();
const secret=process.env.JWT_SECRET;
const generateToken=(id)=>{
    // return jwt.sign({id},process.env.JWT_SECRET,{
    return jwt.sign({id},secret,{
        expiresIn:"30d",
    })
};
module.exports=generateToken;