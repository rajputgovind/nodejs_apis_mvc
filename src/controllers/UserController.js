import { StatusCodes } from "http-status-codes";
import bcryptjs from 'bcryptjs'
import User from "../models/UserModel.js";

const securePassword = async(password)=>{
    try {
        const hashPassword = await bcryptjs.hash(password,10)
        return hashPassword
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({message:error.message})
    }
}

export async function registerUser(req,res){
    try {
        const password = req.body.password
        const hashPassword = bcryptjs.hashSync(password, 10)
        req.body['password'] = hashPassword

        const image = req.file.filename

        const {name, email,mobile, type} = req.body
        const user = await User({name, email,password:hashPassword,mobile, type,image})

        const isUserExist = await User.findOne({email:email})
        if(isUserExist){
            return res.status(StatusCodes.BAD_REQUEST).json({message:"This Email is already exist", success:false})
        }else{
            const userData = await user.save()
            res.status(StatusCodes.CREATED).json({message:"user created successfully", success:true, data:userData})
        }

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"error in user created user", error:error.message, success:false})
    }
}

export const login = async(req,res)=>{
    try {
        const email =req.body.email
        const password = req.body.password
        
        const user = await User.findOne({email:email})
        const isPasswordMatch= bcryptjs.compareSync(password, user.password)

        if(user){
            if(isPasswordMatch){
                const token = await user.generateAuthToken()
               const userResult = {
                _id:user._id,
                name:user.name,
                email:user.email,
                password:user.password,
                mobile:user.mobile,
                image:user.image,
                type:user.type,
                token:token
               }
               return res.status(StatusCodes.OK).json({message:"user Login successful", success:true, data:userResult})
            }
            else{
                return res.status(StatusCodes.BAD_REQUEST).json({message:"Invalid Login Details", success:false})
            }
        }else{
            return res.status(StatusCodes.BAD_REQUEST).json({message:"Invalid Login Details",success:false})
        }
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"error in user login",success:false, error:error.message})
    }
}

export const getAllUser = async(req,res)=>{
    try {
        const user = await User.find({})
       
        return res.status(StatusCodes.OK).json({success:true, message:"Fetch all user successfully", data:user})
    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"Error in find user",error:error.message})
    }
}


// Update password

export const updatePassword = async(req,res)=>{
    try {
        const userId = req.params.id
        const password = req.body.password
        const hashPassword =await securePassword(password)

        const user = await User.findOne({_id:userId})
        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({
                successL:false,
                message:`User not found with userid ${userId}`
            })
        }
        const updateUserPassword = await User.findByIdAndUpdate({_id:userId},{$set:{
            password:hashPassword
        }})

      return  res.status(StatusCodes.OK).json({success:true, message:"Your password has been updated", data:updateUserPassword})

    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false, message:'Error in update password',error:error.message})
    }
}