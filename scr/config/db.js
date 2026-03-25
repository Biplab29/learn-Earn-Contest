import mongoose from "mongoose";



// export const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URL);
//         console.log("MongoDB connected successfully");
//     } catch (error) {
//         console.log("Error from connect to database", error);
//     }
// };


export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

  } catch (error) {
    console.log("DB ERROR:", error.message);
    process.exit(1);
  }
};