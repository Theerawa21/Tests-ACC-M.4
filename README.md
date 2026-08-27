# Tests-ACC-M.4 — ใบงานรายการค้าและรายการที่ไม่ใช่รายการค้า

ใบงานออนไลน์สำหรับนักเรียน ม.4 ใช้งานบนโทรศัพท์เป็นหลัก ตรวจคะแนนด้วย Cloudflare Worker และบันทึกผลลง Google Sheet `รายการค้าและไม่ใช่รายการค้า` แท็บ `ผลการทำใบงาน`.

## โครงสร้าง

- `src/index.js` หน้าเว็บ + API `/api/check` และ `/api/submit`
- `src/quiz.js` คำถาม เฉลย และการคำนวณคะแนน
- `src/storage.js` ส่งผลการทำใบงานไปยัง Google Apps Script webhook
- `apps-script/Code.gs` webhook สำหรับ append ข้อมูลลง Google Sheet
- `test/` ชุดทดสอบ Node

## 1) ติดตั้งและทดสอบ

```bash
npm install
npm test
```

## 2) สร้าง Google Apps Script Web App

1. เปิด Google Sheet `รายการค้าและไม่ใช่รายการค้า`
2. ไปที่ **ส่วนขยาย → Apps Script**
3. แทนที่โค้ดใน `Code.gs` ด้วยไฟล์ `apps-script/Code.gs` จาก repo นี้
4. ถ้าต้องการเพิ่มการป้องกัน ให้ไปที่ **Project Settings → Script Properties** แล้วเพิ่ม `WEBHOOK_TOKEN` เป็นรหัสลับที่ต้องการ
5. เลือก **Deploy → New deployment → Web app**
6. Execute as: **Me**
7. Who has access: **Anyone**
8. Deploy แล้วคัดลอก Web app URL

## 3) ตั้งค่า Cloudflare Worker

เก็บ URL เป็น secret เพื่อไม่ให้ webhook URL อยู่ใน source code:

```bash
npx wrangler secret put SHEET_WEBHOOK_URL
```

วาง URL ที่ได้จาก Google Apps Script

ถ้าตั้ง `WEBHOOK_TOKEN` ใน Apps Script ให้ตั้งค่าเดียวกันใน Worker:

```bash
npx wrangler secret put SHEET_WEBHOOK_TOKEN
```

## 4) Deploy

```bash
npm run deploy
```

ระบบจะตรวจคะแนนก่อน แล้ว append ข้อมูล 18 คอลัมน์ลงชีต: วันเวลา, ชื่อ–นามสกุล, ชั้น, เลขที่, คะแนน, คะแนนเต็ม, ร้อยละ, ผล และคำตอบข้อ 1–10.
