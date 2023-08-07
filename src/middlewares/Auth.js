import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
const verifyToken = async (req, res, next)=>{
    try {
        let token = req.headers["authorization"] || req.body.token || req.query.token
        // const token = authHeader.replace('Bearer ',"")
        if (!token) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Access Denied" })
        }
        token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        console.log(decode)
        req.user = decode
        next()

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message })
    }
}