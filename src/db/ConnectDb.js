import mongoose from "mongoose";

export default async function connectDb(){
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`database connection successfully.....`);
    } catch (error) {
        console.log(error)
        console.log(`error in database connection.........`);
    }
}