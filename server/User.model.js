import { Schema, model } from "mongoose";

// Define a user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required!"],
  },
  password: {
    type: String,
    required: [true, "Email is required!"],
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});

// Create a User model based on the schema
const User = model("User", userSchema);

export default User;
