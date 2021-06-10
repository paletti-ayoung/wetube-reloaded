import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email:{type:String, required:true,unique:true},
    avatarUrl:String,
    socialOnly:{type: Boolean, default:false},
    username:{type:String, required:true,unique:true},
    password:{type:String},
    name:{type:String, required:true},
    location:String,
    videos:[{type:mongoose.Schema.Types.ObjectId,  ref:"Video"},] //vidoes is array the link with Video model.
});

userSchema.pre('save',async function(){
    if(this.isModified("password")){ //only password is modified.
        this.password= await bcrypt.hash(this.password,5);
    }
})

const User = mongoose.model("User",userSchema);
export default User;
