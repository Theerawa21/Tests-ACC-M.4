# Tests-ACC-M.4 — ใบงานรายการค้าและรายการที่ไม่ใช่รายการค้า

ระบบนี้ใช้เพียง **GitHub Pages + Google Sheet** เท่านั้น ไม่มี Cloudflare Workers

- หน้าเว็บ: GitHub Pages
- ฐานข้อมูลนักเรียนและผลการทำใบงาน: Google Sheet `รายการค้าและไม่ใช่รายการค้า`
- ตัวเชื่อมระหว่าง GitHub กับ Google Sheet: Google Apps Script ที่ผูกกับชีต
- แบบฝึกหัด: 20 ข้อ
- เกณฑ์ผ่าน: 70%

## โครงสร้าง

- `index.html` หน้าเว็บสำหรับนักเรียน รองรับมือถือ
- `src/quiz.js` คำถาม 20 ข้อ เฉลย และการคำนวณคะแนน
- `apps-script/Code.gs` อ่านรายชื่อนักเรียน ตรวจคะแนนซ้ำ และบันทึกผลลง Google Sheet
- `test/` ชุดทดสอบ

## 1. Deploy Google Apps Script

1. เปิด Google Sheet `รายการค้าและไม่ใช่รายการค้า`
2. เลือก **ส่วนขยาย → Apps Script**
3. นำโค้ดจาก `apps-script/Code.gs` ไปแทนที่ใน `Code.gs`
4. เลือก **Deploy → New deployment → Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. กด Deploy แล้วคัดลอก URL ที่ลงท้ายด้วย `/exec`

## 2. เชื่อม GitHub Pages กับ Google Sheet

เปิด `index.html` แล้วเปลี่ยนบรรทัดนี้

```js
const APP_SCRIPT_URL = 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

เป็น URL ของ Apps Script เช่น

```js
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec';
```

Commit ลง `main` แล้ว GitHub Pages จะ deploy หน้าเว็บให้อัตโนมัติ

## 3. ลิงก์หน้าเว็บ

`https://theerawa21.github.io/Tests-ACC-M.4/`

## การทำงาน

1. นักเรียนเลือกชั้น
2. หน้าเว็บดึงรายชื่อจากแท็บ `ข้อมูลนักเรียน` ใน Google Sheet
3. นักเรียนเลือกชื่อและทำแบบฝึกหัด 20 ข้อ
4. เมื่อกดส่ง ระบบคำนวณคะแนนและส่งข้อมูลไป Apps Script โดยตรง
5. Apps Script ตรวจรายชื่อนักเรียนและตรวจคะแนนซ้ำ
6. ผลถูกเพิ่มเป็นแถวใหม่ในแท็บ `ผลการทำใบงาน`

Google Sheet ฝั่งผลมี 28 คอลัมน์: วันเวลา, ชื่อ–นามสกุล, ชั้น, เลขที่, คะแนน, คะแนนเต็ม, ร้อยละ, ผล และคำตอบข้อ 1–20

## ทดสอบ

```bash
npm test
```
