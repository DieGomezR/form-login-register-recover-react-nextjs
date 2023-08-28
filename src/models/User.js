import mongoose, { Schema } from "mongoose";

const IUser = new Schema(
  {
    id: mongoose.ObjectId,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", IUser);
export default User;
