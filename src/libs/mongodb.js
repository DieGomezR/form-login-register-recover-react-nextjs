import mongoose from "mongoose";

const MONGO_URL =
  "mongodb+srv://dimaoxd:K5VX7LnDXHIsYqfb@project-build-bips.ap69o7a.mongodb.net/react-bips";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
