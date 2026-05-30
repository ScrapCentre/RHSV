import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface MongooseCache {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

declare global {
    var mongoose: MongooseCache
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 30000,
            heartbeatFrequencyMS: 10000,
        }

        console.log("[DB] Connecting to MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("[DB] Connection Established");
            return mongoose
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        console.error("[DB] Connection Failed:", e);
        cached.promise = null
        throw e
    }

    return cached.conn
}

export default connectToDatabase

