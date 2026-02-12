import express from 'express'
import Schedule from '../models/Schedule.js'

const router = express.Router()

// 목록 조회
router.get('/', async (_req, res) => {
  try {
    const lists = await Schedule.find().sort({ createdAt: -1 })
    res.json({ success: true, data: lists })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 단건 조회
router.get('/:id', async (req, res) => {
  try {
    const item = await Schedule.findById(req.params.id)
    if (!item) return res.status(404).json({ success: false, message: '모임 없음' })
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 생성
router.post('/', async (req, res) => {
  try {
    const { title, date, participants } = req.body
    const item = new Schedule({ title, date, participants })
    const saved = await item.save()
    res.status(201).json({ success: true, data: saved })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 수정
router.put('/:id', async (req, res) => {
  try {
    const { title, date, participants } = req.body
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      { title, date, participants },
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ success: false, message: '모임 없음' })
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: '모임 없음' })
    res.json({ success: true, data: deleted })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
