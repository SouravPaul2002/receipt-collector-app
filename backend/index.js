import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './src/config/db.js'
import apiRoutes from './src/routes/index.js'
import errorHandler from './src/middlewares/errorHandler.js'
import ApiError from './src/utils/ApiError.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Common Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())

// Root Route
app.get("/", (req, res) => {
    res.send("Receipt Collector API Server Running")
})

// API Router Mount (/api)
app.use("/api", apiRoutes)

// 404 Route Catch-all
app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`))
})

// Global Error Handler
app.use(errorHandler)

// Connect DB and Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at: http://localhost:${PORT}`)
    })
}).catch((err) => {
    console.error("Failed to start server due to DB connection error:", err)
})
