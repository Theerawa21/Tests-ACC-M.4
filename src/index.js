import { QUESTIONS, gradeAnswers } from './quiz.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function questionCards() {
  return QUESTIONS.map((q) => `
    <article class="question-card" id="question-${q.id}" data-question-id="${q.id}">
      <div class="question-number">${q.id}</div>
      <div class="question-main">
        <h3>${escapeHtml(q.text)}</h3>
        <div class="choice-row" role="radiogroup" aria-label="คำถามข้อ ${q.id}">
          <label class="choice">
            <input type="radio" name="q${q.id}" value="trade">
            <span class="choice-dot" aria-hidden="true"></span>
            <span>เป็นรายการค้า</span>
          </label>
          <label class="choice">
            <input type="radio" name="q${q.id}" value="nontrade">
            <span class="choice-dot" aria-hidden="true"></span>
            <span>ไม่เป็นรายการค้า</span>
          </label>
        </div>
        <div class="feedback" id="feedback-${q.id}" hidden></div>
      </div>
    </article>`).join('');
}

function renderPage() {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#111111">
  <title>ใบงานออนไลน์ | รายการค้าและรายการที่ไม่ใช่รายการค้า</title>
  <style>
    * { box-sizing: border-box; }
    :root { --ink:#111; --muted:#666; --line:#d7d7d7; --paper:#fff; --soft:#f4f4f4; }
    body { margin:0; background:#ececec; color:var(--ink); font-family:"Sarabun","Noto Sans Thai",Tahoma,Arial,sans-serif; line-height:1.55; }
    button,input,select { font:inherit; }
    .sheet { width:min(1080px, calc(100% - 24px)); margin:24px auto 56px; background:var(--paper); border:2px solid var(--ink); box-shadow:0 14px 36px rgba(0,0,0,.10); }
    .topbar { display:flex; justify-content:space-between; gap:16px; padding:12px 24px; border-bottom:1px solid var(--ink); font-size:.92rem; }
    .hero { padding:34px 28px 26px; text-align:center; border-bottom:2px solid var(--ink); }
    .eyebrow { display:inline-block; padding:5px 14px; border:1px solid var(--ink); border-radius:999px; font-weight:700; font-size:.88rem; margin-bottom:12px; }
    h1 { margin:0; font-size:clamp(1.8rem, 4vw, 3rem); line-height:1.2; }
    .subtitle { margin:8px 0 0; color:#333; font-size:1.06rem; }
    .content { padding:26px; }
    .section-title { display:flex; align-items:center; gap:10px; margin:0 0 16px; font-size:1.28rem; }
    .section-title span { display:grid; place-items:center; width:34px; height:34px; background:#111; color:white; border-radius:50%; font-weight:800; }
    .student-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; margin-bottom:26px; }
    .field label { display:block; font-weight:700; margin-bottom:5px; }
    .field input,.field select { width:100%; border:1.5px solid #111; border-radius:8px; padding:11px 12px; background:white; outline:none; }
    .field input:focus,.field select:focus { box-shadow:0 0 0 3px #ddd; }
    .concept { border:1.5px solid #111; padding:18px; margin-bottom:26px; background:#fafafa; }
    .concept > strong { display:block; margin-bottom:14px; font-size:1.06rem; }
    .flow { display:grid; grid-template-columns:1fr auto 1fr auto 1fr; gap:10px; align-items:center; }
    .flow-box { min-height:90px; display:grid; place-items:center; text-align:center; padding:12px; border:1.5px solid #111; border-radius:12px; background:#fff; font-weight:700; }
    .arrow { font-size:1.8rem; font-weight:900; }
    .mini-note { margin:12px 0 0; color:#444; font-size:.93rem; }
    .instructions { margin:0 0 20px; padding:14px 16px; border-left:5px solid #111; background:#f3f3f3; }
    .questions { display:grid; gap:12px; }
    .question-card { display:grid; grid-template-columns:48px 1fr; gap:14px; border:1.5px solid #111; border-radius:12px; padding:16px; transition:.2s ease; }
    .question-card.correct { box-shadow:inset 5px 0 0 #111; }
    .question-card.incorrect { background:#f1f1f1; border-style:dashed; }
    .question-number { width:42px; height:42px; display:grid; place-items:center; border-radius:50%; background:#111; color:#fff; font-weight:800; font-size:1.1rem; }
    .question-main h3 { margin:2px 0 12px; font-size:1.05rem; }
    .choice-row { display:flex; flex-wrap:wrap; gap:10px; }
    .choice { display:flex; align-items:center; gap:9px; padding:9px 14px; border:1px solid #aaa; border-radius:999px; cursor:pointer; user-select:none; }
    .choice:has(input:checked) { border-color:#111; background:#111; color:#fff; }
    .choice input { position:absolute; opacity:0; pointer-events:none; }
    .choice-dot { width:16px; height:16px; border:2px solid currentColor; border-radius:50%; display:inline-block; position:relative; }
    .choice:has(input:checked) .choice-dot::after { content:""; position:absolute; inset:3px; border-radius:50%; background:currentColor; }
    .feedback { margin-top:12px; padding-top:10px; border-top:1px dashed #999; font-size:.93rem; }
    .feedback strong { display:inline-block; margin-right:4px; }
    .actions { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin:26px 0 8px; }
    .btn { border:2px solid #111; padding:11px 20px; border-radius:10px; font-weight:800; cursor:pointer; background:#fff; color:#111; }
    .btn.primary { background:#111; color:#fff; }
    .btn:hover { transform:translateY(-1px); }
    .btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
    .error-box { margin:18px 0; padding:12px 15px; border:2px solid #111; background:#efefef; font-weight:700; }
    .result { margin-top:24px; border:2px solid #111; border-radius:16px; overflow:hidden; }
    .result-head { display:grid; grid-template-columns:auto 1fr; gap:18px; align-items:center; padding:20px; background:#111; color:#fff; }
    .score-circle { width:92px; height:92px; display:grid; place-items:center; border:3px solid #fff; border-radius:50%; font-size:1.55rem; font-weight:900; }
    .result-head h2 { margin:0; font-size:1.55rem; }
    .result-head p { margin:4px 0 0; }
    .result-body { padding:18px 20px; }
    .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
    .summary-item { text-align:center; padding:12px; border:1px solid #aaa; border-radius:10px; }
    .summary-item b { display:block; font-size:1.35rem; }
    footer { padding:18px 24px; border-top:1px solid #111; text-align:center; color:#555; font-size:.88rem; }
    @media (max-width:760px) {
      .sheet { width:100%; margin:0; border-left:0; border-right:0; box-shadow:none; }
      .topbar { padding:10px 16px; flex-direction:column; gap:2px; }
      .hero { padding:26px 18px 22px; }
      .content { padding:18px 14px; }
      .student-grid { grid-template-columns:1fr; }
      .flow { grid-template-columns:1fr; }
      .arrow { transform:rotate(90deg); text-align:center; }
      .question-card { grid-template-columns:38px 1fr; padding:13px; gap:10px; }
      .question-number { width:36px; height:36px; }
      .choice-row { flex-direction:column; }
      .choice { border-radius:9px; }
      .result-head { grid-template-columns:1fr; text-align:center; justify-items:center; }
      .summary-grid { grid-template-columns:1fr; }
    }
    @media print {
      body { background:white; }
      .sheet { width:100%; margin:0; border:0; box-shadow:none; }
      .actions,.result,.feedback { display:none !important; }
      .question-card { break-inside:avoid; }
      .choice:has(input:checked) { color:#111; background:#fff; border:2px solid #111; }
      .choice:has(input:checked)::after { content:" ✓"; font-weight:900; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <div class="topbar">
      <strong>โรงเรียนเซนต์เทเรซา</strong>
      <span>วิชาการบัญชีเบื้องต้น · ชั้นมัธยมศึกษาปีที่ 4</span>
    </div>

    <header class="hero">
      <div class="eyebrow">ONLINE WORKSHEET</div>
      <h1>รายการค้าและรายการที่ไม่ใช่รายการค้า</h1>
      <p class="subtitle">ฝึกวิเคราะห์เหตุการณ์ก่อนเข้าสู่สมการบัญชีและการบันทึกรายการ</p>
    </header>

    <div class="content">
      <h2 class="section-title"><span>1</span> ข้อมูลนักเรียน</h2>
      <section class="student-grid" aria-label="ข้อมูลนักเรียน">
        <div class="field">
          <label for="studentName">ชื่อ–นามสกุล</label>
          <input id="studentName" autocomplete="name" placeholder="กรอกชื่อ–นามสกุล" required>
        </div>
        <div class="field">
          <label for="studentClass">ชั้น</label>
          <select id="studentClass" required>
            <option value="">เลือกห้อง</option>
            <option>ม.4/1</option><option>ม.4/2</option><option>ม.4/3</option><option>ม.4/4</option><option>ม.4/5</option>
          </select>
        </div>
        <div class="field">
          <label for="studentNo">เลขที่</label>
          <input id="studentNo" inputmode="numeric" min="1" max="60" type="number" placeholder="เช่น 12" required>
        </div>
      </section>

      <h2 class="section-title"><span>2</span> หลักคิดก่อนทำ</h2>
      <section class="concept">
        <strong>ลองถามตัวเองตามเส้นทางนี้ก่อนเลือกคำตอบ</strong>
        <div class="flow" aria-label="หลักการพิจารณารายการค้า">
          <div class="flow-box">เหตุการณ์นี้<br>มีมูลค่าเป็นเงินหรือไม่?</div>
          <div class="arrow">→</div>
          <div class="flow-box">ทำให้สินทรัพย์ หนี้สิน ทุน<br>รายได้ หรือค่าใช้จ่ายเปลี่ยนหรือไม่?</div>
          <div class="arrow">→</div>
          <div class="flow-box">ใช่ = รายการค้า<br>ยังไม่กระทบบัญชี = ไม่เป็นรายการค้า</div>
        </div>
        <p class="mini-note"><strong>จำง่าย:</strong> มีมูลค่าเป็นเงิน + ทำให้บัญชีเปลี่ยนแปลง = รายการค้า</p>
      </section>

      <h2 class="section-title"><span>3</span> ทำใบงาน</h2>
      <p class="instructions"><strong>คำชี้แจง:</strong> พิจารณาเหตุการณ์แต่ละข้อ แล้วเลือกเพียง 1 คำตอบว่า “เป็นรายการค้า” หรือ “ไม่เป็นรายการค้า” จากนั้นกดตรวจคำตอบ</p>

      <form id="worksheetForm" novalidate>
        <section class="questions">${questionCards()}</section>
        <div id="formError" class="error-box" hidden></div>
        <div class="actions">
          <button class="btn primary" id="submitBtn" type="submit">ตรวจคำตอบและดูคะแนน</button>
          <button class="btn" type="button" id="resetBtn">เริ่มทำใหม่</button>
          <button class="btn" type="button" id="printBtn">พิมพ์ใบงาน</button>
        </div>
      </form>

      <section id="result" class="result" hidden aria-live="polite">
        <div class="result-head">
          <div class="score-circle" id="scoreCircle">0/10</div>
          <div>
            <h2 id="resultTitle">ผลการทำใบงาน</h2>
            <p id="resultMessage"></p>
          </div>
        </div>
        <div class="result-body">
          <div class="summary-grid">
            <div class="summary-item"><span>คะแนน</span><b id="summaryScore">0/10</b></div>
            <div class="summary-item"><span>ร้อยละ</span><b id="summaryPercent">0%</b></div>
            <div class="summary-item"><span>ผล</span><b id="summaryStatus">-</b></div>
          </div>
        </div>
      </section>
    </div>

    <footer>ใบงานออนไลน์ · วิชาการบัญชีเบื้องต้น · Cloudflare Workers</footer>
  </main>

  <script>
    const form = document.getElementById('worksheetForm');
    const errorBox = document.getElementById('formError');
    const resultBox = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');

    function showError(message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearFeedback() {
      errorBox.hidden = true;
      resultBox.hidden = true;
      document.querySelectorAll('.question-card').forEach((card) => card.classList.remove('correct','incorrect'));
      document.querySelectorAll('.feedback').forEach((node) => { node.hidden = true; node.textContent = ''; });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFeedback();

      const name = document.getElementById('studentName').value.trim();
      const studentClass = document.getElementById('studentClass').value;
      const studentNo = document.getElementById('studentNo').value.trim();
      if (!name || !studentClass || !studentNo) {
        showError('กรุณากรอกชื่อ–นามสกุล ชั้น และเลขที่ให้ครบก่อนส่งคำตอบ');
        return;
      }

      const answers = {};
      for (let i = 1; i <= ${QUESTIONS.length}; i++) {
        const selected = form.querySelector('input[name="q' + i + '"]:checked');
        if (selected) answers[String(i)] = selected.value;
      }
      if (Object.keys(answers).length !== ${QUESTIONS.length}) {
        showError('กรุณาตอบคำถามให้ครบทั้ง ${QUESTIONS.length} ข้อ');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังตรวจคำตอบ...';
      try {
        const response = await fetch('/api/check', {
          method: 'POST',
          headers: { 'content-type':'application/json' },
          body: JSON.stringify({ answers })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'ไม่สามารถตรวจคำตอบได้');

        data.details.forEach((item) => {
          const card = document.getElementById('question-' + item.id);
          const feedback = document.getElementById('feedback-' + item.id);
          card.classList.add(item.correct ? 'correct' : 'incorrect');
          const correctLabel = item.correctAnswer === 'trade' ? 'เป็นรายการค้า' : 'ไม่เป็นรายการค้า';
          feedback.innerHTML = '<strong>' + (item.correct ? '✓ ถูกต้อง' : '✕ คำตอบที่ถูก: ' + correctLabel) + '</strong> — ' + item.explanation;
          feedback.hidden = false;
        });

        document.getElementById('scoreCircle').textContent = data.score + '/' + data.total;
        document.getElementById('summaryScore').textContent = data.score + '/' + data.total;
        document.getElementById('summaryPercent').textContent = data.percentage + '%';
        document.getElementById('summaryStatus').textContent = data.passed ? 'ผ่าน' : 'ควรทบทวน';
        document.getElementById('resultTitle').textContent = data.passed ? 'ผ่านเกณฑ์ 70%' : 'ทบทวนแล้วลองอีกครั้ง';
        document.getElementById('resultMessage').textContent = name + ' · ' + studentClass + ' เลขที่ ' + studentNo + ' ได้ ' + data.score + ' คะแนน จาก ' + data.total + ' คะแนน';
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior:'smooth', block:'start' });
      } catch (error) {
        showError(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ตรวจคำตอบและดูคะแนน';
      }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      form.reset();
      clearFeedback();
      window.scrollTo({ top:0, behavior:'smooth' });
    });
    document.getElementById('printBtn').addEventListener('click', () => window.print());
  </script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(renderPage(), {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/check') {
      try {
        const body = await request.json();
        return json(gradeAnswers(body.answers));
      } catch (error) {
        return json({ error: error?.message || 'ข้อมูลไม่ถูกต้อง' }, 400);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
