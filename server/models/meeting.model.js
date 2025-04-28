const mongoose=require("mongoose");
const meetingSchema=mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }, 
    startTime: { type: Date, required: true },   
    endTime: { type: Date, required: true },      
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        
        }
      ],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
},
{
    timestamps: true,
}
)
module.exports = mongoose.model('Meeting', meetingSchema);