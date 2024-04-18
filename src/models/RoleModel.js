const mongoose = require("mongoose")

const roleSchema = mongoose.Schema({
    role_name:{
        type:String,
        required:false
    },
    role_permission:{
        type:Array,
        required:false
    }, 
     isDeleted: {
        type: Boolean,
        required: false,
        default: false,
      },
      isActive: {
        type: Boolean,
        required: false,
        default: true,
      },
},
{
    timestamps: true,
  }
)

const Role = mongoose.model("Role",roleSchema)
module.exports=Role