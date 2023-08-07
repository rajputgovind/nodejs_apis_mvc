import bodyParser from 'body-parser'
import 'dotenv/config'
import express from 'express'
import connectDb from './src/db/ConnectDb.js'
import UserRouter from './src/routers/UserRouter.js'

const app = express()
const PORT = 5000 || process.env.PORT

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/public',express.static('public'))

app.use("/api/user",UserRouter)
app.listen(PORT,()=>{
    connectDb()
    console.log(`server is listning on port ${PORT}`)
})
