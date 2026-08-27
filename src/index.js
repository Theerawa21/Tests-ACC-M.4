import { QUESTIONS, gradeAnswers } from './quiz.js';
import { buildSubmission, saveSubmission, fetchStudents } from './storage.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
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
    <article class="question-card" id="question-${q.id}">
      <div class="question-row">
        <div class="question-number">${q.id}</div>
        <h3>${escapeHtml(q.text)}</h3>
      </div>
      <div class="choice-row" role="radiogroup" aria-label="คำถามข้อ ${q.id}">
        <label class="choice"><input type="radio" name="q${q.id}" value="trade"><span class="choice-dot"></span><span>เป็นรายการค้า</span></label>
        <label class="choice"><input type="radio" name="q${q.id}" value="nontrade"><span class="choice-dot"></span><span>ไม่เป็นรายการค้า</span></label>
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
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}body{margin:0;background:#fff;color:#111;font-family:"Sarabun","Noto Sans Thai",Tahoma,Arial,sans-serif;line-height:1.5;-webkit-tap-highlight-color:transparent}button,input,select{font:inherit}button,label,select{touch-action:manipulation}.sheet{min-height:100dvh;background:#fff}.topbar{padding:10px 14px;border-bottom:1px solid #111;font-size:.82rem;display:flex;flex-direction:column;gap:2px}.topbar span{color:#666}.hero{text-align:center;padding:20px 14px 18px;border-bottom:2px solid #111}.eyebrow{display:inline-block;border:1px solid #111;border-radius:999px;padding:4px 11px;font-size:.76rem;font-weight:800;margin-bottom:9px}.hero h1{margin:0;font-size:clamp(1.55rem,8vw,2.25rem);line-height:1.15}.hero p{margin:7px auto 0;max-width:42rem;font-size:.93rem;color:#444}.mobile-progress{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:9px 14px;background:rgba(255,255,255,.96);border-bottom:1px solid #111;backdrop-filter:blur(8px)}.track{height:7px;flex:1;border:1px solid #111;border-radius:999px;overflow:hidden}.fill{height:100%;width:0;background:#111;transition:.2s}.progress-text{font-size:.82rem;font-weight:800;white-space:nowrap}.content{padding:16px 14px;padding-bottom:calc(98px + env(safe-area-inset-bottom))}.section-title{display:flex;align-items:center;gap:9px;margin:0 0 12px;font-size:1.12rem}.section-title span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#111;color:#fff;font-size:.92rem}.student-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:22px}.field label{display:block;font-weight:800;margin-bottom:5px;font-size:.92rem}.field input,.field select{width:100%;min-height:52px;border:1.5px solid #111;border-radius:10px;padding:12px;background:#fff;font-size:16px;outline:none}.field input:focus,.field select:focus{box-shadow:0 0 0 3px #ddd}.field input[readonly]{background:#f3f3f3;color:#333}.roster-status{margin-top:-8px;margin-bottom:20px;font-size:.84rem;color:#555}.save-note{display:flex;gap:9px;align-items:flex-start;margin:0 0 22px;padding:11px 12px;border:1px solid #aaa;border-radius:10px;background:#fafafa;font-size:.86rem}.save-dot{width:10px;height:10px;border-radius:50%;background:#111;margin-top:5px;flex:0 0 auto}details{border:1.5px solid #111;border-radius:12px;background:#fafafa;margin-bottom:22px;overflow:hidden}summary{padding:13px 14px;font-weight:800;cursor:pointer;list-style:none}summary::-webkit-details-marker{display:none}summary:after{content:"＋";float:right}details[open] summary:after{content:"−"}.concept{padding:0 12px 13px}.flow{display:grid;gap:7px}.flow-box{min-height:68px;display:grid;place-items:center;text-align:center;border:1.5px solid #111;border-radius:10px;padding:11px;font-weight:700;font-size:.9rem}.arrow{text-align:center;font-weight:900;transform:rotate(90deg)}.instructions{padding:12px 13px;background:#f3f3f3;border-left:5px solid #111;font-size:.9rem;margin:0 0 14px}.questions{display:grid;gap:12px}.question-card{border:1.5px solid #111;border-radius:14px;padding:14px;scroll-margin-top:60px;background:#fff}.question-card.correct{box-shadow:inset 5px 0 0 #111}.question-card.incorrect{background:#f2f2f2;border-style:dashed}.question-row{display:grid;grid-template-columns:36px 1fr;gap:10px;margin-bottom:12px}.question-number{width:36px;height:36px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-weight:900}.question-row h3{margin:2px 0 0;font-size:1rem;line-height:1.45}.choice-row{display:grid;gap:8px}.choice{min-height:52px;width:100%;display:flex;align-items:center;gap:10px;border:1.5px solid #999;border-radius:11px;padding:11px 13px;font-weight:700;cursor:pointer}.choice input{position:absolute;opacity:0}.choice:has(input:checked){background:#111;color:#fff;border-color:#111}.choice-dot{width:20px;height:20px;border:2px solid currentColor;border-radius:50%;position:relative;flex:0 0 20px}.choice:has(input:checked) .choice-dot:after{content:"";position:absolute;inset:4px;background:currentColor;border-radius:50%}.feedback{margin-top:12px;padding-top:10px;border-top:1px dashed #999;font-size:.9rem}.error-box{margin:14px 0 0;padding:12px 13px;border:2px solid #111;background:#eee;font-weight:800;font-size:.9rem}.actions{position:sticky;bottom:0;z-index:40;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px -14px -98px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid #111;box-shadow:0 -8px 24px rgba(0,0,0,.08);backdrop-filter:blur(10px)}.btn{min-height:52px;border:2px solid #111;border-radius:11px;background:#fff;font-weight:900;padding:10px 12px;cursor:pointer}.btn.primary{grid-column:1/-1;background:#111;color:#fff}.btn:disabled{opacity:.55}.result{margin-top:22px;border:2px solid #111;border-radius:15px;overflow:hidden;scroll-margin-top:60px}.result-head{background:#111;color:#fff;text-align:center;padding:18px}.score{font-size:2rem;font-weight:900}.result-body{padding:14px;text-align:center}.saved-badge{display:inline-block;margin-top:8px;padding:6px 10px;border:1px solid #fff;border-radius:999px;font-size:.82rem;font-weight:800}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}.summary-item{border:1px solid #aaa;border-radius:9px;padding:10px 5px;font-size:.78rem}.summary-item b{display:block;font-size:1.05rem}footer{padding:18px 14px calc(18px + env(safe-area-inset-bottom));border-top:1px solid #111;text-align:center;color:#666;font-size:.78rem}@media(min-width:761px){body{background:#ececec}.sheet{width:min(1080px,calc(100% - 24px));margin:24px auto 56px;border:2px solid #111;box-shadow:0 14px 36px rgba(0,0,0,.1)}.topbar{flex-direction:row;justify-content:space-between;padding:12px 24px;font-size:.92rem}.hero{padding:34px 28px 26px}.mobile-progress{position:static;padding:10px 26px}.content{padding:26px}.student-grid{grid-template-columns:1fr 2fr .8fr 1fr}.flow{grid-template-columns:1fr auto 1fr auto 1fr;align-items:center}.arrow{transform:none}.choice-row{grid-template-columns:1fr 1fr}.choice{border-radius:999px}.actions{position:static;display:flex;justify-content:center;margin:26px 0 8px;padding:0;border:0;box-shadow:none;background:transparent}.btn{min-width:170px}.btn.primary{grid-column:auto}}@media print{body{background:#fff}.sheet{width:100%;margin:0;border:0;box-shadow:none}.mobile-progress,.actions,.result,.feedback{display:none!important}.content{padding-bottom:0}.question-card{break-inside:avoid}}
</style>
</head>
<body>
<main class="sheet">
<div class="topbar"><strong>โรงเรียนเซนต์เทเรซา</strong><span>วิชาการบัญชีเบื้องต้น · ชั้นมัธยมศึกษาปีที่ 4</span></div>
<header class="hero"><div class="eyebrow">ONLINE WORKSHEET</div><h1>รายการค้าและรายการที่ไม่ใช่รายการค้า</h1><p>เลือกชื่อจากฐานข้อมูลนักเรียน ทำใบงาน ตรวจคะแนน และบันทึกผลลง Google Sheet</p></header>
<div class="mobile-progress"><div class="track"><div class="fill" id="progressFill"></div></div><span class="progress-text" id="progressText">ตอบแล้ว 0/${QUESTIONS.length}</span></div>
<div class="content">
<h2 class="section-title"><span>1</span> ข้อมูลนักเรียน</h2>
<section class="student-grid">
<div class="field"><label for="studentClass">ชั้น</label><select id="studentClass" required><option value="">เลือกห้อง</option><option value="ม.4/3">ม.4/3</option><option value="ม.4/4">ม.4/4</option></select></div>
<div class="field"><label for="studentSelect">ชื่อ–นามสกุล</label><select id="studentSelect" required disabled><option value="">เลือกห้องก่อน</option></select></div>
<div class="field"><label for="studentNo">เลขที่</label><input id="studentNo" readonly placeholder="-" required></div>
<div class="field"><label for="studentId">เลขประจำตัวนักเรียน</label><input id="studentId" readonly placeholder="-" aria-label="เลขประจำตัวนักเรียน"></div>
</section>
<div class="roster-status" id="rosterStatus">เลือกระดับชั้นเพื่อโหลดรายชื่อนักเรียนจากฐานข้อมูล</div>
<div class="save-note"><span class="save-dot"></span><span><strong>ฐานข้อมูลเดียวกัน:</strong> รายชื่อนักเรียนอ่านจากแท็บ “ข้อมูลนักเรียน” และผลคะแนนบันทึกลงแท็บ “ผลการทำใบงาน”</span></div>
<h2 class="section-title"><span>2</span> หลักคิดก่อนทำ</h2>
<details open><summary>ดูหลักคิดก่อนตอบ</summary><div class="concept"><div class="flow"><div class="flow-box">มีมูลค่าเป็นเงินหรือไม่?</div><div class="arrow">→</div><div class="flow-box">ทำให้สินทรัพย์ หนี้สิน ทุน รายได้ หรือค่าใช้จ่ายเปลี่ยนหรือไม่?</div><div class="arrow">→</div><div class="flow-box">ใช่ = รายการค้า<br>ยังไม่กระทบบัญชี = ไม่เป็นรายการค้า</div></div></div></details>
<h2 class="section-title"><span>3</span> ทำใบงาน</h2>
<p class="instructions"><strong>คำชี้แจง:</strong> เลือกคำตอบให้ครบทั้ง ${QUESTIONS.length} ข้อ แล้วกด “ส่งคำตอบและบันทึกผล”</p>
<form id="worksheetForm" novalidate><section class="questions">${questionCards()}</section><div id="formError" class="error-box" hidden></div><div class="actions"><button class="btn primary" id="submitBtn" type="submit">ส่งคำตอบและบันทึกผล</button><button class="btn" id="resetBtn" type="button">เริ่มทำใหม่</button><button class="btn" id="printBtn" type="button">พิมพ์</button></div></form>
<section class="result" id="result" hidden aria-live="polite"><div class="result-head"><div>คะแนนของคุณ</div><div class="score" id="score">0/10</div><div id="resultMessage"></div><div class="saved-badge" id="savedBadge">บันทึกผลแล้ว</div></div><div class="result-body"><div class="summary-grid"><div class="summary-item">คะแนน<b id="summaryScore">0/10</b></div><div class="summary-item">ร้อยละ<b id="summaryPercent">0%</b></div><div class="summary-item">ผล<b id="summaryStatus">-</b></div></div></div></section>
</div>
<footer>ใบงานออนไลน์ · วิชาการบัญชีเบื้องต้น · Cloudflare Workers + Google Sheets</footer>
</main>
<script>
const form=document.getElementById('worksheetForm');
const cards=[...document.querySelectorAll('.question-card')];
const errorBox=document.getElementById('formError');
const resultBox=document.getElementById('result');
const submitBtn=document.getElementById('submitBtn');
const studentClass=document.getElementById('studentClass');
const studentSelect=document.getElementById('studentSelect');
const studentNo=document.getElementById('studentNo');
const studentId=document.getElementById('studentId');
const rosterStatus=document.getElementById('rosterStatus');
const progressFill=document.getElementById('progressFill');
const progressText=document.getElementById('progressText');

function showError(message){errorBox.textContent=message;errorBox.hidden=false;errorBox.scrollIntoView({behavior:'smooth',block:'center'});}
function clearFeedback(){errorBox.hidden=true;resultBox.hidden=true;document.querySelectorAll('.question-card').forEach(c=>c.classList.remove('correct','incorrect'));document.querySelectorAll('.feedback').forEach(n=>{n.hidden=true;n.textContent='';});}
function updateProgress(){let count=0;cards.forEach(c=>{if(c.querySelector('input:checked'))count++;});progressFill.style.width=((count/${QUESTIONS.length})*100)+'%';progressText.textContent='ตอบแล้ว '+count+'/${QUESTIONS.length};}
function resetStudentSelection(message){studentSelect.innerHTML='<option value="">'+message+'</option>';studentSelect.disabled=true;studentNo.value='';studentId.value='';}

studentClass.addEventListener('change',async()=>{
  clearFeedback();
  const cls=studentClass.value;
  if(!cls){resetStudentSelection('เลือกห้องก่อน');rosterStatus.textContent='เลือกระดับชั้นเพื่อโหลดรายชื่อนักเรียนจากฐานข้อมูล';return;}
  resetStudentSelection('กำลังโหลดรายชื่อ...');
  rosterStatus.textContent='กำลังโหลดรายชื่อนักเรียน '+cls+' ...';
  try{
    const response=await fetch('/api/students?class='+encodeURIComponent(cls));
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'โหลดรายชื่อไม่สำเร็จ');
    studentSelect.innerHTML='<option value="">เลือกนักเรียน</option>';
    (data.students||[]).forEach(s=>{
      const option=document.createElement('option');
      option.value=String(s.studentNo);
      option.textContent=String(s.studentNo)+'. '+s.name;
      option.dataset.name=s.name;
      option.dataset.studentId=s.studentId||'';
      studentSelect.appendChild(option);
    });
    studentSelect.disabled=false;
    rosterStatus.textContent='พบรายชื่อนักเรียน '+(data.students||[]).length+' คน';
  }catch(error){resetStudentSelection('โหลดรายชื่อไม่สำเร็จ');rosterStatus.textContent=error.message||'โหลดรายชื่อไม่สำเร็จ';}
});

studentSelect.addEventListener('change',()=>{
  const option=studentSelect.options[studentSelect.selectedIndex];
  studentNo.value=studentSelect.value||'';
  studentId.value=option&&option.dataset?option.dataset.studentId||'':'';
});

document.addEventListener('change',e=>{if(e.target.matches('input[type="radio"]'))updateProgress();});

form.addEventListener('submit',async(event)=>{
  event.preventDefault();clearFeedback();
  const cls=studentClass.value;
  const option=studentSelect.options[studentSelect.selectedIndex];
  const name=option&&option.dataset?String(option.dataset.name||'').trim():'';
  const no=studentNo.value.trim();
  if(!cls||!name||!no){showError('กรุณาเลือกชั้นและรายชื่อนักเรียนให้ครบก่อนส่งคำตอบ');return;}
  const answers={};
  for(let i=1;i<=${QUESTIONS.length};i++){const selected=form.querySelector('input[name="q'+i+'"]:checked');if(selected)answers[String(i)]=selected.value;}
  if(Object.keys(answers).length!==${QUESTIONS.length}){showError('กรุณาตอบคำถามให้ครบทั้ง ${QUESTIONS.length} ข้อ');const first=cards.find(c=>!c.querySelector('input:checked'));if(first)first.scrollIntoView({behavior:'smooth',block:'center'});return;}
  submitBtn.disabled=true;submitBtn.textContent='กำลังตรวจและบันทึก...';
  try{
    const response=await fetch('/api/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:name,studentClass:cls,studentNo:no,answers:answers})});
    const data=await response.json();
    if(!response.ok&&data.saved===undefined)throw new Error(data.error||'ส่งคำตอบไม่สำเร็จ');
    (data.details||[]).forEach(item=>{const card=document.getElementById('question-'+item.id);const feedback=document.getElementById('feedback-'+item.id);if(!card||!feedback)return;card.classList.add(item.correct?'correct':'incorrect');const correctLabel=item.correctAnswer==='trade'?'เป็นรายการค้า':'ไม่เป็นรายการค้า';feedback.textContent=(item.correct?'✓ ถูกต้อง':'✕ คำตอบที่ถูก: '+correctLabel)+' — '+item.explanation;feedback.hidden=false;});
    document.getElementById('score').textContent=data.score+'/'+data.total;document.getElementById('summaryScore').textContent=data.score+'/'+data.total;document.getElementById('summaryPercent').textContent=data.percentage+'%';document.getElementById('summaryStatus').textContent=data.passed?'ผ่าน':'ควรทบทวน';document.getElementById('resultMessage').textContent=name+' · '+cls+' เลขที่ '+no;const badge=document.getElementById('savedBadge');badge.textContent=data.saved?'บันทึกผลลง Google Sheet แล้ว':'ตรวจคะแนนแล้ว แต่ยังไม่บันทึกผล';resultBox.hidden=false;resultBox.scrollIntoView({behavior:'smooth',block:'start'});if(!data.saved&&data.error)showError(data.error);
  }catch(error){showError(error.message||'เกิดข้อผิดพลาด กรุณาลองใหม่');}
  finally{submitBtn.disabled=false;submitBtn.textContent='ส่งคำตอบและบันทึกผล';}
});

document.getElementById('resetBtn').addEventListener('click',()=>{form.reset();studentClass.value='';resetStudentSelection('เลือกห้องก่อน');rosterStatus.textContent='เลือกระดับชั้นเพื่อโหลดรายชื่อนักเรียนจากฐานข้อมูล';clearFeedback();updateProgress();window.scrollTo({top:0,behavior:'smooth'});});
document.getElementById('printBtn').addEventListener('click',()=>window.print());
updateProgress();
</script>
</body>
</html>`;
}

export default {
  async fetch(request, env = {}) {
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

    if (request.method === 'GET' && url.pathname === '/api/students') {
      const studentClass = String(url.searchParams.get('class') || '').trim();
      if (!studentClass) return json({ error: 'กรุณาระบุชั้นเรียน' }, 400);
      try {
        const data = await fetchStudents(env, studentClass);
        return json(data);
      } catch (error) {
        return json({ ok: false, error: error?.message || 'โหลดรายชื่อนักเรียนไม่สำเร็จ' }, 503);
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/check') {
      try {
        const body = await request.json();
        return json(gradeAnswers(body.answers));
      } catch (error) {
        return json({ error: error?.message || 'ข้อมูลไม่ถูกต้อง' }, 400);
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/submit') {
      let grading;
      try {
        const body = await request.json();
        const name = String(body.name || '').trim();
        const studentClass = String(body.studentClass || '').trim();
        const studentNo = String(body.studentNo || '').trim();
        if (!name || !studentClass || !studentNo) throw new Error('ข้อมูลนักเรียนไม่ครบ');
        grading = gradeAnswers(body.answers);
        const payload = buildSubmission({ student: { name, studentClass, studentNo }, grading, answers: body.answers });
        try {
          const stored = await saveSubmission(env, payload);
          return json({ ...grading, saved: true, row: stored.row || null });
        } catch (error) {
          return json({ ...grading, saved: false, error: error?.message || 'บันทึกผลไม่สำเร็จ' }, 503);
        }
      } catch (error) {
        return json({ ...(grading || {}), saved: false, error: error?.message || 'ข้อมูลไม่ถูกต้อง' }, 400);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
