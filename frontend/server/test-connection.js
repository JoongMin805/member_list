// MongoDB 연결 테스트 스크립트
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aitestjm805_db_user:T7yNoB69PnsqJzQz@jm.kvjnffb.mongodb.net/Members/member';

console.log('🔄 MongoDB 연결 테스트 시작...');
console.log('📍 연결 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('\n✅ MongoDB 연결 성공!\n');
    
    // 연결 정보 출력
    const db = mongoose.connection.db;
    console.log('📊 데이터베이스 이름:', db.databaseName);
    console.log('🔌 연결 상태:', mongoose.connection.readyState === 1 ? '연결됨' : '연결 안됨');
    console.log('🏠 호스트:', mongoose.connection.host);
    console.log('🔢 포트:', mongoose.connection.port);
    
    // 컬렉션 목록 확인
    try {
      const collections = await db.listCollections().toArray();
      console.log('\n📁 컬렉션 목록:');
      if (collections.length === 0) {
        console.log('   (컬렉션이 없습니다)');
      } else {
        collections.forEach(col => {
          console.log(`   - ${col.name}`);
        });
      }
    } catch (err) {
      console.log('   컬렉션 목록을 가져올 수 없습니다.');
    }
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('\n✅ 테스트 완료! 연결이 정상적으로 종료되었습니다.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ MongoDB 연결 실패!\n');
    console.error('오류 상세:');
    console.error('   이름:', error.name);
    console.error('   메시지:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('   서버 오류 코드:', error.code);
    }
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n💡 가능한 원인:');
      console.error('   - MongoDB 서버가 실행 중이 아닙니다');
      console.error('   - 네트워크 연결 문제');
      console.error('   - 잘못된 연결 문자열');
      console.error('   - 방화벽 또는 IP 화이트리스트 설정');
    }
    
    process.exit(1);
  });
