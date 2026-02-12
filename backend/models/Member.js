import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    member_name: { type: String, required: true },
    month: {type: Object},
    regist_date: { type: String },
    birth: { type: String },
    new_check: { type: String },
    manage: { type: String },  // 'Y' / ''
    gender: { type: String },
    addr: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
