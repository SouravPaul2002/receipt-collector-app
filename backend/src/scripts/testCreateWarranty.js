import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/product.model.js'

dotenv.config()

const runTest = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log("Connected to DB.")

        const testProduct = await Product.create({
            user: new mongoose.Types.ObjectId(),
            productName: "Dell XPS 15 Laptop",
            category: "Electronics",
            brand: "Dell",
            purchaseDate: new Date("2026-01-15"),
            price: 1500,
            currency: "USD",
            retailer: "Dell Official Store",
            warrantyMonths: 24,
            notes: "Test warranty item"
        })

        console.log("Successfully created test warranty product:")
        console.log(JSON.stringify(testProduct, null, 2))

        // Clean up test item
        await Product.findByIdAndDelete(testProduct._id)
        console.log("Test item cleaned up.")

    } catch (err) {
        console.error("Test Error:", err)
    } finally {
        await mongoose.disconnect()
    }
}

runTest()
