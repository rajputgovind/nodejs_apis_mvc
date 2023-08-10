import { StatusCodes } from "http-status-codes";
import bcryptjs from 'bcryptjs'
import User from "../models/UserModel.js";
import nodemailer from 'nodemailer'
import randomstring from 'randomstring'

// Mail send code

const sendResetPassword = async(name,email,token)=>{
    try {
        const transporter =  nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:5000,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASSWORD
            }
        })

        const mailOptions = {
            from:process.env.EMAIL_USER,
            to:email,
            subject:"For Reset Password",
            html: '<p>Hii'+name+', Please copy the link and <a href="http://localhost:5000/api/user/reset-password?token='+token+'">  reset your password </a></p>'

        }

        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }
            else{
                console.log("Mail has been sent",info.response)
            }
        })

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({success:false, message:error.message})
    }
}

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


// forget password api

export const forgetPassword = async(req,res)=>{
    try {
        const email = req.body.email
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(StatusCodes.NO_CONTENT).json({success:false, message:"User not found"})
        }
        
        const randomestring = randomstring.generate() 
        const data= await User.updateOne({email:email},{$set:{token:randomestring}})   
        sendResetPassword(user.name,user.email,randomstring)

        res.status(StatusCodes.OK).json({success:true, message:"please check your email and reset password"})
    } catch (error) { 
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:"Error while forget password"})
    }
}


// Reset Password

export const resetPassword = async(req,res) =>{
    try {
        const token = req.query.token
        const tokenData= await User.findOne({token:token})
        if(!tokenData){
            return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Not found"})
        }
        const {password} = req.body
        const hashPassword = bcryptjs.hashSync(password,10)
        const updateUser = await User.findByIdAndUpdate({_id:tokenData._id},{$set:{
            password:hashPassword, token:''
        }},{new:true})

        return res.status(StatusCodes.OK).json({success:true, message:"Password reset successfully", data:updateUser})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:"Error while reset password"})
    }
}