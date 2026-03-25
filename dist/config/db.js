import mongoose from "mongoose";
export async function connectDB(config) {
    try {
        const response = await mongoose.connect(config.url, {
            dbName: config.dbName,
        });
        if (response) {
            console.log("Connected with MongoDB 🛢️");
        }
    }
    catch (error) {
        console.log("Failed to connect with MongoDB", error);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map