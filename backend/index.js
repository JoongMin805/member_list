import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import Member from "./models/Member.js";
import Schedule from "./models/Schedule.js";

dotenv.config();

const app = express();
connectDB();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://joongmin805.github.io'
    ];

    // 브라우저가 아닌 요청 (Postman 등)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 차단됨'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ⭐ preflight 요청 명시적으로 허용
app.options('*', cors());

app.use(express.json());

/* =========================
   API
========================= */

// 전체 조회
app.get("/api/members", async (req, res) => {
  const members = await Member.find().sort({ createdAt: -1 });
  res.json({ success: true, data: members });
});

// 단건 조회 (⭐ 이거 추가)
app.get("/api/members/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: "회원 없음" });
    }

    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: "잘못된 ID" });
  }
});

// 추가
app.post("/api/members", async (req, res) => {
  console.log("서버 도착 데이터:", req.body);

  try {
    const member = new Member(req.body);
    console.log("🟡 save 직전:", member);

    await member.save();
    console.log("🟢 save 완료:", member);

    res.json({ success: true, data: member });
  } catch (err) {
    console.error("❌ 저장 실패:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 수정
app.put("/api/members/:id", async (req, res) => {
  await Member.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

// 삭제
app.delete("/api/members/:id", async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 🔥 참여 횟수 전체 초기화
app.post("/api/members/init-participation", async (req, res) => {
  try {
    const result = await Member.updateMany(
      {},
      { $set: { participation: 0 } }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ participation 초기화 실패:", err);
    res.status(500).json({
      success: false,
      message: "participation 초기화 실패",
    });
  }
});

// 모임 목록 조회
app.get("/api/schedules", async (_req, res) => {
  const lists = await Schedule.find().sort({ createdAt: -1 });
  res.json({ success: true, data: lists });
});

// 모임 단건 조회
app.get("/api/schedules/:id", async (req, res) => {
  try {
    const item = await Schedule.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "모임 없음" });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: "잘못된 ID" });
  }
});

// 모임 생성
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, date, participants } = req.body;
    const item = new Schedule({ title, date, participants });
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("❌ 모임 저장 실패:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 모임 수정
app.put("/api/schedules/:id", async (req, res) => {
  try {
    const { title, date, participants } = req.body;
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      { title, date, participants },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "모임 없음" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 모임 삭제
app.delete("/api/schedules/:id", async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "모임 없음" });
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
