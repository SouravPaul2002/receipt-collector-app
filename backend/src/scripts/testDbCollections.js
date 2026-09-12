import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import Product from '../models/product.model.js'
import Reminder from '../models/reminder.model.js'

dotenv.config()

const testDbCollections = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...")
        await mongoose.connect(process.env.DATABASE_URI)
        console.log("Connected successfully!\n")

        const db = mongoose.connection.db
        const dbName = db.databaseName
        console.log(`Current Database Name: "${dbName}"`)

        // Fetch existing collections in the DB
        let collections = await db.listCollections().toArray()
        console.log("\nExisting Collections in MongoDB Atlas:")
        if (collections.length === 0) {
            console.log("  (No collections found yet because MongoDB creates collections only when data is inserted or indexes are initialized)")
        } else {
            collections.forEach(col => console.log(`  - ${col.name}`))
        }

        console.log("\nInitializing Mongoose Model Indexes & Collections...")
        await User.init()
        await Product.init()
        await Reminder.init()

        // List collections again after initialization
        collections = await db.listCollections().toArray()
        console.log("\nUpdated Collections in MongoDB Atlas:")
        collections.forEach(col => console.log(`  - ${col.name}`))

    } catch (err) {
        console.error("Error connecting to MongoDB Atlas:", err.message)
    } finally {
        await mongoose.disconnect()
        console.log("\nDisconnected from database.")
    }
}

testDbCollections()
