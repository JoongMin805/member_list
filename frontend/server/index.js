import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import memberRoutes from './routes/members.js';
import scheduleRoutes from './routes/schedule.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
// CORS 설정 - 모든 출처에서 접근 허용 (개발 환경)
app.use(cors({
  origin: true, // 모든 출처 허용
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/members', memberRoutes);
app.use('/api/schedules', scheduleRoutes);

// MongoDB 연결
// 참고: MongoDB Atlas 연결 문자열 형식은 mongodb+srv://username:password@cluster.mongodb.net/databaseName
// /Members/member 형식은 올바르지 않습니다. 데이터베이스 이름만 지정하세요 (예: /member 또는 /Members)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aitestjm805_db_user:T7yNoB69PnsqJzQz@jm.kvjnffb.mongodb.net/member';

console.log('🔄 MongoDB 연결 시도 중...');
console.log('📍 연결 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // 비밀번호 숨김

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    console.log('📊 데이터베이스:', mongoose.connection.db.databaseName);
    console.log('🔌 연결 상태:', mongoose.connection.readyState === 1 ? '연결됨' : '연결 안됨');
  })
  .catch((error) => {
    console.error('❌ MongoDB 연결 실패:');
    console.error('   오류 메시지:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('   서버 오류 코드:', error.code);
    }
    process.exit(1);
  });

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose가 MongoDB에 연결되었습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose 연결이 끊어졌습니다.');
});

// 프로세스 종료 시 MongoDB 연결 종료
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB 연결이 종료되었습니다.');
  process.exit(0);
});

// 라우트
app.use('/api/members', memberRoutes);
app.use('/api/schedules', scheduleRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '회원 관리 API 서버가 실행 중입니다.' });
});

// 서버 시작 - 모든 네트워크 인터페이스에서 접근 가능하도록 설정
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📱 모바일 접근: 같은 네트워크의 기기에서 접근 가능합니다.`);
  console.log(`   컴퓨터의 로컬 IP 주소를 확인하여 사용하세요.`);
});
