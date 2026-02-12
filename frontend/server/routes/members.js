import express from 'express'
import Member from '../models/Member.js'

const router = express.Router()

// 모든 회원 조회
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 })
    res.json({ success: true, data: members })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 특정 회원 조회
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
    if (!member) return res.status(404).json({ success: false, message: '회원 없음' })
    res.json({ success: true, data: member })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 회원 추가
router.post('/', async (req, res) => {
  try {
    const { member_name, month, participation, birth, regist_date, manage, attend, new_check } = req.body
    const member = new Member({ member_name, month, participation, birth, regist_date, manage, attend, new_check })
    const saved = await member.save()
    res.status(201).json({ success: true, data: saved })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 회원 수정
router.put('/:id', async (req, res) => {
  try {
    const { member_name, month, participation, birth, regist_date, manage, attend, new_check } = req.body
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      { member_name, month, participation, birth, regist_date, manage, attend, new_check },
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ success: false, message: '회원 없음' })
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 회원 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: '회원 없음' })
    res.json({ success: true, data: deleted })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
