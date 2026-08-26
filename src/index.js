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
      <div class="question-row">
        <div class="question-number" aria-hidden="true">${q.id}</div>
        <h3>${escapeHtml(q.text)}</h3>
      </div>
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
    </article>`).join('');
}

function renderPage() {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#111111">
  <title>ใบงานออนไลน์ | รายการค้าและรายการที่ไม่ใช่รายการค้า</title>
  <style>
    * { box-sizing:border-box; }
    :root { --ink:#111; --muted:#626262; --line:#d6d6d6; --paper:#fff; --soft:#f5f5f5; }
    html { -webkit-text-size-adjust:100%; scroll-behavior:smooth; }
    body { margin:0; background:#fff; color:var(--ink); font-family:"Sarabun","Noto Sans Thai",Tahoma,Arial,sans-serif; line-height:1.5; -webkit-tap-highlight-color:transparent; }
    button,input,select { font:inherit; }
    button,label,select { touch-action:manipulation; }
    .sheet { min-height:100dvh; background:var(--paper); }
    .topbar { display:flex; flex-direction:column; gap:2px; padding:10px 14px; border-bottom:1px solid var(--ink); font-size:.82rem; }
    .topbar span { color:var(--muted); }
    .hero { padding:20px 14px 18px; text-align:center; border-bottom:2px solid var(--ink); }
    .eyebrow { display:inline-block; padding:4px 11px; border:1px solid var(--ink); border-radius:999px; font-size:.76rem; font-weight:800; margin-bottom:9px; }
    h1 { margin:0; font-size:clamp(1.55rem, 8vw, 2.25rem); line-height:1.16; }
    .subtitle { margin:7px auto 0; max-width:42rem; color:#3f3f3f; font-size:.94rem; }
    .mobile-progress { position:sticky; top:0; z-index:30; display:flex; align-items:center; gap:10px; padding:9px 14px; background:rgba(255,255,255,.96); border-bottom:1px solid var(--ink); backdrop-filter:blur(8px); }
    .progress-track { height:7px; flex:1; overflow:hidden; border:1px solid #111; border-radius:999px; background:#fff; }
    .progress-fill { height:100%; width:0; background:#111; transition:width .2s ease; }
    .progress-text { white-space:nowrap; font-size:.82rem; font-weight:800; }
    .content { padding:16px 14px; padding-bottom:calc(92px + env(safe-area-inset-bottom)); }
    .section-title { display:flex; align-items:center; gap:9px; margin:0 0 12px; font-size:1.12rem; }
    .section-title span { display:grid; place-items:center; width:30px; height:30px; flex:0 0 30px; border-radius:50%; background:#111; color:#fff; font-size:.92rem; }
    .student-grid { display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:22px; }
    .field label { display:block; margin-bottom:5px; font-weight:800; font-size:.92rem; }
    .field input,.field select { width:100%; min-height:52px; border:1.5px solid #111; border-radius:10px; padding:12px; background:#fff; outline:none; font-size:16px; }
    .field input:focus,.field select:focus { box-shadow:0 0 0 3px #d9d9d9; }
    .concept { margin:0 0 22px; border:1.5px solid #111; border-radius:12px; background:#fafafa; overflow:hidden; }
    .concept summary { padding:13px 14px; font-weight:800; cursor:pointer; list-style:none; }
    .concept summary::-webkit-details-marker { display:none; }
    .concept summary::after { content:"＋"; float:right; }
    .concept[open] summary::after { content:"−"; }
    .concept-body { padding:0 12px 13px; }
    .flow { display:grid; grid-template-columns:1fr; gap:7px; }
    .flow-box { display:grid; place-items:center; min-height:68px; padding:11px; border:1.5px solid #111; border-radius:10px; background:#fff; text-align:center; font-weight:700; font-size:.9rem; }
    .arrow { text-align:center; font-size:1.25rem; font-weight:900; transform:rotate(90deg); line-height:1; }
    .mini-note { margin:10px 1px 0; font-size:.86rem; color:#444; }
    .instructions { margin:0 0 14px; padding:12px 13px; border-left:5px solid #111; background:#f3f3f3; font-size:.91rem; }
    .questions { display:grid; gap:12px; }
    .question-card { border:1.5px solid #111; border-radius:14px; padding:14px; background:#fff; scroll-margin-top:56px; }
    .question-card.correct { box-shadow:inset 5px 0 0 #111; }
    .question-card.incorrect { background:#f2f2f2; border-style:dashed; }
    .question-row { display:grid; grid-template-columns:36px 1fr; gap:10px; align-items:start; margin-bottom:12px; }
    .question-number { width:36px; height:36px; display:grid; place-items:center; border-radius:50%; background:#111; color:#fff; font-weight:900; }
    .question-row h3 { margin:2px 0 0; font-size:1rem; line-height:1.45; }
    .choice-row { display:grid; grid-template-columns:1fr; gap:8px; }
    .choice { min-height:52px; width:100%; display:flex; align-items:center; gap:10px; padding:11px 13px; border:1.5px solid #9b9b9b; border-radius:11px; cursor:pointer; user-select:none; font-weight:700; }
    .choice:has(input:checked) { border-color:#111; background:#111; color:#fff; }
    .choice input { position:absolute; opacity:0; pointer-events:none; }
    .choice-dot { width:20px; height:20px; flex:0 0 20px; border:2px solid currentColor; border-radius:50%; position:relative; }
    .choice:has(input:checked) .choice-dot::after { content:""; position:absolute; inset:4px; border-radius:50%; background:currentColor; }
    .feedback { margin-top:12px; padding-top:10px; border-top:1px dashed #999; font-size:.9rem; }
    .feedback strong { display:inline-block; margin-right:4px; }
    .error-box { margin:14px 0 0; padding:12px 13px; border:2px solid #111; background:#eee; font-weight:800; font-size:.92rem; }
    .actions { position:sticky; bottom:0; z-index:40; display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:18px -14px -92px; padding:10px 14px calc(10px + env(safe-area-inset-bottom)); border-top:1px solid #111; background:rgba(255,255,255,.97); box-shadow:0 -8px 24px rgba(0,0,0,.08); backdrop-filter:blur(10px); }
    .btn { min-height:52px; border:2px solid #111; padding:10px 12px; border-radius:11px; background:#fff; color:#111; font-weight:900; cursor:pointer; }
    .btn.primary { grid-column:1 / -1; background:#111; color:#fff; }
    .btn:disabled { opacity:.55; cursor:not-allowed; }
    .result { margin-top:22px; border:2px solid #111; border-radius:15px; overflow:hidden; scroll-margin-top:56px; }
    .result-head { display:grid; grid-template-columns:1fr; justify-items:center; gap:12px; padding:18px; background:#111; color:#fff; text-align:center; }
    .score-circle { width:86px; height:86px; display:grid; place-items:center; border:3px solid #fff; border-radius:50%; font-size:1.45rem; font-weight:900; }
    .result-head h2 { margin:0; font-size:1.35rem; }
    .result-head p { margin:4px 0 0; font-size:.92rem; }
    .result-body { padding:14px; }
    .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
    .summary-item { min-width:0; text-align:center; padding:10px 5px; border:1px solid #aaa; border-radius:9px; font-size:.78rem; }
    .summary-item b { display:block; margin-top:3px; font-size:1.05rem; }
    footer { padding:18px 14px calc(18px + env(safe-area-inset-bottom)); border-top:1px solid #111; text-align:center; color:#666; font-size:.78rem; }

    @media (min-width:761px) {
      body { background:#ececec; }
      .sheet { width:min(1080px, calc(100% - 24px)); min-height:auto; margin:24px auto 56px; border:2px solid #111; box-shadow:0 14px 36px rgba(0,0,0,.10); }
      .topbar { flex-direction:row; justify-content:space-between; gap:16px; padding:12px 24px; font-size:.92rem; }
      .hero { padding:34px 28px 26px; }
      .content { padding:26px; }
      .mobile-progress { position:static; padding:10px 26px; }
      .student-grid { grid-template-columns:2fr 1fr 1fr; gap:14px; }
      .concept summary { display:none; }
      .concept-body { padding:18px; }
      .flow { grid-template-columns:1fr auto 1fr auto 1fr; gap:10px; align-items:center; }
      .flow-box { min-height:90px; font-size:1rem; }
      .arrow { transform:none; font-size:1.8rem; }
      .question-card { padding:16px; }
      .question-row { grid-template-columns:42px 1fr; }
      .question-number { width:42px; height:42px; }
      .choice-row { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .choice { border-radius:999px; }
      .actions { position:static; display:flex; justify-content:center; margin:26px 0 8px; padding:0; border:0; background:transparent; box-shadow:none; }
      .btn { min-width:170px; }
      .btn.primary { grid-column:auto; }
      .result-head { grid-template-columns:auto 1fr; justify-items:start; text-align:left; padding:20px; }
      .summary-item { padding:12px; font-size:.9rem; }
      .summary-item b { font-size:1.35rem; }
    }

    @media print {
      body { background:#fff; }
      .sheet { width:100%; margin:0; border:0; box-shadow:none; }
      .mobile-progress,.actions,.result,.feedback { display:none !important; }
      .content { padding-bottom:0; }
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

    <div class="mobile-progress" aria-live="polite">
      <div class="progress-track" aria-hidden="true"><div class="progress-fill" id="progressFill"></div></div>
      <span class="progress-text" id="progressText">ตอบแล้ว 0/${QUESTIONS.length}</span>
    </div>

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
      <details class="concept" open>
        <summary>ดูหลักคิดก่อนตอบ</summary>
        <div class="concept-body">
          <div class="flow" aria-label="หลักการพิจารณารายการค้า">
            <div class="flow-box">เหตุการณ์นี้<br>มีมูลค่าเป็นเงินหรือไม่?</div>
            <div class="arrow">→</div>
            <div class="flow-box">ทำให้สินทรัพย์ หนี้สิน ทุน<br>รายได้ หรือค่าใช้จ่ายเปลี่ยนหรือไม่?</div>
            <div class="arrow">→</div>
            <div class="flow-box">ใช่ = รายการค้า<br>ยังไม่กระทบบัญชี = ไม่เป็นรายการค้า</div>
          </div>
          <p class="mini-note"><strong>จำง่าย:</strong> มีมูลค่าเป็นเงิน + ทำให้บัญชีเปลี่ยนแปลง = รายการค้า</p>
        </div>
      </details>

      <h2 class="section-title"><span>3</span> ทำใบงาน</h2>
      <p class="instructions"><strong>คำชี้แจง:</strong> เลือกคำตอบให้ครบทั้ง ${QUESTIONS.length} ข้อ แล้วกด “ตรวจคำตอบ” ที่แถบด้านล่าง</p>

      <form id="worksheetForm" novalidate>
        <section class="questions">${questionCards()}</section>
        <div id="formError" class="error-box" hidden></div>
        <div class="actions">
          <button class="btn primary" id="submitBtn" type="submit">ตรวจคำตอบและดูคะแนน</button>
          <button class="btn" type="button" id="resetBtn">เริ่มทำใหม่</button>
          <button class="btn" type="button" id="printBtn">พิมพ์</button>
        </div>
      </form>

      <section id="result" class="result" hidden aria-live="polite">
        <div class="result-head">
          <div class="score-circle" id="scoreCircle">0/${QUESTIONS.length}</div>
          <div>
            <h2 id="resultTitle">ผลการทำใบงาน</h2>
            <p id="resultMessage"></p>
          </div>
        </div>
        <div class="result-body">
          <div class="summary-grid">
            <div class="summary-item"><span>คะแนน</span><b id="summaryScore">0/${QUESTIONS.length}</b></div>
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
    const totalQuestions = ${QUESTIONS.length};
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    function updateProgress() {
      let answered = 0;
      for (let i = 1; i <= totalQuestions; i++) {
        if (form.querySelector('input[name="q' + i + '"]:checked')) answered++;
      }
      progressText.textContent = 'ตอบแล้ว ' + answered + '/' + totalQuestions;
      progressFill.style.width = Math.round((answered / totalQuestions) * 100) + '%';
    }

    function showError(message, target) {
      errorBox.textContent = message;
      errorBox.hidden = false;
      const destination = target || errorBox;
      destination.scrollIntoView({ behavior:'smooth', block:'center' });
    }

    function clearFeedback() {
      errorBox.hidden = true;
      resultBox.hidden = true;
      document.querySelectorAll('.question-card').forEach((card) => card.classList.remove('correct','incorrect'));
      document.querySelectorAll('.feedback').forEach((node) => { node.hidden = true; node.textContent = ''; });
    }

    form.addEventListener('change', (event) => {
      if (event.target.matches('input[type="radio"]')) updateProgress();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFeedback();

      const name = document.getElementById('studentName').value.trim();
      const studentClass = document.getElementById('studentClass').value;
      const studentNo = document.getElementById('studentNo').value.trim();
      if (!name || !studentClass || !studentNo) {
        showError('กรุณากรอกชื่อ–นามสกุล ชั้น และเลขที่ให้ครบก่อนส่งคำตอบ', document.querySelector('.student-grid'));
        return;
      }

      const answers = {};
      let firstUnanswered = null;
      for (let i = 1; i <= totalQuestions; i++) {
        const selected = form.querySelector('input[name="q' + i + '"]:checked');
        if (selected) answers[String(i)] = selected.value;
        else if (!firstUnanswered) firstUnanswered = document.getElementById('question-' + i);
      }
      if (Object.keys(answers).length !== totalQuestions) {
        showError('กรุณาตอบคำถามให้ครบทั้ง ' + totalQuestions + ' ข้อ', firstUnanswered);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังตรวจคำตอบ...';
      try {
        const response = await fetch('/api/check', {
          method:'POST',
          headers:{ 'content-type':'application/json' },
          body:JSON.stringify({ answers })
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
      updateProgress();
      window.scrollTo({ top:0, behavior:'smooth' });
    });
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    updateProgress();
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
          'content-type':'text/html; charset=utf-8',
          'cache-control':'no-store',
          'x-content-type-options':'nosniff'
        }
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/check') {
      try {
        const body = await request.json();
        return json(gradeAnswers(body.answers));
      } catch (error) {
        return json({ error:error?.message || 'ข้อมูลไม่ถูกต้อง' }, 400);
      }
    }

    return new Response('Not Found', { status:404 });
  }
};
