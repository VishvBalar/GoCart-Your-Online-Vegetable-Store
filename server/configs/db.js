import mongoose from "mongoose";

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log("Error in DB connection", error.message); 
    }
};

export default connectDB;