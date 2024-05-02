const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const WorksiteSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  // 현장명
  name: {
    type: String,
    required: true,
  },
  // 현장 상세 주소
  address: {
    type: String,
    required: true,
  },
  // 현장 소재지
  local: {
    type: String,
    required: true,
  },
  // 급여
  salary: {
    type: String,
    required: true,
  },
  // 업종
  worktype: {
    type: String,
    required: true,
  },
  // 날짜
  date: {
    type: Date,
    required: true,
  },
  // 끝나는 시간
  end: {
    type: Date,
    required: true,
  },
  //필요한 인원 (number of people required)
  nopr: {
    type: Number,
    required: true,
  },
  //채용 확정된 인원 (a fixed number of people to be hired{nopr과 유사성을 위해 noph로 설정}) 
  noph: {
    type: Number,
    required: false,
  },
  //현장 내용 예. 5시간 작업 예상, 경력자 필수 등
  worksitenote: {
    type: String,
    required: false,
  },
  // 최초 작성일
  createdAt: {
    type: Date,
    default: Date.now()
  },
  // 최근 수정일
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Worksite', WorksiteSchema);