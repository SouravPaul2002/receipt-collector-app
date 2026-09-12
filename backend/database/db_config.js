import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URI)
        console.log(`DB connection success: ${conn.connection.host}`)
    } catch (err) {
        console.error(`DB connection failed: ${err.message}`)
        process.exit(1)
    }
}

export default connectDB