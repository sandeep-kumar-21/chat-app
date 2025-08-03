import express from 'express'
import 'dotenv/config'
import http from 'http'
import cors from 'cors'
import { connectDB } from './config/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from 'socket.io'
import { Socket } from 'dgram'

const app = express()
const port = process.env.PORT || 4000
// Creating express app and HTTP server
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {} // {userId: socketId}

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log("User connected", userId)

    if(userId) userSocketMap[userId] = socket.id

    // Emit online users to all connected client
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

app.use(cors())
app.use(express.json({limit: "4mb"}))

// Connect to MongoDB
await connectDB()

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

app.get('/', (req, res) => {
  res.send('Server is running!')
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})