export const QUESTIONS = [
  {
    id: 1,
    text: 'เจ้าของนำเงินสด 50,000 บาท มาลงทุนในกิจการ',
    answer: 'trade',
    explanation: 'เงินสดและทุนเพิ่มขึ้น จึงมีผลต่อบัญชีของกิจการ'
  },
  {
    id: 2,
    text: 'ซื้ออุปกรณ์สำนักงานเป็นเงินสด 8,000 บาท',
    answer: 'trade',
    explanation: 'อุปกรณ์เพิ่มขึ้นและเงินสดลดลง จึงเป็นรายการค้า'
  },
  {
    id: 3,
    text: 'ลูกค้าเข้ามาสอบถามราคาสินค้า',
    answer: 'nontrade',
    explanation: 'ยังไม่มีการซื้อขายและยังไม่มีบัญชีใดเปลี่ยนแปลง'
  },
  {
    id: 4,
    text: 'โทรสอบถามราคาคอมพิวเตอร์จากร้านค้า',
    answer: 'nontrade',
    explanation: 'เป็นเพียงการสอบถามราคา ยังไม่เกิดรายการทางการเงิน'
  },
  {
    id: 5,
    text: 'จ่ายค่าไฟฟ้า 2,500 บาท',
    answer: 'trade',
    explanation: 'เงินสดลดลงและค่าใช้จ่ายเพิ่มขึ้น จึงมีผลต่อบัญชี'
  },
  {
    id: 6,
    text: 'เจ้าของวางแผนจะซื้อรถส่งของในเดือนหน้า',
    answer: 'nontrade',
    explanation: 'เป็นเพียงแผน ยังไม่มีสินทรัพย์ หนี้สิน รายได้ หรือค่าใช้จ่ายเปลี่ยนแปลง'
  },
  {
    id: 7,
    text: 'ขายสินค้าเป็นเงินเชื่อ 12,000 บาท',
    answer: 'trade',
    explanation: 'ลูกหนี้และรายได้เพิ่มขึ้น จึงมีผลต่อบัญชี'
  },
  {
    id: 8,
    text: 'พนักงานจัดสินค้าเข้าชั้นวาง',
    answer: 'nontrade',
    explanation: 'เป็นกิจกรรมดำเนินงานทั่วไปที่ยังไม่ทำให้บัญชีเปลี่ยนแปลง'
  },
  {
    id: 9,
    text: 'รับชำระหนี้จากลูกหนี้ 6,000 บาท',
    answer: 'trade',
    explanation: 'เงินสดเพิ่มขึ้นและลูกหนี้ลดลง จึงเป็นรายการค้า'
  },
  {
    id: 10,
    text: 'ประชุมวางแผนเพิ่มยอดขายของกิจการ',
    answer: 'nontrade',
    explanation: 'การประชุมวางแผนยังไม่ก่อให้เกิดการเปลี่ยนแปลงทางบัญชี'
  }
];

export function gradeAnswers(answers) {
  if (!answers || typeof answers !== 'object') {
    throw new Error('ตอบคำถามให้ครบทุกข้อ');
  }

  const missing = QUESTIONS.filter((q) => !['trade', 'nontrade'].includes(answers[String(q.id)]));
  if (missing.length > 0) {
    throw new Error('ตอบคำถามให้ครบทุกข้อ');
  }

  const details = QUESTIONS.map((q) => {
    const selected = answers[String(q.id)];
    return {
      id: q.id,
      correct: selected === q.answer,
      selected,
      correctAnswer: q.answer,
      explanation: q.explanation
    };
  });

  const score = details.filter((item) => item.correct).length;
  const total = QUESTIONS.length;
  const percentage = Math.round((score / total) * 100);

  return {
    score,
    total,
    percentage,
    passed: percentage >= 70,
    details
  };
}
