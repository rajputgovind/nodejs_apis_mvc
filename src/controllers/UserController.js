import { StatusCodes } from "http-status-codes";
import bcryptjs from 'bcryptjs'
import User from "../models/UserModel.js";


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