const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    image:{type:String,default:"https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"},
    isAdmin:{type:Boolean,default:false},
},
{
    timestamps: true,
}
)
userSchema.pre("save",async function(next){
    if(!this.isModified){
        next();
    }
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})
userSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}
const User=mongoose.model("User",userSchema);
module.exports=User;