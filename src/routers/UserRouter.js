import express from 'express'
import { forgetPassword, getAllUser, login, registerUser, resetPassword, updatePassword } from '../controllers/UserController.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises';
import Auth from '../middlewares/Auth.js';
const UserRouter = express.Router()


const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const  destinationPath = path.join(__dirname,'../public/images'); 

// await fs.mkdirSync(destinationPath, { recursive: true });

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        return cb(null,"../Rest_Apis_nodejs_full_cours/src/public/images",function(error,success){
            if(error) throw error
        })
    },
    filename:function(req,file,cb){
        const fname = Date.now()+"-"+file.originalname
        return cb(null, fname, function(error,success){
            if(error) throw error
        })
    }


})

const upload = multer({storage:storage})


UserRouter.post("/register-user",upload.single('image'),registerUser)
UserRouter.post("/user-login",login)
UserRouter.get("/get-all-user", Auth , getAllUser)
UserRouter.post("/update-password/:id",updatePassword)
UserRouter.post('/forget-password',forgetPassword)
UserRouter.get('/reset-password', resetPassword)

export default UserRouter