import { Schema, model } from "mongoose";

// Define a user schema
const statsSchema = new Schema(
  {
    count: {
      type: Number,
      required: [true, "Count is required!"],
    },
    isSuccess: {
      type: Boolean,
      required: [true, "isSuccess is required!"],
      default: true,
    },
  },
  { timestamps: true }
);

// Create a User model based on the schema
const Stats = model("Stats", statsSchema);

export default Stats;
