import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    date: { type: String }
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String },
    participants: { type: [ParticipantSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Schedule", scheduleSchema);