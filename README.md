# Tests-ACC-M.4 — ใบงานออนไลน์วิชาการบัญชีเบื้องต้น

เว็บใบงานออนไลน์เรื่อง **รายการค้าและรายการที่ไม่ใช่รายการค้า** สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 4 สร้างด้วย Cloudflare Workers

## ความสามารถ

- หน้าใบงานโทนขาว–ดำ รองรับมือถือ แท็บเล็ต และคอมพิวเตอร์
- กรอกชื่อ–นามสกุล ชั้น และเลขที่
- คำถาม 10 ข้อ แบบเลือก “เป็นรายการค้า / ไม่เป็นรายการค้า”
- ตรวจคำตอบผ่าน API ของ Cloudflare Worker
- แสดงคะแนน ร้อยละ ผลผ่านเกณฑ์ 70% และคำอธิบายรายข้อ
- ปุ่มเริ่มทำใหม่และพิมพ์ใบงาน

## พัฒนาในเครื่อง

```bash
npm install
npm test
npm run dev
```

เปิด URL ที่ Wrangler แสดงใน Terminal

## Deploy ไป Cloudflare Workers

1. ติดตั้ง dependencies

```bash
npm install
```

2. Login Cloudflare

```bash
npx wrangler login
```

3. Deploy

```bash
npm run deploy
```

จากนั้น Wrangler จะแสดง URL `*.workers.dev` สำหรับเปิดใช้งานจริง

## โครงสร้าง

- `src/index.js` — Cloudflare Worker, หน้า HTML และ `/api/check`
- `src/quiz.js` — ข้อคำถาม เฉลย และฟังก์ชันตรวจคะแนน
- `test/quiz.test.js` — ทดสอบข้อมูลคำถามและการให้คะแนน
- `test/worker.test.js` — ทดสอบ routes ของ Worker
- `wrangler.jsonc` — การตั้งค่า Cloudflare Workers

> เวอร์ชันนี้ยังไม่บันทึกผลนักเรียนลงฐานข้อมูล เพื่อให้ deploy ได้ทันทีโดยไม่ต้องตั้งค่า D1 ก่อน หากต้องการเก็บผลและหน้าครู สามารถเพิ่ม Cloudflare D1 ภายหลังได้
