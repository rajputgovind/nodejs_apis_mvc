import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    type:{
        type:Number,
        required:true
    },
},{
    timestamps:true
})


userSchema.methods.generateAuthToken = async function(){
    try {
        // console.log("token code")
        const token = await jwt.sign({_id:this._id}, process.env.SECRET_KEY)    
        // this.tokens = this.tokens.concat({token:token})
        
        // await this.save()
        return token;
    } catch (error) {
        console.log("error in genreting token", error)
    }
    
}

const User = new mongoose.model('User',userSchema)
export default User