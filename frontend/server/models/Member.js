import mongoose from 'mongoose'

const MemberSchema = new mongoose.Schema({
  member_name: String,
  participation: String,
  birth: String,
  month: Object,
  regist_date: String,
  manage: String,
  attend: String,
  new_check: String
}, { timestamps: true })

export default mongoose.model('Member', MemberSchema)
